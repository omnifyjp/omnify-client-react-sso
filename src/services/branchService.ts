/**
 * Branch Service - Branch Management
 *
 * Provides methods to fetch branches for the current user/organization
 */

import { buildHeaders, request, type ServiceConfig } from "./utils";

// =============================================================================
// Types
// =============================================================================

export interface Branch {
  id: number;
  code: string;
  name: string;
  is_headquarters: boolean;
  is_primary: boolean;
  is_assigned: boolean;
  access_type: "explicit" | "implicit";
  timezone: string | null;
  currency: string | null;
  locale: string | null;
}

export interface BranchesResponse {
  all_branches_access: boolean;
  branches: Branch[];
  primary_branch_id: number | null;
  organization: {
    id: number;
    slug: string;
    name: string;
  };
}

// =============================================================================
// Service Factory
// =============================================================================

export function createBranchService(config: ServiceConfig) {
  const { apiUrl } = config;

  return {
    /**
     * Get branches for current user in organization
     * GET /api/sso/branches
     */
    list: async (orgSlug?: string): Promise<BranchesResponse> => {
      const params = orgSlug ? `?organization_slug=${orgSlug}` : "";
      return request(apiUrl, `/api/sso/branches${params}`, {
        headers: buildHeaders(),
      });
    },

    /**
     * Get a specific branch by ID
     * GET /api/sso/branches/{id}
     */
    get: async (branchId: number): Promise<Branch> => {
      const response = await request<{ data: Branch } | Branch>(
        apiUrl,
        `/api/sso/branches/${branchId}`,
        { headers: buildHeaders() }
      );
      return "data" in response ? response.data : response;
    },

    /**
     * Get headquarters branch for organization
     */
    getHeadquarters: async (orgSlug?: string): Promise<Branch | null> => {
      try {
        const params = orgSlug ? `?organization_slug=${orgSlug}` : "";
        const data = await request<BranchesResponse>(
          apiUrl,
          `/api/sso/branches${params}`,
          { headers: buildHeaders() }
        );
        return data.branches.find((b) => b.is_headquarters) ?? null;
      } catch {
        return null;
      }
    },

    /**
     * Get primary branch for current user
     */
    getPrimary: async (orgSlug?: string): Promise<Branch | null> => {
      try {
        const params = orgSlug ? `?organization_slug=${orgSlug}` : "";
        const data = await request<BranchesResponse>(
          apiUrl,
          `/api/sso/branches${params}`,
          { headers: buildHeaders() }
        );
        if (data.primary_branch_id) {
          return data.branches.find((b) => b.id === data.primary_branch_id) ?? null;
        }
        return null;
      } catch {
        return null;
      }
    },
  };
}

// Export type for the service
export type BranchService = ReturnType<typeof createBranchService>;
