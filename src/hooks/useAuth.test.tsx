import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from './useAuth';
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

// Wrapper component for testing
const createWrapper = (contextValue: SsoContextValue) => {
    return ({ children }: { children: ReactNode }) => (
        <SsoContext.Provider value={contextValue}>
            {children}
        </SsoContext.Provider>
    );
};

describe('useAuth', () => {
    it('should return user from context', () => {
        const mockUser = { id: 1, consoleUserId: 100, email: 'test@example.com', name: 'Test User' };
        const context = createMockContext({ user: mockUser, isAuthenticated: true });

        const { result } = renderHook(() => useAuth(), {
            wrapper: createWrapper(context),
        });

        expect(result.current.user).toEqual(mockUser);
        expect(result.current.isAuthenticated).toBe(true);
    });

    it('should return isLoading state', () => {
        const context = createMockContext({ isLoading: true });

        const { result } = renderHook(() => useAuth(), {
            wrapper: createWrapper(context),
        });

        expect(result.current.isLoading).toBe(true);
    });

    it('should return false for isAuthenticated when no user', () => {
        const context = createMockContext({ user: null, isAuthenticated: false });

        const { result } = renderHook(() => useAuth(), {
            wrapper: createWrapper(context),
        });

        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.user).toBeNull();
    });

    it('should call login with redirect path', () => {
        const loginFn = vi.fn();
        const context = createMockContext({ login: loginFn });

        const { result } = renderHook(() => useAuth(), {
            wrapper: createWrapper(context),
        });

        result.current.login('/dashboard');
        expect(loginFn).toHaveBeenCalledWith('/dashboard');
    });

    it('should call login without redirect path', () => {
        const loginFn = vi.fn();
        const context = createMockContext({ login: loginFn });

        const { result } = renderHook(() => useAuth(), {
            wrapper: createWrapper(context),
        });

        result.current.login();
        expect(loginFn).toHaveBeenCalledWith(undefined);
    });

    it('should call logout', async () => {
        const logoutFn = vi.fn().mockResolvedValue(undefined);
        const context = createMockContext({ logout: logoutFn });

        const { result } = renderHook(() => useAuth(), {
            wrapper: createWrapper(context),
        });

        await act(async () => {
            await result.current.logout();
        });

        expect(logoutFn).toHaveBeenCalled();
    });

    it('should call globalLogout with redirect', () => {
        const globalLogoutFn = vi.fn();
        const context = createMockContext({ globalLogout: globalLogoutFn });

        const { result } = renderHook(() => useAuth(), {
            wrapper: createWrapper(context),
        });

        result.current.globalLogout('/goodbye');
        expect(globalLogoutFn).toHaveBeenCalledWith('/goodbye');
    });

    it('should call refreshUser', async () => {
        const refreshUserFn = vi.fn().mockResolvedValue(undefined);
        const context = createMockContext({ refreshUser: refreshUserFn });

        const { result } = renderHook(() => useAuth(), {
            wrapper: createWrapper(context),
        });

        await act(async () => {
            await result.current.refreshUser();
        });

        expect(refreshUserFn).toHaveBeenCalled();
    });

    it('should memoize login callback', () => {
        const loginFn = vi.fn();
        const context = createMockContext({ login: loginFn });

        const { result, rerender } = renderHook(() => useAuth(), {
            wrapper: createWrapper(context),
        });

        const firstLogin = result.current.login;
        rerender();
        const secondLogin = result.current.login;

        // Callback should be memoized
        expect(firstLogin).toBe(secondLogin);
    });
});
