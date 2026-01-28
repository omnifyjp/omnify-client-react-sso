import { describe, it, expect } from 'vitest';
import { ssoQueryKeys } from './queryKeys';

describe('ssoQueryKeys', () => {
    describe('root', () => {
        it('should have "sso" as root key', () => {
            expect(ssoQueryKeys.all).toEqual(['sso']);
        });
    });

    describe('auth', () => {
        it('should generate auth keys', () => {
            expect(ssoQueryKeys.auth.all()).toEqual(['sso', 'auth']);
            expect(ssoQueryKeys.auth.user()).toEqual(['sso', 'auth', 'user']);
        });

        it('should generate globalLogoutUrl key with redirect', () => {
            expect(ssoQueryKeys.auth.globalLogoutUrl('/home')).toEqual([
                'sso',
                'auth',
                'global-logout-url',
                '/home',
            ]);
        });

        it('should generate globalLogoutUrl key without redirect', () => {
            expect(ssoQueryKeys.auth.globalLogoutUrl()).toEqual([
                'sso',
                'auth',
                'global-logout-url',
                undefined,
            ]);
        });
    });

    describe('tokens', () => {
        it('should generate token keys', () => {
            expect(ssoQueryKeys.tokens.all()).toEqual(['sso', 'tokens']);
            expect(ssoQueryKeys.tokens.list()).toEqual(['sso', 'tokens', 'list']);
        });
    });

    describe('roles', () => {
        it('should generate role keys', () => {
            expect(ssoQueryKeys.roles.all()).toEqual(['sso', 'roles']);
            expect(ssoQueryKeys.roles.list()).toEqual(['sso', 'roles', 'list']);
        });

        it('should generate role detail key', () => {
            expect(ssoQueryKeys.roles.detail(123)).toEqual(['sso', 'roles', 'detail', 123]);
        });
    });

    describe('permissions', () => {
        it('should generate permission keys', () => {
            expect(ssoQueryKeys.permissions.all()).toEqual(['sso', 'permissions']);
            expect(ssoQueryKeys.permissions.matrix()).toEqual(['sso', 'permissions', 'matrix']);
        });

        it('should generate permission list key with params', () => {
            const params = { group: 'admin', search: 'test' };
            expect(ssoQueryKeys.permissions.list(params)).toEqual([
                'sso',
                'permissions',
                'list',
                params,
            ]);
        });

        it('should generate permission list key without params', () => {
            expect(ssoQueryKeys.permissions.list()).toEqual([
                'sso',
                'permissions',
                'list',
                undefined,
            ]);
        });
    });

    describe('admin.roles', () => {
        const orgId = 'my-org';

        it('should generate admin role keys with org slug', () => {
            expect(ssoQueryKeys.admin.roles.all(orgId)).toEqual([
                'sso',
                'admin',
                'my-org',
                'roles',
            ]);
            expect(ssoQueryKeys.admin.roles.list(orgId)).toEqual([
                'sso',
                'admin',
                'my-org',
                'roles',
                'list',
            ]);
        });

        it('should generate admin role detail key', () => {
            expect(ssoQueryKeys.admin.roles.detail(orgId, 456)).toEqual([
                'sso',
                'admin',
                'my-org',
                'roles',
                'detail',
                456,
            ]);
        });

        it('should generate admin role permissions key', () => {
            expect(ssoQueryKeys.admin.roles.permissions(orgId, 789)).toEqual([
                'sso',
                'admin',
                'my-org',
                'roles',
                789,
                'permissions',
            ]);
        });
    });

    describe('admin.permissions', () => {
        const orgId = 'test-org';

        it('should generate admin permission keys', () => {
            expect(ssoQueryKeys.admin.permissions.all(orgId)).toEqual([
                'sso',
                'admin',
                'test-org',
                'permissions',
            ]);
            expect(ssoQueryKeys.admin.permissions.matrix(orgId)).toEqual([
                'sso',
                'admin',
                'test-org',
                'permissions',
                'matrix',
            ]);
        });

        it('should generate admin permission list with params', () => {
            const params = { grouped: true };
            expect(ssoQueryKeys.admin.permissions.list(orgId, params)).toEqual([
                'sso',
                'admin',
                'test-org',
                'permissions',
                'list',
                params,
            ]);
        });
    });

    describe('admin.teams', () => {
        const orgId = 'team-org';

        it('should generate admin team keys', () => {
            expect(ssoQueryKeys.admin.teams.all(orgId)).toEqual([
                'sso',
                'admin',
                'team-org',
                'teams',
            ]);
            expect(ssoQueryKeys.admin.teams.list(orgId)).toEqual([
                'sso',
                'admin',
                'team-org',
                'teams',
                'list',
            ]);
            expect(ssoQueryKeys.admin.teams.orphaned(orgId)).toEqual([
                'sso',
                'admin',
                'team-org',
                'teams',
                'orphaned',
            ]);
        });

        it('should generate team permission key', () => {
            expect(ssoQueryKeys.admin.teams.permissions(orgId, 999)).toEqual([
                'sso',
                'admin',
                'team-org',
                'teams',
                999,
                'permissions',
            ]);
        });
    });
});
