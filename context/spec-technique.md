# Spécification Technique – Générateur de Mémoires Techniques (Open Source)

## 1. Architecture générale

### Type d’application

- **Frontend only SPA** (Single Page Application)
- Hébergée sur **GitHub Pages**
- **Pas de backend**
- **Stockage local avec `localForage`**

### Stack technique

- **Vite**
- **React**
- **Bun** (pour le développement / scripts)
- **Zustand** (gestion d’état)
- **localForage** (stockage structuré)
- **TypeScript**
- **Tailwind CSS v4**
- **React Router**
- **OpenAI API** (via `dangerouslyAllowBrowser: true`)

---

## 2. Structure des fichiers

```
/components      → composants réutilisables
/pages           → routage React Router
/store           → Zustand (avec éventuel persist)
/lib             → helpers (IA, parsing, export…)
/types           → interfaces TypeScript
/assets          → images, icônes, logos…
```

---

## 3. Modules principaux

### 📄 Projets

- Création/édition de projets via formulaire
- Sauvegarde via `localForage` (clé = ID projet)
- Export `.json` ou `.zip` (via JSZip)

### 👥 Intervenants

- Saisie structurée : nom, rôle, diplôme, missions
- Stockage dans le projet + snippets favoris

### 🧰 Moyens matériels

- Liste simple (text input)
- Possibilité d’enregistrer comme snippet

### 📊 Planning

- Génération automatique par l’IA
- Paramètres : type de bâtiment, date de début
- Sortie texte + tableau (markdown ou HTML)

### 📎 Pièces marché (upload)

- PDF via `pdf.js`
- DOCX via `mammoth.js`
- Extraction automatique du texte
- Résumé et checklist générés par l’IA

### 🧠 Génération IA

- Appels à l’API OpenAI (`gpt-4o`)
- Construction du contexte : projet + intervenants + pièces
- Ton neutre et professionnel
- Pas de réécriture contextuelle à la volée

### 📝 Éditeur Markdown

- Composant `CodeMirror` + `react-markdown`
- Édition manuelle complète
- Aperçu en direct
- Pas d’éditeur WYSIWYG ni de suggestions IA

### 📦 Export

- Export vers :
  - `.pdf` (Markdown → HTML → `jsPDF`)
  - `.docx` (`docx.js`)
  - `.html` (version lisible)
- Export du projet entier en `.json` ou `.zip`

---

## 4. Interface utilisateur (UI/UX)

- **Sidebar** latérale pour les grandes sections
- **Tabs** horizontaux pour les sous-sections
- Interface en **français**
- Design sobre, en mode clair
- Navigation fluide entre étapes

---

## 5. Stockage et persistance

- **`localForage`** pour tous les projets, versions, snippets
- Gestion des versions horodatées
- Fonction de restauration d’une version
- Import/export de projets `.json` et `.zip`

---

## 6. Sécurité & confidentialité

- Clé OpenAI stockée uniquement en mémoire (ou localStorage)
- Saisie via `.env.local` (dev) ou prompt utilisateur (prod)
- Aucune donnée transmise hors OpenAI
- Aucune sauvegarde sur serveur distant

---

## 7. Déploiement

- Déploiement via GitHub Pages
- Commande `bun run build` → `vite build`
- Script `gh-pages` pour push auto
- Fichier `.nojekyll` pour compatibilité
- Licence : **MIT** (open source)

---

## 8. Bibliothèques utilisées (principales)

| Fonction        | Lib choisie                 |
| --------------- | --------------------------- |
| Build           | Vite + Bun                  |
| UI              | React + Tailwind CSS v4     |
| Routage         | React Router                |
| État            | Zustand                     |
| Persistance     | localForage                 |
| PDF parsing     | pdf.js                      |
| DOCX parsing    | mammoth.js                  |
| PDF export      | jsPDF                       |
| DOCX export     | docx                        |
| IA              | OpenAI API (GPT-4o)         |
| Markdown        | CodeMirror + react-markdown |
| Compression ZIP | JSZip + FileSaver.js        |
