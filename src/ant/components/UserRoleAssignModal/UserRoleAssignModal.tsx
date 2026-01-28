'use client';

import {
  SafetyOutlined,
  GlobalOutlined,
  BankOutlined,
  BranchesOutlined,
} from '@ant-design/icons';
import {
  Modal,
  Form,
  Select,
  Radio,
  Button,
  Space,
  Tag,
  Typography,
} from 'antd';
import { useState } from 'react';
import type { Role } from '../../../core/services/roleService';

// Use minimal types for flexibility
export interface OrganizationLike {
  id: string | number;
  name: string;
  slug?: string;
}

export interface BranchLike {
  id: string | number;
  name: string;
}
import { ScopeLabel, getScopeColor } from '../ScopeUtils';

const { Text } = Typography;

export interface UserRoleAssignModalProps {
  open: boolean;
  userName?: string;
  roles: Role[];
  organizations: OrganizationLike[];
  branches?: BranchLike[];
  currentOrgId?: string;
  loading?: boolean;
  onAssign: (values: {
    role_id: string;
    scope: 'global' | 'org-wide' | 'branch';
    org_id?: string;
    branch_ids?: string[];
  }) => void | Promise<void>;
  onCancel: () => void;
  translations?: {
    title?: string;
    selectRole?: string;
    scope?: string;
    global?: string;
    orgWide?: string;
    branchSpecific?: string;
    organization?: string;
    selectBranches?: string;
    assign?: string;
    cancel?: string;
    assignRole?: string;
    required?: string;
  };
}

const defaultTranslations = {
  title: 'ロール割り当て',
  selectRole: 'ロールを選択',
  scope: 'スコープ',
  global: 'グローバル',
  orgWide: '組織全体',
  branchSpecific: '拠点限定',
  organization: '組織',
  selectBranches: '拠点を選択',
  assign: '割り当て',
  cancel: 'キャンセル',
  assignRole: 'ロール割り当て',
  required: '必須項目です',
};

export function UserRoleAssignModal({
  open,
  userName,
  roles,
  organizations,
  branches,
  currentOrgId,
  loading = false,
  onAssign,
  onCancel,
  translations: t = {},
}: UserRoleAssignModalProps) {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const labels = { ...defaultTranslations, ...t };

  const handleFinish = async (values: {
    role_id: string;
    scope: 'global' | 'org-wide' | 'branch';
    org_id?: string;
    branch_ids?: string[];
  }) => {
    setIsSubmitting(true);
    try {
      await onAssign(values);
      form.resetFields();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={
        <Space>
          <SafetyOutlined />
          {labels.title} {userName ? `- ${userName}` : ''}
        </Space>
      }
      open={open}
      onCancel={handleCancel}
      footer={null}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ scope: 'org-wide', org_id: currentOrgId }}
      >
        <Form.Item
          name="role_id"
          label={labels.selectRole}
          rules={[{ required: true, message: labels.required }]}
        >
          <Select placeholder={labels.selectRole}>
            {roles.map((role) => (
              <Select.Option key={role.id} value={role.id}>
                {role.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="scope" label={labels.scope}>
          <Radio.Group>
            <Radio value="global">
              <ScopeLabel scope="global" label={labels.global} />
            </Radio>
            <Radio value="org-wide">
              <ScopeLabel scope="org-wide" label={labels.orgWide} />
            </Radio>
            <Radio value="branch">
              <ScopeLabel scope="branch" label={labels.branchSpecific} />
            </Radio>
          </Radio.Group>
        </Form.Item>

        {/* Org selector - show when org-wide or branch scope */}
        <Form.Item noStyle shouldUpdate={(prev, curr) => prev.scope !== curr.scope}>
          {({ getFieldValue }) =>
            (getFieldValue('scope') === 'org-wide' || getFieldValue('scope') === 'branch') && (
              <Form.Item
                name="org_id"
                label={labels.organization}
                rules={[{ required: true, message: labels.required }]}
              >
                <Select placeholder={labels.organization}>
                  {organizations.map((org) => (
                    <Select.Option key={org.id} value={String(org.id)}>
                      <Space>
                        <BankOutlined />
                        {org.name}
                      </Space>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )
          }
        </Form.Item>

        {/* Branch selector - show when branch scope */}
        <Form.Item noStyle shouldUpdate={(prev, curr) => prev.scope !== curr.scope}>
          {({ getFieldValue }) =>
            getFieldValue('scope') === 'branch' && (
              <Form.Item
                name="branch_ids"
                label={labels.selectBranches}
                rules={[{ required: true, message: labels.required }]}
              >
                <Select mode="multiple" placeholder={labels.selectBranches}>
                  {branches?.map((branch) => (
                    <Select.Option key={branch.id} value={String(branch.id)}>
                      {branch.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )
          }
        </Form.Item>

        {/* Preview text */}
        <Form.Item noStyle shouldUpdate>
          {({ getFieldValue }) => {
            const scope = getFieldValue('scope');
            const selectedOrgId = getFieldValue('org_id');
            const selectedBranchIds = getFieldValue('branch_ids') || [];
            const selectedRole = roles.find((r) => r.id === getFieldValue('role_id'));
            const selectedOrg = organizations.find((o) => String(o.id) === selectedOrgId);
            const selectedBranches =
              branches?.filter((b) => selectedBranchIds.includes(String(b.id))) || [];

            if (!selectedRole) return null;

            let scopeText = '';
            if (scope === 'global') {
              scopeText = labels.global;
            } else if (scope === 'org-wide' && selectedOrg) {
              scopeText = `${selectedOrg.name} (${labels.orgWide})`;
            } else if (scope === 'branch' && selectedBranches.length > 0) {
              scopeText = selectedBranches.map((b) => b.name).join(', ');
            }

            return scopeText ? (
              <div
                style={{
                  padding: '8px 12px',
                  background: '#f5f5f5',
                  borderRadius: 4,
                  marginBottom: 16,
                }}
              >
                <Text type="secondary">
                  {labels.assignRole}: <Text strong>{selectedRole.name}</Text>
                  {' → '}
                  <Tag color={getScopeColor(scope)}>{scopeText}</Tag>
                </Text>
              </div>
            ) : null;
          }}
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading || isSubmitting}>
              {labels.assign}
            </Button>
            <Button onClick={handleCancel}>{labels.cancel}</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
