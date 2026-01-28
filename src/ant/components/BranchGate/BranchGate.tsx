'use client';

import React, { useEffect, useState } from 'react';
import { Modal, Select, Space, Typography, Badge, Spin, Button, Alert } from 'antd';
import { BankOutlined, ApartmentOutlined, CheckCircleFilled } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useOrganization } from '../../../core/hooks/useOrganization';
import { useSsoContext } from '../../../core/context/SsoContext';
import { createBranchService, type BranchesResponse } from '../../../core/services/branchService';
import { ssoQueryKeys } from '../../../core/queryKeys';
import type { BranchGateProps } from '../../../core/types';

const { Text, Title } = Typography;

const DEFAULT_STORAGE_KEY = 'omnify_branch_gate_selection';

// Re-export type from types.ts
export type { BranchGateSelection } from '../../../core/types';

type StoredSelection = {
  orgId: string;
  orgName: string;
  branchId: string;
  branchName: string;
  branchCode: string;
};

/**
 * BranchGate - Ensures user has selected an org/branch before accessing the app.
 * 
 * Different from OrgBranchSelectorModal:
 * - OrgBranchSelectorModal: Modal for one-time selection (e.g., creating a project)
 * - BranchGate: Gate that blocks app access until selection is made, persists globally
 * 
 * Auto-selection behavior:
 * - If user has only 1 org and 1 branch: auto-selects and allows access
 * - If user has multiple options: shows selection modal first
 * - Stores selection in localStorage for persistence
 * 
 * @example
 * ```tsx
 * // In your app layout
 * function DashboardLayout({ children }) {
 *   return (
 *     <BranchGate
 *       onSelectionChange={(selection) => {
 *         // Set API headers globally
 *         api.defaults.headers['X-Branch-Id'] = selection.branchId;
 *         api.defaults.headers['X-Organization-Id'] = selection.orgId;
 *       }}
 *     >
 *       {children}
 *     </BranchGate>
 *   );
 * }
 * ```
 */
