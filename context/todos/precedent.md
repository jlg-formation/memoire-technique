Dans les pages d'assistants (ProjectCreate.tsx, ou autre), je ne veux pas de boutons annuler, mais en revanche, je voudrais un bouton precedent sur le haut de la page.

A cette occasion, cree deux composants visuels:

- Bouton Primary (bouton encadre, mais mis en valeur par un fort background)
- Bouton (bouton normal, encadree)
- Bouton Link (bouton sans bord, qui ressemble à un lien mais ecrit en gras)

Tous les boutons doivent avoir un status disabled bien géré :

- pas du cursor-pointer
- un visuel "gris"

# Eviter les CLS

Dans la page ProjectCreate, le spinner fait un Cumulative Layout Shift (CLS). Reserve l'espace pour supprimer le CLS.
