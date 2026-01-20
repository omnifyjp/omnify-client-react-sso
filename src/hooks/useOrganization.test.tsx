import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useOrganization } from './useOrganization';
import { SsoContext } from '../context/SsoContext';
import type { SsoContextValue, SsoOrganization } from '../types';
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

// Wrapper component for testing
const createWrapper = (contextValue: SsoContextValue) => {
    return ({ children }: { children: ReactNode }) => (
        <SsoContext.Provider value={contextValue}>
            {children}
        </SsoContext.Provider>
    );
};

describe('useOrganization', () => {
    describe('organizations', () => {
        it('should return empty organizations list', () => {
            const context = createMockContext({ organizations: [] });

            const { result } = renderHook(() => useOrganization(), {
                wrapper: createWrapper(context),
            });

            expect(result.current.organizations).toEqual([]);
        });

        it('should return organizations list', () => {
            const orgs = [
                createMockOrg({ id: 1, slug: 'org-1', name: 'Org 1' }),
                createMockOrg({ id: 2, slug: 'org-2', name: 'Org 2' }),
            ];
            const context = createMockContext({ organizations: orgs });

            const { result } = renderHook(() => useOrganization(), {
                wrapper: createWrapper(context),
            });

            expect(result.current.organizations).toEqual(orgs);
        });
    });

    describe('currentOrg', () => {
        it('should return null when no current org', () => {
            const context = createMockContext({ currentOrg: null });

            const { result } = renderHook(() => useOrganization(), {
                wrapper: createWrapper(context),
            });

            expect(result.current.currentOrg).toBeNull();
        });

        it('should return current org', () => {
            const org = createMockOrg({ slug: 'current-org', name: 'Current Org' });
            const context = createMockContext({ currentOrg: org });

            const { result } = renderHook(() => useOrganization(), {
                wrapper: createWrapper(context),
            });

            expect(result.current.currentOrg).toEqual(org);
        });
    });

    describe('hasMultipleOrgs', () => {
        it('should return false for empty organizations', () => {
            const context = createMockContext({ organizations: [] });

            const { result } = renderHook(() => useOrganization(), {
                wrapper: createWrapper(context),
            });

            expect(result.current.hasMultipleOrgs).toBe(false);
        });

        it('should return false for single organization', () => {
            const context = createMockContext({
                organizations: [createMockOrg()],
            });

            const { result } = renderHook(() => useOrganization(), {
                wrapper: createWrapper(context),
            });

            expect(result.current.hasMultipleOrgs).toBe(false);
        });

        it('should return true for multiple organizations', () => {
            const context = createMockContext({
                organizations: [
                    createMockOrg({ id: 1, slug: 'org-1' }),
                    createMockOrg({ id: 2, slug: 'org-2' }),
                ],
            });

            const { result } = renderHook(() => useOrganization(), {
                wrapper: createWrapper(context),
            });

            expect(result.current.hasMultipleOrgs).toBe(true);
        });
    });

    describe('switchOrg', () => {
        it('should call switchOrg with org slug', () => {
            const switchOrgFn = vi.fn();
            const context = createMockContext({ switchOrg: switchOrgFn });

            const { result } = renderHook(() => useOrganization(), {
                wrapper: createWrapper(context),
            });

            result.current.switchOrg('new-org');
            expect(switchOrgFn).toHaveBeenCalledWith('new-org');
        });
    });

    describe('currentRole', () => {
        it('should return null when no current org', () => {
            const context = createMockContext({ currentOrg: null });

            const { result } = renderHook(() => useOrganization(), {
                wrapper: createWrapper(context),
            });

            expect(result.current.currentRole).toBeNull();
        });

        it('should return role from current org', () => {
            const org = createMockOrg({ serviceRole: 'admin' });
            const context = createMockContext({ currentOrg: org });

            const { result } = renderHook(() => useOrganization(), {
                wrapper: createWrapper(context),
            });

            expect(result.current.currentRole).toBe('admin');
        });
    });

    describe('hasRole', () => {
        it('should return false when no current role', () => {
            const context = createMockContext({ currentOrg: null });

            const { result } = renderHook(() => useOrganization(), {
                wrapper: createWrapper(context),
            });

            expect(result.current.hasRole('admin')).toBe(false);
            expect(result.current.hasRole('member')).toBe(false);
        });

        it('should return true when user has admin role', () => {
            const org = createMockOrg({ serviceRole: 'admin' });
            const context = createMockContext({ currentOrg: org });

            const { result } = renderHook(() => useOrganization(), {
                wrapper: createWrapper(context),
            });

            expect(result.current.hasRole('admin')).toBe(true);
            expect(result.current.hasRole('manager')).toBe(true);
            expect(result.current.hasRole('member')).toBe(true);
        });

        it('should return true when user has manager role', () => {
            const org = createMockOrg({ serviceRole: 'manager' });
            const context = createMockContext({ currentOrg: org });

            const { result } = renderHook(() => useOrganization(), {
                wrapper: createWrapper(context),
            });

            expect(result.current.hasRole('admin')).toBe(false);
            expect(result.current.hasRole('manager')).toBe(true);
            expect(result.current.hasRole('member')).toBe(true);
        });

        it('should return true when user has member role', () => {
            const org = createMockOrg({ serviceRole: 'member' });
            const context = createMockContext({ currentOrg: org });

            const { result } = renderHook(() => useOrganization(), {
                wrapper: createWrapper(context),
            });

            expect(result.current.hasRole('admin')).toBe(false);
            expect(result.current.hasRole('manager')).toBe(false);
            expect(result.current.hasRole('member')).toBe(true);
        });

        it('should handle unknown roles', () => {
            const org = createMockOrg({ serviceRole: 'custom-role' });
            const context = createMockContext({ currentOrg: org });

            const { result } = renderHook(() => useOrganization(), {
                wrapper: createWrapper(context),
            });

            // Unknown roles have level 0, so can't access any standard role
            expect(result.current.hasRole('admin')).toBe(false);
            expect(result.current.hasRole('member')).toBe(false);
            // But can access other unknown roles (both level 0)
            expect(result.current.hasRole('unknown')).toBe(true);
        });
    });
});
