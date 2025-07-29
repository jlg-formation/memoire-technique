import { create } from "zustand";

interface OpenAIKeyStore {
  apiKey: string;
  setApiKey: (key: string) => void;
}

const STORAGE_KEY = "openai_api_key";

export const useOpenAIKeyStore = create<OpenAIKeyStore>((set) => ({
  apiKey: localStorage.getItem(STORAGE_KEY) ?? "",
  setApiKey: (key) => {
    if (key) {
      localStorage.setItem(STORAGE_KEY, key);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    set({ apiKey: key });
  },
}));
