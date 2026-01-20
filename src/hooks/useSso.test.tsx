import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSso } from './useSso';
import { SsoContext } from '../context/SsoContext';
import type { SsoContextValue } from '../types';
import type { ReactNode } from 'react';

// Mock context value
const createMockContext = (overrides: Partial<SsoContextValue> = {}): SsoContextValue => ({
    user: null,
    organizations: [],
    currentOrg: null,
    isLoading: false,
    isAuthenticated: false,
    login: vi.fn(),
    logout: vi.fn(),
    globalLogout: vi.fn(),
    refreshUser: vi.fn(),
    switchOrg: vi.fn(),
    getHeaders: vi.fn(() => ({})),
    config: {
        apiUrl: 'https://api.example.com',
        consoleUrl: 'https://console.example.com',
        serviceSlug: 'test-service',
    },
    ...overrides,
});

// Wrapper component for testing
const createWrapper = (contextValue: SsoContextValue) => {
    return ({ children }: { children: ReactNode }) => (
        <SsoContext.Provider value={contextValue}>
            {children}
        </SsoContext.Provider>
    );
};

describe('useSso', () => {
    it('should return user from context', () => {
        const mockUser = { id: 1, consoleUserId: 100, email: 'test@example.com', name: 'Test User' };
        const context = createMockContext({ user: mockUser, isAuthenticated: true });

        const { result } = renderHook(() => useSso(), {
            wrapper: createWrapper(context),
        });

        expect(result.current.user).toEqual(mockUser);
        expect(result.current.isAuthenticated).toBe(true);
    });

    it('should return isLoading state', () => {
        const context = createMockContext({ isLoading: true });

        const { result } = renderHook(() => useSso(), {
            wrapper: createWrapper(context),
        });

        expect(result.current.isLoading).toBe(true);
    });

    it('should return organizations list', () => {
        const mockOrgs = [
            { id: 1, slug: 'org-1', name: 'Org 1', orgRole: 'admin', serviceRole: 'admin' },
            { id: 2, slug: 'org-2', name: 'Org 2', orgRole: 'member', serviceRole: 'member' },
        ];
        const context = createMockContext({ organizations: mockOrgs });

        const { result } = renderHook(() => useSso(), {
            wrapper: createWrapper(context),
        });

        expect(result.current.organizations).toEqual(mockOrgs);
        expect(result.current.hasMultipleOrgs).toBe(true);
    });

    it('should return hasMultipleOrgs as false for single org', () => {
        const mockOrgs = [{ id: 1, slug: 'org-1', name: 'Org 1', orgRole: 'admin', serviceRole: 'admin' }];
        const context = createMockContext({ organizations: mockOrgs });

        const { result } = renderHook(() => useSso(), {
            wrapper: createWrapper(context),
        });

        expect(result.current.hasMultipleOrgs).toBe(false);
    });

    it('should return currentOrg', () => {
        const mockOrg = { id: 1, slug: 'current-org', name: 'Current Org', orgRole: 'admin', serviceRole: 'admin' };
        const context = createMockContext({ currentOrg: mockOrg });

        const { result } = renderHook(() => useSso(), {
            wrapper: createWrapper(context),
        });

        expect(result.current.currentOrg).toEqual(mockOrg);
    });

    it('should expose login function', () => {
        const loginFn = vi.fn();
        const context = createMockContext({ login: loginFn });

        const { result } = renderHook(() => useSso(), {
            wrapper: createWrapper(context),
        });

        result.current.login('/dashboard');
        expect(loginFn).toHaveBeenCalledWith('/dashboard');
    });

    it('should expose logout function', async () => {
        const logoutFn = vi.fn().mockResolvedValue(undefined);
        const context = createMockContext({ logout: logoutFn });

        const { result } = renderHook(() => useSso(), {
            wrapper: createWrapper(context),
        });

        await result.current.logout();
        expect(logoutFn).toHaveBeenCalled();
    });

    it('should expose switchOrg function', () => {
        const switchOrgFn = vi.fn();
        const context = createMockContext({ switchOrg: switchOrgFn });

        const { result } = renderHook(() => useSso(), {
            wrapper: createWrapper(context),
        });

        result.current.switchOrg('new-org');
        expect(switchOrgFn).toHaveBeenCalledWith('new-org');
    });

    it('should expose getHeaders function', () => {
        const headers = { 'X-Org-Id': 'org-1' };
        const getHeadersFn = vi.fn(() => headers);
        const context = createMockContext({ getHeaders: getHeadersFn });

        const { result } = renderHook(() => useSso(), {
            wrapper: createWrapper(context),
        });

        expect(result.current.getHeaders()).toEqual(headers);
    });

    it('should expose config', () => {
        const config = {
            apiUrl: 'https://custom-api.com',
            consoleUrl: 'https://custom-console.com',
            serviceSlug: 'custom-service',
        };
        const context = createMockContext({ config });

        const { result } = renderHook(() => useSso(), {
            wrapper: createWrapper(context),
        });

        expect(result.current.config).toEqual(config);
    });
});
