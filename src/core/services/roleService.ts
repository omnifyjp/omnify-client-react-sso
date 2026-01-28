/**
 * Role Service - Role Management
 *
 * CRUD operations for roles and role-permission assignments
 */

import { buildHeaders, request, type ServiceConfig } from "./utils";

// =============================================================================
// Types
// =============================================================================

export interface Role {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  level: number;
  permissions_count?: number;
  console_org_id?: string | null;
  organization?: {
    id: string;
    console_org_id: string;
    name: string;
    code: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: number;
  name: string;
  slug: string;
  group: string | null;
  description?: string | null;
  roles_count?: number;
  created_at: string;
  updated_at: string;
}

export interface RoleWithPermissions extends Role {
  permissions: Permission[];
}

export interface CreateRoleInput {
  slug: string;
  name: string;
  level: number;
  description?: string;
  scope?: "global" | "org" | "org-wide" | "branch";
  console_org_id?: string | null;
}

export interface RoleListParams {
  "filter[scope]"?: "all" | "global" | "org";
  "filter[search]"?: string;
  page?: number;
  per_page?: number;
}

export interface UpdateRoleInput {
  name?: string;
  level?: number;
  description?: string | null;
}

export interface SyncPermissionsInput {
  permissions: (number | string)[];
}

export interface SyncPermissionsResponse {
  message: string;
  attached: number;
  detached: number;
}

// =============================================================================
// Service Factory
// =============================================================================

export function createRoleService(config: ServiceConfig) {
  const { apiUrl } = config;

  return {
    // =========================================================================
    // Read-only endpoints (authenticated users)
    // =========================================================================

    /**
     * Get all roles
     * GET /api/sso/roles
     */
    list: async (): Promise<{ data: Role[] }> => {
      return request(apiUrl, "/api/sso/roles", {
        headers: buildHeaders(),
      });
    },

    /**
     * Get single role with permissions
     * GET /api/sso/roles/{id}
     */
    get: async (id: number | string): Promise<{ data: RoleWithPermissions }> => {
      return request(apiUrl, `/api/sso/roles/${id}`, {
        headers: buildHeaders(),
      });
    },

    // =========================================================================
    // Admin endpoints (requires admin role + org context)
    // =========================================================================

    /**
     * List all roles (admin)
     * GET /api/admin/sso/roles
     */
    adminList: async (
      orgId: string,
      params?: RoleListParams
    ): Promise<{ data: Role[] }> => {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
      }
      const query = queryParams.toString();
      const url = `/api/admin/sso/roles${query ? `?${query}` : ""}`;

      return request(apiUrl, url, {
        headers: buildHeaders(orgId),
      });
    },

    /**
     * Get single role (admin)
     * GET /api/admin/sso/roles/{id}
     */
    adminGet: async (
      id: number | string,
      orgId: string
    ): Promise<{ data: RoleWithPermissions }> => {
      return request(apiUrl, `/api/admin/sso/roles/${id}`, {
        headers: buildHeaders(orgId),
      });
    },

    /**
     * Create role (admin only)
     * POST /api/admin/sso/roles
     */
    create: async (
      input: CreateRoleInput,
      orgId: string
    ): Promise<{ data: Role; message: string }> => {
      return request(apiUrl, "/api/admin/sso/roles", {
        method: "POST",
        headers: buildHeaders(orgId),
        body: JSON.stringify(input),
      });
    },

    /**
     * Update role (admin only)
     * PUT /api/admin/sso/roles/{id}
     */
    update: async (
      id: number | string,
      input: UpdateRoleInput,
      orgId: string
    ): Promise<{ data: Role; message: string }> => {
      return request(apiUrl, `/api/admin/sso/roles/${id}`, {
        method: "PUT",
        headers: buildHeaders(orgId),
        body: JSON.stringify(input),
      });
    },

    /**
     * Delete role (admin only)
     * DELETE /api/admin/sso/roles/{id}
     */
    delete: async (id: number | string, orgId: string): Promise<void> => {
      return request(apiUrl, `/api/admin/sso/roles/${id}`, {
        method: "DELETE",
        headers: buildHeaders(orgId),
      });
    },

    /**
     * Get role's permissions (admin)
     * GET /api/admin/sso/roles/{id}/permissions
     */
    getPermissions: async (
      id: number | string,
      orgId: string
    ): Promise<{
      role: Pick<Role, "id" | "slug" | "name">;
      permissions: Permission[];
    }> => {
      return request(apiUrl, `/api/admin/sso/roles/${id}/permissions`, {
        headers: buildHeaders(orgId),
      });
    },

    /**
     * Sync role's permissions (admin)
     * PUT /api/admin/sso/roles/{id}/permissions
     */
    syncPermissions: async (
      id: number | string,
      input: SyncPermissionsInput,
      orgId: string
    ): Promise<SyncPermissionsResponse> => {
      return request(apiUrl, `/api/admin/sso/roles/${id}/permissions`, {
        method: "PUT",
        headers: buildHeaders(orgId),
        body: JSON.stringify(input),
      });
    },
  };
}

export type RoleService = ReturnType<typeof createRoleService>;
