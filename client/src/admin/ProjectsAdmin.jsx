import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useToast } from './ui';

export default function ProjectsAdmin() {
  const [list, setList] = useState([]);
  const toast = useToast();
  const load = () => api.get('/api/admin/projects').then(setList);
  useEffect(() => {
    load();
  }, []);

  const move = async (i, d) => {
    const n = [...list];
    const j = i + d;
    if (j < 0 || j >= n.length) return;
    [n[i], n[j]] = [n[j], n[i]];
    setList(n);
    await api.post('/api/admin/projects/reorder', { ids: n.map((p) => p.id) });
  };
  const togglePub = async (p) => {
    await api.put(`/api/admin/projects/${p.id}`, { ...p, published: !p.published });
    toast(p.published ? 'Réalisation masquée' : 'Réalisation publiée');
    load();
  };
  const del = async (p) => {
    if (!confirm(`Supprimer « ${p.title} » ?`)) return;
    await api.del(`/api/admin/projects/${p.id}`);
    toast('Réalisation supprimée');
    load();
  };

  return (
    <div className="adm-page">
      <header className="adm-head">
        <div>
          <h1>Réalisations</h1>
          <p>Le portfolio : chaque projet a sa page immersive, sa galerie et son comparateur avant/après.</p>
        </div>
        <Link to="/admin/realisations/new" className="adm-btn">
          + Nouvelle réalisation
        </Link>
      </header>
      <div className="adm-plist">
        {list.map((p, i) => (
          <div key={p.id} className={`adm-prow ${p.published ? '' : 'is-off'}`}>
            <div className="adm-prow__order">
              <button onClick={() => move(i, -1)} disabled={i === 0}>
                ↑
              </button>
              <button onClick={() => move(i, 1)} disabled={i === list.length - 1}>
                ↓
              </button>
            </div>
            <Link to={`/admin/realisations/${p.id}`} className="adm-prow__img">
              {p.cover ? <img src={p.cover} alt="" /> : <span>—</span>}
            </Link>
            <div className="adm-prow__info">
              <Link to={`/admin/realisations/${p.id}`}>
                <strong>{p.title}</strong>
              </Link>
              <span>
                {[p.category, p.year, p.location].filter(Boolean).join(' · ') || '—'} · {p.gallery.length} image(s)
                {p.before_img ? ' · Avant/Après ✓' : ''}
              </span>
            </div>
            <div className="adm-prow__act">
              <button className={`adm-pill ${p.published ? 'is-on' : ''}`} onClick={() => togglePub(p)}>
                {p.published ? 'Publiée' : 'Brouillon'}
              </button>
              <a className="adm-link" href={`/realisations/${p.slug}`} target="_blank" rel="noreferrer">
                Voir ↗
              </a>
              <Link className="adm-btn adm-btn--ghost adm-btn--sm" to={`/admin/realisations/${p.id}`}>
                Modifier
              </Link>
              <button className="adm-link danger" onClick={() => del(p)}>
                Supprimer
              </button>
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="adm-empty">Aucune réalisation. Créez la première !</p>}
      </div>
    </div>
  );
}
