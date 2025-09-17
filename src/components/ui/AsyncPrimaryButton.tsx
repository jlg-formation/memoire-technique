import { useState } from "react";
import { ButtonPrimary } from "./ButtonPrimary";
import { Loader2 } from "lucide-react";

interface AsyncPrimaryButtonProps {
  onClick: () => Promise<void>;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

export default function AsyncPrimaryButton({
  onClick,
  disabled,
  children,
  className = "",
}: AsyncPrimaryButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onClick();
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = disabled || loading;
  return (
    <ButtonPrimary
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      className={
        className +
        (isDisabled
          ? " cursor-not-allowed border-gray-400 bg-gray-400 opacity-70"
          : "")
      }
    >
      {loading && (
        <Loader2 className="mr-2 inline-block h-4 w-4 animate-spin align-middle" />
      )}
      {children}
    </ButtonPrimary>
  );
}
