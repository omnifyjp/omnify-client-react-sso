/**
 * @famgia/omnify-react-sso
 *
 * SSO (Single Sign-On) schemas, types, components, and utilities for Omnify.
 */

// =============================================================================
// Schemas (auto-generated from Omnify)
// =============================================================================

export * from './schemas';

// =============================================================================
// Context & Provider
// =============================================================================

export { SsoContext } from './context/SsoContext';
export { SsoProvider } from './context/SsoProvider';

// =============================================================================
// Hooks
// =============================================================================

export { useAuth } from './hooks/useAuth';
export { useOrganization } from './hooks/useOrganization';
export { useSso } from './hooks/useSso';

// Hook return types
export type { UseAuthReturn } from './hooks/useAuth';
export type { UseOrganizationReturn } from './hooks/useOrganization';
export type { UseSsoReturn } from './hooks/useSso';

// =============================================================================
// Components
// =============================================================================

export { SsoCallback } from './components/SsoCallback';
export { OrganizationSwitcher } from './components/OrganizationSwitcher';
export { ProtectedRoute } from './components/ProtectedRoute';

// =============================================================================
// Services - Individual services (recommended)
// =============================================================================

// Auth Service
export { createAuthService } from './services';
export type {
    AuthService,
    SsoUser as AuthUser,
    Organization,
    AuthCallbackInput,
    AuthCallbackResponse,
    AuthUserResponse,
} from './services';

// Token Service
export { createTokenService } from './services';
export type { TokenService, ApiToken } from './services';

// Role Service
export { createRoleService } from './services';
export type {
    RoleService,
    Role,
    RoleWithPermissions,
    CreateRoleInput,
    UpdateRoleInput,
    SyncPermissionsInput,
    SyncPermissionsResponse,
} from './services';

// Permission Service
export { createPermissionService } from './services';
export type {
    PermissionService,
    Permission,
    PermissionMatrix,
    PermissionListParams,
    CreatePermissionInput,
    UpdatePermissionInput,
} from './services';

// Team Service
export { createTeamService } from './services';
export type {
    TeamService,
    TeamWithPermissions,
    TeamPermissionDetail,
    OrphanedTeam,
    SyncTeamPermissionsInput,
    CleanupOrphanedInput,
} from './services';

// User Role Service (Scoped Role Assignments)
export { createUserRoleService, getScopeLabel, getEffectivePermissions } from './services';
export type {
    UserRoleService,
    RoleScope,
    RoleAssignment,
    AssignRoleInput,
    AssignRoleResponse,
    SyncRolesInput,
    SyncRolesResponse,
    RemoveRoleResponse,
} from './services';

// Branch Service
export { createBranchService } from './services';
export type { BranchService, Branch, BranchesResponse } from './services';

// Service Config
export type { ServiceConfig } from './services';

// =============================================================================
// Legacy: ssoService (deprecated - use individual services)
// =============================================================================

/**
 * @deprecated Use individual services instead:
 * - createAuthService() for auth
 * - createTokenService() for tokens
 * - createRoleService() for roles
 * - createPermissionService() for permissions
 * - createTeamService() for teams
 * - createUserRoleService() for user role assignments
 * - createBranchService() for branches
 */
export { createSsoService } from './services';
export type { SsoService, SsoServiceConfig } from './services';

// Legacy type aliases for backward compatibility
export type { SsoUser as SsoServiceUser } from './services';
export type { Role as ServiceRole } from './services';
export type { Permission as ServicePermission } from './services';

// =============================================================================
// Types (camelCase - for React components)
// =============================================================================

export type {
    SsoUser,
    SsoOrganization,
    SsoConfig,
    SsoContextValue,
    SsoCallbackResponse,
    SsoProviderProps,
    SsoCallbackProps,
    OrganizationSwitcherProps,
    ProtectedRouteProps,
} from './types';

// =============================================================================
// Query Keys (for TanStack Query / React Query)
// =============================================================================

export { ssoQueryKeys } from './queryKeys';
