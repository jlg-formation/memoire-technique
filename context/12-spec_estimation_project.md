# 📑 Spécification détaillée – Processus d’estimation basé sur `Project`

## 🎯 Objectif
Permettre de générer et valider une **estimation des honoraires de maîtrise d’œuvre** directement dans la structure `Project`, en exploitant :
- `missions` (`MissionCategories`)
- `categoryPercentages` (`CategoryPercentages`)
- `missionEstimations` (`MissionEstimation`)
- `companies` et `mobilizedPeople` (`ParticipatingCompany`, `MobilizedPerson`)

---

## 🔹 Étape 1 – Initialisation de la structure

### Input
- `Project.missions` : liste des missions classées en **base**, **pse**, **tranchesConditionnelles**, **variantes**.
- `Project.categoryPercentages` : % attendus par catégorie (ex. base = 8 %).
- `Project.companies` : entreprises avec leurs personnes mobilisées et taux journaliers (`dailyRate`).

### Output
- Un objet `Project.missionEstimations` initialisé avec toutes les missions présentes, vides mais prêtes à recevoir des allocations.

### Objectif
- **Squelette d’estimation** aligné sur les missions et pourcentages attendus.

---

## 🔹 Étape 2 – Intégration des contraintes

### Input
- Les entreprises ayant déjà chiffré certaines missions.

### Output
- Dans `missionEstimations`, les personnes concernées reçoivent :
  ```ts
  { days: X, amount: Y, justification: "...", locked: true }
  ```

### Objectif
- **Verrouiller les chiffrages imposés** par certaines entreprises → l’IA ne peut pas les modifier.

---

## 🔹 Étape 3 – Allocation brute

### Input
- Missions à compléter (non verrouillées).
- `MobilizedPerson.dailyRate`.

### Output
- Pour chaque mission → `companyAllocations` → `personAllocations`.
- Exemple :
  ```ts
  missionEstimations.base["aps"].companyAllocations["archi1"].personAllocations["p1"] = {
    days: 5,
    amount: 3500,
    justification: "Analyse du programme et esquisses",
    locked: false
  };
  ```

- `totalAmount` calculé pour chaque mission et entreprise.

### Objectif
- Construire une **première répartition réaliste** en jours-hommes × taux.

---

## 🔹 Étape 4 – Vérification et ajustement

### Input
- `Project.missionEstimations` rempli.
- `Project.categoryPercentages` (attendus).
- Tolérance ± 5 %.

### Calculs
- **Pourcentage par mission** :
  \[
  \%_{mission} = \frac{mission.totalAmount}{Project.totalWorkAmount} \times 100
  \]
- **Pourcentage par catégorie** = somme des missions d’une catégorie.
- **Écart** = % obtenu – % attendu.

### Output
- Mise à jour des champs :
  - `percentageOfCategory`
  - `percentageOfProject`
  - `differenceFromExpected`

- Signalement si un écart dépasse la tolérance.
- Ajustements automatiques proposés sur les missions non verrouillées.

### Objectif
- **Garantir conformité** avec les % attendus et verrouillages.

---

## 🔹 Étape 5 – Justifications

### Input
- `missionEstimations` vérifié.

### Output
- Chaque `personAllocations` reçoit un champ `justification` (2–3 phrases max), adapté :
  - au **profil** (chef de projet, ingénieur, dessinateur, économiste, OPC, etc.),
  - à la **mission** (APS, APD, PRO, DET, etc.).

Exemple :
```ts
justification: "5 jours sont prévus pour élaborer les esquisses et organiser les réunions de cadrage avec la MOA."
```

### Objectif
- Rendre chaque ligne chiffrée **défendable devant un jury**.

---

## 🔹 Étape 6 – Synthèse finale

### Input
- `missionEstimations` complété avec allocations et justifications.

### Output
1. **Tableaux mission par mission**
   - Sigle, titre, description.
   - % attendu vs % obtenu vs écart.
   - Détail par entreprise et par personne (jours × taux × montant).

2. **Tableau global comparatif par catégorie**
   - Attendu vs obtenu, avec surbrillance des écarts.

3. **Texte normatif** (généré depuis `justification`)
   - Explication claire de la méthodologie.
   - Mise en avant du respect des % attendus.

### Objectif
- Produire un **livrable exploitable** directement dans le mémoire technique.

---

## ✅ Récapitulatif des rôles des champs `Project`

- `missions` → structure de référence (APS, APD, etc.).
- `categoryPercentages` → pourcentages attendus.
- `companies` → entreprises et ressources disponibles.
- `missionEstimations` → cœur du calcul : allocations, montants, justifications, écarts.
