'use client';

import {
  SafetyOutlined,
  GlobalOutlined,
  BankOutlined,
  BranchesOutlined,
  TeamOutlined,
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
  KeyOutlined,
} from '@ant-design/icons';
import {
  Card,
  Typography,
  Button,
  Space,
  Tag,
  Table,
  Tabs,
  Input,
  Select,
  Popconfirm,
  Empty,
} from 'antd';
import { useState, useMemo } from 'react';
import type { UserPermissionsBreakdown, RoleAssignmentWithPermissions } from '../../../core/services/userService';
import { getScopeColor } from '../ScopeUtils';

const { Title, Text, Link: AntLink } = Typography;

export interface UserDetailCardProps {
  user?: UserPermissionsBreakdown['user'];
  roleAssignments: RoleAssignmentWithPermissions[];
  teamMemberships: UserPermissionsBreakdown['team_memberships'];
  aggregatedPermissions: string[];
  currentOrg?: { id: string | number; name: string } | null;
  currentBranch?: { id: string | number; name: string } | null;
  onRefresh?: () => void;
  onAssignRole?: () => void;
  onRemoveRole?: (roleId: string, consoleOrgId?: string | null, consoleBranchId?: string | null) => void;
  onRoleClick?: (roleId: string) => void;
  removeLoading?: boolean;
  translations?: {
    email?: string;
    primaryOrganization?: string;
    currentContext?: string;
    global?: string;
    created?: string;
    lastSignIn?: string;
    roleAssignments?: string;
    roles?: string;
    permissions?: string;
    teams?: string;
    aggregatedPermissions?: string;
    permissionPolicies?: string;
    permissionsDescription?: string;
    searchPermissions?: string;
    allTypes?: string;
    viaRole?: string;
    viaTeam?: string;
    attachedVia?: string;
    filterByType?: string;
    remove?: string;
    addPermissions?: string;
    assignRole?: string;
    noRolesAssigned?: string;
    level?: string;
    actions?: string;
    confirmRemoveRole?: string;
    teamMemberships?: string;
    noTeamMemberships?: string;
    teamLeader?: string;
    noPermissions?: string;
    group?: string;
  };
}

const defaultTranslations = {
  email: 'メール',
  primaryOrganization: '所属組織',
  currentContext: '現在のコンテキスト',
  global: 'グローバル',
  created: '作成日',
  lastSignIn: '最終サインイン',
  roleAssignments: 'ロール割り当て',
  roles: 'ロール',
  permissions: '権限',
  teams: 'チーム',
  aggregatedPermissions: '集約された権限',
  permissionPolicies: '権限ポリシー',
  permissionsDescription: '権限の説明',
  searchPermissions: '権限を検索',
  allTypes: 'すべてのタイプ',
  viaRole: 'ロール経由',
  viaTeam: 'チーム経由',
  attachedVia: '付与元',
  filterByType: 'タイプでフィルタ',
  remove: '削除',
  addPermissions: '権限を追加',
  assignRole: 'ロール割り当て',
  noRolesAssigned: 'ロールが割り当てられていません',
  level: 'レベル',
  actions: '操作',
  confirmRemoveRole: 'このロールを削除してもよろしいですか？',
  teamMemberships: 'チームメンバーシップ',
  noTeamMemberships: 'チームに所属していません',
  teamLeader: 'リーダー',
  noPermissions: '権限がありません',
  group: 'グループ',
};

