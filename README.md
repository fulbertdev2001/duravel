# Sebas Rénovation — site vitrine + portfolio

Site « tout-en-un » pour **Sebas Rénovation** (rénovation & finitions d’exception) :
vitrine animée, portfolio immersif, comparateur avant/après, formulaire de devis et back-office complet.

**Stack** : React 18 + Vite + Framer Motion + Lenis (front) · Express 5 + SQLite (better-sqlite3) + Sharp (API & admin).

## Démarrage rapide

```bash
npm install                 # concurrently (racine)
npm run install:all         # dépendances server + client
cp server/.env.example server/.env   # puis ajustez
npm run dev                 # API :4000 + Vite :5173 (proxy /api et /uploads)
```

Production (un seul process Node qui sert l’API, les médias et le front buildé) :

```bash
npm run build && npm start  # http://localhost:4000
```

Admin : `/admin` — identifiants du `.env` (par défaut `admin@duravelbuilding.com` / `ChangeMoi!2026`, **à changer**).

## Ce qui est inclus

**Site public**
- Préchargeur : logo vectorisé qui se dessine + compteur, rideaux de transition entre pages.
- Hero : la photo s’ouvre en plein écran au scroll, titre en révélation mot par mot, inclinaison à la souris.
- Bandeaux défilants accélérés par la vitesse de scroll, curseur personnalisé avec libellés (« Explorer », « Glisser »…), boutons magnétiques, grain filmique.
- Expertises : lignes XXL, image qui suit la souris, accordéon.
- **Réalisations** : défilement horizontal épinglé avec skew selon la vitesse, aperçu « avant » au survol.
- **Avant / Après** : comparateur glissable (souris, tactile, clavier) avec démonstration automatique.
- Mur d’images en parallaxe + visionneuse plein écran (clavier, swipe, vignettes).
- Fondateur, chiffres animés, méthode en 4 étapes épinglée, formulaire de devis (anti-spam, limite de débit).
- Pages projet : hero 3D, galerie en cartes empilées au scroll, comparateur, projet suivant.
- Responsive, `prefers-reduced-motion` respecté, polices auto-hébergées (pas de Google Fonts → RGPD), balises SEO/OG générées côté serveur par page.

**Admin** (`/admin`)
- Réalisations : création/édition, couverture, avant/après, galerie (glisser pour réordonner, légendes), tags, publication, ordre.
- Expertises, tous les textes et images du site (hero, vision, chiffres, fondateur, méthode, CTA, coordonnées, réseaux, SEO).
- Demandes de devis (lu/non lu, réponse e-mail, export CSV) · médiathèque (glisser-déposer, conversion WebP auto) · mot de passe.

## Données & déploiement
- Base : `server/data/duravel.sqlite` · médias : `server/uploads/` → à placer sur un volume persistant et à sauvegarder.
- Au premier lancement, les photos du client (`server/seed-assets/`) sont copiées dans `uploads/` et le contenu est pré-rempli.
  `npm run seed` réinitialise le contenu (⚠ écrase les réalisations/services/textes).
- Derrière Nginx/Apache : proxy vers le port Node ; Node ≥ 18 (testé en 22).

## Points à valider avec le client
- **E-mail de contact** : la présentation fournie indiquait `contact@seba-renovation.fr` (marque Sebas) — repris par défaut, à confirmer.
- Nom du fondateur, adresse/zone d’intervention, réseaux sociaux, lieu/année des chantiers : champs prévus, laissés vides faute d’info.
- Correspondance avant/après déduite des photos (agencement fenêtre/WC et faïence) — à confirmer.
- Les chiffres clés sont factuels (3 expertises, 4 étapes…) : à remplacer par de vrais chiffres (années, chantiers) si disponibles.
