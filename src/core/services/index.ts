/**
 * SSO Services - Individual services following Single Responsibility Principle
 *
 * Each service handles a specific domain:
 * - authService: SSO authentication (callback, logout, user)
 * - tokenService: API token management (for mobile apps)
 * - roleService: Role CRUD operations
 * - permissionService: Permission CRUD operations
 * - teamService: Team permission management
 * - userRoleService: Scoped role assignments (global/org/branch)
 * - branchService: Branch management
 */

// =============================================================================
// Shared utilities
// =============================================================================

export type { ServiceConfig } from "./utils";

// =============================================================================
// Auth Service
// =============================================================================

export { createAuthService } from "./authService";
export type {
  AuthService,
  SsoUser,
  Organization,
  AuthCallbackInput,
  AuthCallbackResponse,
  AuthUserResponse,
} from "./authService";

// =============================================================================
// Token Service
// =============================================================================

export { createTokenService } from "./tokenService";
export type { TokenService, ApiToken } from "./tokenService";

// =============================================================================
// Role Service
// =============================================================================

export { createRoleService } from "./roleService";
export type {
  RoleService,
  Role,
  RoleWithPermissions,
  RoleListParams,
  CreateRoleInput,
  UpdateRoleInput,
  SyncPermissionsInput,
  SyncPermissionsResponse,
} from "./roleService";

// =============================================================================
// Permission Service
// =============================================================================

export { createPermissionService } from "./permissionService";
export type {
  PermissionService,
  Permission,
  PermissionMatrix,
  PermissionListParams,
  CreatePermissionInput,
  UpdatePermissionInput,
} from "./permissionService";

// =============================================================================
// Team Service
// =============================================================================

export { createTeamService } from "./teamService";
export type {
  TeamService,
  TeamWithPermissions,
  TeamPermissionDetail,
  OrphanedTeam,
  SyncTeamPermissionsInput,
  CleanupOrphanedInput,
} from "./teamService";

// =============================================================================
// User Role Service (Scoped Role Assignments)
// =============================================================================

export { createUserRoleService, getScopeLabel, getEffectivePermissions } from "./userRoleService";
export type {
  UserRoleService,
  RoleScope,
  RoleAssignment,
  AssignRoleInput,
  AssignRoleResponse,
  SyncRolesInput,
  SyncRolesResponse,
  RemoveRoleResponse,
} from "./userRoleService";

// =============================================================================
// User Service (User Management)
// =============================================================================

export { createUserService } from "./userService";
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
} from "./userService";

// =============================================================================
// Branch Service
// =============================================================================

export { createBranchService } from "./branchService";
export type { BranchService, Branch, BranchesResponse } from "./branchService";

// =============================================================================
// Legacy: createSsoService (deprecated - use individual services)
// =============================================================================

// Keep for backward compatibility, but mark as deprecated
export { createSsoService } from "./ssoService";
export type { SsoService, SsoServiceConfig } from "./ssoService";
