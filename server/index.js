import dotenv from 'dotenv';
import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();
dotenv.config({ path: path.join(__dirname, '.env') });

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import sharp from 'sharp';
import nodemailer from 'nodemailer';
import db, { UPLOAD_DIR, DATA_DIR, getSettings, setSettings, parseRow, slugify } from './db.js';
import { seed } from './seed.js';
const PORT = process.env.PORT || 4000;
const PROD = process.env.NODE_ENV === 'production';
const CLIENT_DIST = path.join(__dirname, '..', 'client', 'dist');

// Secret JWT : .env sinon généré et persisté
let JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  const f = path.join(DATA_DIR, '.jwt_secret');
  if (!fs.existsSync(f)) fs.writeFileSync(f, crypto.randomBytes(48).toString('hex'));
  JWT_SECRET = fs.readFileSync(f, 'utf8');
}

seed();

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '30d' }));

/* ---------------- helpers ---------------- */
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function auth(req, res, next) {
  const token = req.cookies.dv_token || (req.headers.authorization || '').replace('Bearer ', '');
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Non authentifié' });
  }
}

function uniqueSlug(base, id = 0) {
  let slug = slugify(base) || 'realisation';
  let i = 2;
  while (db.prepare('SELECT id FROM projects WHERE slug = ? AND id != ?').get(slug, id)) slug = `${slugify(base)}-${i++}`;
  return slug;
}

/* ---------------- public ---------------- */
app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.get('/api/site', (_req, res) => {
  const services = db.prepare('SELECT * FROM services WHERE published = 1 ORDER BY sort, id').all().map((r) => parseRow('services', r));
  const projects = db
    .prepare('SELECT * FROM projects WHERE published = 1 ORDER BY sort, id DESC')
    .all()
    .map((r) => parseRow('projects', r));
  res.json({ settings: getSettings(), services, projects });
});

app.get('/api/projects/:slug', (req, res) => {
  const row = db.prepare('SELECT * FROM projects WHERE slug = ? AND published = 1').get(req.params.slug);
  if (!row) return res.status(404).json({ error: 'Réalisation introuvable' });
  res.json(parseRow('projects', row));
});

const contactHits = new Map();
app.post(
  '/api/contact',
  wrap(async (req, res) => {
    const ip = req.ip;
    const now = Date.now();
    const hits = (contactHits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
    if (hits.length >= 5) return res.status(429).json({ error: 'Trop de messages, réessayez plus tard.' });
    const { name = '', email = '', phone = '', project_type = '', message = '', website = '' } = req.body || {};
    if (website) return res.json({ ok: true }); // honeypot
    if (!name.trim() || (!email.trim() && !phone.trim()) || !message.trim())
      return res.status(400).json({ error: 'Nom, message et un moyen de contact sont requis.' });
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'E-mail invalide.' });
    hits.push(now);
    contactHits.set(ip, hits);
    const clip = (s, n) => String(s).slice(0, n);
    db.prepare('INSERT INTO messages (name,email,phone,project_type,message) VALUES (?,?,?,?,?)').run(
      clip(name, 120),
      clip(email, 160),
      clip(phone, 40),
      clip(project_type, 80),
      clip(message, 4000)
    );
    notify({ name, email, phone, project_type, message }).catch((e) => console.warn('[mail]', e.message));
    res.json({ ok: true });
  })
);

async function notify(m) {
  if (!process.env.SMTP_HOST) return;
  const t = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  const to = process.env.NOTIFY_TO || getSettings().contact?.email;
  await t.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    replyTo: m.email || undefined,
    subject: `Nouvelle demande — ${m.name} (${m.project_type || 'site web'})`,
    text: `Nom : ${m.name}\nE-mail : ${m.email}\nTéléphone : ${m.phone}\nProjet : ${m.project_type}\n\n${m.message}`,
  });
}

/* ---------------- auth ---------------- */
app.post('/api/auth/login', (req, res) => {
  const { email = '', password = '' } = req.body || {};
  const u = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (!u || !bcrypt.compareSync(password, u.password_hash)) return res.status(401).json({ error: 'Identifiants incorrects' });
  const token = jwt.sign({ id: u.id, email: u.email }, JWT_SECRET, { expiresIn: '7d' });
  res.cookie('dv_token', token, { httpOnly: true, sameSite: 'lax', secure: PROD, maxAge: 7 * 864e5 });
  res.json({ email: u.email });
});
app.post('/api/auth/logout', (_req, res) => {
  res.clearCookie('dv_token');
  res.json({ ok: true });
});
app.get('/api/auth/me', auth, (req, res) => res.json({ email: req.user.email }));
app.post('/api/auth/password', auth, (req, res) => {
  const { current = '', next = '' } = req.body || {};
  const u = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!bcrypt.compareSync(current, u.password_hash)) return res.status(400).json({ error: 'Mot de passe actuel incorrect' });
  if (next.length < 8) return res.status(400).json({ error: '8 caractères minimum' });
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(bcrypt.hashSync(next, 10), u.id);
  res.json({ ok: true });
});

