/**
 * Organization API Sync Module
 *
 * This module ensures the organization ID is always available for API calls.
 * It syncs the org ID from React state to a global location that apiClient can access.
 *
 * NOTE: Backend accepts organization ID (UUID), code (slug), or name in X-Organization-Id header.
 *
 * The problem it solves:
 * 1. useOrganization() hook provides currentOrg in React state
 * 2. apiClient needs the org ID to add X-Organization-Id header
 * 3. Without sync, API calls can be made before org ID is available
 *
 * Solution:
 * - Sync org ID IMMEDIATELY when it changes (not in useEffect)
 * - Store in both memory and localStorage for persistence
 * - Provide functions for easy integration
 */

// In-memory storage for immediate access
let _currentOrgId: string | null = null;

// LocalStorage key
const ORG_ID_STORAGE_KEY = 'api_current_org_id';

// SSO package storage keys (for fallback)
const SSO_SELECTED_ORG_KEY = 'sso_selected_org';
const BRANCH_GATE_SELECTION_KEY = 'omnify_branch_gate_selection';

/**
 * Set the current organization ID globally
 * Called by OrganizationGate when organization changes
 */
export function setOrgIdForApi(orgId: string | null): void {
    _currentOrgId = orgId;

    if (typeof window === 'undefined') return;

    if (orgId) {
        localStorage.setItem(ORG_ID_STORAGE_KEY, orgId);
    } else {
        localStorage.removeItem(ORG_ID_STORAGE_KEY);
    }
}

/**
 * Get the current organization ID for API calls
 * Used by apiClient to add X-Organization-Id header
 */
export function getOrgIdForApi(): string | null {
    // First check in-memory (fastest)
    if (_currentOrgId) {
        return _currentOrgId;
    }

    if (typeof window === 'undefined') {
        return null;
    }

    // Check our storage key
    const stored = localStorage.getItem(ORG_ID_STORAGE_KEY);
    if (stored) {
        _currentOrgId = stored;
        return stored;
    }

    // Fallback: Try SSO package's storage keys
    try {
        const ssoOrg = localStorage.getItem(SSO_SELECTED_ORG_KEY);
        if (ssoOrg) {
            const org = JSON.parse(ssoOrg);
            if (org?.slug) {
                return org.slug;
            }
        }
    } catch {
        // Ignore parse errors
    }

    try {
        const branchGate = localStorage.getItem(BRANCH_GATE_SELECTION_KEY);
        if (branchGate) {
            const selection = JSON.parse(branchGate);
            if (selection?.orgId) {
                return selection.orgId;
            }
        }
    } catch {
        // Ignore parse errors
    }

    return null;
}

/**
 * Clear the organization ID (call on logout)
 */
export function clearOrgIdForApi(): void {
    _currentOrgId = null;
    if (typeof window !== 'undefined') {
        localStorage.removeItem(ORG_ID_STORAGE_KEY);
    }
}

/**
 * Check if organization ID is available for API calls
 */
export function hasOrgIdForApi(): boolean {
    return getOrgIdForApi() !== null;
}
