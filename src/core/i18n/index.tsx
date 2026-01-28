'use client';

import { createContext, useContext, useCallback, useState, useEffect, useMemo, type ReactNode } from 'react';
import { useTranslation, I18nextProvider, initReactI18next } from 'react-i18next';
import i18n from 'i18next';

// =============================================================================
// Types
// =============================================================================

export type Locale = 'ja' | 'en' | 'vi';

export const locales: Locale[] = ['ja', 'en', 'vi'];

export const localeNames: Record<Locale, string> = {
    ja: '日本語',
    en: 'English', 
    vi: 'Tiếng Việt',
};

export const defaultLocale: Locale = 'ja';

export interface I18nContextValue {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string, options?: Record<string, unknown>) => string;
}

export interface I18nProviderProps {
    children: ReactNode;
    defaultLocale?: Locale;
    fallbackLocale?: Locale;
    translations?: Record<string, Record<string, unknown>>;
}

// =============================================================================
// Context
// =============================================================================

const I18nContext = createContext<I18nContextValue | null>(null);

// =============================================================================
// i18n Initialization
// =============================================================================

let i18nInitialized = false;

function initializeI18n(
    initialLocale: Locale,
    fallbackLocale: Locale,
    translations?: Record<string, Record<string, unknown>>
) {
    if (i18nInitialized) {
        return i18n;
    }

    const resources: Record<string, { translation: Record<string, unknown> }> = {};
    
    // Add default SSO translations
    for (const locale of locales) {
        resources[locale] = {
            translation: {
                ...defaultTranslations[locale],
                ...(translations?.[locale] || {}),
            },
        };
    }

    i18n.use(initReactI18next).init({
        resources,
        lng: initialLocale,
        fallbackLng: fallbackLocale,
        interpolation: {
            escapeValue: false,
        },
        react: {
            useSuspense: false,
        },
    });

    i18nInitialized = true;
    return i18n;
}

// =============================================================================
// Provider
// =============================================================================

export function I18nProvider({ 
    children, 
    defaultLocale: initialLocale = 'ja',
    fallbackLocale = 'ja',
    translations,
}: I18nProviderProps) {
    // Initialize i18n on first render
    const i18nInstance = useMemo(
        () => initializeI18n(initialLocale, fallbackLocale, translations),
        [initialLocale, fallbackLocale, translations]
    );

    return (
        <I18nextProvider i18n={i18nInstance}>
            <I18nProviderInner initialLocale={initialLocale}>
                {children}
            </I18nProviderInner>
        </I18nextProvider>
    );
}

function I18nProviderInner({ 
    children, 
    initialLocale,
}: { 
    children: ReactNode;
    initialLocale: Locale;
}) {
    const [locale, setLocaleState] = useState<Locale>(initialLocale);
    const { t: translate, i18n: i18nInstance } = useTranslation();

    const setLocale = useCallback((newLocale: Locale) => {
        setLocaleState(newLocale);
        i18nInstance?.changeLanguage(newLocale);
        // Store in cookie for SSR
        if (typeof document !== 'undefined') {
            document.cookie = `locale=${newLocale};path=/;max-age=31536000`;
        }
    }, [i18nInstance]);

    const t = useCallback((key: string, options?: Record<string, unknown>): string => {
        return String(translate(key, options as never));
    }, [translate]);

    // Initialize locale from cookie or browser
    useEffect(() => {
        if (typeof document !== 'undefined') {
            const cookieLocale = document.cookie
                .split('; ')
                .find(row => row.startsWith('locale='))
                ?.split('=')[1] as Locale | undefined;
            
            if (cookieLocale && locales.includes(cookieLocale)) {
                setLocale(cookieLocale);
            }
        }
    }, [setLocale]);

    return (
        <I18nContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </I18nContext.Provider>
    );
}

// =============================================================================
// Hooks
// =============================================================================

export function useLocale(): Locale {
    const context = useContext(I18nContext);
    const { i18n: i18nInstance } = useTranslation();
    
    if (context) {
        return context.locale;
    }
    
    // Fallback to i18next language
    return (i18nInstance?.language as Locale) || defaultLocale;
}

export function useTranslations() {
    const { t } = useTranslation();
    return t;
}

export function useSsoTranslation() {
    return useTranslation('sso');
}

// =============================================================================
// Utilities
// =============================================================================

export function getCurrentLocale(): Locale {
    if (typeof document !== 'undefined') {
        const cookieLocale = document.cookie
            .split('; ')
            .find(row => row.startsWith('locale='))
            ?.split('=')[1] as Locale | undefined;
        
        if (cookieLocale && locales.includes(cookieLocale)) {
            return cookieLocale;
        }
    }
    return defaultLocale;
}

export function changeLanguage(locale: Locale): void {
    i18n.changeLanguage(locale);
    if (typeof document !== 'undefined') {
        document.cookie = `locale=${locale};path=/;max-age=31536000`;
    }
}

// =============================================================================
// Default Translations (SSO namespace)
// =============================================================================

export const ssoNamespace = 'sso';

export const defaultTranslations = {
    ja: {
        login: 'ログイン',
        logout: 'ログアウト',
        loading: '読み込み中...',
        error: 'エラーが発生しました',
        retry: '再試行',
        cancel: 'キャンセル',
        save: '保存',
        delete: '削除',
        edit: '編集',
        create: '新規作成',
        search: '検索',
        reset: 'リセット',
        noData: 'データがありません',
        confirmDelete: '削除してもよろしいですか？',
    },
    en: {
        login: 'Login',
        logout: 'Logout',
        loading: 'Loading...',
        error: 'An error occurred',
        retry: 'Retry',
        cancel: 'Cancel',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        create: 'Create',
        search: 'Search',
        reset: 'Reset',
        noData: 'No data',
        confirmDelete: 'Are you sure you want to delete?',
    },
    vi: {
        login: 'Đăng nhập',
        logout: 'Đăng xuất',
        loading: 'Đang tải...',
        error: 'Đã xảy ra lỗi',
        retry: 'Thử lại',
        cancel: 'Hủy',
        save: 'Lưu',
        delete: 'Xóa',
        edit: 'Sửa',
        create: 'Tạo mới',
        search: 'Tìm kiếm',
        reset: 'Đặt lại',
        noData: 'Không có dữ liệu',
        confirmDelete: 'Bạn có chắc chắn muốn xóa?',
    },
};
