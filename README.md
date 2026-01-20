# @famgia/omnify-react-sso

SSO (Single Sign-On) schemas, types, React hooks, components, and utilities for Omnify Console integration.

## Installation

```bash
npm install @famgia/omnify-react-sso
# or
pnpm add @famgia/omnify-react-sso
```

## Features

- **React Hooks**: `useSso()`, `useAuth()`, `useOrganization()` for SSO state management
- **React Components**: `SsoProvider`, `SsoCallback`, `OrganizationSwitcher`, `ProtectedRoute`
- **SSO Services**: Individual services for auth, roles, permissions, branches, teams
- **SSO Schemas**: User, Role, Permission, Branch, Team with Zod validation and i18n
- **Bundled Types**: `@omnify-base` types included - no extra setup needed
- **Multi-locale Support**: Japanese and English labels/messages
- **Query Keys**: Pre-defined TanStack Query keys for SSO data
- **Test Utilities**: Mock factories and helpers for testing

## Quick Start

```tsx
// 1. Wrap your app with SsoProvider
import { SsoProvider } from '@famgia/omnify-react-sso';

function App() {
  return (
    <SsoProvider config={{
      apiUrl: process.env.NEXT_PUBLIC_API_URL,
      consoleUrl: process.env.NEXT_PUBLIC_SSO_URL,
      loginPath: '/login',
      callbackPath: '/sso/callback',
    }}>
      <YourApp />
    </SsoProvider>
  );
}

// 2. Use hooks in your components
import { useSso } from '@famgia/omnify-react-sso';

function Dashboard() {
  const { user, isAuthenticated, currentOrg, logout } = useSso();
  
  if (!isAuthenticated) return <Login />;
  
  return (
    <div>
      Welcome, {user.name}!
      Current org: {currentOrg?.name}
    </div>
  );
}

// 3. Import types directly from package
import type { Role, Permission, Branch, User } from '@famgia/omnify-react-sso';
```

---

## 🔧 Development & Build Workflow

> ⛔ **CRITICAL: DO NOT MODIFY THIS BUILD PROCESS**
> 
> Quy trình build này đã được thiết kế và test kỹ lưỡng. **TUYỆT ĐỐI KHÔNG ĐƯỢC THAY ĐỔI** các bước sau:
> 1. `build:schemas` - Fetch và generate TypeScript từ YAML
> 2. `build:lib` - Bundle với tsup
> 3. `build:copy-base` - Copy @omnify-base vào dist (QUAN TRỌNG cho TypeScript consumers)
> 4. `postinstall` - Tự động tạo @omnify-base cho consumers
>
> Nếu thay đổi, TypeScript consumers sẽ không resolve được types!

### Overview

This package bundles SSO schemas from the Laravel backend (`omnify-client-laravel-sso`) into a self-contained npm package. Consumers don't need to generate schemas - everything is included.

```
┌─────────────────────────────────────────────────────────────────┐
│  Source: omnify-client-laravel-sso                              │
│  database/schemas/Sso/*.yaml                                    │
│  (Branch, Permission, Role, Team, User, etc.)                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼  pnpm build
┌─────────────────────────────────────────────────────────────────┐
│  Package: @famgia/omnify-react-sso                              │
│                                                                  │
│  dist/                                                           │
│  ├── index.js          (hooks, components, services)            │
│  ├── index.d.ts        (type definitions)                       │
│  ├── schemas/          (bundled SSO schemas)                    │
│  ├── testing/          (test utilities)                         │
│  └── @omnify-base/     (bundled for TypeScript consumers)       │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼  npm install
┌─────────────────────────────────────────────────────────────────┐
│  Consumer App (Boilerplate, etc.)                               │
│                                                                  │
│  import { useSso, Role, Permission } from '@famgia/...'         │
│  // Everything just works - no schema generation needed!        │
└─────────────────────────────────────────────────────────────────┘
```

### Prerequisites

1. **Node.js 18+** and **pnpm**
2. **SSH Access** to `git@github.com:omnifyjp/omnify-client-laravel-sso.git`
3. Test SSH: `ssh -T git@github.com`

### Build Commands

| Command                | Description                                  |
| ---------------------- | -------------------------------------------- |
| `pnpm build`           | Full build (schemas → types → bundle → copy) |
| `pnpm build:schemas`   | Fetch schemas and generate TypeScript types  |
| `pnpm build:lib`       | Bundle with tsup (requires schemas)          |
| `pnpm build:copy-base` | Copy @omnify-base to dist for consumers      |
| `pnpm test`            | Run all tests                                |
| `pnpm typecheck`       | Type check without emitting                  |

