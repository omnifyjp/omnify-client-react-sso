import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createSsoService } from './ssoService';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Mock document.cookie for XSRF token
Object.defineProperty(document, 'cookie', {
    writable: true,
    value: 'XSRF-TOKEN=test-token',
});

describe('createSsoService', () => {
    const apiUrl = 'https://api.example.com';
    let service: ReturnType<typeof createSsoService>;

    beforeEach(() => {
        service = createSsoService({ apiUrl });
        mockFetch.mockReset();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('configuration', () => {
        it('should create service with correct apiUrl', () => {
            expect(service).toBeDefined();
            expect(service.callback).toBeDefined();
            expect(service.logout).toBeDefined();
            expect(service.getUser).toBeDefined();
        });
    });

    describe('callback', () => {
        it('should call callback endpoint with code', async () => {
            const mockUser = { id: 1, email: 'test@example.com', name: 'Test' };
            const mockOrgs = [{ id: 1, slug: 'org-1', name: 'Org 1', role: 'admin' }];

            // First call is CSRF, second is callback
            mockFetch
                .mockResolvedValueOnce({ ok: true }) // CSRF
                .mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve({ user: mockUser, organizations: mockOrgs }),
                });

            const result = await service.callback({ code: 'test-code' });

            expect(mockFetch).toHaveBeenCalledTimes(2);
            expect(mockFetch).toHaveBeenLastCalledWith(
                `${apiUrl}/api/sso/callback`,
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ code: 'test-code' }),
                })
            );
            expect(result.user).toEqual(mockUser);
        });

        it('should throw error on failed callback', async () => {
            mockFetch
                .mockResolvedValueOnce({ ok: true }) // CSRF
                .mockResolvedValueOnce({
                    ok: false,
                    status: 401,
                    json: () => Promise.resolve({ message: 'Invalid code' }),
                });

            await expect(service.callback({ code: 'bad-code' })).rejects.toThrow('Invalid code');
        });
    });

    describe('getUser', () => {
        it('should fetch current user', async () => {
            const mockUser = { id: 1, email: 'test@example.com', name: 'Test' };
            const mockOrgs = [{ id: 1, slug: 'org-1', name: 'Org 1', role: 'admin' }];

            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ user: mockUser, organizations: mockOrgs }),
            });

            const result = await service.getUser();

            expect(mockFetch).toHaveBeenCalledWith(
                `${apiUrl}/api/sso/user`,
                expect.objectContaining({
                    credentials: 'include',
                })
            );
            expect(result.user).toEqual(mockUser);
            expect(result.organizations).toEqual(mockOrgs);
        });
    });

    describe('logout', () => {
        it('should call logout endpoint', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ message: 'Logged out' }),
            });

            const result = await service.logout();

            expect(mockFetch).toHaveBeenCalledWith(
                `${apiUrl}/api/sso/logout`,
                expect.objectContaining({
                    method: 'POST',
                })
            );
            expect(result.message).toBe('Logged out');
        });
    });

    describe('getRoles', () => {
        it('should fetch roles list wrapped in data', async () => {
            const mockRoles = [
                { id: 1, name: 'Admin', slug: 'admin', level: 100 },
                { id: 2, name: 'User', slug: 'user', level: 10 },
            ];
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ data: mockRoles }),
            });

            const result = await service.getRoles();

            expect(mockFetch).toHaveBeenCalledWith(
                `${apiUrl}/api/sso/roles`,
                expect.any(Object)
            );
            expect(result.data).toEqual(mockRoles);
        });
    });

    describe('getPermissions', () => {
        it('should fetch permissions list wrapped in data', async () => {
            const mockPermissions = [
                { id: 1, name: 'Create Post', slug: 'posts.create', group: 'posts' },
                { id: 2, name: 'Edit Post', slug: 'posts.edit', group: 'posts' },
            ];
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ data: mockPermissions, groups: ['posts'] }),
            });

            const result = await service.getPermissions();

            expect(mockFetch).toHaveBeenCalledWith(
                `${apiUrl}/api/sso/permissions`,
                expect.any(Object)
            );
            expect(result.data).toEqual(mockPermissions);
            expect(result.groups).toEqual(['posts']);
        });
    });

    describe('getTokens', () => {
        it('should fetch user tokens wrapped in tokens', async () => {
            const mockTokens = [
                { id: 1, name: 'Token 1', is_current: true },
            ];
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ tokens: mockTokens }),
            });

            const result = await service.getTokens();

            expect(mockFetch).toHaveBeenCalledWith(
                `${apiUrl}/api/sso/tokens`,
                expect.any(Object)
            );
            expect(result.tokens).toEqual(mockTokens);
        });
    });

    describe('getGlobalLogoutUrl', () => {
        it('should fetch global logout URL', async () => {
            const logoutUrl = 'https://console.example.com/logout?redirect=https://app.com';
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ logout_url: logoutUrl }),
            });

            const result = await service.getGlobalLogoutUrl('https://app.com');

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/sso/global-logout-url'),
                expect.any(Object)
            );
            expect(result.logout_url).toBe(logoutUrl);
        });
    });

    describe('revokeToken', () => {
        it('should revoke a specific token', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ message: 'Token revoked' }),
            });

            const result = await service.revokeToken(123);

            expect(mockFetch).toHaveBeenCalledWith(
                `${apiUrl}/api/sso/tokens/123`,
                expect.objectContaining({
                    method: 'DELETE',
                })
            );
            expect(result.message).toBe('Token revoked');
        });
    });
});
