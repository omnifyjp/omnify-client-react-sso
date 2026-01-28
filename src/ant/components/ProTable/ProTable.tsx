'use client';

import {
    PlusOutlined,
    ReloadOutlined,
    SettingOutlined,
    DownOutlined,
    UpOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import {
    Card,
    Table,
    Form,
    Input,
    Select,
    DatePicker,
    InputNumber,
    Button,
    Space,
    Row,
    Col,
    Tooltip,
    Divider,
    Typography,
    Popconfirm,
    theme,
} from 'antd';
import type { TableProps, TablePaginationConfig, TableColumnType } from 'antd';
import type { SorterResult, FilterValue, TableCurrentDataSource } from 'antd/es/table/interface';
import { useState, useMemo, useCallback, type ReactNode, type ComponentType } from 'react';
import type {
    ProTableProps,
    ProTableColumn,
    SearchField,
    QueryParams,
    ApiResponse,
    StatusConfig,
} from './types.js';

const { Link } = Typography;
const { RangePicker } = DatePicker;

// Try to import Inertia Link if available
let InertiaLink: ComponentType<{ href: string; children: ReactNode }> | null = null;
try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    InertiaLink = require('@inertiajs/react').Link;
} catch {
    // Inertia not available, will use regular <a> tags
}

/**
 * Default i18n texts (Japanese)
 * Can be overridden via props
 */
export const DEFAULT_TEXTS = {
    search: '検索',
    reset: 'リセット',
    expand: '展開',
    collapse: '収納',
    add: '新規',
    refresh: '更新',
    columnSettings: '列設定',
    actions: '操作',
    yes: 'はい',
    no: 'いいえ',
    cancel: 'キャンセル',
    totalItems: (total: number) => `全 ${total} 件`,
    selectPlaceholder: '選択してください',
    inputPlaceholder: '入力してください',
    startDate: '開始日',
    endDate: '終了日',
};

// Default status colors
const DEFAULT_STATUS_CONFIG: StatusConfig = {
    active: { color: '#52c41a', text: '有効' },
    Active: { color: '#52c41a', text: '有効' },
    inactive: { color: '#d9d9d9', text: '無効' },
    Inactive: { color: '#d9d9d9', text: '無効' },
    pending: { color: '#faad14', text: '保留中' },
    Pending: { color: '#faad14', text: '保留中' },
    error: { color: '#ff4d4f', text: 'エラー' },
    Error: { color: '#ff4d4f', text: 'エラー' },
    closed: { color: '#ff4d4f', text: '閉鎖' },
    Closed: { color: '#ff4d4f', text: '閉鎖' },
};

/**
 * Render search field based on type
 */
function renderSearchField(field: SearchField, texts: typeof DEFAULT_TEXTS): ReactNode {
    switch (field.type) {
        case 'select':
            return (
                <Select
                    allowClear
                    placeholder={field.placeholder || texts.selectPlaceholder}
                    options={field.options}
                    style={{ width: '100%' }}
                />
            );
        case 'date':
            return (
                <DatePicker
                    placeholder={field.placeholder}
                    style={{ width: '100%' }}
                />
            );
        case 'dateRange':
            return (
                <RangePicker
                    placeholder={[texts.startDate, texts.endDate]}
                    style={{ width: '100%' }}
                />
            );
        case 'number':
            return (
                <InputNumber
                    placeholder={field.placeholder}
                    style={{ width: '100%' }}
                />
            );
        default:
            return (
                <Input
                    allowClear
                    placeholder={field.placeholder || texts.inputPlaceholder}
                />
            );
    }
}

/**
 * Smart Link component - uses Inertia if available, otherwise regular <a>
 */
function SmartLink({ href, children }: { href: string; children: ReactNode }) {
    if (InertiaLink) {
        return <InertiaLink href={href}>{children}</InertiaLink>;
    }
    return <a href={href}>{children}</a>;
}

/**
 * Render value based on valueType
 */
function renderValue(
    value: unknown,
    valueType?: string,
    statusConfig?: StatusConfig
): ReactNode {
    if (value === null || value === undefined) {
        return '-';
    }

    switch (valueType) {
        case 'status': {
            const config = { ...DEFAULT_STATUS_CONFIG, ...statusConfig };
            const statusValue = String(value);
            const status = config[statusValue] || { color: '#d9d9d9', text: statusValue };
            return (
                <Space>
                    <span
                        style={{
                            display: 'inline-block',
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: status.color,
                        }}
                    />
                    {status.text}
                </Space>
            );
        }
        case 'date':
            return value ? new Date(String(value)).toLocaleDateString('ja-JP') : '-';
        case 'datetime':
            return value ? new Date(String(value)).toLocaleString('ja-JP') : '-';
        case 'number':
            return typeof value === 'number' ? value.toLocaleString('ja-JP') : String(value);
        case 'currency':
            return typeof value === 'number'
                ? `¥${value.toLocaleString('ja-JP')}`
                : String(value);
        case 'boolean':
            return value ? 'はい' : 'いいえ';
        default:
            return String(value);
    }
}

