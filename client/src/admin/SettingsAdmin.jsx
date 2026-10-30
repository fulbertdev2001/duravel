import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Field, Text, Area, StringList, ObjList, ImageField, getPath, setPath, useToast } from './ui';

/* Schéma de l'éditeur de contenus (clé = chemin dans settings) */
const GROUPS = [
  {
    id: 'hero',
    title: 'Accueil — Hero',
    fields: [
      ['hero.eyebrow', 'Sur-titre'],
      ['hero.title', 'Titre principal', 'textarea'],
      ['hero.text', 'Texte', 'textarea'],
      ['hero.cta', 'Texte du bouton'],
      ['hero.image', 'Image plein écran', 'image'],
    ],
  },
  { id: 'marquee', title: 'Bandeau défilant', fields: [['marquee', 'Mots du bandeau', 'list']] },
  {
    id: 'vision',
    title: 'Notre vision',
    fields: [
      ['vision.eyebrow', 'Sur-titre'],
      ['vision.title', 'Titre', 'textarea'],
      ['vision.text', 'Texte', 'textarea'],
      ['vision.image', 'Image', 'image'],
      ['vision.pillars', 'Piliers', 'obj', [{ key: 'title', label: 'Titre' }, { key: 'text', label: 'Texte', type: 'textarea' }]],
    ],
  },
  {
    id: 'stats',
    title: 'Chiffres clés',
    fields: [
      [
        'stats',
        'Compteurs animés',
        'obj',
        [
          { key: 'value', label: 'Valeur', type: 'number' },
          { key: 'suffix', label: 'Suffixe (%, +…)' },
          { key: 'label', label: 'Libellé' },
        ],
      ],
    ],
  },
  {
    id: 'touch',
    title: 'La touche Sebas',
    fields: [
      ['touch.eyebrow', 'Sur-titre'],
      ['touch.title', 'Titre', 'textarea'],
      ['touch.text', 'Texte', 'textarea'],
      ['touch.checks', 'Points forts', 'list'],
    ],
  },
  {
    id: 'founder',
    title: 'Le fondateur',
    fields: [
      ['founder.name', 'Nom', 'text', 'Laisser vide pour afficher « Sebas Rénovation »'],
      ['founder.role', 'Fonction'],
      ['founder.quote', 'Citation', 'textarea'],
      ['founder.text', 'Présentation', 'textarea'],
      ['founder.years', 'Chiffre clé (ex. 20+)'],
      ['founder.yearsLabel', 'Légende du chiffre clé'],
      ['founder.journey', 'Parcours (retour au Sénégal)', 'textarea'],
      ['founder.steps', 'Étapes du parcours', 'list'],
      ['founder.handmade', 'Phrase « réalisé par le fondateur » (galerie)', 'textarea'],
      ['founder.image', 'Portrait principal', 'image'],
      ['founder.image2', 'Portrait secondaire (rond)', 'image'],
    ],
  },
  {
    id: 'method',
    title: 'Méthode de travail',
    fields: [
      ['method.eyebrow', 'Sur-titre'],
      ['method.title', 'Titre'],
      ['method.steps', 'Étapes', 'obj', [{ key: 'title', label: 'Titre' }, { key: 'text', label: 'Texte', type: 'textarea' }]],
    ],
  },
  {
    id: 'cta',
    title: 'Appel à l’action & formulaire',
    fields: [
      ['cta.eyebrow', 'Sur-titre'],
      ['cta.title', 'Titre', 'textarea'],
      ['cta.text', 'Texte', 'textarea'],
      ['projectTypes', 'Types de projet proposés dans le formulaire', 'list'],
    ],
  },
  {
    id: 'contact',
    title: 'Coordonnées',
    fields: [
      ['contact.phone', 'Téléphone'],
      ['contact.email', 'E-mail'],
      ['contact.address', 'Adresse'],
      ['contact.zone', 'Zone d’intervention'],
      ['contact.hours', 'Horaires'],
    ],
  },
  {
    id: 'social',
    title: 'Réseaux sociaux',
    fields: [
      ['social.instagram', 'Instagram (URL)'],
      ['social.facebook', 'Facebook (URL)'],
      ['social.linkedin', 'LinkedIn (URL)'],
      ['social.tiktok', 'TikTok (URL)'],
    ],
  },
  {
    id: 'brand',
    title: 'Marque & SEO',
    fields: [
      ['brand.name', 'Nom de l’entreprise'],
      ['brand.tagline', 'Signature'],
      ['brand.baseline', 'Baseline'],
      ['seo.title', 'Titre SEO (onglet / Google)'],
      ['seo.description', 'Description SEO', 'textarea'],
    ],
  },
];

export default function SettingsAdmin() {
  const [s, setS] = useState(null);
  const [tab, setTab] = useState('hero');
  const [dirty, setDirty] = useState(false);
  const toast = useToast();
  useEffect(() => {
    api.get('/api/admin/settings').then(setS);
  }, []);
  if (!s) return <div className="adm-page">Chargement…</div>;
  const g = GROUPS.find((x) => x.id === tab);
  const upd = (path, v) => {
    setS((o) => setPath(o, path, v));
    setDirty(true);
  };
  const save = async () => {
    try {
      setS(await api.put('/api/admin/settings', s));
      setDirty(false);
      toast('Contenus enregistrés');
    } catch (e) {
      toast(e.message, 'err');
    }
  };

  return (
    <div className="adm-page">
      <header className="adm-head adm-head--sticky">
        <div>
          <h1>Contenus du site</h1>
          <p>Textes, images et coordonnées de toutes les sections.</p>
        </div>
        <button className="adm-btn" onClick={save} disabled={!dirty}>
          {dirty ? 'Enregistrer les modifications' : 'Enregistré ✓'}
        </button>
      </header>
      <div className="adm-settings">
        <nav className="adm-tabs">
          {GROUPS.map((x) => (
            <button key={x.id} className={x.id === tab ? 'is-on' : ''} onClick={() => setTab(x.id)}>
              {x.title}
            </button>
          ))}
        </nav>
        <div className="adm-card">
          <h2>{g.title}</h2>
          <div className="adm-grid">
            {g.fields.map(([path, label, type = 'text', extra]) => {
              const v = getPath(s, path);
              let input;
              if (type === 'textarea') input = <Area value={v} onChange={(x) => upd(path, x)} rows={3} />;
              else if (type === 'image') input = <ImageField value={v} onChange={(x) => upd(path, x)} ratio="16/9" />;
              else if (type === 'list') input = <StringList value={v || []} onChange={(x) => upd(path, x)} />;
              else if (type === 'obj') input = <ObjList value={v || []} fields={extra} onChange={(x) => upd(path, x)} />;
              else input = <Text value={v} onChange={(x) => upd(path, x)} />;
              return (
                <Field key={path} label={label} wide={type !== 'text'} hint={type === 'text' ? extra : undefined}>
                  {input}
                </Field>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
