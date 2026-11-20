import fs from 'fs';
import path from 'path';
import { INITIAL_PRODUCTS } from '@/lib/mockCatalog';

const DATA_FILE = path.join(process.cwd(), '..', 'data_catalog.json');

export function getSharedCatalog() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Aviso leyendo catálogo compartido:", e.message);
  }
  return [...INITIAL_PRODUCTS];
}

export function saveSharedCatalog(products) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2), 'utf-8');
  } catch (e) {
    console.error("Error guardando catálogo compartido:", e.message);
  }
}

