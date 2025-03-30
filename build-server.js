#!/usr/bin/env node

import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function buildServer() {
  try {
    console.log('Building server with ESM compatibility...');
    
    // First, compile TypeScript using the build-specific config
    console.log('Compiling TypeScript...');
    execSync('npx tsc -p tsconfig.build.json', { stdio: 'inherit' });
    
    // Then use esbuild for final bundling of the main entry point
    console.log('Bundling with esbuild...');
    await build({
      entryPoints: ['server/index.ts'],
      bundle: true,
      platform: 'node',
      target: 'node16',
      format: 'esm',
      outfile: 'dist/index.js',
      external: [
        'express',
        'express-session',
        'passport',
        'passport-local',
        'connect-pg-simple',
        'bcryptjs',
        'jsonwebtoken',
        'cookie-parser',
        'zod',
        '@prisma/client',
        'prisma',
        'pg',
        'ws'
      ],
      sourcemap: true,
      minify: false
    });

    // Add package.json to the dist folder to ensure ESM compatibility
    const pkgJson = {
      "type": "module",
      "engines": {
        "node": ">=16.0.0"
      }
    };
    
    fs.writeFileSync('dist/package.json', JSON.stringify(pkgJson, null, 2));
    
    // Generate simple shell wrapper for production
    const shellWrapper = `#!/bin/sh
NODE_ENV=production node ./index.js
`;
    
    fs.writeFileSync('dist/start.sh', shellWrapper);
    execSync('chmod +x dist/start.sh', { stdio: 'inherit' });
    
    console.log('Server build complete! Run with: ./dist/start.sh');
  } catch (error) {
    console.error('Error building server:', error);
    process.exit(1);
  }
}

buildServer();