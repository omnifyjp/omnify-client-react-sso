/**
 * Omnify Configuration for SSO Package
 *
 * This configuration generates TypeScript types and Zod schemas
 * from SSO schema YAML files.
 */

import type { OmnifyConfig } from '@famgia/omnify';
import typescriptPlugin from '@famgia/omnify-typescript/plugin';

const config: OmnifyConfig = {
  // Directory containing schema definition files (copied from laravel-sso)
  schemasDir: './schemas',

  // Locale configuration
  locale: {
    locales: ['ja', 'en'],
    defaultLocale: 'ja',
    fallbackLocale: 'en',
  },

  // Database configuration (required but not used for types-only generation)
  database: {
    driver: 'mysql',
    devUrl: 'docker://mysql/8/sso_dev',
  },

  // Output configuration - use legacy mode for standalone package
  output: {
    typescript: {
      path: 'src/schemas',  // Model files output path
    },
  },

  // Plugins with custom configuration
  plugins: [
    typescriptPlugin({
      modelsPath: 'src/schemas',  // Model files (user-editable)
      generateZodSchemas: true,
    }),
  ],
};

export default config;
