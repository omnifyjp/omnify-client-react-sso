/**
 * Shared utilities for SSO services
 */

/**
 * Get XSRF token from cookie (for Sanctum CSRF protection)
 */
export function getXsrfToken(): string | undefined {
  if (typeof document === "undefined") return undefined;
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("XSRF-TOKEN="))
    ?.split("=")[1];
}

/**
 * Build headers with XSRF token and optional org slug
 */
export function buildHeaders(orgSlug?: string): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const xsrfToken = getXsrfToken();
  if (xsrfToken) {
    headers["X-XSRF-TOKEN"] = decodeURIComponent(xsrfToken);
  }

  if (orgSlug) {
    headers["X-Org-Slug"] = orgSlug;
  }

  return headers;
}

/**
 * Fetch CSRF cookie from backend
 */
export async function csrf(apiUrl: string): Promise<void> {
  await fetch(`${apiUrl}/sanctum/csrf-cookie`, {
    credentials: "include",
  });
}

/**
 * Make API request with proper error handling
 */
export async function request<T>(
  apiUrl: string,
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

/**
 * Base service configuration
 */
export interface ServiceConfig {
  apiUrl: string;
}
