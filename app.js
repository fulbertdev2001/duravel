// Point d'entrée racine pour hébergement Node.js (Hostinger, cPanel, CloudLinux)
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Par défaut en production
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Démarrer l'application Express
await import('./server/index.js');
