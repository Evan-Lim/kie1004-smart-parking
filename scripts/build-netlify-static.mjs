import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outDir = path.resolve(rootDir, 'netlify-static');

async function main() {
  fs.rmSync(outDir, { recursive: true, force: true });

  await build({
    root: rootDir,
    configFile: false,
    base: './',
    publicDir: false,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': rootDir,
      },
    },
    build: {
      outDir,
      emptyOutDir: true,
      sourcemap: false,
    },
  });

  // SPA fallback rule for Netlify Drop & static hosting
  fs.writeFileSync(
    path.join(outDir, '_redirects'),
    '/* /index.html 200\n',
    'utf8',
  );

  // Clean caching and security headers for Netlify static deploys
  fs.writeFileSync(
    path.join(outDir, '_headers'),
    [
      '/*',
      '  X-Frame-Options: SAMEORIGIN',
      '  X-Content-Type-Options: nosniff',
      '  Referrer-Policy: strict-origin-when-cross-origin',
      '',
      '/assets/*',
      '  Cache-Control: public, max-age=31536000, immutable',
      '',
    ].join('\n'),
    'utf8',
  );

  const files = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else files.push(path.relative(outDir, full));
    }
  };
  walk(outDir);

  console.log(`Built netlify-static/ (${files.length} files):`);
  for (const f of files) console.log(`  - ${f}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
