import { create } from "zustand";
import type { ChatCompletionMessageParam } from "openai/resources";

export interface IAHistoryEntry {
  timestamp: number;
  messages: ChatCompletionMessageParam[];
  response: unknown;
  context?: string;
}

interface IAHistoryStore {
  history: IAHistoryEntry[];
  addEntry: (entry: IAHistoryEntry) => void;
  clear: () => void;
}

export const useIAHistoryStore = create<IAHistoryStore>((set) => ({
  history: [],
  addEntry: (entry) => set((state) => ({ history: [entry, ...state.history] })),
  clear: () => set({ history: [] }),
}));
