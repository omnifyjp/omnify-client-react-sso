'use client';

import { PlusOutlined, GlobalOutlined, BankOutlined } from '@ant-design/icons';
import { Modal, Form, Input, InputNumber, Select, Radio, Button, Space } from 'antd';
import type { OrganizationLike } from '../UserRoleAssignModal/UserRoleAssignModal';

export interface RoleCreateModalProps {
  open: boolean;
  organizations: OrganizationLike[];
  currentOrgId?: string;
  loading?: boolean;
  onSubmit: (values: {
    name: string;
    slug: string;
    description?: string;
    level: number;
    scope: 'global' | 'org';
    org_id?: string;
  }) => void | Promise<void>;
  onCancel: () => void;
  translations?: {
    title?: string;
    name?: string;
    slug?: string;
    description?: string;
    level?: string;
    scope?: string;
    global?: string;
    orgRole?: string;
    organization?: string;
    create?: string;
    cancel?: string;
    required?: string;
  };
}

const defaultTranslations = {
  title: 'ロール作成',
  name: '名前',
  slug: 'スラッグ',
  description: '説明',
  level: 'レベル',
  scope: 'スコープ',
  global: 'グローバル',
  orgRole: '組織ロール',
  organization: '組織',
  create: '作成',
  cancel: 'キャンセル',
  required: '必須項目です',
};

export function RoleCreateModal({
  open,
  organizations,
  currentOrgId,
  loading = false,
  onSubmit,
  onCancel,
  translations: t = {},
}: RoleCreateModalProps) {
  const [form] = Form.useForm();
  const labels = { ...defaultTranslations, ...t };

  const handleFinish = async (values: {
    name: string;
    slug: string;
    description?: string;
    level: number;
    scope: 'global' | 'org';
    org_id?: string;
  }) => {
    await onSubmit(values);
    form.resetFields();
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={
        <Space>
          <PlusOutlined />
          {labels.title}
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
        initialValues={{ level: 50, scope: 'org', org_id: currentOrgId }}
      >
        <Form.Item
          name="scope"
          label={labels.scope}
          rules={[{ required: true, message: labels.required }]}
        >
          <Radio.Group>
            <Radio value="global">
              <Space>
                <GlobalOutlined />
                {labels.global}
              </Space>
            </Radio>
            <Radio value="org">
              <Space>
                <BankOutlined />
                {labels.orgRole}
              </Space>
            </Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item noStyle shouldUpdate={(prev, curr) => prev.scope !== curr.scope}>
          {({ getFieldValue }) =>
            getFieldValue('scope') === 'org' && (
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

        <Form.Item
          name="name"
          label={labels.name}
          rules={[{ required: true, message: labels.required }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="slug"
          label={labels.slug}
          rules={[{ required: true, message: labels.required }]}
        >
          <Input />
        </Form.Item>

        <Form.Item name="description" label={labels.description}>
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item
          name="level"
          label={labels.level}
          rules={[{ required: true, message: labels.required }]}
        >
          <InputNumber min={1} max={100} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              {labels.create}
            </Button>
            <Button onClick={handleCancel}>{labels.cancel}</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
