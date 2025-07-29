# AGENTS.md – Instructions pour les agents IA (Copilot, Codex, etc.)

---

## 🧪 Qualité de code

### ✅ Formatter

Lancer `bun run format`

### ✅ Linter

Lancer `bun run lint`

### ✅ Builder

Lancer `bun run build`

Si la commande de build échoue, corriger le code, étape par étape jusque quand
cela build avec succès.

---

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

Ajouter dans le pied de page (footer) du message de commit:

```
Co-authored-by: OpenAI Codex for JLG <codex@openai.com>
```
