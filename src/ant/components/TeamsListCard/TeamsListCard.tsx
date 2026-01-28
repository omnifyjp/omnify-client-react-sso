'use client';

import { TeamOutlined, KeyOutlined, UserOutlined } from '@ant-design/icons';
import { Card, Typography, Tag, Table, Empty } from 'antd';

const { Text } = Typography;

export interface TeamData {
  id: string;
  name: string;
  member_count: number;
  permissions: string[];
}

export interface TeamsListCardProps {
  teams: TeamData[];
  loading?: boolean;
  translations?: {
    name?: string;
    memberCount?: string;
    permissions?: string;
    noTeams?: string;
    teamsFromConsole?: string;
    teamPermissions?: string;
    noData?: string;
  };
}

const defaultTranslations = {
  name: '名前',
  memberCount: 'メンバー数',
  permissions: '権限',
  noTeams: 'チームがありません',
  teamsFromConsole: 'チームはコンソールから管理されます',
  teamPermissions: 'チーム権限',
  noData: 'データがありません',
};

export function TeamsListCard({
  teams,
  loading = false,
  translations: t = {},
}: TeamsListCardProps) {
  const labels = { ...defaultTranslations, ...t };

  const columns = [
    {
      title: labels.name,
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <span>
          <TeamOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          <Text strong>{name}</Text>
        </span>
      ),
    },
    {
      title: labels.memberCount,
      dataIndex: 'member_count',
      key: 'member_count',
      width: 120,
      render: (count: number) => <Tag icon={<UserOutlined />}>{count}</Tag>,
    },
    {
      title: labels.permissions,
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions: string[]) => (
        <span>
          {permissions.length > 0 ? (
            <Tag color="blue">
              {permissions.length} {labels.permissions}
            </Tag>
          ) : (
            <Tag>0 {labels.permissions}</Tag>
          )}
        </span>
      ),
    },
  ];

  return (
    <Card>
      {teams.length === 0 ? (
        <Empty
          description={
            <span>
              {labels.noTeams}
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {labels.teamsFromConsole}
              </Text>
            </span>
          }
        />
      ) : (
        <Table
          columns={columns}
          dataSource={teams}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          expandable={{
            expandedRowRender: (record) => (
              <div style={{ padding: '8px 0' }}>
                <Text strong style={{ marginBottom: 8, display: 'block' }}>
                  <KeyOutlined style={{ marginRight: 4 }} />
                  {labels.teamPermissions}:
                </Text>
                {record.permissions.length === 0 ? (
                  <Text type="secondary">{labels.noData}</Text>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {record.permissions.map((perm) => (
                      <Tag key={perm} color="cyan">
                        {perm}
                      </Tag>
                    ))}
                  </div>
                )}
              </div>
            ),
          }}
        />
      )}
    </Card>
  );
}
