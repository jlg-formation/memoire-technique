# TODO Liste Technique – Générateur de Mémoires Techniques

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

## TODO JLG

- la ou on peut importer un PDF, donner la possibilité d'importer un docx.
- faire une page ou l'on voit la generation du memoire technique en markdown.
- donner une image de garde
- Faire une page ou l'on donne les reference de l'AO ou on repond (numero, date limite)
- faire une page ou l'on donne le RC, le CCTP, le CCAP, l'AE.
- Pour creer un projet il faut donner un titre et un doc pdf (que l'IA va parser pour avoir ses infos)
- tous les boutons doivent avoir cursor-pointer
