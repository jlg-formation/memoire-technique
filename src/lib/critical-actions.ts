/**
 * Exécute une action critique après confirmation de l'utilisateur
 * @param message - Message de confirmation à afficher
 * @param action - Fonction à exécuter si l'utilisateur confirme
 * @param title - Titre optionnel pour le contexte (utilisé dans le message par défaut)
 */
export function executeCriticalAction(
  action: () => void,
  message?: string,
  title?: string,
): void {
  const defaultMessage = title
    ? `Êtes-vous sûr de vouloir supprimer "${title}" ?\n\nCette action est irréversible.`
    : "Êtes-vous sûr de vouloir effectuer cette action ?\n\nCette action est irréversible.";

  const confirmMessage = message || defaultMessage;

  if (window.confirm(confirmMessage)) {
    action();
  }
}

/**
 * Version spécialisée pour la suppression avec un message adapté
 */
export function executeDeleteAction(
  action: () => void,
  itemName: string,
): void {
  executeCriticalAction(
    action,
    `Êtes-vous sûr de vouloir supprimer "${itemName}" ?\n\nCette action est irréversible.`,
  );
}
