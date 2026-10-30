import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useToast } from './ui';

export default function MessagesAdmin({ onChange }) {
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(null);
  const toast = useToast();
  const load = () =>
    api.get('/api/admin/messages').then((l) => {
      setList(l);
      onChange?.(l.filter((m) => !m.is_read).length);
    });
  useEffect(() => {
    load();
  }, []);

  const view = async (m) => {
    setOpen(open === m.id ? null : m.id);
    if (!m.is_read) {
      await api.patch(`/api/admin/messages/${m.id}`, { is_read: true });
      load();
    }
  };
  const del = async (m) => {
    if (!confirm('Supprimer cette demande ?')) return;
    await api.del(`/api/admin/messages/${m.id}`);
    toast('Demande supprimée');
    load();
  };
  const exportCsv = () => {
    const rows = [['Date', 'Nom', 'E-mail', 'Téléphone', 'Projet', 'Message']].concat(
      list.map((m) => [m.created_at, m.name, m.email, m.phone, m.project_type, m.message])
    );
    const csv = rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(';')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv' }));
    a.download = 'demandes-sebas.csv';
    a.click();
  };

  return (
    <div className="adm-page">
      <header className="adm-head">
        <div>
          <h1>Demandes de devis</h1>
          <p>Messages envoyés depuis le formulaire du site.</p>
        </div>
        {list.length > 0 && (
          <button className="adm-btn adm-btn--ghost" onClick={exportCsv}>
            Exporter (CSV)
          </button>
        )}
      </header>
      <div className="adm-card adm-msgs">
        {list.length === 0 && <p className="adm-empty">Aucune demande pour l’instant.</p>}
        {list.map((m) => (
          <div key={m.id} className={`adm-msg ${m.is_read ? '' : 'is-unread'} ${open === m.id ? 'is-open' : ''}`}>
            <button className="adm-msg__row" onClick={() => view(m)}>
              <span className="adm-msg__dot" />
              <strong>{m.name}</strong>
              <span>{m.project_type || '—'}</span>
              <em>{m.message.slice(0, 80)}</em>
              <time>{new Date(m.created_at + 'Z').toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</time>
            </button>
            {open === m.id && (
              <div className="adm-msg__body">
                <p className="adm-msg__text">{m.message}</p>
                <div className="adm-row">
                  {m.email && (
                    <a className="adm-btn adm-btn--sm" href={`mailto:${m.email}?subject=Votre projet — Sebas Rénovation`}>
                      Répondre : {m.email}
                    </a>
                  )}
                  {m.phone && (
                    <a className="adm-btn adm-btn--ghost adm-btn--sm" href={`tel:${m.phone}`}>
                      Appeler : {m.phone}
                    </a>
                  )}
                  <button className="adm-link" onClick={() => api.patch(`/api/admin/messages/${m.id}`, { is_read: false }).then(load)}>
                    Marquer non lu
                  </button>
                  <button className="adm-link danger" onClick={() => del(m)}>
                    Supprimer
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
