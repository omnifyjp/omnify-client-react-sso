/**
 * Team Service - Team Permission Management
 *
 * Manage team permissions and orphaned team cleanup
 */

import { buildHeaders, request, type ServiceConfig } from "./utils";
import type { Permission } from "./roleService";

// =============================================================================
// Types
// =============================================================================

export interface TeamWithPermissions {
  console_team_id: number;
  name: string;
  path: string | null;
  permissions: Pick<Permission, "id" | "slug">[];
}

export interface TeamPermissionDetail {
  console_team_id: number;
  permissions: Pick<Permission, "id" | "slug" | "name">[];
}

export interface OrphanedTeam {
  console_team_id: number;
  permissions_count: number;
  permissions: string[];
  deleted_at: string | null;
}

export interface SyncTeamPermissionsInput {
  permissions: (number | string)[];
}

export interface CleanupOrphanedInput {
  console_team_id?: number;
  older_than_days?: number;
}

// =============================================================================
// Service Factory
// =============================================================================

export function createTeamService(config: ServiceConfig) {
  const { apiUrl } = config;

  return {
    /**
     * Get all teams with their permissions (admin only)
     * GET /api/admin/sso/teams/permissions
     */
    list: async (orgId: string): Promise<{ teams: TeamWithPermissions[] }> => {
      return request(apiUrl, "/api/admin/sso/teams/permissions", {
        headers: buildHeaders(orgId),
      });
    },

    /**
     * Get specific team permissions (admin only)
     * GET /api/admin/sso/teams/{teamId}/permissions
     */
    getPermissions: async (
      teamId: number,
      orgId: string
    ): Promise<TeamPermissionDetail> => {
      return request(apiUrl, `/api/admin/sso/teams/${teamId}/permissions`, {
        headers: buildHeaders(orgId),
      });
    },

    /**
     * Sync team permissions (admin only)
     * PUT /api/admin/sso/teams/{teamId}/permissions
     */
    syncPermissions: async (
      teamId: number,
      input: SyncTeamPermissionsInput,
      orgId: string
    ): Promise<{
      message: string;
      console_team_id: number;
      attached: number;
      detached: number;
    }> => {
      return request(apiUrl, `/api/admin/sso/teams/${teamId}/permissions`, {
        method: "PUT",
        headers: buildHeaders(orgId),
        body: JSON.stringify(input),
      });
    },

    /**
     * Remove all permissions for a team (admin only)
     * DELETE /api/admin/sso/teams/{teamId}/permissions
     */
    removePermissions: async (teamId: number, orgId: string): Promise<void> => {
      return request(apiUrl, `/api/admin/sso/teams/${teamId}/permissions`, {
        method: "DELETE",
        headers: buildHeaders(orgId),
      });
    },

    /**
     * List orphaned team permissions (admin only)
     * GET /api/admin/sso/teams/orphaned
     */
    listOrphaned: async (
      orgId: string
    ): Promise<{
      orphaned_teams: OrphanedTeam[];
      total_orphaned_permissions: number;
    }> => {
      return request(apiUrl, "/api/admin/sso/teams/orphaned", {
        headers: buildHeaders(orgId),
      });
    },

    /**
     * Restore orphaned team permissions (admin only)
     * POST /api/admin/sso/teams/orphaned/{teamId}/restore
     */
    restoreOrphaned: async (
      teamId: number,
      orgId: string
    ): Promise<{
      message: string;
      console_team_id: number;
      restored_count: number;
    }> => {
      return request(apiUrl, `/api/admin/sso/teams/orphaned/${teamId}/restore`, {
        method: "POST",
        headers: buildHeaders(orgId),
      });
    },

    /**
     * Cleanup orphaned team permissions (admin only)
     * DELETE /api/admin/sso/teams/orphaned
     */
    cleanupOrphaned: async (
      orgId: string,
      input?: CleanupOrphanedInput
    ): Promise<{ message: string; deleted_count: number }> => {
      return request(apiUrl, "/api/admin/sso/teams/orphaned", {
        method: "DELETE",
        headers: buildHeaders(orgId),
        body: input ? JSON.stringify(input) : undefined,
      });
    },
  };
}

export type TeamService = ReturnType<typeof createTeamService>;
