# GitHub Copilot Instructions

Ces règles guident toute génération de code (Copilot, Codex, etc.) pour ce projet.  
Elles sont obligatoires sauf mention explicite contraire.

---

## 1. Project Structure

- Organisation claire : `components`, `hooks`, `utils`, `types`, `stores`
- Respecter les guidelines TailwindCSS
- Fichiers ≤ 300 lignes (refactor obligatoire au-delà, viser 100–150)
- Composants et hooks petits et réutilisables
- Pas de fonctions ou composants “fourre-tout”

---

## 2. TypeScript Rules

- `strict` mode activé
- Types explicites obligatoires
- `any` interdit
- Utiliser `interface` ou `type` selon besoin
- Éviter les champs optionnels (`?`) sauf si imposés par une API externe (valider avec Zod)
- Pas de `null` (toujours `undefined` pour absence de valeur)
- Pas de fonctions qui retournent `T | undefined` → toujours `T` ou `throw`
- Type narrowing obligatoire
- Fonctions async toujours typées `Promise<Type>`
- Utiliser uniquement la syntaxe ECMAScript Modules (ESM) : `import` / `export`
- Éviter totalement la syntaxe CommonJS (`require`, `module.exports`)

---

## 3. Code Quality

- ESLint + Prettier obligatoires
- Fonctions utilitaires ≤ 20 lignes, hooks ≤ 40, composants ≤ 80, fichiers ≤ 300
- Préférer early return / `throw` plutôt que `else`
- Inciter les Guard clauses dans les fonctions et sortir le plus tôt possible
- Quand plusieurs cas doivent être gérés dans une fonction, gérer le cas le plus simple d'abord et sortir.
- Eviter le code qui part à droite (avoid pyramid of doom)
- Variables/fonctions : noms explicites, pas d’abréviations obscures
- Imports ordonnés : externes → internes → relatifs
- Utiliser des path aliases (`@/…`) au lieu de chemins relatifs longs
- Pas de `console.log` en prod → logger dédié
- Éviter la duplication, réutiliser l’existant
- Toujours destructurer si pertinent
- **Préférer `for…of` aux `.forEach()`**
  - Plus lisible et compatible avec `async/await`
  - Utiliser `.map`, `.filter`, `.reduce` uniquement pour la transformation de données pure
  - Éviter complètement `.forEach()`
- **Détecter et éviter toute utilisation de fonctions dépréciées**
  - Ne jamais proposer ou générer de code avec des API marquées comme `@deprecated`
  - Toujours proposer une alternative moderne quand une fonction dépréciée existe

---

## 4. Git / Workflow

- Historique linéaire (`rebase`, jamais `merge`)
- Commit messages conventionnels : `feat:`, `fix:`, `refactor:`, etc.
- Pas de commit direct sur `main`
- PR petites, cohérentes, testées et faciles à relire

---

## 5. Performance Optimization

- Code splitting + dynamic imports
- `React.memo`, `useMemo`, `useCallback` pour limiter les re-renders
- Composants petits et spécialisés
- Débounce/throttle pour entrées utilisateurs

---

## 6. State Management

- Zustand uniquement
- Stores découpés par logique métier
- Pas de prop drilling
- État immuable et centralisé

---

## 7. Data Fetching

- Appels uniquement via serveur OpenAI
- Pas de mock (dev ni prod)
- Pas de polling inutile

---

## 8. Security Practices

- Zod pour valider toutes les entrées utilisateurs
- Supabase Auth + RLS obligatoires
- Jamais exposer d’informations sensibles
- Secrets uniquement en variables d’environnement
- Pas d’`eval` ni exécution dynamique dangereuse

---

## 9. Error Handling

- Global error boundary
- Logger avec contexte
- Toujours afficher un message clair à l’utilisateur (toast, UI friendly)
- Jamais d’échec silencieux
- `try/catch` pour toutes les opérations async

---

## 10. Styling

- TailwindCSS v4 uniquement
- Pas d’inline styles
- Créer des composants de style réutilisables
- Responsive design obligatoire
- Icônes Lucide React obligatoires pour représenter des actions, statuts ou visuels
- **Éviter les caractères emoji en UI**
  - Toujours préférer une icône Lucide React quand c’est possible
  - Les emoji peuvent être tolérés uniquement dans du contenu textuel ou des tests rapides
- **Interdire les SVG inline** dans le code JSX/TSX
  - Toujours importer les icônes via Lucide React
  - Pas d’éléments `<svg>…</svg>` écrits à la main

---

## 11. Testing

- Jest + React Testing Library
- Tester chemins heureux, erreurs, edge cases
- Éviter snapshot tests aveugles
- Chaque test = une seule responsabilité
- Mock des dépendances externes
- Tester aussi l’accessibilité (axe, jest-axe)

---

## 12. Accessibility

- Respect WCAG
- HTML sémantique + aria corrects
- `:focus-visible` géré, jamais supprimer `outline`
- Alt obligatoire sur toutes les images
- Contraste des couleurs vérifié (via Tailwind config)
- Boutons = composant dédié + `cursor-pointer`

---

## 13. React Rules

- Hooks toujours nommés `useXxx`
- Pas de hooks dans conditions ou boucles
- Extraire en custom hooks si besoin
- Pas de fonctions anonymes inline dans les props
- Props booléennes avec `is/has/can/should`
- Grouper les props dans un objet typé si > 5
- **Ne pas renommer les propriétés lors de la déstructuration des hooks**
  - Préférer `const { isValid, isTested } = useApiKeyValidation();`
  - Éviter `const { isValid: apiKeyIsValid } = useApiKeyValidation();`
- **Déclarer un seul composant React par fichier**
  - Pas de multiples composants exportés dans le même fichier
  - Si besoin d’un composant interne, l’extraire dans son propre fichier

---

## 14. Internationalization

- next-18next obligatoire
- Prévoir expansion des textes
- Implémenter un switcher de langue

---

## 15. Environment Configuration

- `.env.local` pour les secrets
- Jamais commiter de secrets
- Fichiers env par environnement
- Toujours valider les env vars
- `.gitignore` doit contenir `node_modules` et `.env*`

---

## 16. CI/CD

- Pre-commit hooks (lint + tests)
- Build, lint et tests obligatoires avant merge
- Vérifier la taille des bundles
- CI échoue si la couverture minimale n’est pas respectée

---

## 17. Async and Promises

- Toujours `async/await` pour gérer les promesses
- Interdire `.then()/.catch()/.finally()` sauf si API externe l’impose
- Erreurs gérées via `try/catch`
- Pas de promesses imbriquées

---

## 18. Control Flow Rules

- Éviter `else`
- Préférer early return (`if (…) return …`) ou `throw new Error(...)`
- Minimiser les niveaux d’imbrication
- Chaque bloc de contrôle = une seule responsabilité

---

## 19. Comments and Documentation

- Commentaires uniquement si nécessaires
- Jamais de commentaires qui disent “quoi”, mais expliquer **pourquoi**
- JSDoc pour logique complexe ou API publiques
- Commentaires clairs, concis et en anglais

---

## 20. Naming Conventions

- Composants React : `PascalCase`
- Constantes globales : `UPPER_SNAKE_CASE`
- Fichiers/dossiers : `kebab-case`
- Variables/fonctions : `camelCase`
- Props booléennes : `is/has/can/should`
- Pas d’abréviations obscures (`cfg`, `btn`, etc.)

---

## 21. Documentation and ADR

- Documenter les décisions techniques importantes (ADR)
- Chaque choix non trivial doit être justifié dans un commentaire WHY ou un ADR
- Copilot doit ajouter une explication si un pattern inhabituel est choisi
