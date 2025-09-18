interface ProgressBarProps {
  /** Pourcentage de progression (entre 0 et 100) */
  percentage: number;
  /** Couleur de la barre de progression (classes Tailwind) */
  barColor?: string;
  /** Couleur du fond de la barre (classes Tailwind) */
  backgroundColor?: string;
  /** Hauteur de la barre (classes Tailwind) */
  height?: string;
  /** Largeur de la barre (classes Tailwind) */
  width?: string;
  /** Afficher le pourcentage sous forme de texte */
  showPercentage?: boolean;
  /** Classe CSS additionnelle pour le conteneur */
  className?: string;
}

/**
 * Composant de barre de progression horizontale
 * Affiche un pourcentage sous forme de barre colorée avec le texte optionnel
 */
export default function ProgressBar({
  percentage,
  barColor = "bg-blue-500",
  backgroundColor = "bg-slate-200",
  height = "h-2",
  width = "w-24",
  showPercentage = true,
  className = "",
}: ProgressBarProps) {
  // S'assurer que le pourcentage est entre 0 et 100
  const clampedPercentage = Math.min(100, Math.max(0, percentage));

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Barre de progression */}
      <div
        className={`${width} ${height} ${backgroundColor} overflow-hidden rounded-full`}
      >
        <div
          className={`${height} ${barColor} rounded-full transition-all duration-300 ease-in-out`}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>

      {/* Pourcentage en texte */}
      {showPercentage && (
        <span className="min-w-[2.5rem] text-xs font-medium text-slate-600">
          {clampedPercentage.toFixed(1)}%
        </span>
      )}
    </div>
  );
}
