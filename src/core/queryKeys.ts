/**
 * SSO Query Keys - For TanStack Query / React Query
 *
 * Centralized key management for SSO-related queries.
 * Structure matches the service organization.
 */

export const ssoQueryKeys = {
  all: ["sso"] as const,

  // =========================================================================
  // Auth (authService)
  // =========================================================================
  auth: {
    all: () => [...ssoQueryKeys.all, "auth"] as const,
    user: () => [...ssoQueryKeys.auth.all(), "user"] as const,
    globalLogoutUrl: (redirectUri?: string) =>
      [...ssoQueryKeys.auth.all(), "global-logout-url", redirectUri] as const,
  },

  // =========================================================================
  // Tokens (tokenService)
  // =========================================================================
  tokens: {
    all: () => [...ssoQueryKeys.all, "tokens"] as const,
    list: () => [...ssoQueryKeys.tokens.all(), "list"] as const,
  },

  // =========================================================================
  // Roles (roleService)
  // =========================================================================
  roles: {
    all: () => [...ssoQueryKeys.all, "roles"] as const,
    list: () => [...ssoQueryKeys.roles.all(), "list"] as const,
    detail: (id: number | string) =>
      [...ssoQueryKeys.roles.all(), "detail", id] as const,
    permissions: (id: number | string) =>
      [...ssoQueryKeys.roles.all(), id, "permissions"] as const,
  },

  // =========================================================================
  // Permissions (permissionService)
  // =========================================================================
  permissions: {
    all: () => [...ssoQueryKeys.all, "permissions"] as const,
    list: (params?: { group?: string; search?: string; grouped?: boolean }) =>
      [...ssoQueryKeys.permissions.all(), "list", params] as const,
    detail: (id: number | string) =>
      [...ssoQueryKeys.permissions.all(), "detail", id] as const,
    matrix: () => [...ssoQueryKeys.permissions.all(), "matrix"] as const,
  },

  // =========================================================================
  // Teams (teamService)
  // =========================================================================
  teams: {
    all: () => [...ssoQueryKeys.all, "teams"] as const,
    list: () => [...ssoQueryKeys.teams.all(), "list"] as const,
    permissions: (teamId: number) =>
      [...ssoQueryKeys.teams.all(), teamId, "permissions"] as const,
    orphaned: () => [...ssoQueryKeys.teams.all(), "orphaned"] as const,
  },

  // =========================================================================
  // User Roles (userRoleService) - Scoped Role Assignments
  // =========================================================================
  userRoles: {
    all: () => [...ssoQueryKeys.all, "user-roles"] as const,
    list: (userId: string) =>
      [...ssoQueryKeys.userRoles.all(), userId] as const,
    byBranch: (userId: string, orgId: string, branchId: string | null) =>
      [...ssoQueryKeys.userRoles.all(), userId, orgId, branchId] as const,
  },

  // =========================================================================
  // Branches (branchService)
  // =========================================================================
  branches: {
    all: () => [...ssoQueryKeys.all, "branches"] as const,
    list: (orgId?: string) =>
      [...ssoQueryKeys.branches.all(), "list", orgId] as const,
    detail: (branchId: number) =>
      [...ssoQueryKeys.branches.all(), "detail", branchId] as const,
    headquarters: (orgId?: string) =>
      [...ssoQueryKeys.branches.all(), "headquarters", orgId] as const,
    primary: (orgId?: string) =>
      [...ssoQueryKeys.branches.all(), "primary", orgId] as const,
  },

  // =========================================================================
  // Admin variants (with org context)
  // =========================================================================
  admin: {
    roles: {
      all: (orgId: string) =>
        [...ssoQueryKeys.all, "admin", orgId, "roles"] as const,
      list: (orgId: string) =>
        [...ssoQueryKeys.admin.roles.all(orgId), "list"] as const,
      detail: (orgId: string, id: number | string) =>
        [...ssoQueryKeys.admin.roles.all(orgId), "detail", id] as const,
      permissions: (orgId: string, id: number | string) =>
        [...ssoQueryKeys.admin.roles.all(orgId), id, "permissions"] as const,
    },

    permissions: {
      all: (orgId: string) =>
        [...ssoQueryKeys.all, "admin", orgId, "permissions"] as const,
      list: (orgId: string, params?: { group?: string; search?: string; grouped?: boolean }) =>
        [...ssoQueryKeys.admin.permissions.all(orgId), "list", params] as const,
      detail: (orgId: string, id: number | string) =>
        [...ssoQueryKeys.admin.permissions.all(orgId), "detail", id] as const,
      matrix: (orgId: string) =>
        [...ssoQueryKeys.admin.permissions.all(orgId), "matrix"] as const,
    },

    teams: {
      all: (orgId: string) =>
        [...ssoQueryKeys.all, "admin", orgId, "teams"] as const,
      list: (orgId: string) =>
        [...ssoQueryKeys.admin.teams.all(orgId), "list"] as const,
      permissions: (orgId: string, teamId: number) =>
        [...ssoQueryKeys.admin.teams.all(orgId), teamId, "permissions"] as const,
      orphaned: (orgId: string) =>
        [...ssoQueryKeys.admin.teams.all(orgId), "orphaned"] as const,
    },

    userRoles: {
      all: (orgId: string) =>
        [...ssoQueryKeys.all, "admin", orgId, "user-roles"] as const,
      list: (orgId: string, userId: string) =>
        [...ssoQueryKeys.admin.userRoles.all(orgId), userId] as const,
      byBranch: (orgId: string, userId: string, consoleOrgId: string, branchId: string | null) =>
        [...ssoQueryKeys.admin.userRoles.all(orgId), userId, consoleOrgId, branchId] as const,
    },

    users: {
      all: (orgId: string) =>
        [...ssoQueryKeys.all, "admin", orgId, "users"] as const,
      list: (orgId: string, params?: { search?: string }) =>
        [...ssoQueryKeys.admin.users.all(orgId), "list", params] as const,
      detail: (orgId: string, id: string) =>
        [...ssoQueryKeys.admin.users.all(orgId), "detail", id] as const,
      permissions: (orgId: string, userId: string, consoleOrgId?: string, branchId?: string) =>
        [...ssoQueryKeys.admin.users.all(orgId), userId, "permissions", consoleOrgId, branchId] as const,
    },
  },
} as const;
