import { Loader2 } from "lucide-react";

interface SpinnerProps {
  className?: string;
}

/**
 * Spinner component using Lucide React's Loader2 icon with spinning animation
 *
 * @param className - Additional CSS classes to apply to the spinner
 */
export default function Spinner({
  className = "h-6 w-6 text-gray-600",
}: SpinnerProps) {
  return <Loader2 className={`animate-spin ${className}`} />;
}
