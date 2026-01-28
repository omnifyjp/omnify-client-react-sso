import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProtectedRoute } from './ProtectedRoute';
import { SsoContext } from '../../../core/context/SsoContext';
import type { SsoContextValue, SsoOrganization } from '../../../core/types';
import type { ReactNode } from 'react';

// Mock organizations
const createMockOrg = (overrides: Partial<SsoOrganization> = {}): SsoOrganization => ({
    id: 1,
    slug: 'test-org',
    name: 'Test Organization',
    orgRole: 'member',
    serviceRole: 'member',
    ...overrides,
});

// Mock context value
const createMockContext = (overrides: Partial<SsoContextValue> = {}): SsoContextValue => ({
    user: null,
    organizations: [],
    currentOrg: null,
    isLoading: false,
    isAuthenticated: false,
    login: vi.fn(),
    logout: vi.fn().mockResolvedValue(undefined),
    globalLogout: vi.fn(),
    refreshUser: vi.fn().mockResolvedValue(undefined),
    switchOrg: vi.fn(),
    getHeaders: vi.fn(() => ({})),
    config: {
        apiUrl: 'https://api.example.com',
        consoleUrl: 'https://console.example.com',
        serviceSlug: 'test-service',
    },
    ...overrides,
});

describe('ProtectedRoute', () => {
    describe('loading state', () => {
        it('should show default loading when isLoading', () => {
            const context = createMockContext({ isLoading: true });

            render(
                <SsoContext.Provider value={context}>
                    <ProtectedRoute>
                        <div>Protected Content</div>
                    </ProtectedRoute>
                </SsoContext.Provider>
            );

            expect(screen.getByText('Loading...')).toBeDefined();
            expect(screen.queryByText('Protected Content')).toBeNull();
        });

        it('should show custom fallback when isLoading', () => {
            const context = createMockContext({ isLoading: true });

            render(
                <SsoContext.Provider value={context}>
                    <ProtectedRoute fallback={<div>Custom Loading</div>}>
                        <div>Protected Content</div>
                    </ProtectedRoute>
                </SsoContext.Provider>
            );

            expect(screen.getByText('Custom Loading')).toBeDefined();
            expect(screen.queryByText('Loading...')).toBeNull();
        });
    });

    describe('unauthenticated state', () => {
        it('should show default login fallback when not authenticated', () => {
            const context = createMockContext({
                isLoading: false,
                isAuthenticated: false
            });

            render(
                <SsoContext.Provider value={context}>
                    <ProtectedRoute>
                        <div>Protected Content</div>
                    </ProtectedRoute>
                </SsoContext.Provider>
            );

            expect(screen.getByText('Please log in to continue')).toBeDefined();
            expect(screen.getByText('Log In')).toBeDefined();
            expect(screen.queryByText('Protected Content')).toBeNull();
        });

        it('should show custom login fallback when provided', () => {
            const context = createMockContext({
                isLoading: false,
                isAuthenticated: false
            });

            render(
                <SsoContext.Provider value={context}>
                    <ProtectedRoute loginFallback={<div>Custom Login Page</div>}>
                        <div>Protected Content</div>
                    </ProtectedRoute>
                </SsoContext.Provider>
            );

            expect(screen.getByText('Custom Login Page')).toBeDefined();
            expect(screen.queryByText('Please log in to continue')).toBeNull();
        });

        it('should call onAccessDenied with unauthenticated reason', () => {
            const onAccessDenied = vi.fn();
            const context = createMockContext({
                isLoading: false,
                isAuthenticated: false
            });

            render(
                <SsoContext.Provider value={context}>
                    <ProtectedRoute onAccessDenied={onAccessDenied}>
                        <div>Protected Content</div>
                    </ProtectedRoute>
                </SsoContext.Provider>
            );

            expect(onAccessDenied).toHaveBeenCalledWith('unauthenticated');
        });
    });

    describe('authenticated state', () => {
        it('should render children when authenticated', () => {
            const context = createMockContext({
                isLoading: false,
                isAuthenticated: true,
                user: { id: 1, consoleUserId: 100, email: 'test@example.com', name: 'Test' },
                currentOrg: createMockOrg({ serviceRole: 'member' }),
            });

            render(
                <SsoContext.Provider value={context}>
                    <ProtectedRoute>
                        <div>Protected Content</div>
                    </ProtectedRoute>
                </SsoContext.Provider>
            );

            expect(screen.getByText('Protected Content')).toBeDefined();
        });
    });

    describe('role-based access', () => {
        it('should show access denied when user lacks required role', () => {
            const context = createMockContext({
                isLoading: false,
                isAuthenticated: true,
                user: { id: 1, consoleUserId: 100, email: 'test@example.com', name: 'Test' },
                currentOrg: createMockOrg({ serviceRole: 'member' }),
            });

            render(
                <SsoContext.Provider value={context}>
                    <ProtectedRoute requiredRole="admin">
                        <div>Admin Content</div>
                    </ProtectedRoute>
                </SsoContext.Provider>
            );

            expect(screen.getByText('Access Denied')).toBeDefined();
            expect(screen.getByText(/This page requires admin role/)).toBeDefined();
            expect(screen.queryByText('Admin Content')).toBeNull();
        });

        it('should render content when user has required role', () => {
            const context = createMockContext({
                isLoading: false,
                isAuthenticated: true,
                user: { id: 1, consoleUserId: 100, email: 'test@example.com', name: 'Test' },
                currentOrg: createMockOrg({ serviceRole: 'admin' }),
            });

            render(
                <SsoContext.Provider value={context}>
                    <ProtectedRoute requiredRole="admin">
                        <div>Admin Content</div>
                    </ProtectedRoute>
                </SsoContext.Provider>
            );

            expect(screen.getByText('Admin Content')).toBeDefined();
            expect(screen.queryByText('Access Denied')).toBeNull();
        });

        it('should render content when user has higher role than required', () => {
            const context = createMockContext({
                isLoading: false,
                isAuthenticated: true,
                user: { id: 1, consoleUserId: 100, email: 'test@example.com', name: 'Test' },
                currentOrg: createMockOrg({ serviceRole: 'admin' }),
            });

            render(
                <SsoContext.Provider value={context}>
                    <ProtectedRoute requiredRole="member">
                        <div>Member Content</div>
                    </ProtectedRoute>
                </SsoContext.Provider>
            );

            expect(screen.getByText('Member Content')).toBeDefined();
        });

        it('should call onAccessDenied with insufficient_role reason', () => {
            const onAccessDenied = vi.fn();
            const context = createMockContext({
                isLoading: false,
                isAuthenticated: true,
                user: { id: 1, consoleUserId: 100, email: 'test@example.com', name: 'Test' },
                currentOrg: createMockOrg({ serviceRole: 'member' }),
            });

            render(
                <SsoContext.Provider value={context}>
                    <ProtectedRoute requiredRole="admin" onAccessDenied={onAccessDenied}>
                        <div>Admin Content</div>
                    </ProtectedRoute>
                </SsoContext.Provider>
            );

            expect(onAccessDenied).toHaveBeenCalledWith('insufficient_role');
        });
    });
});
