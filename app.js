// Point d'entrée racine pour hébergement Node.js (Hostinger, cPanel, CloudLinux)
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

try {
  await import('./server/index.js');
} catch (err) {
  console.error('Fatal error starting Duravel Building server:', err);
  process.exit(1);
}
