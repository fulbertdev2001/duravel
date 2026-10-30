import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();
dotenv.config({ path: path.join(__dirname, '.env') });

import db, { UPLOAD_DIR, setSettings } from './db.js';
const ASSETS = path.join(__dirname, 'seed-assets');
const u = (f) => `/uploads/${f}`;

export const DEFAULT_SETTINGS = {
  brand: {
    name: 'Duravel Building',
    tagline: 'Excellence technique, le style en plus.',
    baseline: 'Rénovation & finitions d’exception',
  },
  hero: {
    eyebrow: 'Excellence technique, le style en plus.',
    title: 'La précision du geste, l’élégance du résultat.',
    text: 'Votre partenaire spécialisé dans la rénovation d’intérieurs et les travaux de finition haute exigence.',
    image: u('calacatta-vue-ensemble.webp'),
    cta: 'Demander un devis',
  },
  marquee: ['Rénovation globale', 'Second œuvre', 'Finitions design', 'Salles de bain', 'Carrelage grand format', 'Peinture & revêtements'],
  vision: {
    eyebrow: '01 / Notre vision',
    title: 'Sublimer vos espaces par une maîtrise technique irréprochable.',
    text: 'Chaque projet de rénovation nécessite un soin extrême apporté aux détails. Duravel Building allie rigueur de chantier, respect des délais et sens de l’esthétique pour transformer vos intérieurs avec élégance.',
    image: u('calacatta-douche-verre.webp'),
    pillars: [
      { title: 'Rigueur d’exécution', text: 'Préparation méticuleuse des supports et des finitions.' },
      { title: 'Sens du style', text: 'Harmonie des matériaux, textures et lumières.' },
      { title: 'Chantier propre', text: 'Organisation optimale et respect de l’habitat.' },
    ],
  },
  touch: {
    eyebrow: '03 / La touche Duravel',
    title: 'L’alliance parfaite entre savoir-faire artisan et esthétique contemporaine.',
    text: 'Là où d’autres s’arrêtent à la simple pose, Duravel Building apporte un œil esthétique avisé, garantissant des raccords invisibles, des lignes épurées et une mise en valeur durable de votre patrimoine.',
    checks: ['Conseil en choix de matériaux', 'Finitions haute précision', 'Suivi personnalisé du chantier'],
  },
  founder: {
    name: '',
    role: 'Fondateur & dirigeant',
    quote: 'Un chantier réussi, c’est celui où chaque détail a été pensé avant d’être posé.',
    text: 'À la tête de Duravel Building, il suit personnellement chaque projet, de la première visite technique jusqu’à la réception des travaux. Un interlocuteur unique, exigeant sur la qualité d’exécution comme sur le rendu final.',
    image: u('fondateur-costume.webp'),
    image2: u('fondateur-portrait.webp'),
  },
  stats: [
    { value: 3, suffix: '', label: 'Domaines d’expertise' },
    { value: 4, suffix: '', label: 'Étapes maîtrisées' },
    { value: 1, suffix: '', label: 'Interlocuteur unique' },
    { value: 100, suffix: '%', label: 'Sur mesure' },
  ],
  method: {
    eyebrow: '04 / Méthode de travail',
    title: 'Quatre étapes, zéro improvisation.',
    steps: [
      { title: 'Conseil & Étude', text: 'Visite technique, définition du besoin et sélection des matériaux.' },
      { title: 'Préparation', text: 'Protection complète et traitement rigoureux des supports.' },
      { title: 'Réalisation', text: 'Travaux de rénovation et application des finitions.' },
      { title: 'Livraison', text: 'Nettoyage minutieux et réception de votre nouvel intérieur.' },
    ],
  },
  cta: {
    eyebrow: 'Excellence technique, le style en plus.',
    title: 'Donnez du style à vos projets de rénovation.',
    text: 'Contactez nos équipes pour un devis sur mesure ou une étude technique de vos finitions.',
  },
  contact: {
    email: 'contact@seba-renovation.fr',
    phone: '04 67 17 65 57',
    address: '',
    hours: 'Du lundi au vendredi, 8h – 18h',
    zone: '',
    whatsapp: '',
  },
  social: { instagram: '', facebook: '', linkedin: '', tiktok: '' },
  seo: {
    title: 'Duravel Building — Rénovation & finitions d’exception',
    description:
      'Duravel Building : rénovation d’intérieurs, salles de bain, carrelage grand format, peinture et finitions haute exigence. Découvrez nos réalisations et demandez votre devis.',
  },
  projectTypes: ['Salle de bain', 'Rénovation intérieure', 'Peinture & revêtement', 'Sols & carrelage', 'Autre'],
};

const SERVICES = [
  {
    title: 'Peinture & Revêtement',
    icon: 'paint',
    tag: 'Finition impeccable',
    summary: 'Application soignée de peintures haut de gamme, enduits décoratifs et papiers peints design.',
    points: ['Peintures haut de gamme', 'Enduits décoratifs', 'Papiers peints design', 'Préparation des supports'],
    image: u('calacatta-wc-fenetre.webp'),
  },
  {
    title: 'Rénovation Intérieure',
    icon: 'home',
    tag: 'Clé en main',
    summary: 'Redistribution des espaces, réaménagement complet, plâtrerie et agencement sur mesure.',
    points: ['Redistribution des espaces', 'Réaménagement complet', 'Plâtrerie', 'Agencement sur mesure'],
    image: u('calacatta-vasque-porte.webp'),
  },
  {
    title: 'Sols & Salles de Bain',
    icon: 'grid',
    tag: 'Détails & esthétique',
    summary: 'Pose experte de parquets, carrelages grand format, faïences et agencements sanitaires.',
    points: ['Carrelage grand format', 'Faïences & crédences', 'Parquets', 'Agencements sanitaires'],
    image: u('onyx-vasque-miroir.webp'),
  },
];

