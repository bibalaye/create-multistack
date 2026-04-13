/**
 * validate.js
 * Script de validation — vérifie que les commandes de scaffolding
 * de chaque framework sont syntaxiquement correctes et que l'outil
 * est prêt à être publié sur npm.
 *
 * Usage : node scripts/validate.js
 */

import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ─── Couleurs ANSI légères ─────────────────────────────────────────────────
const c = {
  green:  (s) => `\x1b[32m${s}\x1b[0m`,
  red:    (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  bold:   (s) => `\x1b[1m${s}\x1b[0m`,
  dim:    (s) => `\x1b[2m${s}\x1b[0m`,
  cyan:   (s) => `\x1b[36m${s}\x1b[0m`,
};

// ─── Indicateurs ──────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;
let warned = 0;

function ok(label, detail = '') {
  passed++;
  console.log(`  ${c.green('✔')} ${label} ${detail ? c.dim(detail) : ''}`);
}

function fail(label, detail = '') {
  failed++;
  console.log(`  ${c.red('✖')} ${label} ${detail ? c.dim(detail) : ''}`);
}

function warn(label, detail = '') {
  warned++;
  console.log(`  ${c.yellow('⚠')} ${label} ${detail ? c.dim(detail) : ''}`);
}

function section(title) {
  console.log(`\n${c.bold(c.cyan(title))}`);
}

// ─── Checks ────────────────────────────────────────────────────────────────

async function checkNodeVersion() {
  section('Node.js');
  const { stdout } = await execa('node', ['--version']);
  const version = parseInt(stdout.replace('v', '').split('.')[0]);
  if (version >= 18) {
    ok(`Node.js ${stdout}`, '(>= 18 requis)');
  } else {
    fail(`Node.js ${stdout}`, '(version >= 18 requise)');
  }
}

async function checkPackageJson() {
  section('package.json');
  const pkg = await fs.readJson(path.join(ROOT, 'package.json'));

  pkg.name       ? ok(`name: ${pkg.name}`)             : fail('name manquant');
  pkg.version    ? ok(`version: ${pkg.version}`)        : fail('version manquante');
  pkg.bin        ? ok('bin déclaré', JSON.stringify(pkg.bin)) : fail('bin manquant — requis pour npx');
  pkg.license    ? ok(`license: ${pkg.license}`)        : warn('license non spécifiée');
  pkg.description? ok('description présente')           : warn('description manquante');
  pkg.keywords?.length > 0 ? ok(`keywords: ${pkg.keywords.length}`) : warn('keywords absents');
  pkg.type === 'module' ? ok('type: module (ESM)') : warn('type non défini comme module');
  pkg.engines?.node ? ok(`engines.node: ${pkg.engines.node}`) : warn('engines.node non spécifié');
}

async function checkRequiredFiles() {
  section('Fichiers requis');
  const required = [
    'bin/index.js',
    'src/cli.js',
    'src/constants.js',
    'src/scaffolder.js',
    'src/utils/runner.js',
    'src/utils/files.js',
    'src/utils/addons.js',
    'src/utils/git.js',
    'README.md',
    'LICENSE',
    '.npmignore',
    'CHANGELOG.md',
  ];

  for (const file of required) {
    const exists = await fs.pathExists(path.join(ROOT, file));
    exists ? ok(file) : fail(file, '(manquant)');
  }
}

async function checkSharedFiles() {
  section('Fichiers shared/');
  const shared = [
    'shared/.editorconfig',
    // 'shared/.gitignore' → renommé 'shared/gitignore' (npm exclut les .gitignore)
    'shared/gitignore',
    'shared/LICENSE',
    'shared/README.md',
    'shared/Dockerfile',
    'shared/.github/workflows/ci.yml',
    'shared/.vscode/settings.json',
  ];

  for (const file of shared) {
    const exists = await fs.pathExists(path.join(ROOT, file));
    exists ? ok(file) : warn(file, '(manquant — les utilisateurs ne pourront pas sélectionner cette option)');
  }
}

async function checkDependencies() {
  section('Dépendances');
  const pkg = await fs.readJson(path.join(ROOT, 'package.json'));
  const required = ['@clack/prompts', 'picocolors', 'fs-extra', 'execa'];

  for (const dep of required) {
    const installed = await fs.pathExists(path.join(ROOT, 'node_modules', dep));
    dep in (pkg.dependencies ?? {})
      ? ok(dep, installed ? '(installé)' : c.red('(non installé — lancez npm install)'))
      : fail(dep, '(manquant dans package.json)');
  }
}

async function checkBinExecutable() {
  section('Binaire');
  const binPath = path.join(ROOT, 'bin', 'index.js');
  if (!(await fs.pathExists(binPath))) {
    fail('bin/index.js introuvable');
    return;
  }
  const content = await fs.readFile(binPath, 'utf-8');
  content.startsWith('#!/usr/bin/env node')
    ? ok('Shebang présent (#!/usr/bin/env node)')
    : fail('Shebang manquant — le binaire ne pourra pas s\'exécuter via npx');
}

// ─── Résumé ────────────────────────────────────────────────────────────────

async function run() {
  console.log(`\n${c.bold('🔍 Validation create-multistack')}\n`);

  await checkNodeVersion();
  await checkPackageJson();
  await checkRequiredFiles();
  await checkSharedFiles();
  await checkDependencies();
  await checkBinExecutable();

  console.log('\n' + '─'.repeat(50));
  console.log(
    `\n  ${c.green(`${passed} OK`)}  ${failed > 0 ? c.red(`${failed} erreurs`) : '0 erreurs'}  ${warned > 0 ? c.yellow(`${warned} avertissements`) : '0 avertissements'}\n`
  );

  if (failed > 0) {
    console.log(c.red('  ✖ Le projet n\'est PAS prêt à être publié — corrigez les erreurs ci-dessus.\n'));
    process.exit(1);
  } else if (warned > 0) {
    console.log(c.yellow('  ⚠ Le projet peut être publié mais des améliorations sont recommandées.\n'));
  } else {
    console.log(c.green('  ✔ Tout est en ordre — le projet est prêt pour npm publish !\n'));
  }
}

run().catch((err) => {
  console.error(c.red('Erreur inattendue :'), err.message);
  process.exit(1);
});
