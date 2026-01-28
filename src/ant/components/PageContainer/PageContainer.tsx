'use client';

import { Breadcrumb, Space, theme } from 'antd';
import type { BreadcrumbProps } from 'antd';
import type { ReactNode } from 'react';

export interface PageContainerProps {
    /**
     * Page title
     */
    title?: ReactNode;
    /**
     * Subtitle displayed below the title
     */
    subTitle?: ReactNode;
    /**
     * Icon displayed before the title
     */
    icon?: ReactNode;
    /**
     * Extra content displayed on the right side of the header
     */
    extra?: ReactNode;
    /**
     * Breadcrumb configuration
     * Can be BreadcrumbProps or array of { title: string, href?: string }
     */
    breadcrumb?: BreadcrumbProps | { title: ReactNode; href?: string }[];
    /**
     * Content of the page
     */
    children?: ReactNode;
    /**
     * Whether to show the header background
     * @default true
     */
    showHeader?: boolean;
    /**
     * Custom className for the container
     */
    className?: string;
    /**
     * Custom style for the container
     */
    style?: React.CSSProperties;
}

/**
 * PageContainer - A standard page layout component
 *
 * Provides consistent page structure with:
 * - Breadcrumb navigation
 * - Page title with optional icon and subtitle
 * - Extra actions area (right side)
 * - Content area
 *
 * @example
 * ```tsx
 * <PageContainer
 *   title="従業員管理"
 *   subTitle="従業員情報の一覧と管理"
 *   icon={<UserOutlined />}
 *   breadcrumb={[
 *     { title: 'リスト' },
 *     { title: '従業員管理' },
 *   ]}
 *   extra={
 *     <Button type="primary" icon={<PlusOutlined />}>
 *       新規
 *     </Button>
 *   }
 * >
 *   <Card>...</Card>
 * </PageContainer>
 * ```
 */
export function PageContainer({
    title,
    subTitle,
    icon,
    extra,
    breadcrumb,
    children,
    showHeader = true,
    className,
    style,
}: PageContainerProps) {
    const { token } = theme.useToken();

    // Convert breadcrumb array to BreadcrumbProps if needed
    const breadcrumbProps: BreadcrumbProps | undefined = breadcrumb
        ? Array.isArray(breadcrumb)
            ? { items: breadcrumb }
            : breadcrumb
        : undefined;

    const hasHeader = showHeader && (title || subTitle || breadcrumb);

    return (
        <div className={className} style={style}>
            {/* Header Section */}
            {hasHeader && (
                <div
                    style={{
                        marginBottom: 24,
                    }}
                >
                    {/* Breadcrumb */}
                    {breadcrumbProps && (
                        <Breadcrumb
                            {...breadcrumbProps}
                            style={{
                                marginBottom: 12,
                                ...breadcrumbProps.style,
                            }}
                        />
                    )}

                    {/* Title Row */}
                    {(title || extra) && (
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                            }}
                        >
                            {/* Title & Subtitle */}
                            <div>
                                {title && (
                                    <h1
                                        style={{
                                            margin: 0,
                                            fontSize: 20,
                                            fontWeight: 600,
                                            lineHeight: 1.4,
                                            color: token.colorText,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                        }}
                                    >
                                        {icon && (
                                            <span style={{ fontSize: 20 }}>{icon}</span>
                                        )}
                                        {title}
                                    </h1>
                                )}
                                {subTitle && (
                                    <div
                                        style={{
                                            marginTop: 4,
                                            fontSize: 14,
                                            color: token.colorTextSecondary,
                                        }}
                                    >
                                        {subTitle}
                                    </div>
                                )}
                            </div>

                            {/* Extra Actions */}
                            {extra && (
                                <div style={{ flexShrink: 0 }}>
                                    {extra}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Content */}
            {children}
        </div>
    );
}

export default PageContainer;
