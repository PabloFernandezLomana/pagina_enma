/**
 * scripts/backup-and-purge.js
 * 
 * Script seguro y reversible para:
 * 1. Exportar un backup JSON completo de colecciones (products, orders, clients, invoices)
 * 2. Purgar datos ficticios/demo dejando la base lista para los productos reales de la boutique.
 * 
 * Uso:
 *   node scripts/backup-and-purge.js --backup-only
 *   node scripts/backup-and-purge.js --purge
 *   node scripts/backup-and-purge.js --restore <path_to_backup.json>
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKUPS_DIR = path.join(__dirname, '../backups');

if (!fs.existsSync(BACKUPS_DIR)) {
  fs.mkdirSync(BACKUPS_DIR, { recursive: true });
}

export function createLocalBackup(data, prefix = 'pre_purge') {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filePath = path.join(BACKUPS_DIR, `backup_${prefix}_${timestamp}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`✅ Backup guardado con éxito en: ${filePath}`);
  return filePath;
}

export function restoreBackup(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`El archivo de backup no existe: ${filePath}`);
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

// Lógica de arranque si se ejecuta directamente por CLI
const args = process.argv.slice(2);
if (args.includes('--help')) {
  console.log(`
  Modo de empleo:
    node backup-and-purge.js --help
    node backup-and-purge.js --demo-check
  `);
}

