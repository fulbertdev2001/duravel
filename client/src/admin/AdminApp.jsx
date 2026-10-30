import { useEffect, useState } from 'react';
import { Routes, Route, NavLink, Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { LogoMark } from '../components/Logo';
import { ToastProvider } from './ui';
import Dashboard from './Dashboard';
import ProjectsAdmin from './ProjectsAdmin';
import ProjectEdit from './ProjectEdit';
import ServicesAdmin from './ServicesAdmin';
import SettingsAdmin from './SettingsAdmin';
import MessagesAdmin from './MessagesAdmin';
import MediaAdmin from './MediaAdmin';
import AccountAdmin from './AccountAdmin';
import './admin.css';

export default function AdminApp() {
  const [me, setMe] = useState(undefined);
  useEffect(() => {
    document.title = 'Admin — Sebas Rénovation';
    api
      .get('/api/auth/me')
      .then(setMe)
      .catch(() => setMe(null));
  }, []);
  if (me === undefined) return <div className="adm-loading">Chargement…</div>;
  return <ToastProvider>{me ? <Shell me={me} onLogout={() => setMe(null)} /> : <Login onLogin={setMe} />}</ToastProvider>;
}

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <div className="adm-login">
      <form
        className="adm-login__box"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setErr('');
          try {
            onLogin(await api.post('/api/auth/login', { email, password }));
          } catch (e2) {
            setErr(e2.message);
          }
          setBusy(false);
        }}
      >
        <div className="adm-login__logo">
          <LogoMark size={120} />
        </div>
        <h1>Espace administration</h1>
        <p>Sebas Rénovation — gestion du site & du portfolio</p>
        <input className="adm-input" type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus required />
        <input className="adm-input" type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {err && <div className="adm-error">{err}</div>}
        <button className="adm-btn adm-btn--lg" disabled={busy}>
          {busy ? 'Connexion…' : 'Se connecter'}
        </button>
        <Link to="/" className="adm-link">
          ← Retour au site
        </Link>
      </form>
    </div>
  );
}

const NAV = [
  ['', 'Tableau de bord', '◧'],
  ['realisations', 'Réalisations', '▦'],
  ['expertises', 'Expertises', '◆'],
  ['contenus', 'Contenus du site', '✎'],
  ['messages', 'Demandes de devis', '✉'],
  ['medias', 'Médiathèque', '▣'],
  ['compte', 'Mon compte', '◉'],
];

function Shell({ me, onLogout }) {
  const nav = useNavigate();
  const [unread, setUnread] = useState(0);
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    const f = () => api.get('/api/admin/stats').then((s) => setUnread(s.unread)).catch(() => {});
    f();
    const t = setInterval(f, 60000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="adm">
      <aside className={`adm-side ${menu ? 'is-open' : ''}`}>
        <Link to="/admin" className="adm-side__brand">
          <LogoMark size={64} />
          <span>
            Sebas<small>Admin</small>
          </span>
        </Link>
        <nav onClick={() => setMenu(false)}>
          {NAV.map(([to, label, ic]) => (
            <NavLink key={to} to={`/admin${to ? '/' + to : ''}`} end={!to} className="adm-side__link">
              <i>{ic}</i>
              {label}
              {to === 'messages' && unread > 0 && <b className="adm-badge">{unread}</b>}
            </NavLink>
          ))}
        </nav>
        <div className="adm-side__foot">
          <a href="/" target="_blank" rel="noreferrer" className="adm-btn adm-btn--ghost adm-btn--block">
            Voir le site ↗
          </a>
          <span className="adm-side__me">{me.email}</span>
          <button
            className="adm-link"
            onClick={async () => {
              await api.post('/api/auth/logout');
              onLogout();
              nav('/admin');
            }}
          >
            Déconnexion
          </button>
        </div>
      </aside>
      <button className="adm-burger" onClick={() => setMenu(!menu)} aria-label="Menu">
        ☰
      </button>
      <main className="adm-main">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="realisations" element={<ProjectsAdmin />} />
          <Route path="realisations/:id" element={<ProjectEdit />} />
          <Route path="expertises" element={<ServicesAdmin />} />
          <Route path="contenus" element={<SettingsAdmin />} />
          <Route path="messages" element={<MessagesAdmin onChange={setUnread} />} />
          <Route path="medias" element={<MediaAdmin />} />
          <Route path="compte" element={<AccountAdmin />} />
        </Routes>
      </main>
    </div>
  );
}
