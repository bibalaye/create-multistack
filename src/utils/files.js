/**
 * files.js
 * Utilitaires de manipulation de fichiers (copie, création, injection).
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Racine du projet boilerplate (là où vit le CLI)
export const ROOT_DIR    = path.resolve(__dirname, '..', '..');
export const SHARED_DIR  = path.join(ROOT_DIR, 'shared');
export const TEMPLATE_DIR = path.join(ROOT_DIR, 'templates');

/**
 * Copie un dossier template vers la destination.
 * @param {string} templateName - Nom du template (ex: 'vue-vite')
 * @param {string} dest - Chemin absolu de destination
 */
export async function copyTemplate(templateName, dest) {
  const src = path.join(TEMPLATE_DIR, templateName);
  if (await fs.pathExists(src)) {
    await fs.copy(src, dest, { overwrite: false });
  }
}

/**
 * Copie un fichier partagé vers la destination.
 * @param {string} filename - Nom du fichier dans shared/ (ex: '.editorconfig')
 * @param {string} dest - Répertoire de destination
 * @param {string} [rename] - Nom de fichier de destination (si différent)
 */
export async function copySharedFile(filename, dest, rename) {
  const src = path.join(SHARED_DIR, filename);
  if (await fs.pathExists(src)) {
    await fs.copy(src, path.join(dest, rename ?? filename), { overwrite: true });
  }
}

/**
 * Lit et parse un package.json existant.
 * @param {string} dir - Répertoire contenant le package.json
 */
export async function readPkg(dir) {
  const pkgPath = path.join(dir, 'package.json');
  if (!(await fs.pathExists(pkgPath))) return {};
  return fs.readJson(pkgPath);
}

/**
 * Écrit (merge) un package.json.
 * @param {string} dir
 * @param {Object} patch - Champs à fusionner
 */
export async function writePkg(dir, patch) {
  const pkgPath = path.join(dir, 'package.json');
  const existing = await readPkg(dir);
  const merged = deepMerge(existing, patch);
  await fs.writeJson(pkgPath, merged, { spaces: 2 });
}

/**
 * Crée ou écrase un fichier texte.
 * @param {string} filePath - Chemin absolu
 * @param {string} content
 */
export async function writeFile(filePath, content) {
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content, 'utf-8');
}

/**
 * Ajoute du contenu à la fin d'un fichier existant.
 * @param {string} filePath
 * @param {string} content
 */
export async function appendFile(filePath, content) {
  await fs.ensureDir(path.dirname(filePath));
  await fs.appendFile(filePath, content, 'utf-8');
}

/**
 * Deep merge simplifié pour objets JSON.
 */
function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] !== null &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      typeof result[key] === 'object'
    ) {
      result[key] = deepMerge(result[key] ?? {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}
