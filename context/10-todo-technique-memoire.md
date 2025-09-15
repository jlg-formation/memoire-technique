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
- [ ] Rendre l'appli responsive

---

## 🧪 Tests manuels

- [ ] Tester la création et édition d’un projet
- [ ] Vérifier la sauvegarde locale
- [ ] Tester les exports PDF, DOCX, ZIP
- [ ] Vérifier la génération IA sur un exemple complet

## TODO JLG

- donner une image de garde
- Entrer les references : photos avec label, texte en vrac. Utiliser IA pour trouver montant HT travaux, MOA, année.
- Gerer le reportage photographique de la visite avec texte associé éditable et reformulable.
- Retrouver le nom du MOA