export function UserDetailCard({
  user,
  roleAssignments,
  teamMemberships,
  aggregatedPermissions,
  currentOrg,
  currentBranch,
  onRefresh,
  onAssignRole,
  onRemoveRole,
  onRoleClick,
  removeLoading = false,
  translations: t = {},
}: UserDetailCardProps) {
  const labels = { ...defaultTranslations, ...t };
  const [permissionSearch, setPermissionSearch] = useState('');
  const [permissionTypeFilter, setPermissionTypeFilter] = useState<string>('all');

  const getScopeLabel = (assignment: RoleAssignmentWithPermissions) => {
    if (assignment.scope === 'global') return labels.global;
    if (assignment.scope === 'org-wide') return assignment.org_name || labels.global;
    return assignment.branch_name || labels.global;
  };

  // Prepare permissions data for table
  const permissionsTableData = roleAssignments.flatMap((assignment) =>
    assignment.permissions.map((perm) => ({
      key: `${assignment.role.id}-${perm.slug}`,
      permission: perm.slug,
      permissionName: perm.name,
      permissionGroup: perm.group,
      type: 'role',
      attachedVia: assignment.role.name,
      scope: assignment.scope,
      roleId: assignment.role.id,
      consoleOrgId: assignment.console_org_id,
      consoleBranchId: assignment.console_branch_id,
    }))
  );

  // Add team permissions
  const teamPermissionsData = teamMemberships.flatMap((membership) =>
    membership.permissions.map((perm) => ({
      key: `team-${membership.team.id}-${perm.slug}`,
      permission: perm.slug,
      permissionName: perm.name,
      permissionGroup: perm.group,
      type: 'team',
      attachedVia: membership.team.name,
      scope: 'team',
    }))
  );

  const allPermissionsData = [...permissionsTableData, ...teamPermissionsData];

  // Filter permissions
  const filteredPermissions = allPermissionsData.filter((p) => {
    const matchesSearch =
      !permissionSearch || p.permission.toLowerCase().includes(permissionSearch.toLowerCase());
    const matchesType = permissionTypeFilter === 'all' || p.type === permissionTypeFilter;
    return matchesSearch && matchesType;
  });

  // Group permissions by group name
  const groupedAggregatedPermissions = useMemo(
    () =>
      aggregatedPermissions.reduce<Record<string, string[]>>((acc, perm) => {
        const group = perm.split('.').slice(0, -1).join('.') || 'other';
        if (!acc[group]) acc[group] = [];
        acc[group].push(perm);
        return acc;
      }, {}),
    [aggregatedPermissions]
  );

  const tabItems = [
    {
      key: 'permissions',
      label: (
        <span>
          <KeyOutlined /> {labels.permissions}
        </span>
      ),
      children: (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <div>
              <Title level={5} style={{ margin: 0 }}>
                {labels.permissionPolicies} ({allPermissionsData.length})
              </Title>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {labels.permissionsDescription}
              </Text>
            </div>
            <Space>
              {onRefresh && <Button icon={<ReloadOutlined />} onClick={onRefresh} />}
              <Button type="default">{labels.remove}</Button>
              <Button type="primary" icon={<PlusOutlined />}>
                {labels.addPermissions}
              </Button>
            </Space>
          </div>

          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <Input
              placeholder={labels.searchPermissions}
              prefix={<KeyOutlined />}
              value={permissionSearch}
              onChange={(e) => setPermissionSearch(e.target.value)}
              style={{ width: 300 }}
            />
            <Select
              value={permissionTypeFilter}
              onChange={setPermissionTypeFilter}
              style={{ width: 200 }}
              options={[
                { value: 'all', label: labels.allTypes },
                { value: 'role', label: labels.viaRole },
                { value: 'team', label: labels.viaTeam },
              ]}
            />
          </div>

          <Table
            dataSource={filteredPermissions}
            pagination={{ pageSize: 10 }}
            columns={[
              {
                title: labels.permissions,
                dataIndex: 'permission',
                key: 'permission',
                render: (perm: string) => (
                  <Space>
                    <KeyOutlined style={{ color: '#faad14' }} />
                    <AntLink>{perm}</AntLink>
                  </Space>
                ),
              },
              {
                title: labels.filterByType,
                dataIndex: 'type',
                key: 'type',
                width: 150,
                render: (type: string) => (
                  <Tag color={type === 'role' ? 'blue' : 'green'}>
                    {type === 'role' ? labels.viaRole : labels.viaTeam}
                  </Tag>
                ),
              },
              {
                title: labels.attachedVia,
                dataIndex: 'attachedVia',
                key: 'attachedVia',
                width: 200,
                render: (via: string, record: { type: string; scope?: string }) => (
                  <Space>
                    {record.type === 'role' ? <SafetyOutlined /> : <TeamOutlined />}
                    <Text>{via}</Text>
                    {record.scope && record.scope !== 'team' && (
                      <Tag color={getScopeColor(record.scope)} style={{ fontSize: 12 }}>
                        {record.scope}
                      </Tag>
                    )}
                  </Space>
                ),
              },
            ]}
          />
        </div>
      ),
    },
    {
      key: 'roles',
      label: (
        <span>
          <SafetyOutlined /> {labels.roles} ({roleAssignments.length})
        </span>
      ),
      children: (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <Title level={5} style={{ margin: 0 }}>
              {labels.roleAssignments}
            </Title>
            {onAssignRole && (
              <Button type="primary" icon={<PlusOutlined />} onClick={onAssignRole}>
                {labels.assignRole}
              </Button>
            )}
          </div>

          {roleAssignments.length === 0 ? (
            <Empty description={labels.noRolesAssigned} />
          ) : (
            <Table
              dataSource={roleAssignments}
              rowKey={(r) => `${r.role.id}-${r.console_org_id}-${r.console_branch_id}`}
              columns={[
                {
                  title: labels.roles,
                  key: 'role',
                  render: (_, record) => (
                    <Space>
                      <SafetyOutlined style={{ color: '#1890ff' }} />
                      <Text
                        strong
                        style={{ color: '#1890ff', cursor: onRoleClick ? 'pointer' : 'default' }}
                        onClick={() => onRoleClick?.(record.role.id)}
                      >
                        {record.role.name}
                      </Text>
                      <Tag color="default">{record.role.slug}</Tag>
                    </Space>
                  ),
                },
                {
                  title: labels.global,
                  key: 'scope',
                  width: 200,
                  render: (_, record) => (
                    <Tag color={getScopeColor(record.scope)}>{getScopeLabel(record)}</Tag>
                  ),
                },
                {
                  title: labels.level,
                  dataIndex: ['role', 'level'],
                  key: 'level',
                  width: 100,
                },
                {
                  title: labels.permissions,
                  key: 'permissions',
                  width: 150,
                  render: (_, record) => (
                    <Text>
                      {record.permissions.length} {labels.permissions.toLowerCase()}
                    </Text>
                  ),
                },
                {
                  title: labels.actions,
                  key: 'actions',
                  width: 100,
                  render: (_, record) =>
                    onRemoveRole && (
                      <Popconfirm
                        title={labels.confirmRemoveRole}
                        onConfirm={() =>
                          onRemoveRole(
                            record.role.id,
                            record.console_org_id,
                            record.console_branch_id
                          )
                        }
                      >
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          loading={removeLoading}
                        />
                      </Popconfirm>
                    ),
                },
              ]}
            />
          )}
        </div>
      ),
    },
    {
      key: 'teams',
      label: (
        <span>
          <TeamOutlined /> {labels.teams} ({teamMemberships.length})
        </span>
      ),
      children: (
        <div>
          <Title level={5} style={{ marginBottom: 16 }}>
            {labels.teamMemberships}
          </Title>

          {teamMemberships.length === 0 ? (
            <Empty description={labels.noTeamMemberships} />
          ) : (
            <Table
              dataSource={teamMemberships}
              rowKey={(m) => m.team.id}
              columns={[
                {
                  title: labels.teams,
                  key: 'team',
                  render: (_, record) => (
                    <Space>
                      <TeamOutlined style={{ color: '#52c41a' }} />
                      <Text strong>{record.team.name}</Text>
                      {record.team.path && <Text type="secondary">({record.team.path})</Text>}
                    </Space>
                  ),
                },
                {
                  title: labels.teamLeader,
                  key: 'leader',
                  width: 150,
                  render: (_, record) =>
                    record.is_leader ? (
                      <Tag color="gold">{labels.teamLeader}</Tag>
                    ) : (
                      <Text type="secondary">-</Text>
                    ),
                },
                {
                  title: labels.permissions,
                  key: 'permissions',
                  width: 150,
                  render: (_, record) => (
                    <Text>
                      {record.permissions.length} {labels.permissions.toLowerCase()}
                    </Text>
                  ),
                },
              ]}
            />
          )}
        </div>
      ),
    },
    {
      key: 'aggregated',
      label: (
        <span>
          <SafetyOutlined /> {labels.aggregatedPermissions} ({aggregatedPermissions.length})
        </span>
      ),
      children: (
        <div>
          <Title level={5} style={{ marginBottom: 16 }}>
            {labels.aggregatedPermissions}
          </Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            すべてのロールとチームから集約された権限の一覧です。
          </Text>

          {aggregatedPermissions.length === 0 ? (
            <Empty description={labels.noPermissions} />
          ) : (
            <Table
              dataSource={aggregatedPermissions.map((perm) => ({
                key: perm,
                permission: perm,
                group: perm.split('.').slice(0, -1).join('.') || 'other',
                action: perm.split('.').pop() || perm,
              }))}
              pagination={{ pageSize: 20 }}
              size="small"
              columns={[
                {
                  title: labels.group,
                  dataIndex: 'group',
                  key: 'group',
                  width: 200,
                  filters: Object.keys(groupedAggregatedPermissions).map((g) => ({
                    text: g,
                    value: g,
                  })),
                  onFilter: (value, record) => record.group === value,
                  render: (group: string) => (
                    <Tag icon={<SafetyOutlined />} color="blue">
                      {group}
                    </Tag>
                  ),
                },
                {
                  title: labels.permissions,
                  dataIndex: 'permission',
                  key: 'permission',
                  render: (perm: string) => (
                    <Space>
                      <KeyOutlined style={{ color: '#faad14' }} />
                      <Text>{perm}</Text>
                    </Space>
                  ),
                },
                {
                  title: 'Action',
                  dataIndex: 'action',
                  key: 'action',
                  width: 150,
                  render: (action: string) => <Tag color="green">{action}</Tag>,
                },
              ]}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Summary Section */}
      <Card size="small" style={{ marginBottom: 24 }} styles={{ body: { padding: '16px 24px' } }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px 48px',
          }}
        >
          <div>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
              {labels.email}
            </Text>
            <Text copyable style={{ fontSize: 14 }}>
              {user?.email || '-'}
            </Text>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
              {labels.primaryOrganization}
            </Text>
            {user?.organization ? (
              <Space size={4}>
                <BankOutlined style={{ color: '#1890ff' }} />
                <Text style={{ fontSize: 14 }}>{user.organization.name}</Text>
              </Space>
            ) : (
              <Space size={4}>
                <GlobalOutlined style={{ color: '#722ed1' }} />
                <Text style={{ fontSize: 14 }}>{labels.global}</Text>
              </Space>
            )}
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
              {labels.currentContext}
            </Text>
            <Space size={16} wrap>
              {currentOrg && (
                <Space size={4}>
                  <BankOutlined style={{ color: '#1890ff' }} />
                  <Text style={{ fontSize: 14 }}>{currentOrg.name}</Text>
                </Space>
              )}
              {currentBranch && (
                <Space size={4}>
                  <BranchesOutlined style={{ color: '#52c41a' }} />
                  <Text style={{ fontSize: 14 }}>{currentBranch.name}</Text>
                </Space>
              )}
            </Space>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
              {labels.created}
            </Text>
            <Text style={{ fontSize: 14 }}>
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
            </Text>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
              {labels.lastSignIn}
            </Text>
            <Text style={{ fontSize: 14 }}>-</Text>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
              {labels.roleAssignments}
            </Text>
            <Text style={{ fontSize: 14 }}>
              <Text strong>{roleAssignments.length}</Text> {labels.roles.toLowerCase()}
            </Text>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Card>
        <Tabs defaultActiveKey="permissions" items={tabItems} />
      </Card>
    </div>
  );
}
