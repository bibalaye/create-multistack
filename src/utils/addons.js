/**
 * addons.js
 * Logique d'injection des add-ons dans le projet généré.
 * Chaque add-on peut modifier package.json, créer des fichiers de config
 * et ajouter des dépendances.
 */

import { writePkg, writeFile, appendFile } from './files.js';
import { run, getAddCmd } from './runner.js';
import path from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// Tailwind CSS
// ─────────────────────────────────────────────────────────────────────────────

export async function applyTailwind(targetDir, pm) {
  // Installer tailwindcss
  const [cmd, args] = getAddCmd(pm, ['tailwindcss', '@tailwindcss/vite'], true);
  await run(cmd, args, targetDir);

  // tailwind.config.js
  await writeFile(
    path.join(targetDir, 'tailwind.config.js'),
    `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,vue,svelte}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
`
  );

  // Ajouter les directives dans le CSS principal (si existe)
  const cssTargets = [
    path.join(targetDir, 'src', 'index.css'),
    path.join(targetDir, 'src', 'app.css'),
    path.join(targetDir, 'src', 'styles', 'globals.css'),
  ];
  const { default: fs } = await import('fs-extra');
  for (const cssPath of cssTargets) {
    if (await fs.pathExists(cssPath)) {
      const content = await fs.readFile(cssPath, 'utf-8');
      if (!content.includes('@tailwind')) {
        await fs.writeFile(
          cssPath,
          `@import "tailwindcss";\n\n` + content,
          'utf-8'
        );
      }
      break;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ESLint
// ─────────────────────────────────────────────────────────────────────────────

export async function applyESLint(targetDir, pm, framework, hasTypeScript) {
  const deps = ['eslint', '@eslint/js', 'globals'];
  if (hasTypeScript) {
    deps.push('typescript-eslint');
  }
  if (['react', 'nextjs'].includes(framework)) {
    deps.push('eslint-plugin-react', 'eslint-plugin-react-hooks');
  }
  if (framework === 'vue') {
    deps.push('eslint-plugin-vue');
  }

  const [cmd, args] = getAddCmd(pm, deps, true);
  await run(cmd, args, targetDir);

  // eslint.config.js (flat config — ESLint v9+)
  await writeFile(
    path.join(targetDir, 'eslint.config.js'),
    `import js from '@eslint/js';
import globals from 'globals';
${hasTypeScript ? "import tseslint from 'typescript-eslint';" : ''}

export default [
  js.configs.recommended,
  ${hasTypeScript ? '...tseslint.configs.recommended,' : ''}
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2022,
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'warn',
    },
  },
];
`
  );

  await writePkg(targetDir, {
    scripts: {
      lint: 'eslint src/',
      'lint:fix': 'eslint src/ --fix',
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Prettier
// ─────────────────────────────────────────────────────────────────────────────

export async function applyPrettier(targetDir, pm) {
  const [cmd, args] = getAddCmd(pm, ['prettier'], true);
  await run(cmd, args, targetDir);

  await writeFile(
    path.join(targetDir, '.prettierrc'),
    JSON.stringify(
      {
        semi: true,
        singleQuote: true,
        tabWidth: 2,
        trailingComma: 'es5',
        printWidth: 100,
        endOfLine: 'lf',
      },
      null,
      2
    ) + '\n'
  );

  await writeFile(
    path.join(targetDir, '.prettierignore'),
    `node_modules/\ndist/\nbuild/\n.next/\n`
  );

  await writePkg(targetDir, {
    scripts: {
      format: 'prettier --write src/',
      'format:check': 'prettier --check src/',
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Husky + lint-staged
// ─────────────────────────────────────────────────────────────────────────────

export async function applyHusky(targetDir, pm) {
  const [cmd, args] = getAddCmd(pm, ['husky', 'lint-staged'], true);
  await run(cmd, args, targetDir);

  // Initialiser husky
  await run('npx', ['husky', 'init'], targetDir);

  // Hook pre-commit
  await writeFile(
    path.join(targetDir, '.husky', 'pre-commit'),
    `npx lint-staged\n`
  );

  await writePkg(targetDir, {
    'lint-staged': {
      '*.{js,ts,jsx,tsx,vue,svelte}': ['eslint --fix', 'prettier --write'],
      '*.{css,scss,json,md}': ['prettier --write'],
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Testing (Vitest)
// ─────────────────────────────────────────────────────────────────────────────

export async function applyTesting(targetDir, pm, framework) {
  // Angular uses Karma/Jest by default — skip auto-config pour Angular
  if (framework === 'angular') return;

  const deps = ['vitest', '@vitest/coverage-v8'];
  if (['react', 'nextjs'].includes(framework)) {
    deps.push('@testing-library/react', '@testing-library/jest-dom', 'jsdom');
  }
  if (framework === 'vue') {
    deps.push('@testing-library/vue', '@vue/test-utils', 'jsdom');
  }

  const [cmd, args] = getAddCmd(pm, deps, true);
  await run(cmd, args, targetDir);

  await writeFile(
    path.join(targetDir, 'vitest.config.js'),
    `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
});
`
  );

  await writePkg(targetDir, {
    scripts: {
      test: 'vitest',
      'test:run': 'vitest run',
      'test:coverage': 'vitest run --coverage',
    },
  });

  // Exemple de test
  const { default: fs } = await import('fs-extra');
  await fs.ensureDir(path.join(targetDir, 'src', '__tests__'));
  await writeFile(
    path.join(targetDir, 'src', '__tests__', 'example.test.js'),
    `import { describe, it, expect } from 'vitest';

describe('Example', () => {
  it('should pass', () => {
    expect(1 + 1).toBe(2);
  });
});
`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Gestion d'état
// ─────────────────────────────────────────────────────────────────────────────

const STATE_PACKAGES = {
  zustand:      ['zustand'],
  redux:        ['@reduxjs/toolkit', 'react-redux'],
  jotai:        ['jotai'],
  pinia:        ['pinia'],
  vuex:         ['vuex@next'],
  ngrx:         ['@ngrx/store', '@ngrx/effects', '@ngrx/entity', '@ngrx/store-devtools'],
  nanostores:   ['nanostores'],
  'svelte-stores': [], // natif Svelte, pas besoin d'install
};

export async function applyStateManagement(targetDir, pm, stateLib) {
  if (!stateLib || stateLib === 'none') return;
  const pkgs = STATE_PACKAGES[stateLib] ?? [];
  if (pkgs.length === 0) return;

  const [cmd, args] = getAddCmd(pm, pkgs, false);
  await run(cmd, args, targetDir);
}
