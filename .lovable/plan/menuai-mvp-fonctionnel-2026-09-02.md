# MenuAI — MVP fonctionnel

SaaS de transformation de menus restaurant (Bamako · Dakar · Abidjan) : upload d'un menu papier/PDF → page web premium avec images IA, QR code, preview filigranée et déverrouillage payant.

## Adaptation de la stack

Le cahier des charges cite Next.js + Firebase + Replicate + Puppeteer. Le projet tourne sur TanStack Start (React + Vite), avec Lovable Cloud pour base de données, stockage et fonctions serveur, et l'IA intégrée pour l'extraction de texte et la génération d'images. Même produit, mêmes flux — infrastructure déjà disponible, sans comptes externes à créer.

## Identité visuelle

- Orange feu #FF6B2B, noir nuit #0D0D0D, blanc chaud #F5F5F2
- DM Sans (300/400/600/700), mobile-first, ton direct et chaleureux
- Tokens sémantiques dans le design system, images lazy-load

## Périmètre livré

### 1. Landing publique (`/`)
Hero "Transforme ton menu en vitrine digitale", démonstration du avant/après, tarifs (Gratuit / One-shot 10 000 FCFA / Abonnement 5 000 FCFA par mois), CTA "Créer mon menu".

### 2. Tunnel de création (`/creer`)
- Dépôt de fichier PDF, Word, image, ou saisie manuelle
- Formulaire restaurant : nom, ville, téléphone WhatsApp, slug
- Extraction IA : catégories, plats, descriptions, prix, ingrédients, correction orthographique française
- Écran de progression avec étapes visibles
- Écran de vérification : correction des plats extraits avant génération

### 3. Génération visuelle
- Une image IA carrée par plat, prompt optimisé plats africains (tiep, mafé, alloco, brochettes, capitaine)
- Placeholder élégant si la génération échoue (mode dégradé)
- Stockage des images dans le Cloud, réutilisation par plat récurrent

### 4. Page menu publique (`/m/[slug]`)
- Navigation par catégorie en barre sticky
- Carte plat : image, nom, description, prix FCFA, disponibilité
- Bouton "Commander via WhatsApp" pré-rempli
- Mode preview : filigrane "APERÇU MENUAI", 2 plats visibles, reste flouté avec overlay "Déverrouiller", expiration 72 h
- Footer "Créé avec MenuAI"

### 5. Déverrouillage et paiement
- Écran de choix du plan, paiement mobile money (Wave, Orange Money, Moov) via FedaPay/CinetPay
- MVP : intégration structurée avec un mode simulation activable, pour tester le tunnel avant l'obtention des clés marchand
- Après paiement : menu complet, QR code, lien permanent, page de confirmation

### 6. QR code et partage
- QR code PNG + SVG haute résolution téléchargeable
- Lien court copiable en un clic
- Carte "Stories" générée pour Instagram/WhatsApp Status

### 7. Espace admin restaurant (`/admin/[token]`)
- Accès par lien magique, sans mot de passe
- Liste des plats : modifier nom/prix/description en ligne, activer/désactiver, ajouter un plat

## Détails techniques

- Tables Cloud : `restaurants` (slug, ville, whatsapp, plan, expiration preview, token admin), `categories`, `dishes` (nom, description, prix, ingrédients, image, disponible, ordre), `orders` (plan, montant, statut, référence paiement)
- RLS : lecture publique des menus publiés ; écritures via fonctions serveur validées par token admin ; jamais de token exposé côté client
- Extraction et structuration via fonction serveur (IA vision + JSON structuré), génération d'images via fonction serveur avec file d'attente par plat
- PDF haute qualité : rendu depuis le même template menu, généré côté serveur (Puppeteer indisponible sur ce runtime — utilisation d'un générateur PDF compatible edge, rendu fidèle à la preview)
- Webhook paiement sous `/api/public/`, signature vérifiée avant tout déblocage
- Budget de page < 500 Ko, images compressées, chargement paresseux, cible < 3 s en 3G

## Hors périmètre (phases 2 et 3)

Programme revendeur, agent de prospection Google Maps, analytics restaurant, multilingue FR/EN, API partenaires, shooting photo.
