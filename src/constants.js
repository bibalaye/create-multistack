/**
 * constants.js
 * Toutes les données de configuration de l'interface : frameworks, options, package managers.
 */

export const FRAMEWORKS = [
  {
    value: 'react',
    label: '⚛️  React',
    hint: 'SPA, Dashboard, Back-office',
    variants: [
      { value: 'react-vite', label: 'React + Vite', hint: 'Recommandé pour les SPAs rapides' },
      { value: 'react-cra', label: 'React + Create React App', hint: 'Setup classique' },
    ],
  },
  {
    value: 'nextjs',
    label: '▲  Next.js',
    hint: 'Full-stack, SSR, SEO-friendly',
    variants: [
      { value: 'nextjs-app', label: 'Next.js (App Router)', hint: 'Recommandé — React Server Components' },
      { value: 'nextjs-pages', label: 'Next.js (Pages Router)', hint: 'Architecture classique' },
    ],
  },
  {
    value: 'vue',
    label: '💚 Vue',
    hint: 'Interfaces progressives, applications légères',
    variants: [
      { value: 'vue-vite', label: 'Vue 3 + Vite', hint: 'Recommandé pour Vue 3' },
      { value: 'nuxt', label: 'Nuxt 3', hint: 'Full-stack & SSR pour Vue' },
    ],
  },
  {
    value: 'angular',
    label: '🔴 Angular',
    hint: 'Grandes applications d\'entreprise',
    variants: [
      { value: 'angular', label: 'Angular CLI', hint: 'Setup complet et structuré' },
    ],
  },
  {
    value: 'svelte',
    label: '🧡 Svelte',
    hint: 'Applications performantes avec peu de runtime',
    variants: [
      { value: 'svelte-vite', label: 'Svelte + Vite', hint: 'Ultra léger et rapide' },
      { value: 'sveltekit', label: 'SvelteKit', hint: 'Full-stack pour Svelte' },
    ],
  },
  {
    value: 'astro',
    label: '🚀 Astro',
    hint: 'Sites statiques, MPA ultra performants',
    variants: [
      { value: 'astro', label: 'Astro', hint: 'Island Architecture — zéro JS par défaut' },
    ],
  },
];

export const PACKAGE_MANAGERS = [
  { value: 'npm',  label: '📦 npm',  hint: 'Classique et universel' },
  { value: 'pnpm', label: '⚡ pnpm', hint: 'Rapide, économe en espace disque (recommandé)' },
  { value: 'yarn', label: '🧶 yarn', hint: 'Populaire dans les monorepos' },
  { value: 'bun',  label: '🥟 bun',  hint: 'Nouvelle génération, ultra rapide' },
];

export const ADDONS = [
  {
    value: 'typescript',
    label: '🔷 TypeScript',
    hint: 'Typage statique — fortement recommandé',
  },
  {
    value: 'tailwind',
    label: '🎨 Tailwind CSS',
    hint: 'Utility-first CSS framework',
  },
  {
    value: 'eslint',
    label: '🔍 ESLint',
    hint: 'Linting pour détecter les erreurs',
  },
  {
    value: 'prettier',
    label: '✨ Prettier',
    hint: 'Formateur de code automatique',
  },
  {
    value: 'husky',
    label: '🐶 Husky + lint-staged',
    hint: 'Git hooks pour valider le code avant commit',
  },
  {
    value: 'testing',
    label: '🧪 Testing (Vitest/Jest)',
    hint: 'Framework de tests unitaires',
  },
];

export const STATE_MANAGEMENT = {
  react: [
    { value: 'none',   label: 'Aucun', hint: 'Gérer l\'état manuellement' },
    { value: 'zustand', label: '🐻 Zustand', hint: 'Léger et simple (recommandé)' },
    { value: 'redux',   label: '🔴 Redux Toolkit', hint: 'Puissant pour les grandes apps' },
    { value: 'jotai',  label: '⚛️  Jotai', hint: 'Atoms — minimal et performant' },
  ],
  vue: [
    { value: 'none',  label: 'Aucun', hint: 'Gérer l\'état manuellement' },
    { value: 'pinia', label: '🍍 Pinia', hint: 'Officiel Vue 3 — recommandé' },
    { value: 'vuex',  label: '🔄 Vuex', hint: 'Solution classique Vue 2/3' },
  ],
  angular: [
    { value: 'none',   label: 'Aucun / Services Angular', hint: 'Pattern natif Angular' },
    { value: 'ngrx',   label: '🔵 NgRx', hint: 'Redux pattern pour Angular' },
  ],
  svelte: [
    { value: 'none',    label: 'Aucun', hint: 'Svelte stores suffisent souvent' },
    { value: 'svelte-stores', label: '🔮 Svelte Stores', hint: 'Natif Svelte — simple et puissant' },
  ],
  nextjs: [
    { value: 'none',    label: 'Aucun', hint: 'React Context ou Server State' },
    { value: 'zustand', label: '🐻 Zustand', hint: 'Léger et simple (recommandé)' },
    { value: 'redux',   label: '🔴 Redux Toolkit', hint: 'Puissant pour les grandes apps' },
  ],
  astro: [
    { value: 'none', label: 'Aucun', hint: 'Nanostores disponible si besoin' },
    { value: 'nanostores', label: '⚡ Nanostores', hint: 'Ultra léger, framework-agnostic' },
  ],
};

