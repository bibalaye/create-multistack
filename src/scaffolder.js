/**
 * scaffolder.js
 * Moteur de génération de projet — version réelle.
 *
 * Stratégie :
 *  1. Créer le dossier cible
 *  2. Lancer le scaffoldeur officiel du framework dans ce dossier
 *  3. Copier les fichiers communs depuis shared/
 *  4. Appliquer les add-ons (tailwind, eslint, prettier, husky, testing)
 *  5. Installer la librairie de gestion d'état
 *  6. Init Git + premier commit
 *  7. Installer les dépendances (si demandé)
 */

import * as p from '@clack/prompts';
import pc from 'picocolors';
import path from 'path';
import fs from 'fs-extra';

import { run, runCreate, getInstallCmd } from './utils/runner.js';
import { copySharedFile, writeFile, SHARED_DIR } from './utils/files.js';
import { initGit } from './utils/git.js';
import {
  applyTailwind,
  applyESLint,
  applyPrettier,
  applyHusky,
  applyTesting,
  applyStateManagement,
} from './utils/addons.js';

// ─────────────────────────────────────────────────────────────────────────────
// Commandes d'initialisation par variante de framework
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Retourne la commande npx et les arguments pour scaffolder le framework.
 * Chaque commande génère le projet directement dans le dossier cible (`.`).
 *
 * @param {string} variant - Identifiant de la variante (ex: 'vue-vite', 'nextjs-app')
 * @param {boolean} useTypeScript
 * @returns {{ cmd: string, args: string[] }}
 */
function getFrameworkCommand(variant, useTypeScript, useTailwind) {
  const ts = useTypeScript;

  const commands = {
    // ── React ──────────────────────────────────────────────────────────────
    'react-vite': {
      cmd: 'npm',
      args: ['create', 'vite@latest', '.', '--', '--template', ts ? 'react-ts' : 'react'],
    },
    'react-cra': {
      // CRA est déprécié mais toujours fonctionnel
      cmd: 'npx',
      args: [
        '--yes', 'create-react-app@latest', '.',
        ...(ts ? ['--template', 'typescript'] : []),
      ],
    },

    // ── Next.js ────────────────────────────────────────────────────────────
    'nextjs-app': {
      cmd: 'npx',
      args: [
        'create-next-app@latest', '.',
        '--app',
        ts ? '--typescript' : '--javascript',
        '--eslint',
        // Tailwind : conditionnel selon le choix de l'utilisateur
        useTailwind ? '--tailwind' : '--no-tailwind',
        '--no-src-dir',
        '--import-alias', '@/*',
        '--yes',
      ],
    },
    'nextjs-pages': {
      cmd: 'npx',
      args: [
        'create-next-app@latest', '.',
        '--no-app',
        ts ? '--typescript' : '--javascript',
        '--eslint',
        useTailwind ? '--tailwind' : '--no-tailwind',
        '--no-src-dir',
        '--import-alias', '@/*',
        '--yes',
      ],
    },

    // ── Vue ────────────────────────────────────────────────────────────────
    'vue-vite': {
      cmd: 'npm',
      args: ['create', 'vite@latest', '.', '--', '--template', ts ? 'vue-ts' : 'vue'],
    },
    'nuxt': {
      cmd: 'npx',
      args: ['nuxi@latest', 'init', '.', '--no-install', '--no-telemetry'],
    },

    // ── Angular ────────────────────────────────────────────────────────────
    // `ng new` ne supporte pas '.' comme nom de projet — on génère dans un
    // sous-dossier temporaire puis on remonte le contenu.
    'angular': {
      cmd: 'npx',
      args: [
        '--yes', '@angular/cli@latest', 'new', '__ng_tmp__',
        '--routing=true',
        '--style=scss',
        '--skip-git',
        '--skip-install',
        '--defaults',
      ],
      postMove: true, // signal au scaffolder de déplacer __ng_tmp__ → .
    },

    // ── Svelte ─────────────────────────────────────────────────────────────
    'svelte-vite': {
      cmd: 'npm',
      args: ['create', 'vite@latest', '.', '--', '--template', ts ? 'svelte-ts' : 'svelte'],
    },
    'sveltekit': {
      cmd: 'npx',
      args: [
        'sv@latest', 'create', '.',
        '--template', 'minimal',
        '--types', ts ? 'ts' : 'null',
        '--no-add-ons',
      ],
    },

    // ── Astro ──────────────────────────────────────────────────────────────
    'astro': {
      cmd: 'npm',
      args: [
        'create', 'astro@latest', '.',
        '--template', 'minimal',
        '--typescript', ts ? 'strict' : 'relaxed',
        '--no-install',
        '--no-git',
        '--yes',
      ],
    },
  };

  return commands[variant] ?? commands['react-vite'];
}

