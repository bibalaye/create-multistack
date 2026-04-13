/**
 * git.js
 * Opérations Git pour le projet généré.
 */

import { run } from './runner.js';
import { writeFile } from './files.js';
import path from 'path';

/**
 * Initialise un dépôt Git et fait le premier commit.
 * @param {string} targetDir
 * @param {string} projectName
 */
export async function initGit(targetDir, projectName) {
  await run('git', ['init'], targetDir);
  await run('git', ['add', '-A'], targetDir);
  await run(
    'git',
    ['commit', '-m', `chore: initial scaffold — ${projectName} via create-multistack`],
    targetDir
  );
}
