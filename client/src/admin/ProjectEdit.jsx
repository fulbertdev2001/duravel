import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Field, Text, Area, Toggle, StringList, ImageField, GalleryField, useToast } from './ui';

const EMPTY = {
  title: '',
  slug: '',
  category: 'Salle de bain',
  location: '',
  year: '',
  duration: '',
  summary: '',
  description: '',
  cover: '',
  before_img: '',
  after_img: '',
  gallery: [],
  tags: [],
  featured: true,
  published: true,
};

export default function ProjectEdit() {
  const { id } = useParams();
  const isNew = id === 'new';
  const [p, setP] = useState(isNew ? EMPTY : null);
  const [saving, setSaving] = useState(false);
  const nav = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (!isNew) api.get(`/api/admin/projects/${id}`).then(setP);
  }, [id, isNew]);
  if (!p) return <div className="adm-page">Chargement…</div>;
  const set = (k) => (v) => setP({ ...p, [k]: v });

  const save = async () => {
    if (!p.title.trim()) return toast('Le titre est requis', 'err');
    setSaving(true);
    try {
      const r = isNew ? await api.post('/api/admin/projects', p) : await api.put(`/api/admin/projects/${id}`, p);
      toast('Réalisation enregistrée');
      if (isNew) nav(`/admin/realisations/${r.id}`, { replace: true });
      else setP(r);
    } catch (e) {
      toast(e.message, 'err');
    }
    setSaving(false);
  };

  return (
    <div className="adm-page">
      <header className="adm-head adm-head--sticky">
        <div>
          <Link to="/admin/realisations" className="adm-link">
            ← Réalisations
          </Link>
          <h1>{isNew ? 'Nouvelle réalisation' : p.title}</h1>
        </div>
        <div className="adm-head__act">
          <Toggle checked={p.published} onChange={set('published')} label={p.published ? 'Publiée' : 'Brouillon'} />
          {!isNew && (
            <a className="adm-btn adm-btn--ghost" href={`/realisations/${p.slug}`} target="_blank" rel="noreferrer">
              Prévisualiser ↗
            </a>
          )}
          <button className="adm-btn" onClick={save} disabled={saving}>
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </header>

      <div className="adm-cols">
        <div className="adm-card">
          <h2>Informations</h2>
          <div className="adm-grid">
            <Field label="Titre *" wide>
              <Text value={p.title} onChange={set('title')} placeholder="Ex. Salle de bain Marbre Blanc" />
            </Field>
            <Field label="Catégorie">
              <Text value={p.category} onChange={set('category')} list="cats" />
              <datalist id="cats">
                {['Salle de bain', 'Rénovation intérieure', 'Peinture & revêtement', 'Sols & carrelage', 'Cuisine'].map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </Field>
            <Field label="Adresse URL (slug)" hint="Laisser vide : généré depuis le titre">
              <Text value={p.slug} onChange={set('slug')} />
            </Field>
            <Field label="Lieu">
              <Text value={p.location} onChange={set('location')} placeholder="Ville / quartier" />
            </Field>
            <Field label="Année">
              <Text value={p.year} onChange={set('year')} placeholder="2026" />
            </Field>
            <Field label="Durée du chantier">
              <Text value={p.duration} onChange={set('duration')} placeholder="3 semaines" />
            </Field>
            <Field label="Résumé (accroche)" wide>
              <Area rows={3} value={p.summary} onChange={set('summary')} />
            </Field>
            <Field label="Description détaillée" hint="Séparez les paragraphes par une ligne vide." wide>
              <Area rows={9} value={p.description} onChange={set('description')} />
            </Field>
            <Field label="Prestations / matériaux (tags)" wide>
              <StringList value={p.tags} onChange={set('tags')} placeholder="Ajouter un tag puis Entrée" />
            </Field>
          </div>
        </div>

        <div className="adm-stack">
          <div className="adm-card">
            <h2>Image de couverture</h2>
            <ImageField value={p.cover} onChange={set('cover')} ratio="4/5" />
          </div>
          <div className="adm-card">
            <h2>Avant / Après</h2>
            <p className="adm-muted">Ces deux images alimentent le comparateur interactif.</p>
            <div className="adm-grid adm-grid--2">
              <Field label="Avant">
                <ImageField value={p.before_img} onChange={set('before_img')} ratio="3/4" />
              </Field>
              <Field label="Après">
                <ImageField value={p.after_img} onChange={set('after_img')} ratio="3/4" />
              </Field>
            </div>
          </div>
        </div>
      </div>

      <div className="adm-card">
        <h2>Galerie</h2>
        <GalleryField value={p.gallery} onChange={set('gallery')} />
      </div>
    </div>
  );
}
