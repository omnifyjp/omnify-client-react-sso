import { defineConfig } from 'tsup';

export default defineConfig({
    entry: {
        index: 'src/index.ts',
        'core/index': 'src/core/index.ts',
        'ant/index': 'src/ant/index.ts',
        'core/testing/index': 'src/core/testing/index.ts',
    },
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    splitting: false,
    sourcemap: true,
    external: [
        'zod',
        'react',
        'react-dom',
        'antd',
        '@ant-design/icons',
        '@tanstack/react-query',
        'react-i18next',
        'i18next',
    ],
});
