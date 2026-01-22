'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, Select, Form, Space, Typography, Spin, Alert, Badge } from 'antd';
import { BankOutlined, ApartmentOutlined, CheckCircleFilled } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useOrganization } from '../hooks/useOrganization';
import { useSsoContext } from '../context/SsoContext';
import { createBranchService, type BranchesResponse } from '../services/branchService';
import { ssoQueryKeys } from '../queryKeys';
import type { OrgBranchSelectorModalProps, SsoOrganization, SsoBranch } from '../types';

const { Text, Title } = Typography;

/**
 * Organization and Branch Selector Modal
 * 
 * A modal component for selecting organization and branch.
 * - If user has only one organization, it's auto-selected
 * - If user has only one branch, it's auto-selected
 * - Shows selection UI only when there are multiple options
 * 
 * @example
 * ```tsx
 * function CreateProjectButton() {
 *   const [modalOpen, setModalOpen] = useState(false);
 *   
 *   const handleConfirm = (orgId: number, branchId: number) => {
 *     // Create project with selected org and branch
 *     createProject({ organization_id: orgId, branch_id: branchId });
 *     setModalOpen(false);
 *   };
 * 
 *   return (
 *     <>
 *       <Button onClick={() => setModalOpen(true)}>
 *         Create Project
 *       </Button>
 *       <OrgBranchSelectorModal
 *         open={modalOpen}
 *         onClose={() => setModalOpen(false)}
 *         onConfirm={handleConfirm}
 *       />
 *     </>
 *   );
 * }
 * ```
 */
