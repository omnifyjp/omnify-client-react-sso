'use client';

import { Modal, Select, Spin, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { setOrgIdForApi } from '../../../core/utils/orgSync';
import { useOrganization } from '../../../core/hooks/useOrganization';
import { useSso } from '../../../core/hooks/useSso';

const { Text } = Typography;

export interface OrgGateProps {
    children: React.ReactNode;
    /**
     * Custom translations for the UI
     */
    translations?: {
        /** Modal title when selecting org */
        selectOrgTitle?: string;
        /** Confirm button text */
        confirmText?: string;
        /** Placeholder for org select */
        selectPlaceholder?: string;
        /** Message when no orgs available */
        noOrgsMessage?: string;
    };
    /**
     * Custom loading component
     */
    loadingComponent?: React.ReactNode;
    /**
     * Called when organization changes
     */
    onOrgChange?: (orgSlug: string) => void;
}

const defaultTranslations = {
    selectOrgTitle: '組織を選択してください',
    confirmText: '選択',
    selectPlaceholder: '組織を選択',
    noOrgsMessage: 'アクセス可能な組織がありません',
};

/**
 * OrgGate ensures an organization is always selected.
 * - If user has only 1 org, auto-select it
 * - If user has multiple orgs and none selected, show selection modal
 * - Only render children when an org is selected
 * - Syncs org ID to global state for API calls
 *
 * @example
 * ```tsx
 * <SsoProvider config={config}>
 *   <OrgGate>
 *     <App />
 *   </OrgGate>
 * </SsoProvider>
 * ```
 */
export function OrgGate({
    children,
    translations: customTranslations,
    loadingComponent,
    onOrgChange,
}: OrgGateProps) {
    const t = { ...defaultTranslations, ...customTranslations };
    const { isLoading: ssoLoading, isAuthenticated } = useSso();
    const { organizations, currentOrg, switchOrg } = useOrganization();
    const [selectedOrgSlug, setSelectedOrgSlug] = useState<string | undefined>(undefined);

    // Auto-select if only 1 organization
    useEffect(() => {
        if (!ssoLoading && isAuthenticated && organizations.length === 1 && !currentOrg) {
            switchOrg(organizations[0].slug);
        }
    }, [ssoLoading, isAuthenticated, organizations, currentOrg, switchOrg]);

    // Sync org ID to global state IMMEDIATELY when it changes (not in useEffect)
    // This ensures the org ID is set before any child components render and make API calls
    // Backend accepts organization ID (UUID), code (slug), or name in X-Organization-Id header
    // Frontend uses slug since SsoOrganization.id is numeric, not UUID
    if (currentOrg?.slug) {
        setOrgIdForApi(currentOrg.slug);
        // Notify parent if callback provided
        if (onOrgChange) {
            onOrgChange(currentOrg.slug);
        }
    }

    // Show loading while SSO is loading
    if (ssoLoading) {
        if (loadingComponent) {
            return <>{loadingComponent}</>;
        }
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                }}
            >
                <Spin size="large" />
            </div>
        );
    }

    // Not authenticated - let the page handle redirect
    if (!isAuthenticated) {
        return <>{children}</>;
    }

    // No organizations available
    if (organizations.length === 0) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    flexDirection: 'column',
                    gap: 16,
                }}
            >
                <Text type="secondary">{t.noOrgsMessage}</Text>
            </div>
        );
    }

    // Organization selected - render children
    if (currentOrg) {
        return <>{children}</>;
    }

    // Multiple orgs but none selected - show selection modal
    const handleConfirm = () => {
        if (selectedOrgSlug) {
            switchOrg(selectedOrgSlug);
        }
    };

    return (
        <Modal
            open={true}
            closable={false}
            maskClosable={false}
            title={t.selectOrgTitle}
            okText={t.confirmText}
            okButtonProps={{ disabled: !selectedOrgSlug }}
            onOk={handleConfirm}
            cancelButtonProps={{ style: { display: 'none' } }}
        >
            <div style={{ marginTop: 16 }}>
                <Select
                    placeholder={t.selectPlaceholder}
                    style={{ width: '100%' }}
                    value={selectedOrgSlug}
                    onChange={setSelectedOrgSlug}
                    options={organizations.map((org) => ({
                        value: org.slug,
                        label: org.name,
                    }))}
                    size="large"
                />
            </div>
        </Modal>
    );
}
