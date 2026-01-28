/**
 * @famgia/omnify-react-sso
 *
 * SSO (Single Sign-On) schemas, types, components, and utilities for Omnify.
 */

// =============================================================================
// Schemas (auto-generated from Omnify)
// =============================================================================

export * from './core/schemas';

// =============================================================================
// Context & Provider
// =============================================================================

export { SsoContext } from './core/context/SsoContext';
export { SsoProvider } from './core/context/SsoProvider';
export { BranchContext } from './core/context/BranchContext';
export { BranchProvider } from './core/context/BranchProvider';

// =============================================================================
// Hooks
// =============================================================================

export { useAuth } from './core/hooks/useAuth';
export { useOrganization } from './core/hooks/useOrganization';
export { useSso } from './core/hooks/useSso';
export { useBranch } from './core/hooks/useBranch';

// Hook return types
export type { UseAuthReturn } from './core/hooks/useAuth';
export type { UseOrganizationReturn } from './core/hooks/useOrganization';
export type { UseSsoReturn } from './core/hooks/useSso';
export type { UseBranchReturn } from './core/hooks/useBranch';

// =============================================================================
// Components (re-exported from ant module for backward compatibility)
// =============================================================================

export {
    SsoCallback,
    OrganizationSwitcher,
    ProtectedRoute,
    OrgBranchSelectorModal,
    BranchGate,
    useBranchGate,
} from './ant';

// =============================================================================
// Utilities
// =============================================================================

export {
  createBranchHeaderSetter,
  setBranchHeaders,
  BRANCH_HEADERS,
} from './core/utils/branchHeaders';

// =============================================================================
// Services - Individual services (recommended)
// =============================================================================

// Auth Service
export { createAuthService } from './core/services';
export type {
    AuthService,
    SsoUser as AuthUser,
    Organization,
    AuthCallbackInput,
    AuthCallbackResponse,
    AuthUserResponse,
} from './core/services';

// Token Service
export { createTokenService } from './core/services';
export type { TokenService, ApiToken } from './core/services';

// Role Service
export { createRoleService } from './core/services';
export type {
    RoleService,
    Role,
    RoleWithPermissions,
    CreateRoleInput,
    UpdateRoleInput,
    SyncPermissionsInput,
    SyncPermissionsResponse,
} from './core/services';

// Permission Service
export { createPermissionService } from './core/services';
export type {
    PermissionService,
    Permission,
    PermissionMatrix,
    PermissionListParams,
    CreatePermissionInput,
    UpdatePermissionInput,
} from './core/services';

// Team Service
export { createTeamService } from './core/services';
export type {
    TeamService,
    TeamWithPermissions,
    TeamPermissionDetail,
    OrphanedTeam,
    SyncTeamPermissionsInput,
    CleanupOrphanedInput,
} from './core/services';

// User Role Service (Scoped Role Assignments)
export { createUserRoleService, getScopeLabel, getEffectivePermissions } from './core/services';
export type {
    UserRoleService,
    RoleScope,
    RoleAssignment,
    AssignRoleInput,
    AssignRoleResponse,
    SyncRolesInput,
    SyncRolesResponse,
    RemoveRoleResponse,
} from './core/services';

// User Service (User Management)
export { createUserService } from './core/services';
export type {
    UserService,
    User,
    UserWithOrg,
    UserListParams,
    UserListResponse,
    UserPermissionsBreakdown,
    RoleAssignmentWithPermissions,
    TeamMembershipWithPermissions,
    PermissionDetail,
} from './core/services';

// Branch Service
export { createBranchService } from './core/services';
export type { BranchService, Branch, BranchesResponse } from './core/services';

// Service Config
export type { ServiceConfig } from './core/services';

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
export { createSsoService } from './core/services';
export type { SsoService, SsoServiceConfig } from './core/services';

// Legacy type aliases for backward compatibility
export type { SsoUser as SsoServiceUser } from './core/services';
export type { Role as ServiceRole } from './core/services';
export type { Permission as ServicePermission } from './core/services';

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
    // Branch types
    SsoBranch,
    BranchContextValue,
    BranchProviderProps,
    OrgBranchSelectorModalProps,
    OrgBranchSelection,
    // BranchGate types
    BranchGateProps,
    BranchGateSelection,
} from './core/types';

// =============================================================================
// Query Keys (for TanStack Query / React Query)
// =============================================================================

export { ssoQueryKeys } from './core/queryKeys';

// =============================================================================
// i18n (Internationalization)
// =============================================================================

export {
    I18nProvider,
    useLocale,
    useTranslations,
    useSsoTranslation,
    getCurrentLocale,
    changeLanguage,
    locales,
    localeNames,
    defaultLocale,
    ssoNamespace,
    defaultTranslations,
    type Locale,
    type I18nContextValue,
    type I18nProviderProps,
} from './core/i18n';

// =============================================================================
// Ant Design Module (Components + Theme)
// =============================================================================

export * from './ant';
