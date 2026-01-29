/**
 * Ant Design Components
 * 
 * Components built with Ant Design for Japanese enterprise applications.
 */

// =============================================================================
// SSO Components
// =============================================================================

export { SsoCallback } from './SsoCallback';
export { OrganizationSwitcher } from './OrganizationSwitcher';
export { ProtectedRoute } from './ProtectedRoute';
export { OrgBranchSelectorModal } from './OrgBranchSelectorModal';
export { OrgGate } from './OrgGate';
export type { OrgGateProps } from './OrgGate';
export { BranchGate, useBranchGate } from './BranchGate';
export type { BranchGateSelection } from './BranchGate';

// =============================================================================
// Data Display
// =============================================================================

export { ProTable, DEFAULT_TEXTS as PROTABLE_DEFAULT_TEXTS } from './ProTable';
export type {
    ProTableProps,
    ProTableColumn,
    ProTableTexts,
    SearchField,
    RowAction,
    ValueType,
    StatusConfig,
    PaginationMeta,
    ApiResponse,
    QueryParams,
} from './ProTable';

// =============================================================================
// Layout
// =============================================================================

export { PageContainer } from './PageContainer';
export type { PageContainerProps } from './PageContainer';

// =============================================================================
// Navigation
// =============================================================================

export { LocaleSwitcher } from './LocaleSwitcher';

// =============================================================================
// User Management
// =============================================================================

export { UserRoleAssignModal } from './UserRoleAssignModal';
export type { UserRoleAssignModalProps, OrganizationLike, BranchLike } from './UserRoleAssignModal';

export { UserPermissionsModal } from './UserPermissionsModal';
export type { UserPermissionsModalProps } from './UserPermissionsModal';

export { UserDetailCard } from './UserDetailCard';
export type { UserDetailCardProps } from './UserDetailCard';

// =============================================================================
// Role Management
// =============================================================================

export { RoleCreateModal } from './RoleCreateModal';
export type { RoleCreateModalProps } from './RoleCreateModal';

export { RolesListCard } from './RolesListCard';
export type { RolesListCardProps } from './RolesListCard';

// =============================================================================
// Permission Management
// =============================================================================

export { PermissionsListCard } from './PermissionsListCard';
export type { PermissionsListCardProps } from './PermissionsListCard';

// =============================================================================
// Team Management
// =============================================================================

export { TeamsListCard } from './TeamsListCard';
export type { TeamsListCardProps, TeamData } from './TeamsListCard';

// =============================================================================
// Utilities
// =============================================================================

export {
    getScopeIcon,
    getScopeColor,
    ScopeTag,
    ScopeLabel,
    type ScopeType,
    type ScopeTagProps,
    type ScopeLabelProps,
} from './ScopeUtils';