### Build Process (Detailed)

```
┌─────────────────────────────────────────────────────────────────┐
│                         pnpm build                               │
│  "pnpm build:schemas && pnpm build:lib && pnpm build:copy-base" │
└───────────────────────────┬─────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────────────┐
│ build:schemas │  │   build:lib   │  │   build:copy-base     │
│               │  │               │  │                       │
│ 1. Clean      │  │ 1. tsup       │  │ cp -r node_modules/   │
│    - schemas/ │  │    bundle     │  │   @omnify-base dist/  │
│    - src/     │  │               │  │                       │
│      schemas/ │  │ 2. Generate   │  │ ⚠️ CRITICAL STEP!     │
│               │  │    .d.ts      │  │ Without this, TS      │
│ 2. Get YAML   │  │               │  │ consumers can't       │
│    schemas    │  │ 3. Output:    │  │ resolve types         │
│    (local or  │  │    dist/*.js  │  │                       │
│    git clone) │  │    dist/*.d.ts│  │                       │
│               │  │               │  │                       │
│ 3. omnify     │  │               │  │                       │
│    generate   │  │               │  │                       │
│    --types-   │  │               │  │                       │
│    only       │  │               │  │                       │
└───────────────┘  └───────────────┘  └───────────────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            ▼
                    dist/ (complete)
                    ├── index.js
                    ├── index.d.ts
                    ├── schemas/
                    ├── testing/
                    └── @omnify-base/  ← TypeScript types
```

### Step-by-Step Build Details

#### Step 1: `pnpm build:schemas` (scripts/build-schemas.ts)

```typescript
// 1. Clean previous builds
rm -rf schemas/ src/schemas/ src/enum/

// 2. Obtain SSO schema YAML files
if (exists('../omnify-client-laravel-sso/database/schemas/Sso')) {
  // Local copy (fastest)
  cp -r ../omnify-client-laravel-sso/database/schemas/Sso → schemas/
} else {
  // Git clone (fallback)
  git clone --sparse git@github.com:omnifyjp/omnify-client-laravel-sso.git
  git sparse-checkout set database/schemas/Sso
  cp schemas...
}

// 3. Generate TypeScript from YAML
npx omnify generate --types-only
// Creates:
//   - node_modules/@omnify-base/schemas/*.ts
//   - src/schemas/*.ts
```

#### Step 2: `pnpm build:lib` (tsup)

```typescript
// tsup.config.ts
export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'schemas/index': 'src/schemas/index.ts',
    'testing/index': 'src/testing/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,                              // Generate .d.ts
  clean: true,                            // Clean dist/ first
  external: ['zod', 'react', ...],        // Don't bundle these
  noExternal: [/@omnify-base\/.*/],       // Bundle @omnify-base JS
});
```

**Important**: `noExternal: [/@omnify-base\/.*/]` bundles the JavaScript, but `.d.ts` files still reference `@omnify-base` externally.

#### Step 3: `pnpm build:copy-base`

```bash
cp -r node_modules/@omnify-base dist/
```

**Why this is critical:**
- The generated `.d.ts` files contain: `export { User } from '@omnify-base/schemas/User'`
- TypeScript in consumer apps needs to resolve `@omnify-base`
- Without this step, consumers get: `Cannot find module '@omnify-base/...'`

#### Postinstall Script (scripts/postinstall.cjs)

When consumers install the package, this script copies `@omnify-base` to their `node_modules`:

```javascript
// Runs automatically after npm install
// Copies dist/@omnify-base → node_modules/@omnify-base
// This allows TypeScript to resolve the types
```

### First Time Setup

```bash
# Option A: Build with auto-fetch (requires SSH access)
pnpm install
pnpm build

# Option B: Clone Laravel package as sibling (for development)
cd /path/to/omnify/packages
git clone git@github.com:omnifyjp/omnify-client-laravel-sso.git
cd omnify-client-react-sso
pnpm install
pnpm build
```

### When to Rebuild

| Scenario                         | Action                                      |
| -------------------------------- | ------------------------------------------- |
| First time setup                 | `pnpm build`                                |
| Schema YAML changed in Laravel   | `pnpm build`                                |
| Added new hook/component/service | `pnpm build:lib`                            |
| Before publishing to npm         | `pnpm build && pnpm test`                   |
| After `pnpm install`             | Usually not needed (postinstall handles it) |

### Publishing Checklist