// ─────────────────────────────────────────────────────────────────────────────
// Fichiers communs — map valeur → fichier source / destination
// ─────────────────────────────────────────────────────────────────────────────

const COMMON_FILE_MAP = {
  editorconfig:     { src: '.editorconfig',              dest: '.editorconfig' },
  // Note: le fichier source est 'gitignore' (sans point) car npm exclut toujours
  // les fichiers nommés '.gitignore' lors de la publication du package.
  gitignore:        { src: 'gitignore',                  dest: '.gitignore' },
  readme:           { src: 'README.md',                  dest: 'README.md' },
  license:          { src: 'LICENSE',                    dest: 'LICENSE' },
  'github-actions': { src: '.github/workflows/ci.yml',  dest: '.github/workflows/ci.yml' },
  docker:           { src: 'Dockerfile',                 dest: 'Dockerfile' },
  vscode:           { src: '.vscode/settings.json',      dest: '.vscode/settings.json' },
};

// ─────────────────────────────────────────────────────────────────────────────
// Copie des fichiers communs
// ─────────────────────────────────────────────────────────────────────────────

async function applyCommonFiles(targetDir, selectedFiles, answers) {
  for (const fileKey of selectedFiles) {
    const mapping = COMMON_FILE_MAP[fileKey];
    if (!mapping) continue;

    const srcPath = path.join(SHARED_DIR, mapping.src);
    const destPath = path.join(targetDir, mapping.dest);

    if (!(await fs.pathExists(srcPath))) continue;

    await fs.ensureDir(path.dirname(destPath));

    // README et LICENSE : remplace les placeholders
    if (fileKey === 'readme' || fileKey === 'license') {
      let content = await fs.readFile(srcPath, 'utf-8');
      content = content
        .replace(/\{\{PROJECT_NAME\}\}/g, answers.projectName)
        .replace(/\{\{YEAR\}\}/g, new Date().getFullYear())
        .replace(/\{\{AUTHOR\}\}/g, answers.author ?? '')
        .replace(/\{\{FRAMEWORK\}\}/g, answers.variant ?? answers.framework)
        .replace(/\{\{TYPESCRIPT\}\}/g, answers.addons.includes('typescript') ? '✅ Oui' : '❌ Non')
        .replace(/\{\{STYLING\}\}/g, answers.addons.includes('tailwind') ? 'Tailwind CSS' : 'CSS natif');
      await fs.writeFile(destPath, content, 'utf-8');
    } else {
      await fs.copy(srcPath, destPath, { overwrite: true });
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Vérification des prérequis
// ─────────────────────────────────────────────────────────────────────────────

async function checkPrerequisites(pm) {
  const checks = [
    { cmd: 'node', args: ['--version'], label: 'Node.js' },
    { cmd: pm,     args: ['--version'], label: pm },
  ];

  for (const check of checks) {
    const result = await run(check.cmd, check.args, process.cwd(), true).catch(() => null);
    if (!result || result.exitCode !== 0) {
      throw new Error(`${check.label} n'est pas installé ou introuvable dans le PATH.`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Point d'entrée principal
// ─────────────────────────────────────────────────────────────────────────────

export async function scaffoldProject(answers) {
  const {
    projectName,
    framework,
    variant,
    addons,
    stateManagement,
    commonFiles,
    packageManager: pm,
    gitInit,
    installDeps,
    targetDir,
  } = answers;

  const hasTypeScript = addons.includes('typescript');
  const spinner = p.spinner();

  // ── 0. Prérequis ────────────────────────────────────────────────────────
  spinner.start('Vérification des prérequis…');
  try {
    await checkPrerequisites(pm);
    spinner.stop(pc.green('✔ Prérequis vérifiés'));
  } catch (err) {
    spinner.stop(pc.red(`✖ Prérequis manquants : ${err.message}`));
    throw err;
  }

  // ── 1. Créer le dossier cible ────────────────────────────────────────────
  spinner.start(`Création du dossier ${pc.cyan(projectName)}…`);
  try {
    if (await fs.pathExists(targetDir)) {
      const files = await fs.readdir(targetDir);
      if (files.length > 0) {
        spinner.stop(pc.red(`✖ Le dossier "${projectName}" existe déjà et n'est pas vide.`));
        throw new Error(`Le dossier "${targetDir}" n'est pas vide.`);
      }
    }
    await fs.ensureDir(targetDir);
    spinner.stop(pc.green(`✔ Dossier créé : ${pc.dim(targetDir)}`));
  } catch (err) {
    spinner.stop(pc.red(`✖ Impossible de créer le dossier : ${err.message}`));
    throw err;
  }

  // ── 2. Scaffolding du framework ──────────────────────────────────────────
  spinner.start(`Scaffolding ${pc.cyan(variant)} en cours… (peut prendre 30–60 secondes)`);
  try {
    const hasTailwind = addons.includes('tailwind');
    const frameworkCmd = getFrameworkCommand(variant, hasTypeScript, hasTailwind);
    const { cmd, args, postMove } = frameworkCmd;
    await run(cmd, args, targetDir, true);

    // Angular workaround : déplacer __ng_tmp__/* → targetDir
    if (postMove) {
      const tmpDir = path.join(targetDir, '__ng_tmp__');
      if (await fs.pathExists(tmpDir)) {
        const entries = await fs.readdir(tmpDir);
        for (const entry of entries) {
          await fs.move(
            path.join(tmpDir, entry),
            path.join(targetDir, entry),
            { overwrite: true }
          );
        }
        await fs.remove(tmpDir);
      }
    }

    spinner.stop(pc.green(`✔ Projet ${variant} généré`));
  } catch (err) {
    spinner.stop(pc.red(`✖ Erreur lors du scaffolding : ${err.message}`));
    throw err;
  }

  // ── 3. Fichiers communs ──────────────────────────────────────────────────
  if (commonFiles.length > 0) {
    spinner.start('Ajout des fichiers partagés…');
    try {
      await applyCommonFiles(targetDir, commonFiles, answers);
      spinner.stop(pc.green(`✔ Fichiers communs ajoutés (${commonFiles.length})`));
    } catch (err) {
      spinner.stop(pc.yellow(`⚠ Fichiers communs partiellement appliqués : ${err.message}`));
    }
  }

  // ── 4. Add-ons ───────────────────────────────────────────────────────────

  // On installe d'abord les dépendances de base pour que les add-ons puissent
  // faire des `npm add` correctement sur certains frameworks (Next.js les a déjà)
  const needsBaseInstall = !['nextjs-app', 'nextjs-pages', 'angular', 'nuxt'].includes(variant);
  if (needsBaseInstall && addons.length > 0) {
    spinner.start(`Installation des dépendances de base avec ${pm}…`);
    try {
      const [icmd, iargs] = getInstallCmd(pm);
      await run(icmd, iargs, targetDir, true);
      spinner.stop(pc.green('✔ Dépendances de base installées'));
    } catch (err) {
      spinner.stop(pc.yellow(`⚠ Impossible d'installer les dépendances de base : ${err.message}`));
    }
  }

  // Next.js intègre Tailwind nativement via create-next-app — on évite le double-install
  const tailwindHandledByFramework = ['nextjs-app', 'nextjs-pages'].includes(variant) && addons.includes('tailwind');
  if (addons.includes('tailwind') && !tailwindHandledByFramework) {
    spinner.start('Configuration de Tailwind CSS…');
    try {
      await applyTailwind(targetDir, pm);
      spinner.stop(pc.green('✔ Tailwind CSS configuré'));
    } catch (err) {
      spinner.stop(pc.yellow(`⚠ Tailwind : ${err.message}`));
    }
  } else if (tailwindHandledByFramework) {
    p.log.info(pc.dim('ℹ Tailwind CSS déjà intégré par create-next-app — configuration ignorée'));
  }

  if (addons.includes('eslint')) {
    spinner.start('Configuration d\'ESLint…');
    try {
      await applyESLint(targetDir, pm, framework, hasTypeScript);
      spinner.stop(pc.green('✔ ESLint configuré'));
    } catch (err) {
      spinner.stop(pc.yellow(`⚠ ESLint : ${err.message}`));
    }
  }

  if (addons.includes('prettier')) {
    spinner.start('Configuration de Prettier…');
    try {
      await applyPrettier(targetDir, pm);
      spinner.stop(pc.green('✔ Prettier configuré'));
    } catch (err) {
      spinner.stop(pc.yellow(`⚠ Prettier : ${err.message}`));
    }
  }

  if (addons.includes('testing')) {
    spinner.start('Installation de Vitest…');
    try {
      await applyTesting(targetDir, pm, framework);
      spinner.stop(pc.green('✔ Vitest configuré'));
    } catch (err) {
      spinner.stop(pc.yellow(`⚠ Vitest : ${err.message}`));
    }
  }

  // ── 5. Gestion d'état ────────────────────────────────────────────────────
  if (stateManagement && stateManagement !== 'none') {
    spinner.start(`Installation de ${pc.cyan(stateManagement)}…`);
    try {
      await applyStateManagement(targetDir, pm, stateManagement);
      spinner.stop(pc.green(`✔ ${stateManagement} installé`));
    } catch (err) {
      spinner.stop(pc.yellow(`⚠ Gestion d'état : ${err.message}`));
    }
  }

  // ── 6. Husky (après les autres add-ons car nécessite que les scripts existent) ─
  if (addons.includes('husky')) {
    spinner.start('Configuration de Husky + lint-staged…');
    try {
      await applyHusky(targetDir, pm);
      spinner.stop(pc.green('✔ Husky + lint-staged configurés'));
    } catch (err) {
      spinner.stop(pc.yellow(`⚠ Husky : ${err.message}`));
    }
  }

  // ── 7. Installation finale des dépendances ───────────────────────────────
  if (installDeps) {
    spinner.start(`Installation finale avec ${pc.cyan(pm)}…`);
    try {
      const [icmd, iargs] = getInstallCmd(pm);
      await run(icmd, iargs, targetDir, true);
      spinner.stop(pc.green(`✔ Dépendances installées avec ${pm}`));
    } catch (err) {
      spinner.stop(pc.yellow(`⚠ Installation : ${err.message}`));
    }
  }

  // ── 8. Git init ──────────────────────────────────────────────────────────
  if (gitInit) {
    spinner.start('Initialisation du dépôt Git…');
    try {
      await initGit(targetDir, projectName);
      spinner.stop(pc.green('✔ Dépôt Git initialisé — premier commit créé'));
    } catch (err) {
      spinner.stop(pc.yellow(`⚠ Git : ${err.message}`));
    }
  }
}
