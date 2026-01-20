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
    adminList: async (orgSlug: string): Promise<{ data: Role[] }> => {
      return request(apiUrl, "/api/admin/sso/roles", {
        headers: buildHeaders(orgSlug),
      });
    },

    /**
     * Get single role (admin)
     * GET /api/admin/sso/roles/{id}
     */
    adminGet: async (
      id: number | string,
      orgSlug: string
    ): Promise<{ data: RoleWithPermissions }> => {
      return request(apiUrl, `/api/admin/sso/roles/${id}`, {
        headers: buildHeaders(orgSlug),
      });
    },

    /**
     * Create role (admin only)
     * POST /api/admin/sso/roles
     */
    create: async (
      input: CreateRoleInput,
      orgSlug: string
    ): Promise<{ data: Role; message: string }> => {
      return request(apiUrl, "/api/admin/sso/roles", {
        method: "POST",
        headers: buildHeaders(orgSlug),
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
      orgSlug: string
    ): Promise<{ data: Role; message: string }> => {
      return request(apiUrl, `/api/admin/sso/roles/${id}`, {
        method: "PUT",
        headers: buildHeaders(orgSlug),
        body: JSON.stringify(input),
      });
    },

    /**
     * Delete role (admin only)
     * DELETE /api/admin/sso/roles/{id}
     */
    delete: async (id: number | string, orgSlug: string): Promise<void> => {
      return request(apiUrl, `/api/admin/sso/roles/${id}`, {
        method: "DELETE",
        headers: buildHeaders(orgSlug),
      });
    },

    /**
     * Get role's permissions (admin)
     * GET /api/admin/sso/roles/{id}/permissions
     */
    getPermissions: async (
      id: number | string,
      orgSlug: string
    ): Promise<{
      role: Pick<Role, "id" | "slug" | "name">;
      permissions: Permission[];
    }> => {
      return request(apiUrl, `/api/admin/sso/roles/${id}/permissions`, {
        headers: buildHeaders(orgSlug),
      });
    },

    /**
     * Sync role's permissions (admin)
     * PUT /api/admin/sso/roles/{id}/permissions
     */
    syncPermissions: async (
      id: number | string,
      input: SyncPermissionsInput,
      orgSlug: string
    ): Promise<SyncPermissionsResponse> => {
      return request(apiUrl, `/api/admin/sso/roles/${id}/permissions`, {
        method: "PUT",
        headers: buildHeaders(orgSlug),
        body: JSON.stringify(input),
      });
    },
  };
}

export type RoleService = ReturnType<typeof createRoleService>;