/* ---------------- admin ---------------- */
const admin = express.Router();
admin.use(auth);

admin.get('/stats', (_req, res) => {
  const c = (sql) => db.prepare(sql).get().c;
  res.json({
    projects: c('SELECT COUNT(*) c FROM projects'),
    published: c('SELECT COUNT(*) c FROM projects WHERE published = 1'),
    services: c('SELECT COUNT(*) c FROM services'),
    messages: c('SELECT COUNT(*) c FROM messages'),
    unread: c('SELECT COUNT(*) c FROM messages WHERE is_read = 0'),
    media: fs.readdirSync(UPLOAD_DIR).filter((f) => !f.startsWith('.')).length,
  });
});

// settings
admin.get('/settings', (_req, res) => res.json(getSettings()));
admin.put('/settings', (req, res) => {
  setSettings(req.body || {});
  res.json(getSettings());
});

// projects
const PROJECT_FIELDS = ['title', 'category', 'location', 'year', 'duration', 'summary', 'description', 'cover', 'before_img', 'after_img', 'accent'];
function projectPayload(b, id = 0) {
  const p = {};
  for (const f of PROJECT_FIELDS) p[f] = (b[f] ?? '').toString();
  p.slug = uniqueSlug(b.slug || b.title || 'realisation', id);
  p.gallery = JSON.stringify(Array.isArray(b.gallery) ? b.gallery.filter((g) => g && g.src) : []);
  p.tags = JSON.stringify(Array.isArray(b.tags) ? b.tags.map(String).filter(Boolean) : []);
  p.featured = b.featured ? 1 : 0;
  p.published = b.published === false ? 0 : 1;
  p.sort = Number(b.sort) || 0;
  return p;
}
admin.get('/projects', (_req, res) =>
  res.json(db.prepare('SELECT * FROM projects ORDER BY sort, id DESC').all().map((r) => parseRow('projects', r)))
);
admin.get('/projects/:id', (req, res) => {
  const r = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!r) return res.status(404).json({ error: 'Introuvable' });
  res.json(parseRow('projects', r));
});
admin.post('/projects', (req, res) => {
  if (!req.body?.title) return res.status(400).json({ error: 'Titre requis' });
  const p = projectPayload(req.body);
  if (!req.body.sort) p.sort = (db.prepare('SELECT MAX(sort) m FROM projects').get().m || 0) + 1;
  const cols = Object.keys(p);
  const info = db.prepare(`INSERT INTO projects (${cols.join(',')}) VALUES (${cols.map((c) => '@' + c).join(',')})`).run(p);
  res.json(parseRow('projects', db.prepare('SELECT * FROM projects WHERE id = ?').get(info.lastInsertRowid)));
});
admin.put('/projects/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!db.prepare('SELECT id FROM projects WHERE id = ?').get(id)) return res.status(404).json({ error: 'Introuvable' });
  const p = projectPayload(req.body, id);
  db.prepare(
    `UPDATE projects SET ${Object.keys(p).map((c) => `${c}=@${c}`).join(',')}, updated_at = CURRENT_TIMESTAMP WHERE id = @id`
  ).run({ ...p, id });
  res.json(parseRow('projects', db.prepare('SELECT * FROM projects WHERE id = ?').get(id)));
});
admin.delete('/projects/:id', (req, res) => {
  db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});
admin.post('/projects/reorder', (req, res) => {
  const ids = req.body?.ids || [];
  const st = db.prepare('UPDATE projects SET sort = ? WHERE id = ?');
  db.transaction(() => ids.forEach((id, i) => st.run(i + 1, id)))();
  res.json({ ok: true });
});

