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
    res.end(`Démarrage impossible (Node ${process.version})\n${e?.message || e}\n`);
  });
  app.listen(process.env.PORT || 3000, '0.0.0.0');
}
export default app;
