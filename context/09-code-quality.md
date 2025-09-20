# GitHub Copilot Instructions

Ces règles doivent guider toute génération de code (Copilot, Codex, etc.) pour ce projet.  
Elles sont obligatoires sauf mention explicite contraire.

---

## 1. Project Structure

- Organisation claire (components, hooks, utils, types, stores, etc.)
- Respecter les guidelines TailwindCSS
- Fichiers ≤ 300 lignes (refactor obligatoire au-delà)
- Idéalement viser 100–150 lignes par fichier
- Séparer les responsabilités (petits composants, petits hooks)
- Pas de fonctions ou composants "fourre-tout"

---

## 2. TypeScript Rules

- Utiliser `strict` mode
- Toujours définir des types explicites
- Interdire `any`
- Utiliser `interface` ou `type` selon le besoin
- Éviter au maximum les propriétés optionnelles (`?`) dans les interfaces
  - Par défaut, toutes les propriétés doivent être obligatoires
  - Les `?` sont tolérés uniquement pour modéliser des données externes (ex: API OpenAI ou Supabase)
  - Toujours valider ces cas avec Zod avant utilisation
- Implémenter un type narrowing approprié
- Interdire totalement `null`
  - Utiliser uniquement `undefined` pour l’absence de valeur
  - Ne jamais typer avec `null` ou `T | null`
- Pas de fonctions qui retournent `T | undefined`
  - Une fonction doit soit retourner un `T` garanti, soit lever une erreur
- Toujours typer les fonctions async avec `Promise<Type>`

---

## 3. Code Quality

- ESLint + Prettier obligatoires
- Fonctions utilitaires : max 20 lignes
- Hooks personnalisés : max 30–40 lignes
- Composants React : max 50–80 lignes
- Fichiers : max 300 lignes
- Préférer des early return (`if (...) return`) ou `throw` plutôt que `else`
- Variables/fonctions avec noms clairs (éviter abréviations obscures)
- Imports ordonnés : externes → internes → relatifs
- Utiliser des path aliases (`@/…`) pour éviter `../../../../`
- Interdiction des `console.log` en prod (utiliser un logger)
- Toujours destructurer si pertinent
- Pas de duplication de code → réutiliser les fonctions/composants existants

---

## 4. Git / Workflow

- Historique linéaire (utiliser `rebase`, jamais `merge`)
- Commit messages conventionnels : `feat:`, `fix:`, `refactor:`, `test:`, `docs:`
- Pas de commit direct sur `main` → toujours via PR
- PR petites, testées, cohérentes et faciles à relire

---

## 5. Performance Optimization

- Code splitting
- Utiliser `React.memo`, `useMemo`, `useCallback` pour limiter les re-renders
- Dynamic imports
- Petits composants réutilisables
- Débounce/throttle pour les entrées utilisateurs

---

## 6. State Management

- Zustand uniquement
- Stores découpés par logique métier
- Pas de prop drilling
- État toujours immuable
- Centraliser la logique métier

---

## 7. Data Fetching

- Utiliser uniquement le serveur OpenAI pour appeler l’IA
- Pas de mock de données (ni dev, ni prod)
- Pas de polling inutile

---

## 8. Security Practices

- Zod pour valider/sanitizer toutes les entrées utilisateurs
- Supabase Auth + RLS obligatoires
- Jamais exposer d’informations sensibles
- Utiliser des variables d’environnement pour les secrets
- Pas d’`eval` ni d’exécution dynamique dangereuse

---

## 9. Error Handling

- Créer un global error boundary
- Logger les erreurs avec contexte
- Toujours afficher une erreur à l’utilisateur (toast, UI friendly)
- Jamais d’échec silencieux
- Utiliser `try/catch` pour toutes les opérations async

---

## 10. Styling

- TailwindCSS v4 uniquement
- Pas d’inline styles
- Créer des composants de style réutilisables
- Responsive design obligatoire
- Utiliser uniquement les icônes Lucide React

---

## 11. Testing

- Jest + React Testing Library
- Tester les chemins heureux + erreurs + edge cases
- Éviter les snapshot tests aveugles
- Chaque test doit avoir une seule responsabilité
- Mock des dépendances externes
- Tester aussi l’accessibilité (axe, jest-axe)

---

## 12. Accessibility

- Respecter WCAG
- Utiliser HTML sémantique
- aria-attributes corrects
- Gérer `:focus-visible`, ne jamais supprimer `outline`
- Alt obligatoire sur toutes les images
- Contraste des couleurs vérifié (via Tailwind config)
- Boutons = composant dédié, toujours `cursor-pointer`

---

## 13. React Rules

- Les hooks doivent toujours commencer par `use`
- Pas de hooks dans des boucles ou des conditions
- Extraire la logique dans des custom hooks si besoin
- Pas de fonctions anonymes inline dans les props
- Nommer les props booléennes avec `is/has/can/should`
- Grouper les props dans un objet typé si leur nombre dépasse 5

---

## 14. Internationalization

- Utiliser next-18next
- Prévoir expansion des textes
- Implémenter un switcher de langue
- Supporter plusieurs contextes de langue

---

## 15. Environment Configuration

- `.env.local` pour les secrets
- Jamais commiter d’informations sensibles
- Env files séparés par environnement
- Toujours valider les env vars
- `.gitignore` doit contenir `node_modules` et `.env*`

---

## 16. CI/CD

- Pre-commit hooks avec lint + tests
- Build, lint et tests obligatoires avant merge
- Vérifier la taille des bundles
- CI doit échouer si la couverture minimale n’est pas respectée

---

## 17. Async and Promises

- Toujours utiliser `async/await` pour gérer les promesses
- Interdire `.then()`, `.catch()`, `.finally()` sauf si une API externe l’exige
- Les erreurs doivent être gérées avec `try/catch`
- Pas de promesses imbriquées, garder un flow clair

---

## 18. Control Flow Rules

- Éviter l’utilisation de `else`
- Préférer des early return (`if (...) return …`) ou `throw new Error(...)`
- Minimiser les niveaux d’imbrication
- Chaque bloc de contrôle doit avoir une seule responsabilité

---

## 19. Function Size Rules

- Fonctions utilitaires : max 20 lignes
- Hooks personnalisés : max 30–40 lignes
- Composants React : max 50–80 lignes
- Fichiers : max 300 lignes (refactor obligatoire)
- Toujours décomposer si une fonction devient trop longue

---

## 20. Comments and Documentation

- Ajouter des commentaires uniquement quand c’est nécessaire
- Éviter les commentaires qui expliquent **ce que fait le code**
- Privilégier les commentaires qui expliquent **pourquoi ce choix**
- Utiliser JSDoc pour les fonctions complexes ou API publiques
- Les commentaires doivent être clairs, concis et en anglais

---

## 21. Naming Conventions

- Composants React : `PascalCase`
- Constantes globales : `UPPER_SNAKE_CASE`
- Fichiers et dossiers : `kebab-case`
- Variables/fonctions : `camelCase`
- Props booléennes : `is/has/can/should` pour plus de clarté
- Pas d’abréviations obscures (`cfg`, `btn`, etc.)

---

## 22. Documentation and ADR

- Documenter les décisions techniques importantes (ADR = Architecture Decision Records)
- Chaque choix non trivial doit être justifié dans un commentaire WHY ou dans un ADR
- Copilot doit privilégier des explications quand un pattern inhabituel est choisi