/**
 * ProTable Component
 * A feature-rich table with search, filter, sort, and pagination
 */
export function ProTable<T extends object>({
    // Header
    title,
    icon,
    subTitle,
    
    // Search
    searchFields = [],
    defaultSearchValues = {},
    
    // Columns
    columns,
    
    // Data
    dataSource: externalDataSource,
    rowKey = 'id',
    loading: externalLoading,
    
    // Query
    queryKey,
    queryFn,
    queryResult: externalQueryResult,
    queryEnabled = true,
    
    // Toolbar
    onAdd,
    addButtonLink,
    addLabel = '新規',
    toolbarExtra,
    showRefresh = true,
    showColumnSettings = true,
    
    // Row actions
    rowActions,
    
    // Pagination
    pagination = true,
    defaultPageSize = 15,
    
    // Events
    onSearch,
    onReset,
    onChange,
    
    // Style
    className,
    style,
    cardStyle,
    tableProps,
    
    // i18n
    texts: customTexts,
}: ProTableProps<T>) {
    const { token } = theme.useToken();
    const texts = { ...DEFAULT_TEXTS, ...customTexts };
    const [searchForm] = Form.useForm();
    const [expanded, setExpanded] = useState(false);
    const [queryParams, setQueryParams] = useState<QueryParams>({
        page: 1,
        per_page: defaultPageSize,
        ...defaultSearchValues,
    });

    // Separate visible and hidden search fields
    const visibleFields = searchFields.filter((f) => !f.hidden);
    const hiddenFields = searchFields.filter((f) => f.hidden);
    const hasHiddenFields = hiddenFields.length > 0;

    // Internal query if queryFn provided
    const internalQuery = useQuery({
        queryKey: queryKey ? [...queryKey, queryParams] : ['proTable', queryParams],
        queryFn: () => queryFn!(queryParams),
        enabled: !!queryFn && queryEnabled,
    });

    // Use external or internal query result
    const queryResult = externalQueryResult || internalQuery;
    const dataSource = externalDataSource || queryResult.data?.data || [];
    const loading = externalLoading ?? queryResult.isLoading;
    const meta = queryResult.data?.meta;

    // Handle search
    const handleSearch = useCallback((values: Record<string, unknown>) => {
        const newParams = {
            ...queryParams,
            ...values,
            page: 1,
        };
        setQueryParams(newParams);
        onSearch?.(values);
    }, [queryParams, onSearch]);

    // Handle reset
    const handleReset = useCallback(() => {
        searchForm.resetFields();
        const newParams = {
            page: 1,
            per_page: defaultPageSize,
        };
        setQueryParams(newParams);
        onReset?.();
    }, [searchForm, defaultPageSize, onReset]);

    // Handle table change (pagination, sort)
    const handleTableChange = useCallback(
        (
            pag: TablePaginationConfig,
            _filters: Record<string, FilterValue | null>,
            sorter: SorterResult<T> | SorterResult<T>[],
            _extra: TableCurrentDataSource<T>
        ) => {
            const sortInfo = Array.isArray(sorter) ? sorter[0] : sorter;
            const newParams: QueryParams = {
                ...queryParams,
                page: pag.current || 1,
                per_page: pag.pageSize || defaultPageSize,
            };

            if (sortInfo?.field && sortInfo?.order) {
                newParams.sort = String(sortInfo.field);
                newParams.order = sortInfo.order === 'ascend' ? 'asc' : 'desc';
            } else {
                delete newParams.sort;
                delete newParams.order;
            }

            setQueryParams(newParams);
            onChange?.(pag, _filters, sorter, _extra);
        },
        [queryParams, defaultPageSize, onChange]
    );

    // Build table columns
    const tableColumns = useMemo(() => {
        const cols: TableColumnType<T>[] = columns
            .filter((col) => !col.hidden)
            .map((col) => ({
                ...col,
                key: col.key || (Array.isArray(col.dataIndex) ? col.dataIndex.join('.') : col.dataIndex),
                sorter: col.sortable ? true : undefined,
                render: col.render
                    ? col.render
                    : (value: unknown) => renderValue(value, col.valueType, col.statusConfig),
            }));

        // Add actions column if rowActions provided
        if (rowActions) {
            cols.push({
                title: texts.actions,
                key: '_actions',
                width: 150,
                render: (_: unknown, record: T) => {
                    const actions = rowActions(record).filter(
                        (a) => !a.hidden?.(record)
                    );
                    return (
                        <Space size={0}>
                            {actions.map((action, idx) => {
                                const isLast = idx === actions.length - 1;
                                
                                let actionElement: ReactNode;
                                
                                // If action has href, render as Smart Link
                                if (action.href) {
                                    actionElement = (
                                        <SmartLink href={action.href}>
                                            <Link style={action.danger ? { color: token.colorError } : undefined}>
                                                {action.label}
                                            </Link>
                                        </SmartLink>
                                    );
                                } else {
                                    const linkElement = (
                                        <Link
                                            style={action.danger ? { color: token.colorError } : undefined}
                                            onClick={
                                                action.confirm
                                                    ? undefined
                                                    : () => action.onClick?.(record)
                                            }
                                        >
                                            {action.label}
                                        </Link>
                                    );

                                    if (action.confirm) {
                                        actionElement = (
                                            <Popconfirm
                                                title={
                                                    typeof action.confirm === 'string'
                                                        ? action.confirm
                                                        : `${action.label}しますか？`
                                                }
                                                onConfirm={() => action.onClick?.(record)}
                                                okText={texts.yes}
                                                cancelText={texts.cancel}
                                                okButtonProps={action.danger ? { danger: true } : undefined}
                                            >
                                                {linkElement}
                                            </Popconfirm>
                                        );
                                    } else {
                                        actionElement = linkElement;
                                    }
                                }
                                
                                return (
                                    <span key={idx}>
                                        {actionElement}
                                        {!isLast && <Divider type="vertical" />}
                                    </span>
                                );
                            })}
                        </Space>
                    );
                },
            });
        }

        return cols;
    }, [columns, rowActions, texts]);

    // Pagination config
    const paginationConfig = useMemo(() => {
        if (pagination === false) return false;
        
        return {
            current: meta?.current_page || queryParams.page,
            pageSize: meta?.per_page || queryParams.per_page,
            total: meta?.total || 0,
            showSizeChanger: true,
            showTotal: texts.totalItems,
            ...(typeof pagination === 'object' ? pagination : {}),
        };
    }, [pagination, meta, queryParams, texts]);

    return (
        <div className={className} style={style}>
            {/* Search Card */}
            {searchFields.length > 0 && (
                <Card style={{ marginBottom: 24, ...cardStyle }}>
                    <Form
                        form={searchForm}
                        layout="horizontal"
                        onFinish={handleSearch}
                        labelCol={{ flex: '100px' }}
                        wrapperCol={{ flex: 1 }}
                        initialValues={defaultSearchValues}
                    >
                        <Row gutter={24}>
                            {visibleFields.map((field) => (
                                <Col key={field.name} span={8}>
                                    <Form.Item name={field.name} label={field.label}>
                                        {renderSearchField(field, texts)}
                                    </Form.Item>
                                </Col>
                            ))}
                            <Col span={visibleFields.length === 1 ? 16 : 8} style={{ textAlign: 'right' }}>
                                <Space>
                                    <Button onClick={handleReset}>{texts.reset}</Button>
                                    <Button type="primary" htmlType="submit">
                                        {texts.search}
                                    </Button>
                                    {hasHiddenFields && (
                                        <Button
                                            type="link"
                                            onClick={() => setExpanded(!expanded)}
                                        >
                                            {expanded ? texts.collapse : texts.expand}
                                            {expanded ? <UpOutlined /> : <DownOutlined />}
                                        </Button>
                                    )}
                                </Space>
                            </Col>
                        </Row>

                        {/* Expanded fields */}
                        {expanded && hiddenFields.length > 0 && (
                            <Row gutter={24} style={{ marginTop: 16 }}>
                                {hiddenFields.map((field) => (
                                    <Col key={field.name} span={8}>
                                        <Form.Item name={field.name} label={field.label}>
                                            {renderSearchField(field, texts)}
                                        </Form.Item>
                                    </Col>
                                ))}
                            </Row>
                        )}
                    </Form>
                </Card>
            )}

            {/* List Card */}
            <Card
                title={
                    <Space>
                        {icon}
                        {title}
                        {subTitle && (
                            <span style={{ 
                                fontWeight: 'normal', 
                                fontSize: 14,
                                color: token.colorTextSecondary 
                            }}>
                                {subTitle}
                            </span>
                        )}
                    </Space>
                }
                extra={
                    <Space size="small">
                        {toolbarExtra}
                        {addButtonLink && (
                            <SmartLink href={addButtonLink}>
                                <Button type="primary" icon={<PlusOutlined />}>
                                    {addLabel || texts.add}
                                </Button>
                            </SmartLink>
                        )}
                        {onAdd && !addButtonLink && (
                            <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
                                {addLabel || texts.add}
                            </Button>
                        )}
                        {showRefresh && (
                            <Tooltip title={texts.refresh}>
                                <Button
                                    icon={<ReloadOutlined />}
                                    onClick={() => queryResult.refetch?.()}
                                    loading={queryResult.isFetching}
                                />
                            </Tooltip>
                        )}
                        {showColumnSettings && (
                            <Tooltip title={texts.columnSettings}>
                                <Button icon={<SettingOutlined />} />
                            </Tooltip>
                        )}
                    </Space>
                }
                style={cardStyle}
            >
                <Table<T>
                    {...tableProps}
                    columns={tableColumns}
                    dataSource={dataSource as T[]}
                    rowKey={rowKey}
                    loading={loading}
                    pagination={paginationConfig}
                    onChange={handleTableChange}
                />
            </Card>
        </div>
    );
}

export default ProTable;
