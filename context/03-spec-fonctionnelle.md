# Spécification Fonctionnelle – Générateur de Mémoires Techniques (Open Source)

## Objectif du projet

Développer une application web open source permettant à un architecte ou maître d’œuvre de **générer automatiquement des mémoires techniques** pour des appels d’offres publics.  
L’outil utilise une **IA générative** (via API) et permet une saisie **hybride** : formulaire, fichiers téléversés, et dialogue interactif.  
Le projet sera **déployé sur GitHub Pages** et utilisera le **stockage local du navigateur** (localStorage) sans backend.

---

## Utilisateurs ciblés

- Architectes et maîtres d’œuvre
- Agences souhaitant gagner du temps sur les pièces de réponse
- Utilisateurs francophones, familiarisés avec les marchés publics

---

## Fonctionnalités principales

### 🔧 Génération de contenu

- Génération **de toutes les sections** classiques d’un mémoire technique :
  - Présentation de l’agence
  - Moyens humains
  - Moyens matériels
  - Méthodologie par phase (DIA, APS, APD, PRO, etc.)
  - Organisation de chantier
  - Planning prévisionnel
- **Contenu professionnel, clair et accessible** (pas de jargon inutile)
- **Ton neutre et homogène**, adapté aux appels d’offres

---

### 🧠 Interaction avec l’IA

- Co-construction interactive du mémoire via :
  - **Formulaires structurés**
  - **Dialogue en langage naturel**
  - **Téléversement de pièces de marché (PDF, DOCX)**
- L’IA peut proposer un **planning complet** à partir des éléments fournis
- **Adaptation du contenu** selon :
  - Le **type d’ouvrage** (patrimonial, scolaire, ERP…)
  - Le **profil de l’acheteur public** (commune, département, etc.)

---

### 📁 Analyse automatique des pièces marché

- Téléversement de documents (CCTP, règlement de consultation, etc.)
- Résumé automatique des exigences
- Détection des incohérences ou points d’attention
- **Checklist de conformité** générée automatiquement

---

### 📋 Saisie des intervenants

- Informations structurées :
  - Nom, rôle, diplôme, années d’expérience, missions sur le projet
- Réutilisation possible via **snippets favoris**

---

### 🧰 Moyens matériels

- **Liste simple** des équipements, logiciels, véhicules, etc.
- Génération d’un texte de synthèse automatique si besoin

---

### 🕓 Planning

- Génération automatique par l’IA d’un **planning par phase**
- Paramétrable à partir d’une date de début, complexité ou durée moyenne

---

### 💾 Gestion des données

- **Stockage local dans le navigateur** (via localStorage)
- Pas de backend, pas d’identification
- **Gestion des versions** :
  - Sauvegardes horodatées
  - Possibilité de restauration

---

### 🧩 Réutilisabilité

- Base locale de données réutilisables :
  - Fiches intervenants
  - Éléments de planning
  - Paragraphes types
- **Snippets favoris** insérables dans de nouveaux projets

---

### 📝 Édition et export

- Édition manuelle **complète dans une interface dédiée**
- Export dans plusieurs formats :
  - PDF
  - DOCX
  - Vue HTML

---

## Contraintes techniques

- Application **frontend-only** (type Vite + Vue/React + Tailwind)
- API OpenAI via le package `openai` en mode `dangerouslyAllowBrowser: true`
- Hébergement statique (GitHub Pages)
- Stockage uniquement en localStorage (aucune donnée sur un serveur)
- Code sous **licence libre (ex. MIT ou GPL)**

---

## Objectif à court terme

- Prototyper rapidement un MVP open source
- Couvrir au minimum :
  - Formulaire intervenants
  - Planning IA
  - Présentation de l’agence
  - Export PDF

---

## Évolutions futures possibles

- Ajout de bibliothèques de styles de mémoire par type de marché
- Traduction multilingue (fr/en)
- Intégration d’un moteur LaTeX ou d’un éditeur Markdown pour les utilisateurs avancés
- Option d’export vers plateformes de réponse (ex : AWS, PLACE)

---
