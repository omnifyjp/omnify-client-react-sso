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
    list: (orgSlug?: string) =>
      [...ssoQueryKeys.branches.all(), "list", orgSlug] as const,
    detail: (branchId: number) =>
      [...ssoQueryKeys.branches.all(), "detail", branchId] as const,
    headquarters: (orgSlug?: string) =>
      [...ssoQueryKeys.branches.all(), "headquarters", orgSlug] as const,
    primary: (orgSlug?: string) =>
      [...ssoQueryKeys.branches.all(), "primary", orgSlug] as const,
  },

  // =========================================================================
  // Admin variants (with org context)
  // =========================================================================
  admin: {
    roles: {
      all: (orgSlug: string) =>
        [...ssoQueryKeys.all, "admin", orgSlug, "roles"] as const,
      list: (orgSlug: string) =>
        [...ssoQueryKeys.admin.roles.all(orgSlug), "list"] as const,
      detail: (orgSlug: string, id: number | string) =>
        [...ssoQueryKeys.admin.roles.all(orgSlug), "detail", id] as const,
      permissions: (orgSlug: string, id: number | string) =>
        [...ssoQueryKeys.admin.roles.all(orgSlug), id, "permissions"] as const,
    },

    permissions: {
      all: (orgSlug: string) =>
        [...ssoQueryKeys.all, "admin", orgSlug, "permissions"] as const,
      list: (orgSlug: string, params?: { group?: string; search?: string; grouped?: boolean }) =>
        [...ssoQueryKeys.admin.permissions.all(orgSlug), "list", params] as const,
      detail: (orgSlug: string, id: number | string) =>
        [...ssoQueryKeys.admin.permissions.all(orgSlug), "detail", id] as const,
      matrix: (orgSlug: string) =>
        [...ssoQueryKeys.admin.permissions.all(orgSlug), "matrix"] as const,
    },

    teams: {
      all: (orgSlug: string) =>
        [...ssoQueryKeys.all, "admin", orgSlug, "teams"] as const,
      list: (orgSlug: string) =>
        [...ssoQueryKeys.admin.teams.all(orgSlug), "list"] as const,
      permissions: (orgSlug: string, teamId: number) =>
        [...ssoQueryKeys.admin.teams.all(orgSlug), teamId, "permissions"] as const,
      orphaned: (orgSlug: string) =>
        [...ssoQueryKeys.admin.teams.all(orgSlug), "orphaned"] as const,
    },

    userRoles: {
      all: (orgSlug: string) =>
        [...ssoQueryKeys.all, "admin", orgSlug, "user-roles"] as const,
      list: (orgSlug: string, userId: string) =>
        [...ssoQueryKeys.admin.userRoles.all(orgSlug), userId] as const,
      byBranch: (orgSlug: string, userId: string, orgId: string, branchId: string | null) =>
        [...ssoQueryKeys.admin.userRoles.all(orgSlug), userId, orgId, branchId] as const,
    },
  },
} as const;
