/**
 * Branch Service - Branch Management
 *
 * Provides methods to fetch branches for the current user/organization
 */

import { buildHeaders, request, type ServiceConfig } from "./utils";
import type { BranchCache } from "../schemas/base/BranchCache";

// =============================================================================
// Types
// =============================================================================

/**
 * Branch from SSO API - extends BranchCache with SSO-specific fields
 */
export interface Branch extends Omit<BranchCache, 'id' | 'console_branch_id' | 'console_org_id' | 'is_active' | 'created_at' | 'updated_at' | 'deleted_at'> {
  /** SSO Branch ID (number from API) */
  id: number;
  /** Is user's primary branch */
  is_primary: boolean;
  /** Is branch assigned to user */
  is_assigned: boolean;
  /** Access type */
  access_type: "explicit" | "implicit";
  /** Timezone */
  timezone: string | null;
  /** Currency */
  currency: string | null;
  /** Locale */
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
     * @param orgId - Organization ID or slug (sent via X-Organization-Id header)
     */
    list: async (orgId?: string): Promise<BranchesResponse> => {
      return request(apiUrl, `/api/sso/branches`, {
        headers: buildHeaders(orgId),
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
     * @param orgId - Organization ID or slug (sent via X-Organization-Id header)
     */
    getHeadquarters: async (orgId?: string): Promise<Branch | null> => {
      try {
        const data = await request<BranchesResponse>(
          apiUrl,
          `/api/sso/branches`,
          { headers: buildHeaders(orgId) }
        );
        return data.branches.find((b) => b.is_headquarters) ?? null;
      } catch {
        return null;
      }
    },

    /**
     * Get primary branch for current user
     * @param orgId - Organization ID or slug (sent via X-Organization-Id header)
     */
    getPrimary: async (orgId?: string): Promise<Branch | null> => {
      try {
        const data = await request<BranchesResponse>(
          apiUrl,
          `/api/sso/branches`,
          { headers: buildHeaders(orgId) }
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
