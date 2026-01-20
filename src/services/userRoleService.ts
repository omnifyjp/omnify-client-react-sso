/**
 * User Role Service - Scoped Role Assignments
 *
 * Implements Branch-Level Permissions management:
 * - Global: org_id=null, branch_id=null → Role applies everywhere
 * - Org-wide: org_id=X, branch_id=null → Role applies to all branches in org
 * - Branch: org_id=X, branch_id=Y → Role applies only to specific branch
 */

import { buildHeaders, request, type ServiceConfig } from "./utils";

// =============================================================================
// Types
// =============================================================================

export type RoleScope = "global" | "org-wide" | "branch";

export interface RoleAssignment {
  id: string | null;
  role: {
    id: string;
    name: string;
    slug: string;
    level: number;
  };
  console_org_id: string | null;
  console_branch_id: string | null;
  scope: RoleScope;
  created_at: string | null;
}

export interface UserRoleListResponse {
  data: RoleAssignment[];
}

export interface AssignRoleInput {
  role_id: string;
  console_org_id?: string | null;
  console_branch_id?: string | null;
}

export interface AssignRoleResponse {
  message: string;
  data: {
    role: {
      id: string;
      name: string;
      slug: string;
      level: number;
    };
    console_org_id: string | null;
    console_branch_id: string | null;
    scope: RoleScope;
  };
}

export interface SyncRolesInput {
  roles: string[]; // Role IDs or slugs
  console_org_id?: string | null;
  console_branch_id?: string | null;
}

export interface SyncRolesResponse {
  message: string;
  attached: string[];
  detached: string[];
  scope: RoleScope;
}

export interface RemoveRoleResponse {
  message: string;
  removed: number;
}

// =============================================================================
// Service Factory
// =============================================================================

export function createUserRoleService(config: ServiceConfig) {
  const { apiUrl } = config;

  return {
    /**
     * List user's role assignments with scope information
     * GET /api/admin/sso/users/{userId}/roles
     */
    list: async (userId: string, orgSlug?: string): Promise<RoleAssignment[]> => {
      const response = await request<UserRoleListResponse>(
        apiUrl,
        `/api/admin/sso/users/${userId}/roles`,
        { headers: buildHeaders(orgSlug) }
      );
      return response.data;
    },

    /**
     * List user's role assignments filtered by branch context
     * Returns roles applicable to the given org/branch
     */
    listByBranch: async (
      userId: string,
      orgId: string,
      branchId: string | null,
      orgSlug?: string
    ): Promise<RoleAssignment[]> => {
      const all = await request<UserRoleListResponse>(
        apiUrl,
        `/api/admin/sso/users/${userId}/roles`,
        { headers: buildHeaders(orgSlug) }
      );

      // Filter assignments that apply to this branch:
      // 1. Global assignments (org=null)
      // 2. Org-wide assignments (org=X, branch=null)
      // 3. Branch-specific assignments (org=X, branch=Y)
      return all.data.filter((a) => {
        // Global applies everywhere
        if (a.console_org_id === null) return true;

        // Must be same org
        if (a.console_org_id !== orgId) return false;

        // Org-wide applies to all branches
        if (a.console_branch_id === null) return true;

        // Branch-specific must match
        return a.console_branch_id === branchId;
      });
    },

    /**
     * Assign a role to user with scope
     * POST /api/admin/sso/users/{userId}/roles
     */
    assign: async (
      userId: string,
      input: AssignRoleInput,
      orgSlug?: string
    ): Promise<AssignRoleResponse> => {
      return request<AssignRoleResponse>(
        apiUrl,
        `/api/admin/sso/users/${userId}/roles`,
        {
          method: "POST",
          headers: buildHeaders(orgSlug),
          body: JSON.stringify(input),
        }
      );
    },

    /**
     * Remove a role assignment from user
     * DELETE /api/admin/sso/users/{userId}/roles/{roleId}
     */
    remove: async (
      userId: string,
      roleId: string,
      orgId?: string | null,
      branchId?: string | null,
      orgSlug?: string
    ): Promise<RemoveRoleResponse> => {
      return request<RemoveRoleResponse>(
        apiUrl,
        `/api/admin/sso/users/${userId}/roles/${roleId}`,
        {
          method: "DELETE",
          headers: buildHeaders(orgSlug),
          body: JSON.stringify({
            console_org_id: orgId ?? null,
            console_branch_id: branchId ?? null,
          }),
        }
      );
    },

    /**
     * Sync roles for user in a specific scope
     * PUT /api/admin/sso/users/{userId}/roles/sync
     */
    sync: async (
      userId: string,
      input: SyncRolesInput,
      orgSlug?: string
    ): Promise<SyncRolesResponse> => {
      return request<SyncRolesResponse>(
        apiUrl,
        `/api/admin/sso/users/${userId}/roles/sync`,
        {
          method: "PUT",
          headers: buildHeaders(orgSlug),
          body: JSON.stringify(input),
        }
      );
    },
  };
}

// Export type for the service
export type UserRoleService = ReturnType<typeof createUserRoleService>;

// =============================================================================
// Helper functions for permission resolution
// =============================================================================

/**
 * Get scope label for display
 */
export const getScopeLabel = (
  scope: RoleScope,
  locale: "en" | "ja" | "vi" = "en"
): string => {
  const labels: Record<RoleScope, Record<string, string>> = {
    global: { en: "Global", ja: "グローバル", vi: "Toàn hệ thống" },
    "org-wide": { en: "Organization", ja: "組織全体", vi: "Toàn tổ chức" },
    branch: { en: "Branch", ja: "支店限定", vi: "Chi nhánh" },
  };
  return labels[scope][locale] || labels[scope]["en"];
};

/**
 * Get effective permissions for a user at a specific branch
 * based on their role assignments
 */
export const getEffectivePermissions = <
  TRole extends { id: string; permissions?: Array<string | { slug: string }> }
>(
  roleAssignments: RoleAssignment[],
  allRoles: TRole[],
  orgId: string,
  branchId: string | null
): string[] => {
  const permissions = new Set<string>();

  // Filter applicable assignments
  const applicableAssignments = roleAssignments.filter((a) => {
    if (a.console_org_id === null) return true;
    if (a.console_org_id !== orgId) return false;
    if (a.console_branch_id === null) return true;
    return a.console_branch_id === branchId;
  });

  // Collect permissions from all applicable roles
  for (const assignment of applicableAssignments) {
    const role = allRoles.find((r) => r.id === assignment.role.id);
    if (role?.permissions) {
      for (const perm of role.permissions) {
        if (typeof perm === "string") {
          permissions.add(perm);
        } else if (perm.slug) {
          permissions.add(perm.slug);
        }
      }
    }
  }

  return Array.from(permissions);
};
