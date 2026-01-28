/**
 * Permission Service - Permission Management
 *
 * CRUD operations for permissions and permission matrix
 */

import { buildHeaders, request, type ServiceConfig } from "./utils";
import type { Role, Permission } from "./roleService";

// =============================================================================
// Types
// =============================================================================

export interface PermissionMatrix {
  roles: Pick<Role, "id" | "slug" | "name">[];
  permissions: Record<string, Pick<Permission, "id" | "slug" | "name">[]>;
  matrix: Record<string, string[]>; // role_slug: permission_slugs[]
}

export interface CreatePermissionInput {
  slug: string;
  name: string;
  group?: string;
  description?: string;
}

export interface UpdatePermissionInput {
  name?: string;
  group?: string | null;
  description?: string | null;
}

export interface PermissionListParams {
  group?: string;
  search?: string;
  grouped?: boolean;
}

// =============================================================================
// Service Factory
// =============================================================================

export function createPermissionService(config: ServiceConfig) {
  const { apiUrl } = config;

  return {
    // =========================================================================
    // Read-only endpoints (authenticated users)
    // =========================================================================

    /**
     * Get all permissions
     * GET /api/sso/permissions
     */
    list: async (params?: PermissionListParams): Promise<{ data: Permission[]; groups: string[] }> => {
      const queryString = params
        ? `?${new URLSearchParams(
          Object.entries(params)
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)])
        )}`
        : "";
      return request(apiUrl, `/api/sso/permissions${queryString}`, {
        headers: buildHeaders(),
      });
    },

    /**
     * Get permission matrix (roles x permissions)
     * GET /api/sso/permission-matrix
     */
    getMatrix: async (): Promise<PermissionMatrix> => {
      return request(apiUrl, "/api/sso/permission-matrix", {
        headers: buildHeaders(),
      });
    },

    // =========================================================================
    // Admin endpoints (requires admin role + org context)
    // =========================================================================

    /**
     * List all permissions (admin)
     * GET /api/admin/sso/permissions
     */
    adminList: async (
      orgId: string,
      params?: PermissionListParams
    ): Promise<{ data: Permission[]; groups: string[] }> => {
      const queryString = params
        ? `?${new URLSearchParams(
          Object.entries(params)
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)])
        )}`
        : "";
      return request(apiUrl, `/api/admin/sso/permissions${queryString}`, {
        headers: buildHeaders(orgId),
      });
    },

    /**
     * Get single permission (admin)
     * GET /api/admin/sso/permissions/{id}
     */
    adminGet: async (
      id: number | string,
      orgId: string
    ): Promise<{ data: Permission }> => {
      return request(apiUrl, `/api/admin/sso/permissions/${id}`, {
        headers: buildHeaders(orgId),
      });
    },

    /**
     * Create permission (admin only)
     * POST /api/admin/sso/permissions
     */
    create: async (
      input: CreatePermissionInput,
      orgId: string
    ): Promise<{ data: Permission; message: string }> => {
      return request(apiUrl, "/api/admin/sso/permissions", {
        method: "POST",
        headers: buildHeaders(orgId),
        body: JSON.stringify(input),
      });
    },

    /**
     * Update permission (admin only)
     * PUT /api/admin/sso/permissions/{id}
     */
    update: async (
      id: number | string,
      input: UpdatePermissionInput,
      orgId: string
    ): Promise<{ data: Permission; message: string }> => {
      return request(apiUrl, `/api/admin/sso/permissions/${id}`, {
        method: "PUT",
        headers: buildHeaders(orgId),
        body: JSON.stringify(input),
      });
    },

    /**
     * Delete permission (admin only)
     * DELETE /api/admin/sso/permissions/{id}
     */
    delete: async (id: number | string, orgId: string): Promise<void> => {
      return request(apiUrl, `/api/admin/sso/permissions/${id}`, {
        method: "DELETE",
        headers: buildHeaders(orgId),
      });
    },

    /**
     * Get permission matrix (admin)
     * GET /api/admin/sso/permission-matrix
     */
    adminGetMatrix: async (orgId: string): Promise<PermissionMatrix> => {
      return request(apiUrl, "/api/admin/sso/permission-matrix", {
        headers: buildHeaders(orgId),
      });
    },
  };
}

export type PermissionService = ReturnType<typeof createPermissionService>;

// Re-export Permission type for convenience
export type { Permission } from "./roleService";
