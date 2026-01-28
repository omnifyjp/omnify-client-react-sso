/**
 * Core Module
 * 
 * Shared utilities, hooks, services, and types.
 * UI-agnostic - can be used with any UI library.
 */

// =============================================================================
// Context
// =============================================================================

export { SsoContext, useSsoContext } from './context/SsoContext';
export { SsoProvider } from './context/SsoProvider';
export { BranchContext, useBranchContext } from './context/BranchContext';
export { BranchProvider } from './context/BranchProvider';

// =============================================================================
// Hooks
// =============================================================================

export { useAuth } from './hooks/useAuth';
export type { UseAuthReturn } from './hooks/useAuth';

export { useOrganization } from './hooks/useOrganization';
export type { UseOrganizationReturn } from './hooks/useOrganization';

export { useSso } from './hooks/useSso';
export type { UseSsoReturn } from './hooks/useSso';

export { useBranch } from './hooks/useBranch';
export type { UseBranchReturn } from './hooks/useBranch';

// =============================================================================
// Services (API clients)
// =============================================================================

// Note: Services have their own SsoUser, Role, Permission types for API responses
// These may differ from component types in ./types
export * from './services';

// =============================================================================
// Utils
// =============================================================================

export {
    createBranchHeaderSetter,
    setBranchHeaders,
    BRANCH_HEADERS,
} from './utils/branchHeaders';

// =============================================================================
// Query Keys
// =============================================================================

export { ssoQueryKeys } from './queryKeys';

// =============================================================================
// Types (Component props, context values)
// Note: SsoUser here is for components, different from services/SsoUser
// =============================================================================

export type {
    // SsoUser is exported from services, skip here to avoid conflict
    SsoOrganization,
    SsoConfig,
    SsoContextValue,
    SsoCallbackResponse,
    SsoProviderProps,
    SsoCallbackProps,
    OrganizationSwitcherProps,
    ProtectedRouteProps,
    SsoBranch,
    BranchContextValue,
    BranchProviderProps,
    OrgBranchSelectorModalProps,
    OrgBranchSelection,
    BranchGateProps,
    BranchGateSelection,
} from './types';

// =============================================================================
// i18n (Internationalization)
// =============================================================================

export {
    I18nProvider,
    useLocale,
    useTranslations,
    useSsoTranslation,
    getCurrentLocale,
    changeLanguage,
    locales,
    localeNames,
    defaultLocale,
    ssoNamespace,
    defaultTranslations,
    type Locale,
    type I18nContextValue,
    type I18nProviderProps,
} from './i18n';

// =============================================================================
// Schemas (Zod schemas for data validation)
// Access via: import { schemas } from '@famgia/omnify-react-sso/core'
// Or: import { branchCacheSchemas } from '@famgia/omnify-react-sso/core'
// =============================================================================

export * as schemas from './schemas';

// Re-export commonly used schema utilities
export {
    // Common types
    type LocaleMap,
    type ValidationRule,
    type DateTimeString,
    type DateString,
    // i18n utilities from schemas
    fallbackLocale,
    supportedLocales,
    validationMessages,
    getMessage,
    getMessages,
} from './schemas';
