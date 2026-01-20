/**
 * Auth Service - SSO Authentication
 *
 * Handles SSO callback, logout, user info
 */

import { buildHeaders, csrf, request, type ServiceConfig } from "./utils";

// =============================================================================
// Types
// =============================================================================

export interface SsoUser {
  id: number;
  console_user_id: number;
  email: string;
  name: string;
}

export interface Organization {
  id: number;
  slug: string;
  name: string;
  role: string;
}

export interface AuthCallbackInput {
  code: string;
  device_name?: string;
}

export interface AuthCallbackResponse {
  user: SsoUser;
  organizations: Organization[];
  token?: string;
}

export interface AuthUserResponse {
  user: SsoUser;
  organizations: Organization[];
}

// =============================================================================
// Service Factory
// =============================================================================

export function createAuthService(config: ServiceConfig) {
  const { apiUrl } = config;

  return {
    /**
     * Exchange SSO authorization code for tokens
     * POST /api/sso/callback
     */
    callback: async (input: AuthCallbackInput): Promise<AuthCallbackResponse> => {
      await csrf(apiUrl);
      return request(apiUrl, "/api/sso/callback", {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify(input),
      });
    },

    /**
     * Logout current user and revoke tokens
     * POST /api/sso/logout
     */
    logout: async (): Promise<{ message: string }> => {
      return request(apiUrl, "/api/sso/logout", {
        method: "POST",
        headers: buildHeaders(),
      });
    },

    /**
     * Get current authenticated user with organizations
     * GET /api/sso/user
     */
    getUser: async (): Promise<AuthUserResponse> => {
      return request(apiUrl, "/api/sso/user", {
        headers: buildHeaders(),
      });
    },

    /**
     * Get Console SSO global logout URL
     * GET /api/sso/global-logout-url
     */
    getGlobalLogoutUrl: async (redirectUri?: string): Promise<{ logout_url: string }> => {
      const params = redirectUri
        ? `?redirect_uri=${encodeURIComponent(redirectUri)}`
        : "";
      return request(apiUrl, `/api/sso/global-logout-url${params}`, {
        headers: buildHeaders(),
      });
    },
  };
}

export type AuthService = ReturnType<typeof createAuthService>;
