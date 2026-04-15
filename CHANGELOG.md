# Changelog

Tous les changements notables de ce projet sont documentés ici.

Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
ce projet respecte le [Semantic Versioning](https://semver.org/lang/fr/).

---

## [0.1.1] — 2026-04-15

### Ajouté
- **UI Architecture** : Sélecteur de bibliothèques UI intégré (shadcn/ui, shadcn-vue, shadcn-svelte, MUI, Chakra UI, Ant Design, Mantine, PrimeVue, Element Plus).
- Support Nuxt 3 et SvelteKit.
- Support Astro.
- Initialisation automatique pour les libs basées sur Tailwind (shadcn init).

### Corrigé
- Problème de fichiers invisibles (.gitignore, etc.) lors du `npm publish`.
- Correction du mapping des fichiers partagés.

---

## [0.1.0] — 2026-04-13

### Ajouté
- Interface CLI interactive avec Clack prompts
- Support React (Vite + CRA), Next.js (App Router + Pages Router), Vue (Vite), Angular, Svelte (Vite)
- Add-ons : TypeScript, Tailwind CSS, ESLint (flat config), Prettier, Husky, Vitest
- Gestion d'état : Zustand, Redux Toolkit, Jotai, Pinia, Vuex, NgRx, Nanostores
- 4 package managers : npm, pnpm, yarn, bun
- Fichiers communs partagés : .editorconfig, .gitignore, README, LICENSE, CI, Docker, VSCode
- Git init avec premier commit automatique
- Récapitulatif avant génération avec confirmation