export function BranchGate({
  children,
  onSelectionChange,
  storageKey = DEFAULT_STORAGE_KEY,
  loadingComponent,
  title,
  description,
}: BranchGateProps) {
  const { config, isAuthenticated } = useSsoContext();
  const { organizations, currentOrg, hasMultipleOrgs } = useOrganization();

  // Stored selection
  const [storedSelection, setStoredSelection] = useState<StoredSelection | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Temp selection (UI state before confirm)
  const [tempOrgId, setTempOrgId] = useState<string | null>(null);
  const [tempBranchId, setTempBranchId] = useState<string | null>(null);

  // Branch service
  const branchService = React.useMemo(
    () => createBranchService({ apiUrl: config.apiUrl }),
    [config.apiUrl]
  );

  // Get org slug for branch fetching
  const activeOrgSlug = React.useMemo(() => {
    if (tempOrgId) {
      return organizations.find(o => String(o.id) === tempOrgId)?.slug;
    }
    return storedSelection?.orgId ?? currentOrg?.slug;
  }, [tempOrgId, organizations, storedSelection, currentOrg]);

  // Fetch branches
  const { data: branchesData, isLoading: branchesLoading } = useQuery<BranchesResponse>({
    queryKey: ssoQueryKeys.branches.list(activeOrgSlug),
    queryFn: () => branchService.list(activeOrgSlug),
    enabled: isAuthenticated && !!activeOrgSlug,
  });

  const branches = branchesData?.branches ?? [];
  const hasMultipleBranches = branches.length > 1;

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as StoredSelection;
        setStoredSelection(parsed);
        onSelectionChange?.(parsed);
      } catch {
        localStorage.removeItem(storageKey);
      }
    }
    setIsInitialized(true);
  }, [storageKey, onSelectionChange]);

  // Auto-select org if only one
  useEffect(() => {
    if (!isAuthenticated || !isInitialized || storedSelection) return;

    if (organizations.length === 1 && !tempOrgId) {
      setTempOrgId(String(organizations[0].id));
    }
  }, [isAuthenticated, isInitialized, organizations, storedSelection, tempOrgId]);

  // Auto-select branch if only one
  useEffect(() => {
    if (!tempOrgId || branchesLoading || storedSelection) return;

    if (branches.length === 1 && !tempBranchId) {
      setTempBranchId(String(branches[0].id));
    } else if (branches.length > 0 && !tempBranchId) {
      // Auto-select primary or HQ
      const primaryId = branchesData?.primary_branch_id;
      if (primaryId) {
        setTempBranchId(String(primaryId));
      } else {
        const hq = branches.find(b => b.is_headquarters);
        if (hq) {
          setTempBranchId(String(hq.id));
        }
      }
    }
  }, [tempOrgId, branches, branchesLoading, branchesData, storedSelection, tempBranchId]);

  // Auto-confirm if both are auto-selected and no UI needed
  useEffect(() => {
    if (storedSelection || !isInitialized) return;
    if (!tempOrgId || !tempBranchId || branchesLoading) return;

    // If no multiple choices, auto-confirm
    if (!hasMultipleOrgs && !hasMultipleBranches) {
      confirmSelection();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tempOrgId, tempBranchId, branchesLoading, hasMultipleOrgs, hasMultipleBranches, storedSelection, isInitialized]);

  const confirmSelection = React.useCallback(() => {
    if (!tempOrgId || !tempBranchId) return;

    const org = organizations.find(o => String(o.id) === tempOrgId);
    const branch = branches.find(b => String(b.id) === tempBranchId);

    if (!org || !branch) return;

    const selection: StoredSelection = {
      orgId: org.slug,
      orgName: org.name,
      branchId: String(branch.id),
      branchName: branch.name,
      branchCode: branch.code,
    };

    localStorage.setItem(storageKey, JSON.stringify(selection));
    setStoredSelection(selection);
    onSelectionChange?.(selection);

    // Clear temp
    setTempOrgId(null);
    setTempBranchId(null);
  }, [tempOrgId, tempBranchId, organizations, branches, storageKey, onSelectionChange]);

  const clearSelection = React.useCallback(() => {
    localStorage.removeItem(storageKey);
    setStoredSelection(null);
    onSelectionChange?.(null);
  }, [storageKey, onSelectionChange]);

  // Determine if selection is needed
  const needsSelection = isAuthenticated && isInitialized && !storedSelection && (hasMultipleOrgs || hasMultipleBranches);
  const isLoading = !isAuthenticated || !isInitialized || (!!activeOrgSlug && branchesLoading && !storedSelection);

  // Show loading while checking
  if (isLoading && !needsSelection) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}>
        <Spin size="large" />
      </div>
    );
  }

  // Show selection modal if needed
  if (needsSelection) {
    const canConfirm = tempOrgId && tempBranchId;

    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}>
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: 32,
          maxWidth: 480,
          width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <BankOutlined style={{ fontSize: 28, color: '#fff' }} />
            </div>
            <Title level={3} style={{ margin: 0 }}>
              {title ?? 'Select Organization'}
            </Title>
            <Text type="secondary">
              {description ?? 'Please select your organization and branch to continue'}
            </Text>
          </div>

          {/* Organization Selection */}
          <div style={{ marginBottom: 20 }}>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              <Space>
                <BankOutlined />
                <span>Organization</span>
                {!hasMultipleOrgs && <Badge status="success" text="Auto-selected" />}
              </Space>
            </Text>
            {hasMultipleOrgs ? (
              <Select
                value={tempOrgId}
                onChange={(value) => {
                  setTempOrgId(String(value));
                  setTempBranchId(null);
                }}
                placeholder="Select organization"
                size="large"
                style={{ width: '100%' }}
                optionLabelProp="label"
              >
                {organizations.map((org) => (
                  <Select.Option key={org.id} value={String(org.id)} label={org.name}>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <div>
                        <Text strong>{org.name}</Text>
                        {org.serviceRole && (
                          <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                            ({org.serviceRole})
                          </Text>
                        )}
                      </div>
                    </Space>
                  </Select.Option>
                ))}
              </Select>
            ) : (
              <div style={{
                padding: '8px 12px',
                background: '#f5f5f5',
                borderRadius: 6,
                border: '1px solid #d9d9d9',
              }}>
                <Space>
                  <BankOutlined style={{ color: '#1677ff' }} />
                  <Text strong>{organizations[0]?.name}</Text>
                </Space>
              </div>
            )}
          </div>

          {/* Branch Selection */}
          {tempOrgId && (
            <div style={{ marginBottom: 24 }}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                <Space>
                  <ApartmentOutlined />
                  <span>Branch</span>
                  {!hasMultipleBranches && branches.length === 1 && (
                    <Badge status="success" text="Auto-selected" />
                  )}
                </Space>
              </Text>
              {branchesLoading ? (
                <div style={{ padding: '12px', textAlign: 'center' }}>
                  <Spin size="small" />
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    Loading...
                  </Text>
                </div>
              ) : hasMultipleBranches ? (
                <Select
                  value={tempBranchId}
                  onChange={(value) => setTempBranchId(String(value))}
                  placeholder="Select branch"
                  size="large"
                  style={{ width: '100%' }}
                  optionLabelProp="label"
                >
                  {branches.map((branch) => (
                    <Select.Option key={branch.id} value={String(branch.id)} label={branch.name}>
                      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                        <div>
                          <Text strong>{branch.name}</Text>
                          <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                            {branch.code}
                          </Text>
                        </div>
                        <Space size={4}>
                          {branch.is_headquarters && <Badge color="blue" text="HQ" />}
                          {branch.is_primary && <Badge color="green" text="Primary" />}
                        </Space>
                      </Space>
                    </Select.Option>
                  ))}
                </Select>
              ) : branches.length === 1 ? (
                <div style={{
                  padding: '8px 12px',
                  background: '#f5f5f5',
                  borderRadius: 6,
                  border: '1px solid #d9d9d9',
                }}>
                  <Space>
                    <ApartmentOutlined style={{ color: '#1677ff' }} />
                    <Text strong>{branches[0].name}</Text>
                    <Text type="secondary">({branches[0].code})</Text>
                  </Space>
                </div>
              ) : (
                <Alert
                  type="warning"
                  message="No branches available"
                  description="You don't have access to any branches in this organization."
                />
              )}
            </div>
          )}

          {/* Confirm Button */}
          <Button
            type="primary"
            size="large"
            block
            disabled={!canConfirm}
            onClick={confirmSelection}
            icon={<CheckCircleFilled />}
            style={{
              height: 48,
              fontSize: 16,
              background: canConfirm
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : undefined,
              border: 'none',
            }}
          >
            Confirm
          </Button>
        </div>
      </div>
    );
  }

  // Selection complete - render children
  return <>{children}</>;
}

// Export hook for accessing current selection
export function useBranchGate(storageKey = DEFAULT_STORAGE_KEY) {
  const [selection, setSelection] = useState<StoredSelection | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setSelection(JSON.parse(saved));
      } catch {
        // ignore
      }
    }

    // Listen for storage changes
    const handleStorage = (e: StorageEvent) => {
      if (e.key === storageKey) {
        if (e.newValue) {
          try {
            setSelection(JSON.parse(e.newValue));
          } catch {
            setSelection(null);
          }
        } else {
          setSelection(null);
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [storageKey]);

  const clearSelection = React.useCallback(() => {
    localStorage.removeItem(storageKey);
    setSelection(null);
  }, [storageKey]);

  return {
    selection,
    selectedOrg: selection ? { id: selection.orgId, slug: selection.orgId, name: selection.orgName } : null,
    selectedBranch: selection ? { id: selection.branchId, name: selection.branchName, code: selection.branchCode } : null,
    clearSelection,
  };
}