```bash
# 1. Ensure you're on main branch
git checkout main && git pull

# 2. Full build
pnpm build

# 3. Run tests
pnpm test

# 4. Type check
pnpm typecheck

# 5. Bump version
npm version patch  # or minor/major

# 6. Publish
npm publish --access public

# 7. Verify on npm
npm view @famgia/omnify-react-sso
```

---

## 📦 Package Contents

After build, `dist/` contains:

```
dist/
├── index.js              # Main entry (ESM)
├── index.cjs             # Main entry (CJS)
├── index.d.ts            # Type definitions
├── schemas/
│   ├── index.js          # SSO schemas bundle
│   └── index.d.ts
├── testing/
│   ├── index.js          # Test utilities
│   └── index.d.ts
├── @omnify-base/         # Bundled types for TS resolution
│   ├── package.json
│   └── schemas/
│       ├── User.ts
│       ├── Role.ts
│       ├── Permission.ts
│       ├── Branch.ts
│       ├── Team.ts
│       └── ...
└── types-*.d.ts          # Internal type chunks
```

---

## Local Development with Boilerplate

### Option 1: Use Published Package (Recommended)

```bash
# In boilerplate/frontend
pnpm add @famgia/omnify-react-sso@latest
```

The postinstall script automatically sets up `@omnify-base` for TypeScript.

### Option 2: Link Local Package (Development)

```bash
# In boilerplate/frontend
pnpm add link:/path/to/omnify/packages/omnify-client-react-sso
```

**After linking, manually run postinstall:**
```bash
node node_modules/@famgia/omnify-react-sso/scripts/postinstall.cjs
```

### Consumer App Configuration

#### 1. Exclude SSO Schemas from Local Generation

In `omnify.config.ts`:

```typescript
typescriptPlugin({
  modelsPath: "./frontend/src/omnify/schemas",
  exclude: [
    // SSO types come from @famgia/omnify-react-sso
    "Branch",
    "Permission", 
    "Role",
    "RolePermission",
    "Team",
    "TeamPermission",
    "User",  // Important!
  ],
})
```

#### 2. Import Patterns

```typescript
// ✅ CORRECT: SSO types from package
import type { User, Role, Permission, Branch } from '@famgia/omnify-react-sso';
import { useSso, useAuth } from '@famgia/omnify-react-sso';
import { roleService, permissionService } from '@/lib/ssoService';  // configured instances

// ✅ CORRECT: App-specific types from local
import type { Product, Order } from '@/omnify/schemas';
import { getProductFieldLabel } from '@/omnify/schemas';

// ❌ WRONG: Don't import SSO types from local schemas
import type { Role } from '@/omnify/schemas';  // Error or duplicate!
```

#### 3. Service Configuration

Create `lib/ssoService.ts` to configure services with your API URL:

```typescript
import {
  createAuthService,
  createRoleService,
  createPermissionService,
  createBranchService,
  createUserRoleService,
} from '@famgia/omnify-react-sso';

const apiUrl = process.env.NEXT_PUBLIC_API_URL!;

export const authService = createAuthService({ apiUrl });
export const roleService = createRoleService({ apiUrl });
export const permissionService = createPermissionService({ apiUrl });
export const branchService = createBranchService({ apiUrl });
export const userRoleService = createUserRoleService({ apiUrl });
```

