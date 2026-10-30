import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Dossier inscriptible : celui demandé, sinon un dossier hors de la version déployée
// (Hostinger remplace le dossier du site à chaque déploiement), sinon le dossier temporaire.
function writableDir(wanted, name) {
  const candidates = [wanted, path.join(os.homedir(), 'duravel-data', name), path.join(os.tmpdir(), 'duravel-data', name)].filter(Boolean);
  for (const dir of candidates) {
    try {
      fs.mkdirSync(dir, { recursive: true });
      fs.accessSync(dir, fs.constants.W_OK);
      if (dir !== wanted) console.warn(`[stockage] ${wanted} non inscriptible, utilisation de ${dir}`);
      return dir;
    } catch {}
  }
  throw new Error(`Aucun dossier inscriptible pour ${name}`);
}
export const DATA_DIR = writableDir(process.env.DATA_DIR || path.join(__dirname, 'data'), 'data');
export const UPLOAD_DIR = writableDir(process.env.UPLOAD_DIR || path.join(__dirname, 'uploads'), 'uploads');

const dbPath = path.join(DATA_DIR, 'duravel.sqlite');
let db;

try {
  const Database = require('better-sqlite3');
  db = new Database(dbPath);
  console.log('[db] Moteur SQLite: better-sqlite3');
} catch (err) {
  console.warn(`[db] better-sqlite3 indisponible (${err.message}), bascule sur node:sqlite natif (Node 22)...`);
  try {
    const { DatabaseSync } = require('node:sqlite');
    const rawDb = new DatabaseSync(dbPath);
    console.log('[db] Moteur SQLite: node:sqlite natif Node 22 (indépendant de GLIBC)');

    db = {
      pragma(str) {
        try { rawDb.exec(`PRAGMA ${str}`); } catch {}
      },
      exec(sql) {
        return rawDb.exec(sql);
      },
      prepare(sql) {
        const stmt = rawDb.prepare(sql);
        const paramNames = sql.match(/[@:$][a-zA-Z0-9_]+/g) || [];

        function normalize(args) {
          if (paramNames.length > 0 && args.length === 1 && typeof args[0] === 'object' && args[0] !== null && !Array.isArray(args[0])) {
            const data = args[0];
            const out = {};
            for (const p of paramNames) {
              const clean = p.slice(1);
              if (data[p] !== undefined) out[p] = data[p];
              else if (data[clean] !== undefined) out[p] = data[clean];
              else out[p] = null;
            }
            return [out];
          }
          return args;
        }

        return {
          all(...args) {
            return stmt.all(...normalize(args));
          },
          get(...args) {
            return stmt.get(...normalize(args));
          },
          run(...args) {
            const res = stmt.run(...normalize(args));
            return {
              changes: res?.changes ?? 0,
              lastInsertRowid: typeof res?.lastInsertRowid === 'bigint' ? Number(res.lastInsertRowid) : (res?.lastInsertRowid ?? 0),
            };
          },
        };
      },
      transaction(fn) {
        return (...args) => {
          rawDb.exec('BEGIN IMMEDIATE');
          try {
            const res = fn(...args);
            rawDb.exec('COMMIT');
            return res;
          } catch (e) {
            rawDb.exec('ROLLBACK');
            throw e;
          }
        };
      },
    };
  } catch (err2) {
    console.error('[db] Erreur critique : aucun moteur SQLite n\'a pu être chargé.', err2);
    throw err;
  }
}

try {
  db.pragma('journal_mode = WAL');
} catch {
  try { db.pragma('journal_mode = DELETE'); } catch {}
}
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  icon TEXT DEFAULT 'paint',
  tag TEXT DEFAULT '',
  summary TEXT DEFAULT '',
  points TEXT DEFAULT '[]',
  image TEXT DEFAULT '',
  sort INTEGER DEFAULT 0,
  published INTEGER DEFAULT 1
);
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT DEFAULT '',
  location TEXT DEFAULT '',
  year TEXT DEFAULT '',
  duration TEXT DEFAULT '',
  summary TEXT DEFAULT '',
  description TEXT DEFAULT '',
  cover TEXT DEFAULT '',
  before_img TEXT DEFAULT '',
  after_img TEXT DEFAULT '',
  gallery TEXT DEFAULT '[]',
  tags TEXT DEFAULT '[]',
  accent TEXT DEFAULT '',
  featured INTEGER DEFAULT 1,
  sort INTEGER DEFAULT 0,
  published INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  project_type TEXT DEFAULT '',
  message TEXT DEFAULT '',
  is_read INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

const JSON_FIELDS = { projects: ['gallery', 'tags'], services: ['points'] };

export function parseRow(table, row) {
  if (!row) return row;
  const out = { ...row };
  for (const f of JSON_FIELDS[table] || []) {
    try {
      out[f] = JSON.parse(out[f] || '[]');
    } catch {
      out[f] = [];
    }
  }
  for (const b of ['featured', 'published', 'is_read']) if (b in out) out[b] = !!out[b];
  return out;
}

export function getSettings() {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const s = {};
  for (const r of rows) {
    try {
      s[r.key] = JSON.parse(r.value);
    } catch {
      s[r.key] = r.value;
    }
  }
  return s;
}

export function setSettings(obj) {
  const stmt = db.prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  );
  const tx = db.transaction((o) => {
    for (const [k, v] of Object.entries(o)) stmt.run(k, JSON.stringify(v));
  });
  tx(obj);
}

export function slugify(s = '') {
  return s
    .toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export default db;