const PROJECTS = [
  {
    slug: 'salle-de-bain-marbre-blanc',
    title: 'Salle de bain Marbre Blanc',
    category: 'Salle de bain',
    year: '',
    location: '',
    duration: '',
    accent: '#8a8f98',
    summary:
      'Rénovation complète d’une salle de bain : grands formats effet marbre veiné du sol au plafond, robinetterie noir mat et douche vitrée.',
    description:
      'L’ancienne salle de bain — faïence beige, frise décorative et baignoire avec paroi coulissante — a été entièrement déposée pour repartir sur des supports sains.\n\nLe parti pris : un effet marbre blanc veiné posé en grand format sur les murs comme au sol, pour une continuité visuelle totale et des joints réduits au minimum. Les accessoires noir mat (robinetterie, barres, porte-serviettes) dessinent les lignes de la pièce.\n\nUne douche à paroi vitrée coulissante avec colonne de douche pluie remplace la baignoire, et un meuble vasque blanc à plan effet marbre et poignées noires complète l’ensemble, surmonté d’un miroir lumineux.',
    cover: u('calacatta-vue-ensemble.webp'),
    before_img: u('calacatta-avant.webp'),
    after_img: u('calacatta-wc-fenetre.webp'),
    gallery: [
      { src: u('calacatta-vue-ensemble.webp'), caption: 'Vue d’ensemble — continuité sol/murs' },
      { src: u('calacatta-douche-verre.webp'), caption: 'Douche vitrée & colonne pluie noir mat' },
      { src: u('calacatta-vasque-porte.webp'), caption: 'Meuble vasque & miroir lumineux' },
      { src: u('calacatta-meuble-detail.webp'), caption: 'Détail du meuble et des raccords au sol' },
      { src: u('calacatta-wc-fenetre.webp'), caption: 'Raccords d’angle et encadrement de fenêtre' },
    ],
    tags: ['Carrelage grand format', 'Plomberie', 'Robinetterie noir mat', 'Paroi de douche', 'Meuble vasque'],
    featured: 1,
    sort: 1,
  },
  {
    slug: 'salle-de-bain-onyx-bleu',
    title: 'Salle de bain Onyx Bleu',
    category: 'Salle de bain',
    year: '',
    location: '',
    duration: '',
    accent: '#5b7aa0',
    summary:
      'Un écrin minéral : carrelage effet onyx bleu veiné d’or, miroir LED à tablette intégrée et meuble à façades chevrons.',
    description:
      'Point de départ : une salle de bain datée, carrelage beige à frise, baignoire-douche et vasque marbrée.\n\nLe projet mise sur un matériau fort : un grand format effet onyx bleu aux veines dorées, posé du sol au plafond. Face à lui, un meuble blanc aux façades à motif chevrons et un plan de vasque quartz blanc apportent la respiration.\n\nLe miroir LED à découpe organique et tablette noire intégrée sert à la fois d’éclairage et de pièce signature, en écho à la robinetterie noir mat.',
    cover: u('onyx-vasque-miroir.webp'),
    before_img: u('onyx-avant.webp'),
    after_img: u('onyx-vasque-miroir.webp'),
    gallery: [{ src: u('onyx-vasque-miroir.webp'), caption: 'Meuble chevrons, plan quartz et miroir LED' }],
    tags: ['Carrelage effet onyx', 'Miroir LED', 'Meuble sur mesure', 'Robinetterie noir mat'],
    featured: 1,
    sort: 2,
  },
];

export function seed({ force = false } = {}) {
  // copie des visuels du client dans uploads/
  for (const f of fs.readdirSync(ASSETS)) {
    const dest = path.join(UPLOAD_DIR, f);
    if (!fs.existsSync(dest)) fs.copyFileSync(path.join(ASSETS, f), dest);
  }

  const hasSettings = db.prepare('SELECT COUNT(*) c FROM settings').get().c > 0;
  if (force || !hasSettings) setSettings(DEFAULT_SETTINGS);

  const hasServices = db.prepare('SELECT COUNT(*) c FROM services').get().c > 0;
  if (force) db.prepare('DELETE FROM services').run();
  if (force || !hasServices) {
    const st = db.prepare(
      'INSERT INTO services (title, icon, tag, summary, points, image, sort) VALUES (?,?,?,?,?,?,?)'
    );
    SERVICES.forEach((s, i) => st.run(s.title, s.icon, s.tag, s.summary, JSON.stringify(s.points), s.image, i + 1));
  }

  const hasProjects = db.prepare('SELECT COUNT(*) c FROM projects').get().c > 0;
  if (force) db.prepare('DELETE FROM projects').run();
  if (force || !hasProjects) {
    const st = db.prepare(`INSERT INTO projects
      (slug,title,category,location,year,duration,summary,description,cover,before_img,after_img,gallery,tags,accent,featured,sort)
      VALUES (@slug,@title,@category,@location,@year,@duration,@summary,@description,@cover,@before_img,@after_img,@gallery,@tags,@accent,@featured,@sort)`);
    for (const p of PROJECTS) st.run({ ...p, gallery: JSON.stringify(p.gallery), tags: JSON.stringify(p.tags) });
  }

  const email = (process.env.ADMIN_EMAIL || 'admin@duravelbuilding.com').toLowerCase();
  const pwd = process.env.ADMIN_PASSWORD || 'ChangeMoi!2026';
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (!existing) {
    db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)').run(email, bcrypt.hashSync(pwd, 10));
    console.log(`[seed] Compte admin créé : ${email}`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  seed({ force: process.argv.includes('--force') });
  console.log('[seed] Terminé.');
}