### Development Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│  omnify-client-laravel-sso (Laravel Package)                    │
│  database/schemas/Sso/*.yaml  (Source of truth)                 │
└───────────────────────────┬─────────────────────────────────────┘
                            │ pnpm build (copies + generates)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  @famgia/omnify-react-sso (This Package)                        │
│  dist/                                                           │
│  ├── index.js     (hooks, components, services)                 │
│  ├── schemas/     (SSO types: User, Role, Permission...)        │
│  └── @omnify-base/(TypeScript resolution)                       │
└───────────────────────────┬─────────────────────────────────────┘
                            │ npm install / pnpm link
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  Boilerplate / Your App                                         │
│                                                                  │
│  Import from package:                                            │
│  - useSso, useAuth, useOrganization                             │
│  - User, Role, Permission, Branch, Team                         │
│  - createRoleService, ssoQueryKeys, etc.                        │
│                                                                  │
│  Generate locally (via omnify.config.ts):                       │
│  - App-specific schemas only                                     │
│  - Product, Order, Invoice, etc.                                │
└─────────────────────────────────────────────────────────────────┘
```

### After Changing SSO Schemas

1. **Edit YAML** in `omnify-client-laravel-sso/database/schemas/Sso/`
2. **Rebuild package:**
   ```bash
   cd packages/omnify-client-react-sso
   pnpm build
   ```
3. **If using npm (not link):** Publish and update
   ```bash
   npm version patch
   npm publish --access public
   # In boilerplate:
   pnpm update @famgia/omnify-react-sso
   ```
4. **If using link:** Rebuild triggers automatic update

---

## Architecture Note

This package provides client-side schemas for Omnify Console's **ServiceInstance** architecture:

```
Console (SSO Provider)                    Your React App (SSO Client)
┌─────────────────────────────┐          ┌─────────────────────────┐
│ Service: "your-service"     │          │                         │
│                             │          │  Uses: service_slug     │
│ ServiceInstance (per-org):  │◀────────▶│  Schemas from this pkg  │
│   - Unique credentials      │          │  JWT token handling     │
│   - Environment config      │          │                         │
└─────────────────────────────┘          └─────────────────────────┘
```

> **Note:** Your app only needs the `service_slug`. Console manages credentials per-organization through ServiceInstance.

---

## API Reference

### Hooks

```typescript
import { useSso, useAuth, useOrganization } from '@famgia/omnify-react-sso';

// Main hook - all SSO functionality
const {
  user,              // Current user
  isAuthenticated,   // Auth status
  isLoading,         // Loading state
  organizations,     // User's organizations
  currentOrg,        // Current organization
  hasMultipleOrgs,   // Has more than one org?
  login,             // Redirect to login
  logout,            // Logout current session
  globalLogout,      // Logout from all sessions
  switchOrg,         // Switch organization
  getHeaders,        // Get auth headers
  config,            // SSO config
} = useSso();

// Auth-focused hook
const { user, isAuthenticated, login, logout } = useAuth();

// Organization-focused hook
const { organizations, currentOrg, switchOrg, hasMultipleOrgs } = useOrganization();
```

### Components

```tsx
import {
  SsoProvider,
  SsoCallback,
  OrganizationSwitcher,
  ProtectedRoute,
} from '@famgia/omnify-react-sso';

// Provider - wrap your app
<SsoProvider config={ssoConfig}>
  <App />
</SsoProvider>

// Callback page - handle OAuth redirect
<SsoCallback
  onSuccess={(user) => router.push('/dashboard')}
  onError={(error) => console.error(error)}
/>

// Organization switcher dropdown
<OrganizationSwitcher />

// Protected route wrapper
<ProtectedRoute fallback={<Login />}>
  <Dashboard />
</ProtectedRoute>
```

### Services (Recommended)

Use individual services for better tree-shaking and type safety:

```typescript
import {
  createAuthService,
  createRoleService,
  createPermissionService,
  createBranchService,
  createUserRoleService,
} from '@famgia/omnify-react-sso';

const config = { apiUrl: 'https://api.example.com' };

// Auth Service
const authService = createAuthService(config);
await authService.callback({ code: 'oauth-code' });
await authService.getUser();
await authService.logout();

// Role Service
const roleService = createRoleService(config);
await roleService.list();
await roleService.get(roleId);
await roleService.create({ name: 'Editor', slug: 'editor' });
await roleService.syncPermissions(roleId, { permissions: ['read', 'write'] });

// Permission Service
const permissionService = createPermissionService(config);
await permissionService.list();
await permissionService.getMatrix();

// Branch Service
const branchService = createBranchService(config);
await branchService.list();
await branchService.getPrimary();

// User Role Service (Scoped Assignments)
const userRoleService = createUserRoleService(config);
await userRoleService.listForUser(userId);
await userRoleService.assign({ user_id, role_id, scope: 'branch', branch_id });
```

### Legacy Service (Deprecated)

```typescript
// @deprecated - Use individual services instead
import { createSsoService } from '@famgia/omnify-react-sso';

const ssoService = createSsoService({ apiUrl: 'https://api.example.com' });
await ssoService.getRoles();  // Use roleService.list() instead
```

### Schemas

```typescript
import {
  // User
  userSchemas,
  userCreateSchema,
  userI18n,
  type User,
  type UserCreate,
  
  // Role
  roleSchemas,
  roleCreateSchema,
  roleI18n,
  type Role,
  
  // Permission
  permissionSchemas,
  permissionI18n,
  type Permission,
  
  // Team
  teamSchemas,
  teamI18n,
  type Team,
} from '@famgia/omnify-react-sso';
```

### Query Keys

```typescript
import { ssoQueryKeys } from '@famgia/omnify-react-sso';

// Use with TanStack Query
useQuery({
  queryKey: ssoQueryKeys.auth.user(),
  queryFn: () => ssoService.getUser(),
});

useQuery({
  queryKey: ssoQueryKeys.roles.list(),
  queryFn: () => ssoService.getRoles(),
});
```

---

## i18n Support

Each schema includes internationalization support:

```typescript
import { userI18n, getUserLabel, getUserFieldLabel } from '@famgia/omnify-react-sso';

// Get model label
const label = getUserLabel('ja'); // 'ユーザー'

// Get field label
const emailLabel = getUserFieldLabel('email', 'ja'); // 'メールアドレス'
```

---

## Testing

### Run Tests

```bash
pnpm test           # Run once
pnpm test:watch     # Watch mode
pnpm typecheck      # Type check
```

### Test Utilities (for App Tests)

The package provides official test mocks:

```typescript
import {
  createMockUser,
  createMockOrganization,
  setMockSsoData,
  resetMockSsoData,
  mockUseSso,
} from '@famgia/omnify-react-sso/testing';

// Create mock data
const user = createMockUser({ name: 'Custom User' });
const org = createMockOrganization({ slug: 'my-org' });

// Setup mock for tests
beforeEach(() => {
  setMockSsoData({
    user,
    organizations: [org],
    currentOrg: org,
    isAuthenticated: true,
  });
});

afterEach(() => {
  resetMockSsoData();
});

// Mock the hooks in vitest
vi.mock('@famgia/omnify-react-sso', async () => {
  const testing = await import('@famgia/omnify-react-sso/testing');
  return {
    useSso: testing.mockUseSso,
    useAuth: testing.mockUseAuth,
    useOrganization: testing.mockUseOrganization,
    SsoProvider: ({ children }) => children,
  };
});
```

> **Note**: Subpath exports (`/testing`) may not work with linked packages in Vite/Vitest. Use direct imports or install from npm.

---

## Troubleshooting

### ❌ Cannot find module '@omnify-base/schemas/...'

**Cause:** TypeScript can't resolve the bundled types.

**Solutions:**

1. **If installed from npm:** Run postinstall manually
   ```bash
   node node_modules/@famgia/omnify-react-sso/scripts/postinstall.cjs
   ```

2. **If using pnpm link:** Same as above
   ```bash
   cd your-app/frontend
   node node_modules/@famgia/omnify-react-sso/scripts/postinstall.cjs
   ```

3. **Verify @omnify-base exists:**
   ```bash
   ls node_modules/@omnify-base/schemas/
   # Should show: User.ts, Role.ts, Permission.ts, etc.
   ```

### ❌ Module has no exported member 'Role' (from @/omnify/schemas)

**Cause:** You're importing SSO types from local schemas instead of the package.

**Fix:** Change imports:
```typescript
// ❌ Wrong
import type { Role } from '@/omnify/schemas';

// ✅ Correct  
import type { Role } from '@famgia/omnify-react-sso';
```

### ❌ Duplicate identifier 'User'

**Cause:** SSO schemas generated locally AND imported from package.

**Fix:** Add to `omnify.config.ts`:
```typescript
typescriptPlugin({
  exclude: ["User", "Role", "Permission", "Branch", "Team", "RolePermission", "TeamPermission"],
})
```

### ❌ Build fails: Cannot clone git repository

**Cause:** No SSH access to omnifyjp/omnify-client-laravel-sso.

**Fix:**
```bash
# Test SSH access
ssh -T git@github.com

# If needed, add SSH key to GitHub
# Or clone manually as sibling:
git clone git@github.com:omnifyjp/omnify-client-laravel-sso.git ../omnify-client-laravel-sso
```

### ❌ Tests fail with "Cannot find module '@famgia/omnify-react-sso/testing'"

**Cause:** Subpath exports don't work well with linked packages in Vite.

**Fix:** Create local mock file instead:
```typescript
// src/test/mocks/sso.ts
export function createMockUser(overrides = {}) {
  return { id: '1', name: 'Test User', email: 'test@example.com', ...overrides };
}
```

---

## Version History

| Version | Changes                                                  |
| ------- | -------------------------------------------------------- |
| 2.2.1   | Bundled @omnify-base for TS consumers, added postinstall |
| 2.2.0   | Added testing utilities subpath export                   |
| 2.1.0   | Split services into individual factories                 |
| 2.0.0   | Initial stable release                                   |

---

## License

MIT
