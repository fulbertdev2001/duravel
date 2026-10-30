import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

export default function Dashboard() {
  const [s, setS] = useState(null);
  const [msgs, setMsgs] = useState([]);
  useEffect(() => {
    api.get('/api/admin/stats').then(setS);
    api.get('/api/admin/messages').then((m) => setMsgs(m.slice(0, 5)));
  }, []);
  const cards = s
    ? [
        ['Réalisations', `${s.published}/${s.projects}`, 'publiées', '/admin/realisations'],
        ['Expertises', s.services, 'services', '/admin/expertises'],
        ['Demandes', s.messages, `${s.unread} non lue(s)`, '/admin/messages'],
        ['Médias', s.media, 'images', '/admin/medias'],
      ]
    : [];
  return (
    <div className="adm-page">
      <header className="adm-head">
        <div>
          <h1>Tableau de bord</h1>
          <p>Gérez le portfolio, les textes et les demandes de devis de Sebas Rénovation.</p>
        </div>
        <Link to="/admin/realisations/new" className="adm-btn">
          + Nouvelle réalisation
        </Link>
      </header>
      <div className="adm-stats">
        {cards.map(([t, v, sub, to]) => (
          <Link key={t} to={to} className="adm-stat">
            <span>{t}</span>
            <strong>{v}</strong>
            <small>{sub}</small>
          </Link>
        ))}
      </div>
      <section className="adm-card">
        <div className="adm-card__head">
          <h2>Dernières demandes</h2>
          <Link to="/admin/messages" className="adm-link">
            Tout voir →
          </Link>
        </div>
        {msgs.length === 0 && <p className="adm-empty">Aucune demande pour le moment.</p>}
        {msgs.map((m) => (
          <Link to="/admin/messages" key={m.id} className={`adm-msgrow ${m.is_read ? '' : 'is-unread'}`}>
            <strong>{m.name}</strong>
            <span>{m.project_type || '—'}</span>
            <em>{m.message.slice(0, 90)}</em>
            <time>{new Date(m.created_at + 'Z').toLocaleDateString('fr-FR')}</time>
          </Link>
        ))}
      </section>
      <section className="adm-card adm-tips">
        <h2>Astuces</h2>
        <ul>
          <li>Une réalisation avec une image « Avant » apparaît automatiquement dans le comparateur Avant / Après de l’accueil.</li>
          <li>L’ordre des réalisations (glisser ↑↓) est celui du défilement horizontal de l’accueil.</li>
          <li>Les images importées sont converties en WebP et redimensionnées automatiquement.</li>
        </ul>
      </section>
    </div>
  );
}
