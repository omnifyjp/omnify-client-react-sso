/**
 * Test utilities for @famgia/omnify-react-sso
 *
 * Usage:
 *   import { mockSsoContext, setMockSsoData, createMockUser } from '@famgia/omnify-react-sso/testing';
 */

import type { SsoUser, SsoOrganization, SsoContextValue } from '../types';

// =============================================================================
// Mock Data Factories
// =============================================================================

/**
 * Create a mock SSO user
 */
export function createMockUser(overrides?: Partial<SsoUser>): SsoUser {
    return {
        id: 1,
        consoleUserId: 100,
        email: 'test@example.com',
        name: 'Test User',
        ...overrides,
    };
}

/**
 * Create a mock organization
 */
export function createMockOrganization(overrides?: Partial<SsoOrganization>): SsoOrganization {
    return {
        id: 1,
        name: 'Test Organization',
        slug: 'test-org',
        orgRole: 'owner',
        serviceRole: 'admin',
        ...overrides,
    };
}

// =============================================================================
// Mock Context
// =============================================================================

export interface MockSsoContextValue {
    user: SsoUser | null;
    organizations: SsoOrganization[];
    currentOrg: SsoOrganization | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    hasMultipleOrgs: boolean;
    login: () => void;
    logout: () => Promise<void>;
    globalLogout: () => Promise<void>;
    switchOrg: (orgId: number) => void;
    getHeaders: () => Record<string, string>;
    config: {
        apiUrl: string;
        consoleUrl: string;
        serviceSlug: string;
    };
}

/**
 * Default mock context values
 */
export const defaultMockContext: MockSsoContextValue = {
    user: createMockUser(),
    organizations: [createMockOrganization()],
    currentOrg: createMockOrganization(),
    isLoading: false,
    isAuthenticated: true,
    hasMultipleOrgs: false,
    login: () => { },
    logout: async () => { },
    globalLogout: async () => { },
    switchOrg: () => { },
    getHeaders: () => ({ 'X-CSRF-TOKEN': 'test-token' }),
    config: {
        apiUrl: 'http://localhost:8000',
        consoleUrl: 'https://console.example.com',
        serviceSlug: 'test-service',
    },
};

// Mutable mock data for tests
let currentMockData: MockSsoContextValue = { ...defaultMockContext };

/**
 * Set mock SSO data for tests
 *
 * @example
 * beforeEach(() => {
 *   setMockSsoData({
 *     user: createMockUser({ name: 'Custom User' }),
 *     isAuthenticated: true,
 *   });
 * });
 */
export function setMockSsoData(data: Partial<MockSsoContextValue>): void {
    currentMockData = { ...defaultMockContext, ...data };
}

/**
 * Reset mock data to defaults
 */
export function resetMockSsoData(): void {
    currentMockData = { ...defaultMockContext };
}

/**
 * Get current mock data (used by mock useSso)
 */
export function getMockSsoData(): MockSsoContextValue {
    return currentMockData;
}

// =============================================================================
// Mock Hooks (for vi.mock)
// =============================================================================

/**
 * Mock useSso hook - returns current mock data
 *
 * Usage with vitest:
 * ```typescript
 * vi.mock('@famgia/omnify-react-sso', async () => {
 *   const testing = await import('@famgia/omnify-react-sso/testing');
 *   return {
 *     useSso: testing.mockUseSso,
 *     useAuth: testing.mockUseAuth,
 *     useOrganization: testing.mockUseOrganization,
 *   };
 * });
 * ```
 */
export function mockUseSso() {
    return currentMockData;
}

/**
 * Mock useAuth hook
 */
export function mockUseAuth() {
    const data = currentMockData;
    return {
        user: data.user,
        isAuthenticated: data.isAuthenticated,
        isLoading: data.isLoading,
        login: data.login,
        logout: data.logout,
        globalLogout: data.globalLogout,
    };
}

/**
 * Mock useOrganization hook
 */
export function mockUseOrganization() {
    const data = currentMockData;
    return {
        organizations: data.organizations,
        currentOrg: data.currentOrg,
        hasMultipleOrgs: data.hasMultipleOrgs,
        switchOrg: data.switchOrg,
    };
}

// =============================================================================
// Type exports
// =============================================================================

export type { SsoUser, SsoOrganization } from '../types';
