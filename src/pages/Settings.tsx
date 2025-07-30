import { useState } from "react";
import { useOpenAIKeyStore } from "../store/useOpenAIKeyStore";
import { testKey } from "../lib/openai";

function Settings() {
  const { apiKey, setApiKey } = useOpenAIKeyStore();
  const [tempKey, setTempKey] = useState(apiKey);
  const [status, setStatus] = useState<
    "idle" | "testing" | "success" | "error"
  >("idle");

  const handleSave = () => {
    setApiKey(tempKey.trim());
    setStatus("idle");
  };

  const handleTest = async () => {
    setStatus("testing");
    try {
      const ok = await testKey(tempKey.trim());
      setStatus(ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-bold">Paramètres</h1>
      <label className="block font-semibold">Clé API OpenAI</label>
      <input
        type="password"
        className="w-full border p-2"
        value={tempKey}
        onChange={(e) => setTempKey(e.target.value)}
        placeholder="sk-..."
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          className="cursor-pointer rounded bg-blue-500 px-4 py-2 text-white"
        >
          Enregistrer
        </button>
        <button
          type="button"
          onClick={handleTest}
          className="cursor-pointer rounded bg-green-500 px-4 py-2 text-white"
        >
          Tester
        </button>
      </div>
      {status === "testing" && <div>Test en cours...</div>}
      {status === "success" && <div className="text-green-600">Clé valide</div>}
      {status === "error" && (
        <div className="text-red-600">Impossible de vérifier la clé</div>
      )}
    </div>
  );
}

export default Settings;
