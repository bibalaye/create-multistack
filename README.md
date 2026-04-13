<div align="center">

# ⚡ create-multistack

**CLI de scaffolding multi-framework pour générer des projets prêts à l'emploi en quelques secondes.**

[![npm version](https://img.shields.io/npm/v/create-multistack.svg)](https://www.npmjs.com/package/create-multistack)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

</div>

---

## 🚀 Utilisation

```bash
npm create multistack@latest
# ou
npx create-multistack@latest
# ou
pnpm create multistack@latest
```

> Aucune installation globale requise. La commande télécharge et exécute la dernière version automatiquement.

---

## ✨ Fonctionnalités

- 🧱 **6 frameworks supportés** — React, Next.js, Vue, Angular, Svelte, Astro
- 🔀 **Variantes** — Vite, App Router / Pages Router, SvelteKit, Nuxt, CRA...
- 🔷 **TypeScript** — au choix, pour tous les frameworks
- 🎨 **Tailwind CSS** — intégration automatique
- 🔍 **ESLint + Prettier** — configuration flat config (v9+)
- 🐶 **Husky + lint-staged** — git hooks prêts à l'emploi
- 🧪 **Vitest** — tests unitaires configurés avec exemples
- 📦 **Gestion d'état** — Zustand, Redux Toolkit, Pinia, Vuex, NgRx, Jotai, Nanostores
- 📦 **4 package managers** — npm, pnpm, yarn, bun
- 📄 **Fichiers communs** — `.editorconfig`, `.gitignore`, `README`, `LICENSE`, GitHub Actions CI, Dockerfile, `.vscode/`
- 🐙 **Git init** — premier commit automatique
- ⚙️ **Mode 100% interactif** — aucun flag à mémoriser

---

## 📋 Déroulement interactif

```
  create-multistack   CLI de scaffolding multi-framework

  Générez un projet React, Next.js, Vue, Angular, Svelte ou Astro en quelques secondes.

┌  🚀 Bienvenue dans create-multistack
│
◇  📁 Quel est le nom de votre projet ?
│  mon-super-projet
│
◇  🧱 Quel framework souhaitez-vous utiliser ?
│  💚 Vue — Interfaces progressives, applications légères
│
◇  ⚙️  Quelle variante de Vue ?
│  Vue 3 + Vite — Recommandé pour Vue 3
│
◇  🔌 Quels add-ons souhaitez-vous inclure ?
│  TypeScript, Tailwind CSS, ESLint, Prettier
│
◇  📦 Quelle librairie de gestion d'état ?
│  🍍 Pinia — Officiel Vue 3
│
◇  📄 Quels fichiers communs ajouter au projet ?
│  .editorconfig, .gitignore, README.md, LICENSE
│
◇  📦 Quel gestionnaire de paquets ?
│  ⚡ pnpm
│
◇  🐙 Initialiser un dépôt Git ?
│  Yes
│
◇  ⚡ Installer les dépendances maintenant ?
│  Yes
│
│  📋 Récapitulatif ──────────────────────────────
│  Projet     → mon-super-projet
│  Framework  → 💚 Vue  (Vue 3 + Vite)
│  Add-ons    → typescript, tailwind, eslint, prettier
│  État       → pinia
│  Pkg Mgr    → pnpm
│  Git        → ✅ oui
│  ─────────────────────────────────────────────
│
◇  ✅ Tout est correct ? Lancer la génération ?
│  Yes
│
◇  ✔ Prérequis vérifiés
◇  ✔ Dossier créé
◇  ✔ Projet vue-vite généré
◇  ✔ Fichiers communs ajoutés (4)
◇  ✔ Tailwind CSS configuré
◇  ✔ ESLint configuré
◇  ✔ Prettier configuré
◇  ✔ Pinia installé
◇  ✔ Dépendances installées avec pnpm
◇  ✔ Dépôt Git initialisé — premier commit créé
│
└  🎉 Projet créé avec succès !

  Prochaines étapes :
  cd mon-super-projet
  pnpm dev
```

---

## 🧱 Frameworks & variantes supportés

| Framework | Variantes | Description |
|---|---|---|
| ⚛️ React | React + Vite, React + CRA | SPA, Dashboard, Back-office |
| ▲ Next.js | App Router, Pages Router | Full-stack, SSR, SEO-friendly |
| 💚 Vue | Vue 3 + Vite, Nuxt 3 | Interfaces progressives |
| 🔴 Angular | Angular CLI | Applications d'entreprise |
| 🧡 Svelte | Svelte + Vite, SvelteKit | Applications ultra-performantes |
| 🚀 Astro | Astro minimal | Sites statiques, MPA |

## 📦 Librairies de gestion d'état supportées

| Framework | Options |
|---|---|
| React / Next.js | Zustand, Redux Toolkit, Jotai |
| Vue / Nuxt | Pinia, Vuex |
| Angular | NgRx |
| Svelte | Svelte Stores natifs |
| Astro | Nanostores |

---

## 🛠️ Prérequis

- **Node.js** `>= 18.0.0`
- **npm**, **pnpm**, **yarn** ou **bun**
- **Git** (optionnel, pour l'init automatique)

---

## 🏗️ Structure du dépôt

```
create-multistack/
├── bin/
│   └── index.js               # Point d'entrée binaire npm
├── src/
│   ├── cli.js                 # Interface interactive (Clack)
│   ├── constants.js           # Configuration frameworks/add-ons
│   ├── scaffolder.js          # Moteur de génération
│   └── utils/
│       ├── runner.js          # Wrapper execa (commandes système)
│       ├── files.js           # Utilitaires fichiers (fs-extra)
│       ├── addons.js          # Injection des add-ons
│       └── git.js             # Opérations Git
├── shared/                    # Fichiers communs copiés dans les projets
│   ├── .editorconfig
│   ├── .gitignore
│   ├── LICENSE
│   ├── README.md
│   ├── Dockerfile
│   ├── .github/workflows/ci.yml
│   └── .vscode/settings.json
└── templates/                 # Templates personnalisés (optionnel)
    ├── react-vite/
    ├── nextjs-app/
    └── ...
```

---

## 🔌 Ajouter un nouveau framework

1. **Ajouter l'entrée dans** `src/constants.js` :

```js
// Dans FRAMEWORKS :
{
  value: 'solid',
  label: '🟦 Solid',
  hint: 'Réactivité fine, ultra performant',
  variants: [
    { value: 'solid-vite', label: 'Solid + Vite', hint: 'Setup recommandé' },
  ],
},

// Dans STATE_MANAGEMENT :
solid: [
  { value: 'none', label: 'Aucun', hint: 'Signal natif Solid' },
],
```

2. **Ajouter la commande dans** `src/scaffolder.js` (dans `getFrameworkCommand`) :

```js
'solid-vite': {
  cmd: 'npm',
  args: ['create', 'vite@latest', '.', '--', '--template', ts ? 'solid-ts' : 'solid'],
},
```

3. C'est tout. Le CLI détectera automatiquement le nouveau framework.

> Pour des setups plus complexes, créez un dossier `templates/solid-vite/` avec vos fichiers — ils seront copiés après le scaffolding officiel.

---

## 🤝 Contribution

Les contributions sont les bienvenues !

```bash
git clone https://github.com/bibalaye/create-multistack
cd create-multistack
npm install
node bin/index.js
```

---

## 📄 Licence

[MIT](./LICENSE) — Fait avec ❤️ par la communauté.
