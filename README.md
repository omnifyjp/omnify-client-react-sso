# @famgia/omnify-react-sso

SSO (Single Sign-On) schemas, types, and utilities for Omnify Console integration.

## Installation

```bash
npm install @famgia/omnify-react-sso
# or
pnpm add @famgia/omnify-react-sso
```

## Features

- **User Management**: User schema with Zod validation and i18n support
- **Role-Based Access Control (RBAC)**: Role, Permission, and RolePermission schemas
- **Team Management**: Team and TeamPermission schemas
- **Multi-locale Support**: Japanese and English labels/messages
- **ServiceInstance Compatible**: Works with Console's multi-instance architecture

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

## Usage

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

## Schemas

| Schema         | Description                             |
| -------------- | --------------------------------------- |
| User           | User account with authentication fields |
| Role           | User roles for RBAC                     |
| Permission     | Individual permissions                  |
| RolePermission | Role-Permission mapping (pivot)         |
| Team           | Team/Organization grouping              |
| TeamPermission | Team-Permission mapping                 |

## i18n Support

Each schema includes internationalization support:

```typescript
import { userI18n, getUserLabel, getUserFieldLabel } from '@famgia/omnify-react-sso';

// Get model label
const label = getUserLabel('ja'); // 'ユーザー'

// Get field label
const emailLabel = getUserFieldLabel('email', 'ja'); // 'メールアドレス'
```

## License

MIT
