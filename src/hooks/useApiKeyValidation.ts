import { useState, useEffect } from "react";
import { getStrictApiKey, useOpenAIKeyStore } from "../store/useOpenAIKeyStore";
import { testKey } from "../lib/OpenAI";

interface ApiKeyValidationState {
  isValid: boolean;
  isTested: boolean;
}

export function useApiKeyValidation(): ApiKeyValidationState {
  const { apiKey } = useOpenAIKeyStore();
  const [isValid, setIsValid] = useState(false);
  const [isTested, setIsTested] = useState(false);

  useEffect(() => {
    const validateApiKey = async (): Promise<void> => {
      try {
        getStrictApiKey();
      } catch {
        setIsValid(false);
        setIsTested(true);
        return;
      }

      try {
        const isKeyValid = await testKey();
        setIsValid(isKeyValid);
        setIsTested(true);
      } catch {
        setIsValid(false);
        setIsTested(true);
      }
    };

    validateApiKey();
  }, [apiKey]);

  return {
    isValid,
    isTested,
  };
}
