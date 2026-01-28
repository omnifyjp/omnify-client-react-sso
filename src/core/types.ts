/**
 * User information from SSO
 */
export interface SsoUser {
    id: number;
    consoleUserId: number;
    email: string;
    name: string;
}

/**
 * Organization with user's access information
 */
export interface SsoOrganization {
    id: number;
    slug: string;
    name: string;
    orgRole: string;
    serviceRole: string | null;
}

/**
 * SSO Provider configuration
 */
export interface SsoConfig {
    /** Service backend API URL */
    apiUrl: string;
    /** Console URL for SSO redirects */
    consoleUrl: string;
    /** Service slug registered in Console */
    serviceSlug: string;
    /** Storage type for selected org */
    storage?: 'localStorage' | 'sessionStorage';
    /** Key name for storing selected org */
    storageKey?: string;
}

/**
 * SSO Context value
 */
export interface SsoContextValue {
    /** Current authenticated user */
    user: SsoUser | null;
    /** List of organizations user has access to */
    organizations: SsoOrganization[];
    /** Currently selected organization */
    currentOrg: SsoOrganization | null;
    /** Loading state */
    isLoading: boolean;
    /** Authentication state */
    isAuthenticated: boolean;
    /** Configuration */
    config: SsoConfig;
    /** Redirect to Console login */
    login: (redirectTo?: string) => void;
    /** Logout from service */
    logout: () => Promise<void>;
    /** Global logout (logout from Console too) */
    globalLogout: (redirectTo?: string) => void;
    /** Switch to different organization */
    switchOrg: (orgId: string) => void;
    /** Refresh user data */
    refreshUser: () => Promise<void>;
    /** Get headers for API requests */
    getHeaders: () => Record<string, string>;
}

/**
 * SSO Callback response from backend
 */
export interface SsoCallbackResponse {
    user: {
        id: number;
        console_user_id: number;
        email: string;
        name: string;
    };
    organizations: Array<{
        organization_id: number;
        organization_slug: string;
        organization_name: string;
        org_role: string;
        service_role: string | null;
    }>;
    token?: string; // For mobile apps
}

/**
 * Props for SsoProvider
 */
export interface SsoProviderProps {
    children: React.ReactNode;
    config: SsoConfig;
    /** Called when auth state changes */
    onAuthChange?: (isAuthenticated: boolean, user: SsoUser | null) => void;
}

/**
 * Props for SsoCallback component
 */
export interface SsoCallbackProps {
    /** Called on successful login */
    onSuccess?: (user: SsoUser, organizations: SsoOrganization[]) => void;
    /** Called on error */
    onError?: (error: Error) => void;
    /** Redirect path after login */
    redirectTo?: string;
    /** Loading component */
    loadingComponent?: React.ReactNode;
    /** Error component */
    errorComponent?: (error: Error) => React.ReactNode;
}

/**
 * Props for OrganizationSwitcher component
 */
export interface OrganizationSwitcherProps {
    className?: string;
    /** Custom trigger render */
    renderTrigger?: (currentOrg: SsoOrganization | null, isOpen: boolean) => React.ReactNode;
    /** Custom option render */
    renderOption?: (org: SsoOrganization, isSelected: boolean) => React.ReactNode;
    /** Called when org changes */
    onChange?: (org: SsoOrganization) => void;
}

/**
 * Props for ProtectedRoute component
 */
export interface ProtectedRouteProps {
    children: React.ReactNode;
    /** Component to show when loading */
    fallback?: React.ReactNode;
    /** Component to show when not authenticated */
    loginFallback?: React.ReactNode;
    /** Required role to access */
    requiredRole?: string;
    /** Required permission to access */
    requiredPermission?: string;
    /** Called when access is denied */
    onAccessDenied?: (reason: 'unauthenticated' | 'insufficient_role' | 'missing_permission') => void;
}

// =============================================================================
// Branch Types
// =============================================================================

/**
 * Branch information
 */
export interface SsoBranch {
    id: number;
    code: string;
    name: string;
    is_headquarters: boolean;
    is_primary: boolean;
    is_assigned: boolean;
    access_type: 'explicit' | 'implicit';
    timezone: string | null;
    currency: string | null;
    locale: string | null;
}

/**
 * Branch Context value
 */
export interface BranchContextValue {
    /** List of branches user has access to */
    branches: SsoBranch[];
    /** Currently selected branch */
    currentBranch: SsoBranch | null;
    /** Whether user has access to all branches */
    allBranchesAccess: boolean;
    /** Primary branch ID for current user */
    primaryBranchId: number | null;
    /** Loading state */
    isLoading: boolean;
    /** Error state */
    error: Error | null;
    /** Whether user has multiple branches */
    hasMultipleBranches: boolean;
    /** Switch to a different branch */
    switchBranch: (branchId: number) => void;
    /** Refresh branches */
    refreshBranches: () => Promise<void>;
}

/**
 * Props for BranchProvider
 */
export interface BranchProviderProps {
    children: React.ReactNode;
    /** Storage type for selected branch */
    storage?: 'localStorage' | 'sessionStorage';
    /** Key name for storing selected branch */
    storageKey?: string;
    /** Called when branch changes */
    onBranchChange?: (branch: SsoBranch | null) => void;
}

/**
 * Props for OrgBranchSelectorModal component
 */
export interface OrgBranchSelectorModalProps {
    /** Whether modal is open */
    open: boolean;
    /** Called when modal is closed */
    onClose: () => void;
    /** Called when selection is confirmed */
    onConfirm: (orgId: number, branchId: number) => void;
    /** Modal title */
    title?: string;
    /** Whether to require branch selection (default: true) */
    requireBranch?: boolean;
    /** Custom loading component */
    loadingComponent?: React.ReactNode;
}

/**
 * Selection result from OrgBranchSelectorModal
 */
export interface OrgBranchSelection {
    organization: SsoOrganization;
    branch: SsoBranch | null;
}

/**
 * Selection stored by BranchGate
 */
export interface BranchGateSelection {
    orgId: string;
    orgName: string;
    branchId: string;
    branchName: string;
    branchCode: string;
}

/**
 * Props for BranchGate component
 */
export interface BranchGateProps {
    children: React.ReactNode;
    /** Called when selection changes (use to set API headers) */
    onSelectionChange?: (selection: BranchGateSelection | null) => void;
    /** Storage key for persisting selection */
    storageKey?: string;
    /** Custom loading component */
    loadingComponent?: React.ReactNode;
    /** Modal title */
    title?: string;
    /** Modal description */
    description?: string;
}
