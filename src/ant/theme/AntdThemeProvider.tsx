'use client';

import { App, ConfigProvider, theme } from 'antd';
import enUS from 'antd/locale/en_US';
import jaJP from 'antd/locale/ja_JP';
import viVN from 'antd/locale/vi_VN';
import { useEffect } from 'react';
import { useLocale } from '../../core/i18n';

// Optional dayjs locale setter (can be passed as prop)
type SetDayjsLocale = (locale: string) => void;

const antdLocales = {
    ja: jaJP,
    en: enUS,
    vi: viVN,
};

// Font families optimized for each language
const fontFamilies: Record<string, string> = {
    // Japanese - CJK optimized fonts
    ja: "'Noto Sans JP', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif",
    // English - Modern western fonts
    en: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    // Vietnamese - Light, clean font with good diacritics
    vi: "'Inter', 'Nunito Sans', -apple-system, BlinkMacSystemFont, sans-serif",
};

type ThemeVariant = 'dashboard' | 'admin';

export interface AntdThemeProviderProps {
    children: React.ReactNode;
    variant?: ThemeVariant;
    /** Optional function to set dayjs locale */
    setDayjsLocale?: SetDayjsLocale;
}

const themeColors = {
    dashboard: {
        primary: '#7C3AED', // Violet
        siderBg: '#7C3AED',
        menuDarkItemBg: '#7C3AED',
        menuDarkSubMenuItemBg: '#6D28D9',
        menuDarkItemSelectedBg: '#9061F9',
        menuDarkItemHoverBg: 'rgba(144, 97, 249, 0.6)',
    },
    admin: {
        primary: '#64748B', // Slate gray - professional admin look
        siderBg: '#475569',
        menuDarkItemBg: '#475569',
        menuDarkSubMenuItemBg: '#334155',
        menuDarkItemSelectedBg: '#64748B',
        menuDarkItemHoverBg: 'rgba(100, 116, 139, 0.6)',
    },
};

export default function AntdThemeProvider({ children, variant = 'dashboard', setDayjsLocale }: AntdThemeProviderProps) {
    const locale = useLocale();
    const antdLocale = antdLocales[locale as keyof typeof antdLocales] ?? jaJP;
    const fontFamily = fontFamilies[locale] ?? fontFamilies.ja;
    const colors = themeColors[variant];

    useEffect(() => {
        setDayjsLocale?.(locale);
    }, [locale, setDayjsLocale]);

    return (
        <ConfigProvider
            locale={antdLocale}
            theme={{
                algorithm: theme.defaultAlgorithm,
                token: {
                    // ===========================================
                    // Tempofast Design System (HSL-based harmony)
                    // ===========================================

                    // Primary - Dynamic based on variant
                    colorPrimary: colors.primary,
                    colorInfo: colors.primary,

                    // Semantic Colors (Complementary harmony)
                    colorSuccess: '#10B981', // HSL(160, 84%, 39%) - Teal-green, cool tone
                    colorWarning: '#F59E0B', // HSL(38, 92%, 50%) - Amber, warm accent
                    colorError: '#EF4444', // HSL(0, 84%, 60%) - Red, same saturation

                    // Text - Neutral with slight violet undertone
                    colorText: '#1E1B2E', // Near black with violet tint
                    colorTextSecondary: '#4B5563', // Cool gray
                    colorTextTertiary: '#9CA3AF', // Light cool gray

                    // Background - Cool neutrals
                    colorBgLayout: '#F8F7FA', // Very light violet-gray
                    colorBgContainer: '#FFFFFF',
                    colorBgElevated: '#FFFFFF',

                    // Border - Subtle
                    colorBorder: '#E5E7EB',
                    colorBorderSecondary: '#F3F4F6',

                    // Border Radius - Compact
                    borderRadius: 4,
                    borderRadiusSM: 2,
                    borderRadiusLG: 6,

                    // Control Heights - Compact
                    controlHeight: 32,
                    controlHeightLG: 36,
                    controlHeightSM: 28,

                    // Font - Dynamic based on locale
                    fontFamily,
                    fontSize: 13,
                    fontSizeLG: 14,
                    fontSizeHeading1: 24,
                    fontSizeHeading2: 20,
                    fontSizeHeading3: 16,
                    fontSizeHeading4: 14,
                    fontSizeHeading5: 13,

                    // Spacing - Tight
                    padding: 12,
                    paddingLG: 16,
                    paddingSM: 8,
                    paddingXS: 4,
                    margin: 12,
                    marginLG: 16,
                    marginSM: 8,
                    marginXS: 4,

                    // Shadows - Almost flat (Japanese style)
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
                    boxShadowSecondary: '0 1px 3px rgba(0, 0, 0, 0.04)',

                    // Line Height
                    lineHeight: 1.5,
                },
                components: {
                    // Global icon margin in Space component
                    Space: {
                        marginXS: 6,
                    },
                    Button: {
                        controlHeight: 32,
                        paddingInline: 12,
                        fontWeight: 500,
                    },
                    Statistic: {
                        contentFontSize: 24,
                        titleFontSize: 13,
                    },
                    Input: {
                        controlHeight: 32,
                        paddingInline: 8,
                    },
                    Select: {
                        controlHeight: 32,
                    },
                    Table: {
                        cellPaddingBlock: 8,
                        cellPaddingInline: 8,
                        headerBg: '#F8F7FA',
                    },
                    Card: {
                        paddingLG: 16,
                    },
                    Form: {
                        itemMarginBottom: 16,
                        verticalLabelPadding: '0 0 4px',
                    },
                    Menu: {
                        itemHeight: 36,
                        itemMarginBlock: 2,
                        itemMarginInline: 4,
                        darkItemBg: colors.menuDarkItemBg,
                        darkSubMenuItemBg: colors.menuDarkSubMenuItemBg,
                        darkItemSelectedBg: colors.menuDarkItemSelectedBg,
                        darkItemSelectedColor: '#FFFFFF',
                        darkItemColor: 'rgba(255, 255, 255, 0.9)',
                        darkItemHoverBg: colors.menuDarkItemHoverBg,
                        darkItemHoverColor: '#FFFFFF',
                    },
                    Layout: {
                        siderBg: colors.siderBg,
                        headerPadding: '0 16px',
                        headerHeight: 48,
                    },
                    Typography: {
                        titleMarginBottom: 8,
                        titleMarginTop: 0,
                    },
                    Modal: {
                        paddingContentHorizontalLG: 16,
                    },
                    Descriptions: {
                        itemPaddingBottom: 8,
                    },
                },
            }}
        >
            <App>{children}</App>
        </ConfigProvider>
    );
}
