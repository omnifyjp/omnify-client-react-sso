'use client';

import {
  UserOutlined,
  SafetyOutlined,
  GlobalOutlined,
  BankOutlined,
  BranchesOutlined,
  TeamOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import {
  Modal,
  Card,
  Tag,
  Space,
  Collapse,
  Empty,
  Spin,
  Button,
  Popconfirm,
  Typography,
} from 'antd';
import type { UserPermissionsBreakdown } from '../../../core/services/userService';

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
import { getScopeIcon, getScopeColor } from '../ScopeUtils';

const { Text } = Typography;

export interface UserPermissionsModalProps {
  open: boolean;
  userName?: string;
  permissions?: UserPermissionsBreakdown | null;
  loading?: boolean;
  currentOrg?: OrganizationLike | null;
  currentBranch?: BranchLike | null;
  branches?: BranchLike[];
  onClose: () => void;
  onAddRole?: () => void;
  onAddTeam?: () => void;
  onRemoveRole?: (roleId: string, orgId?: string | null, branchId?: string | null) => void;
  translations?: {
    permissionBreakdown?: string;
    userInfo?: string;
    email?: string;
    primaryOrganization?: string;
    global?: string;
    currentContext?: string;
    roleAssignments?: string;
    noRolesAssigned?: string;
    add?: string;
    permissions?: string;
    teamMemberships?: string;
    noTeamMemberships?: string;
    teamLeader?: string;
    teamsFromConsole?: string;
    aggregatedPermissions?: string;
    noData?: string;
    ungrouped?: string;
    orgWide?: string;
    confirmRemoveRole?: string;
  };
}

const defaultTranslations = {
  permissionBreakdown: '権限ブレークダウン',
  userInfo: 'ユーザー情報',
  email: 'メール',
  primaryOrganization: '所属組織',
  global: 'グローバル',
  currentContext: '現在のコンテキスト',
  roleAssignments: 'ロール割り当て',
  noRolesAssigned: 'ロールが割り当てられていません',
  add: '追加',
  permissions: '権限',
  teamMemberships: 'チームメンバーシップ',
  noTeamMemberships: 'チームに所属していません',
  teamLeader: 'リーダー',
  teamsFromConsole: 'チームはコンソールから管理します',
  aggregatedPermissions: '集約された権限',
  noData: 'データがありません',
  ungrouped: '未分類',
  orgWide: '組織全体',
  confirmRemoveRole: 'このロールを削除してもよろしいですか？',
};

export function UserPermissionsModal({
  open,
  userName,
  permissions,
  loading = false,
  currentOrg,
  currentBranch,
  branches,
  onClose,
  onAddRole,
  onAddTeam,
  onRemoveRole,
  translations: t = {},
}: UserPermissionsModalProps) {
  const labels = { ...defaultTranslations, ...t };

  const getBranchName = (branchId: string | null) => {
    if (!branchId || !branches) return '';
    const branch = branches.find((b) => String(b.id) === branchId);
    return branch?.name || branchId;
  };

  return (
    <Modal
      title={
        <Space>
          <UserOutlined />
          {userName} - {labels.permissionBreakdown}
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      destroyOnHidden
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" />
        </div>
      ) : permissions ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* User Info with Primary Organization */}
          <Card size="small" title={labels.userInfo}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>
                <Text type="secondary">{labels.email}: </Text>
                <Text>{permissions.user?.email}</Text>
              </div>
              <div>
                <Text type="secondary">{labels.primaryOrganization}: </Text>
                {permissions.user?.organization ? (
                  <Tag icon={<BankOutlined />} color="blue">
                    {permissions.user.organization.name}
                  </Tag>
                ) : (
                  <Tag icon={<GlobalOutlined />} color="purple">
                    {labels.global}
                  </Tag>
                )}
              </div>
            </div>
          </Card>

          {/* Current Context */}
          <Card size="small" title={labels.currentContext}>
            <Space wrap>
              {currentOrg && (
                <Tag icon={<BankOutlined />} color="blue">
                  {currentOrg.name}
                </Tag>
              )}
              {currentBranch && (
                <Tag icon={<BranchesOutlined />} color="green">
                  {currentBranch.name}
                </Tag>
              )}
            </Space>
          </Card>

          {/* Role Assignments */}
          <Card
            size="small"
            title={
              <Space>
                <SafetyOutlined />
                {labels.roleAssignments} ({permissions.role_assignments.length})
              </Space>
            }
            extra={
              onAddRole && (
                <Button type="primary" size="small" icon={<PlusOutlined />} onClick={onAddRole}>
                  {labels.add}
                </Button>
              )
            }
          >
            {permissions.role_assignments.length === 0 ? (
              <Empty description={labels.noRolesAssigned} />
            ) : (
              <Collapse ghost>
                {permissions.role_assignments.map((assignment, index) => (
                  <Collapse.Panel
                    key={index}
                    header={
                      <Space wrap>
                        {getScopeIcon(assignment.scope)}
                        <Text strong>{assignment.role.name}</Text>
                        <Tag color={getScopeColor(assignment.scope)}>
                          {assignment.scope === 'global'
                            ? labels.global
                            : assignment.scope === 'org-wide'
                              ? assignment.org_name || labels.orgWide
                              : assignment.branch_name ||
                                getBranchName(assignment.console_branch_id)}
                        </Tag>
                        {assignment.scope === 'branch' && assignment.org_name && (
                          <Tag color="blue" icon={<BankOutlined />}>
                            {assignment.org_name}
                          </Tag>
                        )}
                        <Tag>
                          {assignment.permissions.length} {labels.permissions}
                        </Tag>
                        {onRemoveRole && (
                          <Popconfirm
                            title={labels.confirmRemoveRole}
                            onConfirm={() => {
                              onRemoveRole(
                                assignment.role.id,
                                assignment.console_org_id,
                                assignment.console_branch_id
                              );
                            }}
                          >
                            <Button
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </Popconfirm>
                        )}
                      </Space>
                    }
                  >
                    {Object.entries(
                      assignment.permissions.reduce(
                        (
                          groups: Record<string, Array<{ slug: string; name: string }>>,
                          perm
                        ) => {
                          const group = perm.group || labels.ungrouped;
                          if (!groups[group]) groups[group] = [];
                          groups[group].push({ slug: perm.slug, name: perm.name });
                          return groups;
                        },
                        {}
                      )
                    ).map(([group, perms]) => (
                      <div key={group} style={{ marginBottom: 8 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {group}
                        </Text>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                          {perms.map((perm) => (
                            <Tag key={perm.slug} color="blue">
                              {perm.name}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    ))}
                  </Collapse.Panel>
                ))}
              </Collapse>
            )}
          </Card>

          {/* Team Memberships */}
          <Card
            size="small"
            title={
              <Space>
                <TeamOutlined />
                {labels.teamMemberships} ({permissions.team_memberships.length})
              </Space>
            }
            extra={
              onAddTeam && (
                <Button size="small" icon={<PlusOutlined />} onClick={onAddTeam}>
                  {labels.add}
                </Button>
              )
            }
          >
            {permissions.team_memberships.length === 0 ? (
              <Empty description={labels.noTeamMemberships} />
            ) : (
              <Collapse ghost>
                {permissions.team_memberships.map((membership, index) => (
                  <Collapse.Panel
                    key={index}
                    header={
                      <Space>
                        <TeamOutlined />
                        <Text strong>{membership.team.name}</Text>
                        {membership.is_leader && <Tag color="gold">{labels.teamLeader}</Tag>}
                        <Tag>
                          {membership.permissions.length} {labels.permissions}
                        </Tag>
                      </Space>
                    }
                  >
                    {Object.entries(
                      membership.permissions.reduce(
                        (
                          groups: Record<string, Array<{ slug: string; name: string }>>,
                          perm
                        ) => {
                          const group = perm.group || labels.ungrouped;
                          if (!groups[group]) groups[group] = [];
                          groups[group].push({ slug: perm.slug, name: perm.name });
                          return groups;
                        },
                        {}
                      )
                    ).map(([group, perms]) => (
                      <div key={group} style={{ marginBottom: 8 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {group}
                        </Text>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                          {perms.map((perm) => (
                            <Tag key={perm.slug} color="cyan">
                              {perm.name}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    ))}
                  </Collapse.Panel>
                ))}
              </Collapse>
            )}
          </Card>

          {/* Aggregated Permissions - Grouped */}
          <Card
            size="small"
            title={
              <Space>
                <SafetyOutlined />
                {labels.aggregatedPermissions} ({permissions.aggregated_permissions.length})
              </Space>
            }
          >
            {permissions.aggregated_permissions.length === 0 ? (
              <Empty description={labels.noData} />
            ) : (
              <Collapse ghost>
                {Object.entries(
                  permissions.aggregated_permissions.reduce(
                    (groups: Record<string, string[]>, perm: string) => {
                      const parts = perm.split('.');
                      const group = parts.length > 1 ? parts.slice(0, -1).join('.') : labels.ungrouped;
                      if (!groups[group]) groups[group] = [];
                      groups[group].push(perm);
                      return groups;
                    },
                    {}
                  )
                ).map(([group, perms]) => (
                  <Collapse.Panel
                    key={group}
                    header={
                      <Space>
                        <SafetyOutlined />
                        <Text strong>{group}</Text>
                        <Tag color="green">{(perms as string[]).length}</Tag>
                      </Space>
                    }
                  >
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {(perms as string[]).map((perm) => (
                        <Tag key={perm} color="green">
                          {perm.split('.').pop()}
                        </Tag>
                      ))}
                    </div>
                  </Collapse.Panel>
                ))}
              </Collapse>
            )}
          </Card>
        </div>
      ) : null}
    </Modal>
  );
}
