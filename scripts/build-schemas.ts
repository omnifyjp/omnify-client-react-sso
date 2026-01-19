#!/usr/bin/env tsx
/**
 * Build script to generate TypeScript types from SSO schemas
 * 
 * This script:
 * 1. Copies latest SSO schemas from omnify-client-laravel-sso
 * 2. Runs `npx omnify generate --types-only` to create TypeScript types
 * 3. Outputs to src/schemas/ for bundling
 * 
 * Note: schemas/ folder is gitignored - it's refreshed on each build
 */

import { cpSync, existsSync, mkdirSync, rmSync, readdirSync } from 'fs';
import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageRoot = resolve(__dirname, '..');

// Paths
const ssoSchemasSource = resolve(packageRoot, '../omnify-client-laravel-sso/database/schemas/Sso');
const schemasTarget = resolve(packageRoot, 'schemas');
const typesOutput = resolve(packageRoot, 'src/schemas');
const enumOutput = resolve(packageRoot, 'src/enum');

async function main() {
    console.log('🔧 Building SSO schema types...');
    console.log('');

    // 1. Clean previous builds
    console.log('🧹 Cleaning previous builds...');
    if (existsSync(schemasTarget)) {
        rmSync(schemasTarget, { recursive: true });
    }
    if (existsSync(typesOutput)) {
        rmSync(typesOutput, { recursive: true });
    }
    if (existsSync(enumOutput)) {
        rmSync(enumOutput, { recursive: true });
    }

    // 2. Copy latest SSO schemas from laravel-sso
    console.log('📦 Copying latest schemas from omnify-client-laravel-sso...');
    if (!existsSync(ssoSchemasSource)) {
        console.error('❌ SSO schemas not found at:', ssoSchemasSource);
        console.error('');
        console.error('Make sure omnify-client-laravel-sso is available at:');
        console.error('  ../omnify-client-laravel-sso/database/schemas/Sso');
        process.exit(1);
    }

    mkdirSync(schemasTarget, { recursive: true });
    cpSync(ssoSchemasSource, schemasTarget, { recursive: true });
    console.log('✅ Copied SSO schemas to:', schemasTarget);

    // List copied files
    const schemaFiles = readdirSync(schemasTarget).filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
    console.log(`   Found ${schemaFiles.length} schema files:`);
    schemaFiles.forEach(f => console.log(`     - ${f}`));
    console.log('');

    // 3. Generate TypeScript types using omnify CLI
    console.log('⚙️  Running omnify generate --types-only...');
    try {
        execSync('npx omnify generate --types-only', {
            cwd: packageRoot,
            stdio: 'inherit',
            env: {
                ...process.env,
                OMNIFY_SKIP_POSTINSTALL: '1',
            },
        });
        console.log('');
        console.log('✅ TypeScript types generated successfully');
    } catch (error) {
        console.error('❌ Failed to generate TypeScript types');
        throw error;
    }

    console.log('');
    console.log('✨ Done!');
    console.log('');
    console.log('📝 Note: schemas/ folder is gitignored.');
    console.log('   It will be refreshed from laravel-sso on each build.');
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
