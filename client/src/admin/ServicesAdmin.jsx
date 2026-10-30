import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import Icon, { ICON_NAMES } from '../components/Icon';
import { Field, Text, Area, StringList, ImageField, Toggle, useToast } from './ui';

export default function ServicesAdmin() {
  const [list, setList] = useState([]);
  const [edit, setEdit] = useState(null);
  const toast = useToast();
  const load = () => api.get('/api/admin/services').then(setList);
  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    try {
      if (edit.id) await api.put(`/api/admin/services/${edit.id}`, edit);
      else await api.post('/api/admin/services', edit);
      toast('Expertise enregistrée');
      setEdit(null);
      load();
    } catch (e) {
      toast(e.message, 'err');
    }
  };
  const del = async (s) => {
    if (!confirm(`Supprimer « ${s.title} » ?`)) return;
    await api.del(`/api/admin/services/${s.id}`);
    load();
  };
  const set = (k) => (v) => setEdit({ ...edit, [k]: v });

  return (
    <div className="adm-page">
      <header className="adm-head">
        <div>
          <h1>Expertises</h1>
          <p>Les domaines d’intervention affichés sur l’accueil (accordéon avec image flottante).</p>
        </div>
        <button className="adm-btn" onClick={() => setEdit({ title: '', icon: 'paint', tag: '', summary: '', points: [], image: '', published: true })}>
          + Ajouter
        </button>
      </header>
      <div className="adm-svc-grid">
        {list.map((s) => (
          <div key={s.id} className={`adm-card adm-svc ${s.published ? '' : 'is-off'}`}>
            <div className="adm-svc__icon">
              <Icon name={s.icon} size={26} />
            </div>
            <h3>{s.title}</h3>
            <small>{s.tag}</small>
            <p>{s.summary}</p>
            <div className="adm-row">
              <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => setEdit(s)}>
                Modifier
              </button>
              <button className="adm-link danger" onClick={() => del(s)}>
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      {edit && (
        <div className="adm-modal" onClick={() => setEdit(null)}>
          <div className="adm-modal__box adm-modal__box--md" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal__head">
              <h3>{edit.id ? 'Modifier l’expertise' : 'Nouvelle expertise'}</h3>
              <Toggle checked={edit.published} onChange={set('published')} label="Visible" />
            </div>
            <div className="adm-grid">
              <Field label="Titre" wide>
                <Text value={edit.title} onChange={set('title')} />
              </Field>
              <Field label="Accroche courte">
                <Text value={edit.tag} onChange={set('tag')} placeholder="Finition impeccable" />
              </Field>
              <Field label="Ordre">
                <Text type="number" value={edit.sort} onChange={set('sort')} />
              </Field>
              <Field label="Icône" wide>
                <div className="adm-icons">
                  {ICON_NAMES.map((n) => (
                    <button type="button" key={n} className={edit.icon === n ? 'is-on' : ''} onClick={() => set('icon')(n)}>
                      <Icon name={n} />
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Description" wide>
                <Area value={edit.summary} onChange={set('summary')} rows={3} />
              </Field>
              <Field label="Points clés" wide>
                <StringList value={edit.points} onChange={set('points')} />
              </Field>
              <Field label="Image (survol)" wide>
                <ImageField value={edit.image} onChange={set('image')} ratio="16/9" />
              </Field>
            </div>
            <div className="adm-modal__foot">
              <span />
              <div>
                <button className="adm-btn adm-btn--ghost" onClick={() => setEdit(null)}>
                  Annuler
                </button>
                <button className="adm-btn" onClick={save}>
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
