import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { compile as compileSvelte } from 'svelte/compiler';
import { compile as compileMarkdown } from 'mdsvex';

const root = fileURLToPath(new URL('.', import.meta.url));

// The source-only export has no original app configuration. Render its actual
// components on the server, preserving mdsvex's frontmatter and runbook layout.
export default defineConfig({
  resolve: { alias: { '#lib': path.join(root, 'src/lib') } },
  plugins: [{
    name: 'kb-server-render',
    enforce: 'pre',
    async transform(source, id) {
      const filename = id.split('?')[0];
      if (!/\.(svelte|svx)$/.test(filename)) return null;
      if (filename.endsWith('.svx')) {
        const result = await compileMarkdown(source, {
          extensions: ['.svx'],
          layout: { runbook: path.join(root, 'src/lib/layouts/runbook.svelte') },
        });
        if (!result) throw new Error(`Could not compile ${filename}`);
        source = result.code;
      }
      const result = compileSvelte(source, { filename, generate: 'server', css: 'injected', dev: false });
      for (const warning of result.warnings) console.warn(`${filename}: ${warning.message}`);
      return { code: result.js.code, map: result.js.map };
    },
  }],
  build: {
    ssr: path.join(root, 'scripts/render-page.mjs'),
    outDir: '.render',
    emptyOutDir: true,
    rollupOptions: { output: { entryFileNames: 'render-page.mjs' } },
  },
});
