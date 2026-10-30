import http from 'node:http';

// Point d'entrée Hostinger. Si le démarrage échoue (version de Node, module natif…),
// on affiche la cause au lieu d'un « 503 » muet, et elle apparaît aussi dans les logs.
let app;
try {
  ({ default: app } = await import('./server/index.js'));
} catch (e) {
  console.error('[boot] démarrage impossible', e);
  app = http.createServer((_req, res) => {
    res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
    res.end(`Démarrage impossible (Node ${process.version})\n${e?.stack || e?.message || e}\n`);
  });
  const rawPort = process.env.PORT || 3000;
  const port = isNaN(Number(rawPort)) ? rawPort : Number(rawPort);
  function tryListen(p, host) {
    try {
      const s = host ? app.listen(p, host) : app.listen(p);
      s.on('error', () => {});
    } catch {}
  }
  if (typeof port === 'number') {
    tryListen(port, '0.0.0.0');
    for (const alt of [3000, 4000, 8080]) if (alt !== port) tryListen(alt, '0.0.0.0');
  } else {
    tryListen(port);
  }
}
export default app;
