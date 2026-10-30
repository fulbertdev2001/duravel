import { isVideo } from '../components/Media';
import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { api } from '../lib/api';

/* ---------- Toasts ---------- */
const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);
export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = useCallback((msg, type = 'ok') => {
    const id = Math.random();
    setItems((x) => [...x, { id, msg, type }]);
    setTimeout(() => setItems((x) => x.filter((t) => t.id !== id)), 3200);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="adm-toasts">
        {items.map((t) => (
          <div key={t.id} className={`adm-toast adm-toast--${t.type}`}>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ---------- Champs ---------- */
export function Field({ label, hint, children, wide }) {
  return (
    <label className={`adm-field ${wide ? 'is-wide' : ''}`}>
      <span className="adm-field__label">{label}</span>
      {children}
      {hint && <small className="adm-field__hint">{hint}</small>}
    </label>
  );
}

export function Text({ value, onChange, ...p }) {
  return <input className="adm-input" value={value ?? ''} onChange={(e) => onChange(e.target.value)} {...p} />;
}
export function Area({ value, onChange, rows = 4, ...p }) {
  return <textarea className="adm-input" rows={rows} value={value ?? ''} onChange={(e) => onChange(e.target.value)} {...p} />;
}
export function Toggle({ checked, onChange, label }) {
  return (
    <button type="button" className={`adm-toggle ${checked ? 'is-on' : ''}`} onClick={() => onChange(!checked)} aria-pressed={checked}>
      <span />
      {label}
    </button>
  );
}

/* Liste de chaînes (tags, points…) */
export function StringList({ value = [], onChange, placeholder = 'Ajouter…' }) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const v = draft.trim();
    if (!v) return;
    onChange([...(value || []), v]);
    setDraft('');
  };
  return (
    <div className="adm-tags">
      {(value || []).map((t, i) => (
        <span key={i} className="adm-tag">
          <input value={t} onChange={(e) => onChange(value.map((x, k) => (k === i ? e.target.value : x)))} size={Math.max(4, t.length)} />
          <button type="button" onClick={() => onChange(value.filter((_, k) => k !== i))} aria-label="Retirer">
            ×
          </button>
        </span>
      ))}
      <input
        className="adm-tags__input"
        value={draft}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            add();
          }
        }}
        onBlur={add}
      />
    </div>
  );
}

/* Liste d'objets éditables (étapes, piliers, chiffres) */
export function ObjList({ value = [], onChange, fields, addLabel = 'Ajouter' }) {
  const set = (i, k, v) => onChange(value.map((o, j) => (j === i ? { ...o, [k]: v } : o)));
  const move = (i, d) => {
    const n = [...value];
    const j = i + d;
    if (j < 0 || j >= n.length) return;
    [n[i], n[j]] = [n[j], n[i]];
    onChange(n);
  };
  return (
    <div className="adm-objlist">
      {value.map((o, i) => (
        <div key={i} className="adm-objlist__item">
          <span className="adm-objlist__n">{String(i + 1).padStart(2, '0')}</span>
          <div className="adm-objlist__fields">
            {fields.map((f) =>
              f.type === 'textarea' ? (
                <Area key={f.key} rows={2} placeholder={f.label} value={o[f.key]} onChange={(v) => set(i, f.key, v)} />
              ) : (
                <Text
                  key={f.key}
                  placeholder={f.label}
                  type={f.type === 'number' ? 'number' : 'text'}
                  value={o[f.key]}
                  onChange={(v) => set(i, f.key, f.type === 'number' ? Number(v) : v)}
                />
              )
            )}
          </div>
          <div className="adm-objlist__act">
            <button type="button" onClick={() => move(i, -1)} title="Monter">
              ↑
            </button>
            <button type="button" onClick={() => move(i, 1)} title="Descendre">
              ↓
            </button>
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} title="Supprimer" className="danger">
              ×
            </button>
          </div>
        </div>
      ))}
      <button type="button" className="adm-btn adm-btn--ghost" onClick={() => onChange([...value, {}])}>
        + {addLabel}
      </button>
    </div>
  );
}

export const Thumb = ({ src }) =>
  isVideo(src) ? <video src={`${src}#t=0.1`} muted playsInline preload="metadata" /> : <img src={src} alt="" loading="lazy" />;

