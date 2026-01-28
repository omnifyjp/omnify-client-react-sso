'use client';

import {
  SafetyOutlined,
  PlusOutlined,
  EyeOutlined,
  DeleteOutlined,
  GlobalOutlined,
  BankOutlined,
} from '@ant-design/icons';
import { Card, Typography, Button, Space, Tag, Select, Table, Popconfirm } from 'antd';
import type { Role } from '../../../core/services/roleService';

const { Text } = Typography;

export interface RolesListCardProps {
  roles: Role[];
  loading?: boolean;
  scopeFilter: 'all' | 'global' | 'org';
  onScopeFilterChange: (value: 'all' | 'global' | 'org') => void;
  onCreateClick: () => void;
  onViewClick: (role: Role) => void;
  onDeleteClick: (role: Role) => void;
  translations?: {
    name?: string;
    scope?: string;
    level?: string;
    description?: string;
    actions?: string;
    detail?: string;
    global?: string;
    orgRole?: string;
    all?: string;
    confirmDeleteRole?: string;
  };
}

const defaultTranslations = {
  name: '名前',
  scope: 'スコープ',
  level: 'レベル',
  description: '説明',
  actions: '操作',
  detail: '詳細',
  global: 'グローバル',
  orgRole: '組織ロール',
  all: 'すべて',
  confirmDeleteRole: 'このロールを削除してもよろしいですか？',
};

export function RolesListCard({
  roles,
  loading = false,
  scopeFilter,
  onScopeFilterChange,
  onCreateClick,
  onViewClick,
  onDeleteClick,
  translations: t = {},
}: RolesListCardProps) {
  const labels = { ...defaultTranslations, ...t };

  const columns = [
    {
      title: labels.name,
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Role) => (
        <Space>
          <SafetyOutlined style={{ color: '#1890ff' }} />
          <Text strong>{name}</Text>
          <Tag>{record.slug}</Tag>
        </Space>
      ),
    },
    {
      title: labels.scope,
      dataIndex: 'console_org_id',
      key: 'scope',
      width: 180,
      render: (_: unknown, record: Role) =>
        record.console_org_id ? (
          <Tag icon={<BankOutlined />} color="blue">
            {record.organization?.name || record.console_org_id}
          </Tag>
        ) : (
          <Tag icon={<GlobalOutlined />} color="purple">
            {labels.global}
          </Tag>
        ),
    },
    {
      title: labels.level,
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (level: number) => <Tag color="blue">{level}</Tag>,
    },
    {
      title: labels.description,
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: labels.actions,
      key: 'actions',
      width: 180,
      render: (_: unknown, record: Role) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => onViewClick(record)}>
            {labels.detail}
          </Button>
          <Popconfirm title={labels.confirmDeleteRole} onConfirm={() => onDeleteClick(record)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title={
        <Space>
          <SafetyOutlined />
          Roles
        </Space>
      }
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={onCreateClick}>
          Create
        </Button>
      }
    >
      <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
        <Select
          value={scopeFilter}
          onChange={onScopeFilterChange}
          style={{ minWidth: 200 }}
        >
          <Select.Option value="all">
            <Space>
              <SafetyOutlined />
              {labels.all}
            </Space>
          </Select.Option>
          <Select.Option value="global">
            <Space>
              <GlobalOutlined />
              {labels.global}
            </Space>
          </Select.Option>
          <Select.Option value="org">
            <Space>
              <BankOutlined />
              {labels.orgRole}
            </Space>
          </Select.Option>
        </Select>
      </div>

      <Table
        columns={columns}
        dataSource={roles}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
}
