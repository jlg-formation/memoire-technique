import { create } from "zustand";

interface OpenAIKeyStore {
  apiKey: string;
  setApiKey: (key: string) => void;
}

const STORAGE_KEY = "openai_api_key";

export const getStrictApiKey = (): string => {
  const key = localStorage.getItem(STORAGE_KEY);
  if (!key || key.trim().length < 10) {
    const errorMessage = "Clé OpenAI manquante ou invalide";
    console.error("OpenAI API Key validation failed:", {
      hasKey: !!key,
      keyLength: key?.length || 0,
      storageKey: STORAGE_KEY,
    });
    alert(
      "Clé OpenAI manquante ou invalide. Veuillez la renseigner dans les paramètres.",
    );
    throw new Error(errorMessage);
  }
  return key;
};

export const useOpenAIKeyStore = create<OpenAIKeyStore>((set) => ({
  apiKey: localStorage.getItem(STORAGE_KEY) ?? "",
  setApiKey: (apiKey) => {
    if (apiKey) {
      localStorage.setItem(STORAGE_KEY, apiKey);
      set({ apiKey });
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
    set({ apiKey });
  },
}));