/* ---------- Médiathèque ---------- */
export function MediaPicker({ open, onClose, onPick, multiple = false }) {
  const [files, setFiles] = useState([]);
  const [sel, setSel] = useState([]);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const load = () => api.get('/api/admin/media').then(setFiles);
  useEffect(() => {
    if (open) {
      setSel([]);
      load();
    }
  }, [open]);
  if (!open) return null;
  const upload = async (list) => {
    if (!list?.length) return;
    setBusy(true);
    try {
      const r = await api.upload(list);
      await load();
      setSel((s) => (multiple ? [...s, ...r.files] : r.files.slice(0, 1)));
      toast(`${r.files.length} fichier(s) importé(s)`);
    } catch (e) {
      toast(e.message, 'err');
    }
    setBusy(false);
  };
  const toggle = (url) =>
    setSel((s) => (multiple ? (s.includes(url) ? s.filter((x) => x !== url) : [...s, url]) : [url]));
  return (
    <div className="adm-modal" onClick={onClose}>
      <div className="adm-modal__box" onClick={(e) => e.stopPropagation()}>
        <div className="adm-modal__head">
          <h3>Médiathèque</h3>
          <label className="adm-btn">
            {busy ? 'Import…' : 'Importer images / vidéos'}
            <input type="file" accept="image/*,video/mp4,video/webm,video/quicktime" multiple hidden onChange={(e) => upload(e.target.files)} />
          </label>
        </div>
        <Dropzone onFiles={upload}>
          <div className="adm-media-grid">
            {files.map((f) => (
              <button
                type="button"
                key={f.url}
                className={`adm-media ${sel.includes(f.url) ? 'is-sel' : ''}`}
                onClick={() => toggle(f.url)}
                onDoubleClick={() => {
                  onPick(multiple ? [f.url] : f.url);
                  onClose();
                }}
              >
                <Thumb src={f.url} />
                {sel.includes(f.url) && <span className="adm-media__check">{multiple ? sel.indexOf(f.url) + 1 : '✓'}</span>}
              </button>
            ))}
          </div>
        </Dropzone>
        <div className="adm-modal__foot">
          <small>Glissez-déposez des images ici · double-clic pour choisir</small>
          <div>
            <button type="button" className="adm-btn adm-btn--ghost" onClick={onClose}>
              Annuler
            </button>
            <button
              type="button"
              className="adm-btn"
              disabled={!sel.length}
              onClick={() => {
                onPick(multiple ? sel : sel[0]);
                onClose();
              }}
            >
              Choisir {multiple && sel.length ? `(${sel.length})` : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Dropzone({ onFiles, children }) {
  const [over, setOver] = useState(false);
  const n = useRef(0);
  return (
    <div
      className={`adm-drop ${over ? 'is-over' : ''}`}
      onDragEnter={(e) => {
        e.preventDefault();
        n.current++;
        setOver(true);
      }}
      onDragLeave={() => {
        n.current--;
        if (n.current <= 0) setOver(false);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        n.current = 0;
        setOver(false);
        onFiles(e.dataTransfer.files);
      }}
    >
      {children}
    </div>
  );
}

export function ImageField({ value, onChange, ratio = '4/3' }) {
  const [open, setOpen] = useState(false);
  const toast = useToast();
  return (
    <div className="adm-imgfield">
      <Dropzone
        onFiles={async (fl) => {
          try {
            const r = await api.upload([fl[0]]);
            onChange(r.files[0]);
          } catch (e) {
            toast(e.message, 'err');
          }
        }}
      >
        <button type="button" className="adm-imgfield__prev" style={{ aspectRatio: ratio }} onClick={() => setOpen(true)}>
          {value ? <Thumb src={value} /> : <span>Choisir / déposer une image</span>}
        </button>
      </Dropzone>
      {value && (
        <button type="button" className="adm-link danger" onClick={() => onChange('')}>
          Retirer
        </button>
      )}
      <MediaPicker open={open} onClose={() => setOpen(false)} onPick={onChange} />
    </div>
  );
}

export function GalleryField({ value = [], onChange }) {
  const [open, setOpen] = useState(false);
  const [dragI, setDragI] = useState(null);
  const set = (i, k, v) => onChange(value.map((g, j) => (j === i ? { ...g, [k]: v } : g)));
  return (
    <div>
      <div className="adm-gallery">
        {value.map((g, i) => (
          <div
            key={g.src + i}
            className={`adm-gallery__item ${dragI === i ? 'is-drag' : ''}`}
            draggable
            onDragStart={() => setDragI(i)}
            onDragOver={(e) => {
              e.preventDefault();
              if (dragI === null || dragI === i) return;
              const n = [...value];
              const [m] = n.splice(dragI, 1);
              n.splice(i, 0, m);
              setDragI(i);
              onChange(n);
            }}
            onDragEnd={() => setDragI(null)}
          >
            <img src={g.src} alt="" />
            <input placeholder="Légende" value={g.caption || ''} onChange={(e) => set(i, 'caption', e.target.value)} />
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="Retirer">
              ×
            </button>
          </div>
        ))}
        <button type="button" className="adm-gallery__add" onClick={() => setOpen(true)}>
          + Ajouter des images
        </button>
      </div>
      <small className="adm-field__hint">Glissez les vignettes pour changer l’ordre.</small>
      <MediaPicker
        open={open}
        multiple
        onClose={() => setOpen(false)}
        onPick={(urls) => onChange([...value, ...urls.map((src) => ({ src, caption: '' }))])}
      />
    </div>
  );
}

/* accès imbriqué "a.b.c" */
export const getPath = (o, p) => p.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
export const setPath = (o, p, v) => {
  const keys = p.split('.');
  const out = Array.isArray(o) ? [...o] : { ...o };
  let cur = out;
  keys.slice(0, -1).forEach((k) => {
    cur[k] = { ...(cur[k] || {}) };
    cur = cur[k];
  });
  cur[keys.at(-1)] = v;
  return out;
};
