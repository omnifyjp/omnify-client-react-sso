'use client';

import { GlobalOutlined } from '@ant-design/icons';
import { Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { locales, localeNames, type Locale } from '../../../core/i18n';

export default function LocaleSwitcher() {
    const { i18n } = useTranslation();
    const locale = (i18n.language as Locale) || 'ja';

    const handleChange = (newLocale: Locale) => {
        i18n.changeLanguage(newLocale);
        document.cookie = `locale=${newLocale};path=/;max-age=31536000`;
    };

    return (
        <Select
            value={locale}
            onChange={handleChange}
            style={{ width: 100 }}
            size="small"
            suffixIcon={<GlobalOutlined />}
            options={locales.map((l) => ({
                value: l,
                label: localeNames[l],
            }))}
        />
    );
}
