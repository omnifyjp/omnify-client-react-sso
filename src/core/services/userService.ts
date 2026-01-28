/**
 * User Service - User Management for Admin Panel
 *
 * Provides user listing and permission retrieval for admin interface
 */

import { buildHeaders, request, type ServiceConfig } from "./utils";

// =============================================================================
// Types
// =============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  email_verified_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserWithOrg extends User {
  console_org_id?: string;
  organization?: {
    id: string;
    console_org_id: string;
    name: string;
    code: string;
  } | null;
}

export interface UserListParams {
  "filter[search]"?: string;
  "filter[org_id]"?: string;
  page?: number;
  per_page?: number;
}

export interface UserListResponse {
  data: User[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface RoleAssignmentWithPermissions {
  id: string | null;
  role: {
    id: string;
    name: string;
    slug: string;
    level: number;
  };
  console_org_id: string | null;
  console_branch_id: string | null;
  org_name?: string | null;
  branch_name?: string | null;
  scope: "global" | "org-wide" | "branch";
  permissions: Array<{
    id: string;
    name: string;
    slug: string;
    group: string;
  }>;
}

export interface TeamMembershipWithPermissions {
  id: string;
  team: {
    id: string;
    name: string;
    path?: string;
  };
  is_leader?: boolean;
  permissions: Array<{
    id: string;
    name: string;
    slug: string;
    group: string;
  }>;
}

export interface PermissionDetail {
  id: string;
  name: string;
  slug: string;
  group: string;
  sources: Array<{
    type: "role" | "team" | "direct";
    name: string;
    scope?: string;
  }>;
}

export interface UserPermissionsBreakdown {
  user: {
    id: string;
    email: string;
    name: string;
    created_at?: string;
    organization?: {
      id: string;
      console_org_id: string;
      name: string;
      code: string;
    } | null;
  };
  context: {
    org_id: string | null;
    branch_id: string | null;
  };
  role_assignments: RoleAssignmentWithPermissions[];
  team_memberships: TeamMembershipWithPermissions[];
  direct_permissions: Array<{
    id: string;
    name: string;
    slug: string;
    group: string;
  }>;
  effective_permissions: PermissionDetail[];
  aggregated_permissions: string[];
  total_permissions: number;
}

// =============================================================================
// Service Factory
// =============================================================================

export function createUserService(config: ServiceConfig) {
  const { apiUrl } = config;

  return {
    /**
     * List users with optional filters
     * GET /api/admin/sso/users
     */
    list: async (
      params?: UserListParams,
      orgId?: string
    ): Promise<UserListResponse> => {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
      }
      const query = queryParams.toString();
      const url = `/api/admin/sso/users${query ? `?${query}` : ""}`;

      return request<UserListResponse>(apiUrl, url, {
        headers: buildHeaders(orgId),
      });
    },

    /**
     * Get single user by ID
     * GET /api/admin/sso/users/{userId}
     */
    get: async (userId: string, orgId?: string): Promise<User> => {
      const response = await request<{ data: User }>(
        apiUrl,
        `/api/admin/sso/users/${userId}`,
        { headers: buildHeaders(orgId) }
      );
      return response.data;
    },

    /**
     * Get user permissions breakdown for specific org/branch context
     * GET /api/admin/sso/users/{userId}/permissions
     */
    getPermissions: async (
      userId: string,
      consoleOrgId?: string,
      branchId?: string,
      orgId?: string
    ): Promise<UserPermissionsBreakdown> => {
      const queryParams = new URLSearchParams();
      if (consoleOrgId) queryParams.append("org_id", consoleOrgId);
      if (branchId) queryParams.append("branch_id", branchId);
      const query = queryParams.toString();
      const url = `/api/admin/sso/users/${userId}/permissions${query ? `?${query}` : ""}`;

      return request<UserPermissionsBreakdown>(apiUrl, url, {
        headers: buildHeaders(orgId),
      });
    },
  };
}

// Export type for the service
export type UserService = ReturnType<typeof createUserService>;
