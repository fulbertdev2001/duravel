// Point d'entrée racine pour hébergement Node.js (Hostinger, cPanel, CloudLinux)
import fs from 'node:fs';
import http from 'node:http';

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

try {
  console.log(`Starting app.js — NODE_ENV: ${process.env.NODE_ENV}, PORT: ${process.env.PORT}`);
  await import('./server/index.js');
  console.log('Server imported and running.');
} catch (err) {
  const msg = `FATAL STARTUP ERROR:\n${err?.stack || err}`;
  console.error(msg);
  try {
    fs.writeFileSync('server_error.log', msg);
  } catch {}

  // En cas d'erreur, créer un serveur de secours pour renvoyer le détail au lieu d'un 503
  const PORT = process.env.PORT || 4000;
  const emergencyServer = http.createServer((req, res) => {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(msg);
  });
  emergencyServer.listen(PORT, '0.0.0.0', () => {
    console.error(`Emergency error server listening on 0.0.0.0:${PORT}`);
  });
}
