#!/usr/bin/env tsx
/**
 * Build script to generate TypeScript types from SSO schemas
 *
 * This script:
 * 1. Fetches/copies latest SSO schemas from omnify-client-laravel-sso
 *    - From local sibling directory (if exists)
 *    - OR from git repository (fallback)
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

// Configuration
const GIT_REPO_SSH = 'git@github.com:omnifyjp/omnify-client-laravel-sso.git';
const GIT_REPO_HTTPS = 'https://github.com/omnifyjp/omnify-client-laravel-sso.git';
const GIT_BRANCH = 'main';
const SCHEMAS_PATH_IN_REPO = 'database/schemas/Sso';

// Paths
const ssoSchemasSource = resolve(packageRoot, '../omnify-client-laravel-sso/database/schemas/Sso');
const schemasTarget = resolve(packageRoot, 'schemas');
const typesOutput = resolve(packageRoot, 'src/schemas');
const enumOutput = resolve(packageRoot, 'src/enum');
const tempDir = resolve(packageRoot, '.tmp-laravel-sso');

/**
 * Try to clone from a git URL
 */
function tryGitClone(repoUrl: string): boolean {
    try {
        // Clean temp directory
        if (existsSync(tempDir)) {
            rmSync(tempDir, { recursive: true });
        }

        mkdirSync(tempDir, { recursive: true });

        // Sparse checkout only the schemas directory
        execSync(`git clone --depth 1 --filter=blob:none --sparse ${repoUrl} ${tempDir}`, {
            stdio: 'pipe',
        });

        execSync(`git sparse-checkout set ${SCHEMAS_PATH_IN_REPO}`, {
            cwd: tempDir,
            stdio: 'pipe',
        });

        return true;
    } catch {
        // Cleanup on error
        if (existsSync(tempDir)) {
            rmSync(tempDir, { recursive: true });
        }
        return false;
    }
}

/**
 * Fetch schemas from git repository (SSH first, then HTTPS fallback)
 */
function fetchSchemasFromGit(): boolean {
    console.log('📡 Fetching schemas from git repository...');
    console.log(`   Branch: ${GIT_BRANCH}`);
    console.log('');

    // Try SSH first (developers should have access)
    console.log(`   Trying SSH: ${GIT_REPO_SSH}`);
    if (tryGitClone(GIT_REPO_SSH)) {
        console.log('   ✓ SSH clone successful');
    } else {
        // Fallback to HTTPS
        console.log('   ✗ SSH failed, trying HTTPS...');
        console.log(`   Trying HTTPS: ${GIT_REPO_HTTPS}`);
        if (!tryGitClone(GIT_REPO_HTTPS)) {
            console.error('❌ Failed to clone repository via SSH and HTTPS');
            return false;
        }
        console.log('   ✓ HTTPS clone successful');
    }

    // Check if schemas exist
    const gitSchemasPath = resolve(tempDir, SCHEMAS_PATH_IN_REPO);
    if (!existsSync(gitSchemasPath)) {
        console.error('❌ Schemas not found in git repository at:', SCHEMAS_PATH_IN_REPO);
        rmSync(tempDir, { recursive: true });
        return false;
    }

    // Copy to target
    mkdirSync(schemasTarget, { recursive: true });
    cpSync(gitSchemasPath, schemasTarget, { recursive: true });

    // Cleanup temp
    rmSync(tempDir, { recursive: true });

    console.log('✅ Fetched schemas from git successfully');
    return true;
}

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

    // 2. Get SSO schemas (local or git)
    let schemasObtained = false;

    // Try local first
    if (existsSync(ssoSchemasSource)) {
        console.log('📦 Copying schemas from local omnify-client-laravel-sso...');
        mkdirSync(schemasTarget, { recursive: true });
        cpSync(ssoSchemasSource, schemasTarget, { recursive: true });
        console.log('✅ Copied SSO schemas from local directory');
        schemasObtained = true;
    } else {
        console.log('📦 Local omnify-client-laravel-sso not found, trying git...');
        schemasObtained = fetchSchemasFromGit();
    }

    if (!schemasObtained) {
        console.error('');
        console.error('❌ Could not obtain SSO schemas!');
        console.error('');
        console.error('Please ensure you have SSH access to omnifyjp/omnify-client-laravel-sso');
        console.error('');
        console.error('Setup SSH key:');
        console.error('  1. Add your SSH key to GitHub');
        console.error('  2. Test: ssh -T git@github.com');
        console.error('');
        console.error('Or clone manually:');
        console.error('  git clone git@github.com:omnifyjp/omnify-client-laravel-sso.git ../omnify-client-laravel-sso');
        process.exit(1);
    }

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
