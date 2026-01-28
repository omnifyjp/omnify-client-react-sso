import type { ReactNode } from 'react';
import type { TableProps, TableColumnType } from 'antd';
import type { UseQueryResult } from '@tanstack/react-query';

/**
 * Search field configuration
 */
export interface SearchField {
    name: string;
    label: string;
    type: 'input' | 'select' | 'date' | 'dateRange' | 'number';
    placeholder?: string;
    options?: { value: string | number; label: string }[];
    hidden?: boolean; // Only show when expanded
    width?: number | string;
}

/**
 * Row action configuration
 */
export interface RowAction<T> {
    label: string;
    onClick?: (record: T) => void;
    href?: string;
    danger?: boolean;
    confirm?: boolean | string;
    hidden?: (record: T) => boolean;
}

/**
 * Value type for automatic formatting
 */
export type ValueType = 
    | 'text' 
    | 'status' 
    | 'tag' 
    | 'date' 
    | 'datetime' 
    | 'number' 
    | 'currency' 
    | 'boolean';

/**
 * Status configuration for colored dots
 */
export interface StatusConfig {
    [key: string]: {
        color: string;
        text: string;
    };
}

/**
 * Extended column type with ProTable features
 */
export interface ProTableColumn<T> extends Omit<TableColumnType<T>, 'render' | 'dataIndex'> {
    dataIndex?: string | string[];
    key?: string;
    title: string;
    sortable?: boolean;
    searchable?: boolean;
    valueType?: ValueType;
    statusConfig?: StatusConfig;
    render?: (value: unknown, record: T, index: number) => ReactNode;
    width?: number | string;
    ellipsis?: boolean;
    hidden?: boolean;
}

/**
 * Pagination meta from API
 */
export interface PaginationMeta {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
}

/**
 * API response shape
 */
export interface ApiResponse<T> {
    data: T[];
    meta?: PaginationMeta;
}

/**
 * Query parameters for API
 */
export interface QueryParams {
    page?: number;
    per_page?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    [key: string]: unknown;
}

/**
 * i18n texts for ProTable
 */
export interface ProTableTexts {
    search?: string;
    reset?: string;
    expand?: string;
    collapse?: string;
    add?: string;
    refresh?: string;
    columnSettings?: string;
    actions?: string;
    yes?: string;
    no?: string;
    cancel?: string;
    totalItems?: (total: number) => string;
    selectPlaceholder?: string;
    inputPlaceholder?: string;
    startDate?: string;
    endDate?: string;
}

/**
 * ProTable props
 */
export interface ProTableProps<T extends object> {
    // Header
    title: string;
    icon?: ReactNode;
    subTitle?: string;

    // Search
    searchFields?: SearchField[];
    defaultSearchValues?: Record<string, unknown>;
    
    // Columns
    columns: ProTableColumn<T>[];
    
    // Data
    dataSource?: T[];
    rowKey?: string | ((record: T) => string);
    loading?: boolean;
    
    // TanStack Query integration
    queryKey?: unknown[];
    queryFn?: (params: QueryParams) => Promise<ApiResponse<T>>;
    queryResult?: UseQueryResult<ApiResponse<T>>;
    queryEnabled?: boolean;
    
    // Toolbar
    onAdd?: () => void;
    addButtonLink?: string;
    addLabel?: string;
    toolbarExtra?: ReactNode;
    showRefresh?: boolean;
    showColumnSettings?: boolean;
    
    // Row actions
    rowActions?: (record: T) => RowAction<T>[];
    
    // Pagination
    pagination?: boolean | TableProps<T>['pagination'];
    defaultPageSize?: number;
    
    // Events
    onSearch?: (values: Record<string, unknown>) => void;
    onReset?: () => void;
    onChange?: TableProps<T>['onChange'];
    
    // Style
    className?: string;
    style?: React.CSSProperties;
    cardStyle?: React.CSSProperties;
    tableProps?: Omit<TableProps<T>, 'columns' | 'dataSource' | 'loading' | 'pagination' | 'onChange'>;
    
    // i18n
    texts?: ProTableTexts;
}
