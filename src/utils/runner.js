/**
 * runner.js
 * Wrapper autour d'execa pour lancer des commandes système (git, npm, pnpm...).
 */

import { execa } from 'execa';

/**
 * Exécute une commande dans un répertoire donné.
 * @param {string} cmd - La commande principale (ex: 'npm')
 * @param {string[]} args - Les arguments (ex: ['install', '--save-dev', 'tailwindcss'])
 * @param {string} cwd - Le répertoire de travail
 * @param {boolean} silent - Si true, supprime stdout/stderr
 */
export async function run(cmd, args = [], cwd = process.cwd(), silent = true) {
  const result = await execa(cmd, args, {
    cwd,
    stdio: silent ? 'pipe' : 'inherit',
    reject: false, // on gère les erreurs manuellement
  });

  if (result.exitCode !== 0 && result.exitCode !== null) {
    throw new Error(
      `Commande échouée: ${cmd} ${args.join(' ')}\n${result.stderr || result.stdout || ''}`
    );
  }

  return result;
}

/**
 * Lance une commande "create" npx (create-vite, create-next-app, etc.)
 * en mode non-interactif dans le répertoire cible.
 */
export async function runCreate(cmd, args = [], cwd = process.cwd()) {
  return run(cmd, args, cwd, false);
}

/**
 * Retourne la commande d'installation selon le package manager.
 * @param {string} pm - 'npm' | 'pnpm' | 'yarn' | 'bun'
 */
export function getInstallCmd(pm) {
  const map = {
    npm:  ['npm', ['install']],
    pnpm: ['pnpm', ['install']],
    yarn: ['yarn', []],
    bun:  ['bun', ['install']],
  };
  return map[pm] ?? map['npm'];
}

/**
 * Retourne la commande d'ajout de paquet selon le package manager.
 * @param {string} pm
 * @param {string[]} packages
 * @param {boolean} dev
 */
export function getAddCmd(pm, packages, dev = false) {
  const devFlag = { npm: '--save-dev', pnpm: '--save-dev', yarn: '--dev', bun: '--dev' };
  const addVerb = { npm: 'install', pnpm: 'add', yarn: 'add', bun: 'add' };

  const args = [addVerb[pm], ...packages];
  if (dev) args.push(devFlag[pm]);
  return [pm, args];
}
