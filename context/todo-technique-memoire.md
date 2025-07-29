# TODO Liste Technique – Générateur de Mémoires Techniques

> Généré le 2025-07-29 07:50

## 🏗️ Initialisation du projet

- [ ] Créer un nouveau projet Vite + React + TypeScript
- [ ] Ajouter Bun en tant que gestionnaire de scripts
- [ ] Installer Tailwind CSS v4
- [ ] Configurer React Router
- [ ] Installer Zustand pour la gestion d'état
- [ ] Installer localForage et créer un wrapper d'accès aux projets

---

## 📁 Structure de base

- [ ] Créer les dossiers `/components`, `/pages`, `/store`, `/types`, `/lib`, `/assets`
- [ ] Configurer Tailwind (fichier `tailwind.config.ts`)
- [ ] Ajouter routing de base avec React Router

---

## 🧠 Système de projets

- [ ] Définir le type `Project` (TypeScript)
- [ ] Créer une page de gestion des projets (liste, création, suppression)
- [ ] Implémenter la persistance avec localForage
- [ ] Ajouter export `.json` et import `.json`
- [ ] Ajouter export/import `.zip` avec JSZip

---

## 👥 Module Intervenants

- [ ] Créer composant de formulaire pour ajouter un intervenant
- [ ] Enregistrer les intervenants dans le projet
- [ ] Ajouter gestion de snippets favoris

---

## 🧰 Module Moyens Matériels

- [ ] Créer liste simple avec ajout d’éléments
- [ ] Ajouter suggestions auto-complétées (optionnel)
- [ ] Liaison avec le projet + snippets

---

## 📊 Planning IA

- [ ] Créer composant pour paramétrer le planning
- [ ] Générer prompt IA en fonction du projet
- [ ] Envoyer à l’API OpenAI
- [ ] Afficher le résultat (texte + tableau)

---

## 📎 Téléversement de pièces

- [ ] Intégrer `pdf.js` pour lire les PDF
- [ ] Intégrer `mammoth.js` pour lire les `.docx`
- [ ] Extraire texte et injecter dans le contexte IA
- [ ] Résumer automatiquement + générer checklist

---

## 🧠 Génération IA

- [ ] Créer moteur de génération section par section
- [ ] Gérer le prompt dynamique (contexte projet + utilisateur)
- [ ] Appeler l’API OpenAI avec `fetch`
- [ ] Afficher les résultats par section

---

## 📝 Édition manuelle

- [ ] Intégrer `CodeMirror` comme éditeur Markdown
- [ ] Ajouter aperçu en direct (`react-markdown`)
- [ ] Gérer la sauvegarde locale des modifications

---

## 📦 Export

- [ ] Générer PDF via `jsPDF` depuis HTML
- [ ] Générer `.docx` via `docx.js`
- [ ] Export `.html` autonome
- [ ] Générer archive `.zip` complète

---

## 🧭 Interface & Navigation

- [ ] Créer une `Sidebar` pour navigation globale
- [ ] Ajouter `Tabs` horizontaux dans chaque module
- [ ] Définir navigation entre étapes

---

## 🛠️ Utilitaires

- [ ] Créer helper pour appels à OpenAI
- [ ] Créer wrapper localForage (getProject, saveProject, etc.)
- [ ] Gérer les horodatages (création, modification, versions)

---

## 🔒 Sécurité

- [ ] Saisie de la clé OpenAI via `.env.local` (dev)
- [ ] Prompt utilisateur pour la clé en production
- [ ] Ne jamais exposer la clé dans le code public

---

## 🧪 Tests manuels

- [ ] Tester la création et édition d’un projet
- [ ] Vérifier la sauvegarde locale
- [ ] Tester les exports PDF, DOCX, ZIP
- [ ] Vérifier la génération IA sur un exemple complet

