import { defineCloudflareConfig } from '@opennextjs/cloudflare';

// Sin caché incremental externa (no hace falta: las páginas son dinámicas y el catálogo se cachea en memoria).
export default defineCloudflareConfig();