// services
admin.get('/services', (_req, res) =>
  res.json(db.prepare('SELECT * FROM services ORDER BY sort, id').all().map((r) => parseRow('services', r)))
);
function servicePayload(b) {
  return {
    title: String(b.title || ''),
    icon: String(b.icon || 'paint'),
    tag: String(b.tag || ''),
    summary: String(b.summary || ''),
    points: JSON.stringify(Array.isArray(b.points) ? b.points.filter(Boolean) : []),
    image: String(b.image || ''),
    sort: Number(b.sort) || 0,
    published: b.published === false ? 0 : 1,
  };
}
admin.post('/services', (req, res) => {
  if (!req.body?.title) return res.status(400).json({ error: 'Titre requis' });
  const p = servicePayload(req.body);
  if (!p.sort) p.sort = (db.prepare('SELECT MAX(sort) m FROM services').get().m || 0) + 1;
  const info = db
    .prepare('INSERT INTO services (title,icon,tag,summary,points,image,sort,published) VALUES (@title,@icon,@tag,@summary,@points,@image,@sort,@published)')
    .run(p);
  res.json(parseRow('services', db.prepare('SELECT * FROM services WHERE id = ?').get(info.lastInsertRowid)));
});
admin.put('/services/:id', (req, res) => {
  const p = servicePayload(req.body);
  db.prepare(
    'UPDATE services SET title=@title,icon=@icon,tag=@tag,summary=@summary,points=@points,image=@image,sort=@sort,published=@published WHERE id=@id'
  ).run({ ...p, id: Number(req.params.id) });
  res.json(parseRow('services', db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id)));
});
admin.delete('/services/:id', (req, res) => {
  db.prepare('DELETE FROM services WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// messages
admin.get('/messages', (_req, res) =>
  res.json(db.prepare('SELECT * FROM messages ORDER BY id DESC').all().map((r) => parseRow('messages', r)))
);
admin.patch('/messages/:id', (req, res) => {
  db.prepare('UPDATE messages SET is_read = ? WHERE id = ?').run(req.body?.is_read ? 1 : 0, req.params.id);
  res.json({ ok: true });
});
admin.delete('/messages/:id', (req, res) => {
  db.prepare('DELETE FROM messages WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// media
const VIDEO_EXT = { 'video/mp4': '.mp4', 'video/webm': '.webm', 'video/quicktime': '.mov', 'video/x-m4v': '.m4v' };
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024, files: 30 },
  fileFilter: (_req, file, cb) => cb(null, /^image\//.test(file.mimetype) || !!VIDEO_EXT[file.mimetype]),
});
admin.post(
  '/upload',
  upload.array('files', 30),
  wrap(async (req, res) => {
    const out = [];
    for (const f of req.files || []) {
      const base = slugify(path.parse(f.originalname).name) || 'image';
      const name = `${base}-${crypto.randomBytes(3).toString('hex')}.webp`;
      if (VIDEO_EXT[f.mimetype]) {
        // vidéos conservées telles quelles (pas de ré-encodage) ; lecture par segments gérée par express.static
        const vName = name.replace(/\.webp$/, VIDEO_EXT[f.mimetype]);
        fs.writeFileSync(path.join(UPLOAD_DIR, vName), f.buffer);
        out.push(`/uploads/${vName}`);
        continue;
      }
      if (/svg/.test(f.mimetype)) {
        const svgName = name.replace(/\.webp$/, '.svg');
        fs.writeFileSync(path.join(UPLOAD_DIR, svgName), f.buffer);
        out.push(`/uploads/${svgName}`);
        continue;
      }
      await sharp(f.buffer)
        .rotate()
        .resize({ width: 2800, height: 2800, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 92, effort: 5 })
        .toFile(path.join(UPLOAD_DIR, name));
      out.push(`/uploads/${name}`);
    }
    res.json({ files: out });
  })
);
admin.get('/media', (_req, res) => {
  const files = fs
    .readdirSync(UPLOAD_DIR)
    .filter((f) => !f.startsWith('.'))
    .map((f) => ({ url: `/uploads/${f}`, name: f, mtime: fs.statSync(path.join(UPLOAD_DIR, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);
  res.json(files);
});
admin.delete('/media/:name', (req, res) => {
  const name = path.basename(req.params.name);
  const p = path.join(UPLOAD_DIR, name);
  if (fs.existsSync(p)) fs.unlinkSync(p);
  res.json({ ok: true });
});

app.use('/api/admin', admin);
app.use('/api', (_req, res) => res.status(404).json({ error: 'Route inconnue' }));

/* ---------------- SPA ---------------- */
if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST, { index: false, maxAge: '7d' }));
  // index.html avec titre / description SEO issus des réglages (utile pour Google et les partages)
  const esc = (s = '') => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  app.use((req, res, next) => {
    if ((req.method !== 'GET' && req.method !== 'HEAD') || req.path.startsWith('/uploads/')) return next();
    let html = fs.readFileSync(path.join(CLIENT_DIST, 'index.html'), 'utf8');
    const seo = getSettings().seo || {};
    let title = seo.title;
    const m = req.path.match(/^\/realisations\/([^/]+)/);
    if (m) {
      const p = db.prepare('SELECT title, summary, cover FROM projects WHERE slug = ? AND published = 1').get(m[1]);
      if (p) {
        title = `${p.title} — ${getSettings().brand?.name || ''}`;
        seo.description = p.summary;
        html = html.replace(/(<meta property="og:image" content=")[^"]*/, `$1${esc(p.cover)}`);
      }
    }
    if (title) html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`).replace(/(<meta property="og:title" content=")[^"]*/, `$1${esc(title)}`);
    if (seo.description) html = html.replace(/(<meta name="description" content=")[^"]*/, `$1${esc(seo.description)}`);
    res.type('html').send(html);
  });
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Erreur serveur' });
});

app.listen(PORT, '0.0.0.0', () => console.log(`Duravel Building → http://0.0.0.0:${PORT}`));
