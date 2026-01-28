'use client';

import { KeyOutlined, AppstoreOutlined } from '@ant-design/icons';
import { Card, Typography, Tag, Table, Input, Space, Collapse } from 'antd';
import { useState, useMemo } from 'react';
import type { Permission } from '../../../core/services/permissionService';

const { Text } = Typography;

export interface PermissionsListCardProps {
  permissions: Permission[];
  groups: string[];
  loading?: boolean;
  translations?: {
    searchPermissions?: string;
    name?: string;
    slug?: string;
    group?: string;
    noData?: string;
  };
  onGroupLabelRender?: (group: string) => string;
}

const defaultTranslations = {
  searchPermissions: '権限を検索',
  name: '名前',
  slug: 'スラッグ',
  group: 'グループ',
  noData: 'データがありません',
};

export function PermissionsListCard({
  permissions,
  groups,
  loading = false,
  translations: t = {},
  onGroupLabelRender,
}: PermissionsListCardProps) {
  const [search, setSearch] = useState('');
  const labels = { ...defaultTranslations, ...t };

  // Filter and group permissions
  const filteredPermissions = useMemo(() => {
    if (!search) return permissions;
    const lowerSearch = search.toLowerCase();
    return permissions.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerSearch) ||
        p.slug.toLowerCase().includes(lowerSearch) ||
        (p.group || '').toLowerCase().includes(lowerSearch)
    );
  }, [permissions, search]);

  const groupedPermissions = useMemo(() => {
    const grouped: Record<string, Permission[]> = {};
    filteredPermissions.forEach((perm) => {
      const group = perm.group || 'other';
      if (!grouped[group]) grouped[group] = [];
      grouped[group].push(perm);
    });
    return grouped;
  }, [filteredPermissions]);

  const getGroupLabel = (group: string) => {
    if (onGroupLabelRender) return onGroupLabelRender(group);
    return group;
  };

  const columns = [
    {
      title: labels.name,
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <Space>
          <KeyOutlined style={{ color: '#52c41a' }} />
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    {
      title: labels.slug,
      dataIndex: 'slug',
      key: 'slug',
      render: (slug: string) => <Tag color="blue">{slug}</Tag>,
    },
    {
      title: labels.group,
      dataIndex: 'group',
      key: 'group',
      render: (group: string) => (
        <Tag icon={<AppstoreOutlined />} color="purple">
          {getGroupLabel(group || 'other')}
        </Tag>
      ),
    },
  ];

  return (
    <Card>
      <div style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder={labels.searchPermissions}
          allowClear
          onSearch={setSearch}
          onChange={(e) => !e.target.value && setSearch('')}
          style={{ maxWidth: 300 }}
        />
      </div>

      <Collapse defaultActiveKey={groups} ghost>
        {Object.entries(groupedPermissions).map(([group, perms]) => (
          <Collapse.Panel
            key={group}
            header={
              <Space>
                <AppstoreOutlined style={{ color: '#722ed1' }} />
                <Text strong>{getGroupLabel(group)}</Text>
                <Tag>{perms.length}</Tag>
              </Space>
            }
          >
            <Table
              columns={columns}
              dataSource={perms}
              rowKey="id"
              loading={loading}
              pagination={false}
              size="small"
            />
          </Collapse.Panel>
        ))}
      </Collapse>

      {filteredPermissions.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Text type="secondary">{labels.noData}</Text>
        </div>
      )}
    </Card>
  );
}