export const COMMON_FILES = [
  { value: 'editorconfig', label: '📝 .editorconfig', hint: 'Uniformise l\'éditeur dans l\'équipe' },
  { value: 'gitignore',    label: '🚫 .gitignore',    hint: 'Ignorer node_modules, dist, etc.' },
  { value: 'readme',       label: '📖 README.md',     hint: 'Documentation de base du projet' },
  { value: 'license',      label: '⚖️  LICENSE',       hint: 'Licence MIT par défaut' },
  { value: 'github-actions', label: '⚙️  GitHub Actions CI',   hint: 'Pipeline CI basique (lint + test)' },
  { value: 'docker',       label: '🐳 Dockerfile',    hint: 'Image Docker de base pour le projet' },
  { value: 'vscode',       label: '💻 .vscode/settings.json', hint: 'Config VSCode recommandée' },
];
export const UI_LIBRARIES = {
  react: [
    { value: 'none', label: 'Aucune', hint: 'Pas de librairie UI pré-installée' },
    { value: 'shadcn', label: '💎 shadcn/ui', hint: 'Premium, Tailwind-based (recommandé)' },
    { value: 'mui', label: '🥇 Material UI (MUI)', hint: 'Complet, design Google' },
    { value: 'chakra', label: '🎨 Chakra UI', hint: 'Moderne et flexible' },
    { value: 'mantine', label: '⚡ Mantine', hint: 'Composants riches et hooks stylés' },
    { value: 'antd', label: '🥉 Ant Design', hint: 'Idéal pour dashboards complexes' },
  ],
  nextjs: [
    { value: 'none', label: 'Aucune', hint: 'Pas de librairie UI pré-installée' },
    { value: 'shadcn', label: '💎 shadcn/ui', hint: 'La meilleure pour Next.js (Tailwind + Radix)' },
    { value: 'mui', label: '🥇 Material UI', hint: 'Classique et robuste' },
    { value: 'chakra', label: '🎨 Chakra UI', hint: 'Facile et moderne' },
  ],
  vue: [
    { value: 'none', label: 'Aucune', hint: 'Pas de librairie UI pré-installée' },
    { value: 'shadcn-vue', label: '💎 shadcn-vue', hint: 'Portage de shadcn pour Vue' },
    { value: 'element-plus', label: '🥇 Element Plus', hint: 'Très complet pour Vue 3' },
    { value: 'primevue', label: '🥉 PrimeVue', hint: 'Énorme collection de composants' },
  ],
  svelte: [
    { value: 'none', label: 'Aucune', hint: 'Pas de librairie UI pré-installée' },
    { value: 'shadcn-svelte', label: '💎 shadcn-svelte', hint: 'Portage de shadcn pour Svelte' },
    { value: 'skeleton', label: '💀 Skeleton UI', hint: 'Tailwind-based pour SvelteKit' },
  ],
  angular: [
    { value: 'none', label: 'Aucune', hint: 'Pas de librairie UI pré-installée' },
    { value: 'angular-material', label: '🥇 Angular Material', hint: 'Officiel, design Google' },
    { value: 'primeng', label: '🥉 PrimeNG', hint: 'Très complet pour Angular' },
  ],
  astro: [
    { value: 'none', label: 'Aucune', hint: 'Pas de librairie UI pré-installée' },
    { value: 'shadcn', label: '💎 shadcn (React islands)', hint: 'Utilise React pour les composants UI' },
    { value: 'tailwind-only', label: '🎨 Tailwind Only', hint: 'Pas de composants JS' },
  ],
};