export function OrgBranchSelectorModal({
    open,
    onClose,
    onConfirm,
    title = 'Select Organization & Branch',
    requireBranch = true,
    loadingComponent,
}: OrgBranchSelectorModalProps) {
    const { config } = useSsoContext();
    const { organizations, currentOrg, hasMultipleOrgs } = useOrganization();
    const [form] = Form.useForm();

    // Selected organization state (for fetching branches)
    const [selectedOrgSlug, setSelectedOrgSlug] = useState<string | null>(
        currentOrg?.slug ?? null
    );

    // Branch service
    const branchService = useMemo(
        () => createBranchService({ apiUrl: config.apiUrl }),
        [config.apiUrl]
    );

    // Fetch branches for selected organization
    const {
        data: branchesData,
        isLoading: branchesLoading,
        error: branchesError,
    } = useQuery<BranchesResponse>({
        queryKey: ssoQueryKeys.branches.list(selectedOrgSlug ?? undefined),
        queryFn: () => branchService.list(selectedOrgSlug ?? undefined),
        enabled: open && !!selectedOrgSlug,
    });

    const branches = branchesData?.branches ?? [];
    const hasMultipleBranches = branches.length > 1;

    // Find selected organization object
    const selectedOrg = useMemo(
        () => organizations.find(o => o.slug === selectedOrgSlug) ?? null,
        [organizations, selectedOrgSlug]
    );

    // Auto-select logic
    useEffect(() => {
        if (!open) return;

        // Auto-select organization if only one
        if (organizations.length === 1 && !selectedOrgSlug) {
            setSelectedOrgSlug(organizations[0].slug);
            form.setFieldValue('organization_id', organizations[0].id);
        } else if (currentOrg && !selectedOrgSlug) {
            setSelectedOrgSlug(currentOrg.slug);
            form.setFieldValue('organization_id', currentOrg.id);
        }
    }, [open, organizations, currentOrg, selectedOrgSlug, form]);

    // Auto-select branch if only one
    useEffect(() => {
        if (!open || branchesLoading) return;

        if (branches.length === 1) {
            form.setFieldValue('branch_id', branches[0].id);
        } else if (branches.length > 0) {
            // Try to select primary or headquarters
            const primaryId = branchesData?.primary_branch_id;
            if (primaryId) {
                form.setFieldValue('branch_id', primaryId);
            } else {
                const hq = branches.find(b => b.is_headquarters);
                if (hq) {
                    form.setFieldValue('branch_id', hq.id);
                }
            }
        }
    }, [open, branches, branchesLoading, branchesData, form]);

    // Auto-confirm if both are auto-selected
    useEffect(() => {
        if (!open || branchesLoading) return;

        const orgId = form.getFieldValue('organization_id');
        const branchId = form.getFieldValue('branch_id');

        // If we have auto-selected values and no multiple choices needed
        if (orgId && branchId && !hasMultipleOrgs && !hasMultipleBranches) {
            // Small delay to ensure UI renders
            const timer = setTimeout(() => {
                onConfirm(orgId, branchId);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [open, branchesLoading, hasMultipleOrgs, hasMultipleBranches, form, onConfirm]);

    const handleOrgChange = useCallback((orgId: number) => {
        const org = organizations.find(o => o.id === orgId);
        if (org) {
            setSelectedOrgSlug(org.slug);
            // Reset branch selection when org changes
            form.setFieldValue('branch_id', undefined);
        }
    }, [organizations, form]);

    const handleSubmit = useCallback(() => {
        form.validateFields().then(values => {
            onConfirm(values.organization_id, values.branch_id);
        });
    }, [form, onConfirm]);

    const handleClose = useCallback(() => {
        form.resetFields();
        setSelectedOrgSlug(currentOrg?.slug ?? null);
        onClose();
    }, [form, currentOrg, onClose]);

    // If loading and no branches yet, show loading
    const isInitialLoading = open && (!organizations.length || (selectedOrgSlug && branchesLoading && !branches.length));

    // Check if we need to show the modal at all
    const needsSelection = hasMultipleOrgs || hasMultipleBranches;

    return (
        <Modal
            title={
                <Space>
                    <BankOutlined />
                    <span>{title}</span>
                </Space>
            }
            open={open}
            onCancel={handleClose}
            onOk={handleSubmit}
            okText="Confirm"
            cancelText="Cancel"
            destroyOnHidden
            width={480}
        >
            {isInitialLoading ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                    {loadingComponent ?? <Spin size="large" />}
                    <div style={{ marginTop: 16 }}>
                        <Text type="secondary">Loading...</Text>
                    </div>
                </div>
            ) : (
                <Form
                    form={form}
                    layout="vertical"
                    style={{ marginTop: 16 }}
                >
                    {branchesError && (
                        <Alert
                            type="error"
                            message="Failed to load branches"
                            description={(branchesError as Error).message}
                            style={{ marginBottom: 16 }}
                        />
                    )}

                    {/* Organization Selection */}
                    <Form.Item
                        name="organization_id"
                        label={
                            <Space>
                                <BankOutlined />
                                <span>Organization</span>
                                {!hasMultipleOrgs && selectedOrg && (
                                    <Badge status="success" text="Auto-selected" />
                                )}
                            </Space>
                        }
                        rules={[{ required: true, message: 'Please select an organization' }]}
                    >
                        {hasMultipleOrgs ? (
                            <Select
                                placeholder="Select organization"
                                onChange={handleOrgChange}
                                size="large"
                                optionLabelProp="label"
                            >
                                {organizations.map((org) => (
                                    <Select.Option
                                        key={org.id}
                                        value={org.id}
                                        label={org.name}
                                    >
                                        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                            <div>
                                                <Text strong>{org.name}</Text>
                                                {org.serviceRole && (
                                                    <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                                                        ({org.serviceRole})
                                                    </Text>
                                                )}
                                            </div>
                                            {org.slug === currentOrg?.slug && (
                                                <CheckCircleFilled style={{ color: '#52c41a' }} />
                                            )}
                                        </Space>
                                    </Select.Option>
                                ))}
                            </Select>
                        ) : (
                            <div
                                style={{
                                    padding: '8px 12px',
                                    background: '#f5f5f5',
                                    borderRadius: 6,
                                    border: '1px solid #d9d9d9',
                                }}
                            >
                                <Space>
                                    <BankOutlined style={{ color: '#1677ff' }} />
                                    <Text strong>{selectedOrg?.name}</Text>
                                </Space>
                            </div>
                        )}
                    </Form.Item>

                    {/* Branch Selection */}
                    {selectedOrgSlug && (
                        <Form.Item
                            name="branch_id"
                            label={
                                <Space>
                                    <ApartmentOutlined />
                                    <span>Branch</span>
                                    {!hasMultipleBranches && branches.length === 1 && (
                                        <Badge status="success" text="Auto-selected" />
                                    )}
                                </Space>
                            }
                            rules={requireBranch ? [{ required: true, message: 'Please select a branch' }] : undefined}
                        >
                            {branchesLoading ? (
                                <div style={{ padding: '8px 12px', textAlign: 'center' }}>
                                    <Spin size="small" />
                                    <Text type="secondary" style={{ marginLeft: 8 }}>
                                        Loading branches...
                                    </Text>
                                </div>
                            ) : hasMultipleBranches ? (
                                <Select
                                    placeholder="Select branch"
                                    size="large"
                                    optionLabelProp="label"
                                >
                                    {branches.map((branch) => (
                                        <Select.Option
                                            key={branch.id}
                                            value={branch.id}
                                            label={branch.name}
                                        >
                                            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                                <div>
                                                    <Text strong>{branch.name}</Text>
                                                    <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                                                        {branch.code}
                                                    </Text>
                                                </div>
                                                <Space size={4}>
                                                    {branch.is_headquarters && (
                                                        <Badge color="blue" text="HQ" />
                                                    )}
                                                    {branch.is_primary && (
                                                        <Badge color="green" text="Primary" />
                                                    )}
                                                </Space>
                                            </Space>
                                        </Select.Option>
                                    ))}
                                </Select>
                            ) : branches.length === 1 ? (
                                <div
                                    style={{
                                        padding: '8px 12px',
                                        background: '#f5f5f5',
                                        borderRadius: 6,
                                        border: '1px solid #d9d9d9',
                                    }}
                                >
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
                        </Form.Item>
                    )}

                    {/* Info message when everything is auto-selected */}
                    {!needsSelection && selectedOrg && branches.length > 0 && (
                        <Alert
                            type="info"
                            message="Auto-selected"
                            description={`Using ${selectedOrg.name} / ${branches[0]?.name ?? 'Default'}`}
                            icon={<CheckCircleFilled />}
                            showIcon
                        />
                    )}
                </Form>
            )}
        </Modal>
    );
}
