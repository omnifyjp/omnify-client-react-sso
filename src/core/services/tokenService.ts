/**
 * Token Service - API Token Management
 *
 * For mobile apps using bearer tokens
 */

import { buildHeaders, request, type ServiceConfig } from "./utils";

// =============================================================================
// Types
// =============================================================================

export interface ApiToken {
  id: number;
  name: string;
  last_used_at: string | null;
  created_at: string;
  is_current: boolean;
}

// =============================================================================
// Service Factory
// =============================================================================

export function createTokenService(config: ServiceConfig) {
  const { apiUrl } = config;

  return {
    /**
     * List all API tokens for current user
     * GET /api/sso/tokens
     */
    list: async (): Promise<{ tokens: ApiToken[] }> => {
      return request(apiUrl, "/api/sso/tokens", {
        headers: buildHeaders(),
      });
    },

    /**
     * Revoke a specific token
     * DELETE /api/sso/tokens/{tokenId}
     */
    revoke: async (tokenId: number): Promise<{ message: string }> => {
      return request(apiUrl, `/api/sso/tokens/${tokenId}`, {
        method: "DELETE",
        headers: buildHeaders(),
      });
    },

    /**
     * Revoke all tokens except current
     * POST /api/sso/tokens/revoke-others
     */
    revokeOthers: async (): Promise<{ message: string; revoked_count: number }> => {
      return request(apiUrl, "/api/sso/tokens/revoke-others", {
        method: "POST",
        headers: buildHeaders(),
      });
    },
  };
}

export type TokenService = ReturnType<typeof createTokenService>;
