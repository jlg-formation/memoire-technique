# AGENTS.md – Instructions pour les agents IA (Copilot, Codex, etc.)

---

## 🧪 Qualité de code

Avant de commiter toujours tester

```
bun run format:changed
bun run lint:changed
```

### ✅ Builder

```
bun run build
```

Si la commande de build échoue, corriger le code, étape par étape jusque quand
cela build avec succès.

---

## Git

Ne pas faire de commande git qui modifie le repository.
(ex: stager, commiter, etc.)
Par contre les commande git pour lire le repository sont autorisées.

## ✅ Convention de commit

Utiliser les **conventional commits** :

```
feat:     nouvelle fonctionnalité
fix:      correction de bug
style:    mise en forme (indentation, etc.)
refactor: modification sans changement fonctionnel
docs:     ajout ou mise à jour de documentation
test:     ajout ou correction de tests
chore:    maintenance ou dépendances
```
