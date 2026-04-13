/**
 * cli.js
 * Script principal de l'interface interactive (Clack).
 * Orchestre toutes les étapes de scaffolding via des menus.
 */

import * as p from '@clack/prompts';
import pc from 'picocolors';
import path from 'path';
import { FRAMEWORKS, PACKAGE_MANAGERS, ADDONS, STATE_MANAGEMENT, COMMON_FILES } from './constants.js';
import { scaffoldProject } from './scaffolder.js';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Annule proprement si l'utilisateur fait Ctrl+C */
function onCancel() {
  p.cancel(pc.red('✖ Opération annulée. À bientôt !'));
  process.exit(0);
}

/** Wrap un group Clack et vérifie l'annulation */
async function prompt(fn) {
  const result = await fn();
  if (p.isCancel(result)) onCancel();
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Bannière d'accueil
// ─────────────────────────────────────────────────────────────────────────────

function printBanner() {
  console.log('');
  console.log(
    pc.bgCyan(pc.black('  create-multistack  ')) +
    '  ' +
    pc.dim('CLI de scaffolding multi-framework')
  );
  console.log('');
  console.log(
    pc.dim('  Générez un projet') +
    pc.bold(' React, Next.js, Vue, Angular, Svelte ou Astro') +
    pc.dim(' en quelques secondes.')
  );
  console.log('');
}

// ─────────────────────────────────────────────────────────────────────────────
// Étape 1 — Nom & destination du projet
// ─────────────────────────────────────────────────────────────────────────────

async function askProjectName() {
  return prompt(() =>
    p.text({
      message: pc.cyan('📁 Quel est le nom de votre projet ?'),
      placeholder: 'mon-super-projet',
      defaultValue: 'mon-super-projet',
      validate(value) {
        if (!value || value.trim().length === 0) return 'Le nom ne peut pas être vide.';
        if (!/^[a-z0-9@._/-]+$/i.test(value)) return 'Utilisez uniquement des lettres, chiffres, tirets ou points.';
      },
    })
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Étape 2 — Choix du framework
// ─────────────────────────────────────────────────────────────────────────────

async function askFramework() {
  return prompt(() =>
    p.select({
      message: pc.cyan('🧱 Quel framework souhaitez-vous utiliser ?'),
      options: FRAMEWORKS.map((f) => ({
        value: f.value,
        label: f.label,
        hint: f.hint,
      })),
    })
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Étape 3 — Variante du framework
// ─────────────────────────────────────────────────────────────────────────────

async function askVariant(frameworkKey) {
  const framework = FRAMEWORKS.find((f) => f.value === frameworkKey);
  if (!framework || framework.variants.length === 1) {
    return framework?.variants[0]?.value ?? frameworkKey;
  }
  return prompt(() =>
    p.select({
      message: pc.cyan(`⚙️  Quelle variante de ${framework.label.trim()} ?`),
      options: framework.variants.map((v) => ({
        value: v.value,
        label: v.label,
        hint: v.hint,
      })),
    })
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Étape 4 — Add-ons (TypeScript, Tailwind, ESLint, etc.)
// ─────────────────────────────────────────────────────────────────────────────

async function askAddons() {
  return prompt(() =>
    p.multiselect({
      message: pc.cyan('🔌 Quels add-ons souhaitez-vous inclure ?'),
      options: ADDONS,
      required: false,
    })
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Étape 5 — Gestion d'état (conditionnel selon le framework)
// ─────────────────────────────────────────────────────────────────────────────

async function askStateManagement(frameworkKey) {
  const options = STATE_MANAGEMENT[frameworkKey] ?? STATE_MANAGEMENT['react'];
  return prompt(() =>
    p.select({
      message: pc.cyan('📦 Quelle librairie de gestion d\'état ?'),
      options,
    })
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Étape 6 — Fichiers communs
// ─────────────────────────────────────────────────────────────────────────────

async function askCommonFiles() {
  return prompt(() =>
    p.multiselect({
      message: pc.cyan('📄 Quels fichiers communs ajouter au projet ?'),
      options: COMMON_FILES,
      // Sélection par défaut : editorconfig, gitignore, readme, license
      initialValues: ['editorconfig', 'gitignore', 'readme', 'license'],
      required: false,
    })
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Étape 7 — Gestionnaire de paquets
// ─────────────────────────────────────────────────────────────────────────────

async function askPackageManager() {
  return prompt(() =>
    p.select({
      message: pc.cyan('📦 Quel gestionnaire de paquets ?'),
      options: PACKAGE_MANAGERS,
    })
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Étape 8 — Initialiser Git ?
// ─────────────────────────────────────────────────────────────────────────────

async function askGitInit() {
  return prompt(() =>
    p.confirm({
      message: pc.cyan('🐙 Initialiser un dépôt Git ?'),
      initialValue: true,
    })
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Étape 9 — Installer les dépendances ?
// ─────────────────────────────────────────────────────────────────────────────

async function askInstallDeps() {
  return prompt(() =>
    p.confirm({
      message: pc.cyan('⚡ Installer les dépendances maintenant ?'),
      initialValue: true,
    })
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Récap — Affiche le résumé avant de lancer la génération
// ─────────────────────────────────────────────────────────────────────────────

function printSummary(answers) {
  const framework = FRAMEWORKS.find((f) => f.value === answers.framework);
  const variant = framework?.variants.find((v) => v.value === answers.variant);

  p.note(
    [
      `${pc.bold('Projet')}     → ${pc.cyan(answers.projectName)}`,
      `${pc.bold('Dossier')}    → ${pc.dim(path.resolve(process.cwd(), answers.projectName))}`,
      `${pc.bold('Framework')}  → ${framework?.label ?? answers.framework}  ${variant?.label ? pc.dim(`(${variant.label})`) : ''}`,
      `${pc.bold('Add-ons')}    → ${answers.addons.length ? answers.addons.join(', ') : pc.dim('Aucun')}`,
      `${pc.bold('État')}       → ${answers.stateManagement === 'none' ? pc.dim('Aucun') : answers.stateManagement}`,
      `${pc.bold('Fichiers')}   → ${answers.commonFiles.length ? answers.commonFiles.join(', ') : pc.dim('Aucun')}`,
      `${pc.bold('Pkg Mgr')}    → ${answers.packageManager}`,
      `${pc.bold('Git')}        → ${answers.gitInit ? '✅ oui' : '❌ non'}`,
      `${pc.bold('Install')}    → ${answers.installDeps ? '✅ oui' : '❌ non'}`,
    ].join('\n'),
    '📋 Récapitulatif'
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Message de fin
// ─────────────────────────────────────────────────────────────────────────────

function printNextSteps(answers) {
  const pm = answers.packageManager;
  const name = answers.projectName;
  const devCmd = pm === 'npm' ? 'npm run dev' : `${pm} dev`;
  const steps = [
    `  ${pc.bold('cd')} ${pc.cyan(name)}`,
    !answers.installDeps ? `  ${pc.bold(pm === 'npm' ? 'npm install' : `${pm} install`)}` : null,
    `  ${pc.bold(devCmd)}`,
  ].filter(Boolean);

  console.log('');
  p.outro(
    pc.green('🎉 Projet créé avec succès !') +
    '\n\n' +
    pc.dim('  Prochaines étapes :') +
    '\n' +
    steps.join('\n') +
    '\n\n' +
    pc.dim(`  Documentation : ${pc.underline('https://github.com/votre-org/create-multistack')}`)
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Point d'entrée principal
// ─────────────────────────────────────────────────────────────────────────────

export async function run() {
  printBanner();

  p.intro(pc.bgCyan(pc.black(' 🚀 Bienvenue dans create-multistack ')));

  // — Collecte des réponses
  const projectName      = await askProjectName();
  const framework        = await askFramework();
  const variant          = await askVariant(framework);
  const addons           = await askAddons();
  const stateManagement  = await askStateManagement(framework);
  const commonFiles      = await askCommonFiles();
  const packageManager   = await askPackageManager();
  const gitInit          = await askGitInit();
  const installDeps      = await askInstallDeps();

  const answers = {
    projectName,
    framework,
    variant,
    addons,
    stateManagement,
    commonFiles,
    packageManager,
    gitInit,
    installDeps,
    targetDir: path.resolve(process.cwd(), projectName),
  };

  // — Récapitulatif
  printSummary(answers);

  // — Confirmation finale
  const confirmed = await prompt(() =>
    p.confirm({
      message: pc.yellow('✅ Tout est correct ? Lancer la génération ?'),
      initialValue: true,
    })
  );

  if (!confirmed) {
    p.cancel(pc.red('Génération annulée.'));
    process.exit(0);
  }

  // — Scaffolding
  await scaffoldProject(answers);

  // — Fin
  printNextSteps(answers);
}
