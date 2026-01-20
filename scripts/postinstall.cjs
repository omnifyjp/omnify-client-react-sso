#!/usr/bin/env node
/**
 * Postinstall script for @famgia/omnify-react-sso
 *
 * Creates @omnify-base in the consumer's node_modules so TypeScript can resolve types.
 * The actual @omnify-base types are bundled in this package's dist/@omnify-base.
 */

const fs = require('fs');
const path = require('path');

// Find the consumer's node_modules (go up from this package)
const packageDir = path.resolve(__dirname, '..');
const nodeModulesDir = path.resolve(packageDir, '..', '..'); // node_modules/@famgia/omnify-react-sso -> node_modules
const targetDir = path.join(nodeModulesDir, '@omnify-base');
const sourceDir = path.join(packageDir, 'dist', '@omnify-base');

// Only run if we're in a consumer's node_modules (not during development)
if (!nodeModulesDir.includes('node_modules')) {
    console.log('@famgia/omnify-react-sso: Skipping postinstall (not in node_modules)');
    process.exit(0);
}

// Check if source exists
if (!fs.existsSync(sourceDir)) {
    console.log('@famgia/omnify-react-sso: dist/@omnify-base not found, skipping');
    process.exit(0);
}

// Skip if @omnify-base already exists (from another package or manual setup)
if (fs.existsSync(targetDir)) {
    console.log('@famgia/omnify-react-sso: @omnify-base already exists, skipping');
    process.exit(0);
}

try {
    // Copy @omnify-base to node_modules
    fs.cpSync(sourceDir, targetDir, { recursive: true });
    console.log('@famgia/omnify-react-sso: Created @omnify-base for TypeScript');
} catch (error) {
    console.warn('@famgia/omnify-react-sso: Could not create @omnify-base:', error.message);
    // Don't fail - the package still works at runtime
}
