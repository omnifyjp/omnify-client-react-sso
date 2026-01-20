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
    list: async (orgSlug: string): Promise<{ teams: TeamWithPermissions[] }> => {
      return request(apiUrl, "/api/admin/sso/teams/permissions", {
        headers: buildHeaders(orgSlug),
      });
    },

    /**
     * Get specific team permissions (admin only)
     * GET /api/admin/sso/teams/{teamId}/permissions
     */
    getPermissions: async (
      teamId: number,
      orgSlug: string
    ): Promise<TeamPermissionDetail> => {
      return request(apiUrl, `/api/admin/sso/teams/${teamId}/permissions`, {
        headers: buildHeaders(orgSlug),
      });
    },

    /**
     * Sync team permissions (admin only)
     * PUT /api/admin/sso/teams/{teamId}/permissions
     */
    syncPermissions: async (
      teamId: number,
      input: SyncTeamPermissionsInput,
      orgSlug: string
    ): Promise<{
      message: string;
      console_team_id: number;
      attached: number;
      detached: number;
    }> => {
      return request(apiUrl, `/api/admin/sso/teams/${teamId}/permissions`, {
        method: "PUT",
        headers: buildHeaders(orgSlug),
        body: JSON.stringify(input),
      });
    },

    /**
     * Remove all permissions for a team (admin only)
     * DELETE /api/admin/sso/teams/{teamId}/permissions
     */
    removePermissions: async (teamId: number, orgSlug: string): Promise<void> => {
      return request(apiUrl, `/api/admin/sso/teams/${teamId}/permissions`, {
        method: "DELETE",
        headers: buildHeaders(orgSlug),
      });
    },

    /**
     * List orphaned team permissions (admin only)
     * GET /api/admin/sso/teams/orphaned
     */
    listOrphaned: async (
      orgSlug: string
    ): Promise<{
      orphaned_teams: OrphanedTeam[];
      total_orphaned_permissions: number;
    }> => {
      return request(apiUrl, "/api/admin/sso/teams/orphaned", {
        headers: buildHeaders(orgSlug),
      });
    },

    /**
     * Restore orphaned team permissions (admin only)
     * POST /api/admin/sso/teams/orphaned/{teamId}/restore
     */
    restoreOrphaned: async (
      teamId: number,
      orgSlug: string
    ): Promise<{
      message: string;
      console_team_id: number;
      restored_count: number;
    }> => {
      return request(apiUrl, `/api/admin/sso/teams/orphaned/${teamId}/restore`, {
        method: "POST",
        headers: buildHeaders(orgSlug),
      });
    },

    /**
     * Cleanup orphaned team permissions (admin only)
     * DELETE /api/admin/sso/teams/orphaned
     */
    cleanupOrphaned: async (
      orgSlug: string,
      input?: CleanupOrphanedInput
    ): Promise<{ message: string; deleted_count: number }> => {
      return request(apiUrl, "/api/admin/sso/teams/orphaned", {
        method: "DELETE",
        headers: buildHeaders(orgSlug),
        body: input ? JSON.stringify(input) : undefined,
      });
    },
  };
}

export type TeamService = ReturnType<typeof createTeamService>;
