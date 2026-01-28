'use client';

import { GlobalOutlined, BankOutlined, BranchesOutlined } from '@ant-design/icons';
import { Tag, Space } from 'antd';
import type { ReactNode } from 'react';

export type ScopeType = 'global' | 'org-wide' | 'branch';

/**
 * Get icon for scope type
 */
export function getScopeIcon(scope: ScopeType | string): ReactNode {
  switch (scope) {
    case 'global':
      return <GlobalOutlined />;
    case 'org-wide':
      return <BankOutlined />;
    case 'branch':
      return <BranchesOutlined />;
    default:
      return null;
  }
}

/**
 * Get color for scope type
 */
export function getScopeColor(scope: ScopeType | string): string {
  switch (scope) {
    case 'global':
      return 'purple';
    case 'org-wide':
      return 'blue';
    case 'branch':
      return 'green';
    default:
      return 'default';
  }
}

export interface ScopeTagProps {
  scope: ScopeType | string;
  label?: string;
  showIcon?: boolean;
}

/**
 * Tag component for displaying scope
 */
export function ScopeTag({ scope, label, showIcon = true }: ScopeTagProps) {
  return (
    <Tag color={getScopeColor(scope)} icon={showIcon ? getScopeIcon(scope) : undefined}>
      {label || scope}
    </Tag>
  );
}

export interface ScopeLabelProps {
  scope: ScopeType | string;
  label: string;
}

/**
 * Label with icon for scope
 */
export function ScopeLabel({ scope, label }: ScopeLabelProps) {
  return (
    <Space>
      {getScopeIcon(scope)}
      {label}
    </Space>
  );
}
