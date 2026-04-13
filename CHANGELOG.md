# Changelog

Tous les changements notables de ce projet sont documentés ici.

Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
ce projet respecte le [Semantic Versioning](https://semver.org/lang/fr/).

---

## [Unreleased]

### Ajouté
- Support Nuxt 3 comme variante Vue
- Support SvelteKit comme variante Svelte
- Support Astro (Island Architecture)
- Script Husky + lint-staged pour git hooks
- Dockerfile multi-stage inclus dans les fichiers communs
- GitHub Actions CI workflow

### Prévu
- Support Remix
- Support Qwik
- Mode `--template` pour scaffolding non-interactif
- Tests automatisés de chaque framework

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
