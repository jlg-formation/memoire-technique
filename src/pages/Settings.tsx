import { useState } from "react";
import { useOpenAIKeyStore } from "../store/useOpenAIKeyStore";
import { testKey } from "../lib/OpenAI";
import { ButtonPrimary, AccentButton } from "../components/ui";

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
    <div className="mx-auto max-w-2xl p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Paramètres
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Configurez votre clé API OpenAI pour utiliser l'application
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="space-y-6">
          <div>
            <label
              htmlFor="api-key"
              className="block text-sm font-medium text-gray-700"
            >
              Clé API OpenAI
            </label>
            <div className="mt-2">
              <input
                id="api-key"
                type="password"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 shadow-sm transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                placeholder="sk-..."
                aria-describedby="api-key-description"
              />
              <p
                id="api-key-description"
                className="mt-2 text-sm text-gray-500"
              >
                Votre clé API ne sera stockée que localement dans votre
                navigateur
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonPrimary type="button" onClick={handleSave}>
              Enregistrer
            </ButtonPrimary>
            <AccentButton
              type="button"
              onClick={handleTest}
              disabled={status === "testing" || !tempKey.trim()}
            >
              {status === "testing" ? "Test en cours..." : "Tester"}
            </AccentButton>
          </div>
        </div>
      </div>

      {(status === "success" || status === "error") && (
        <div className="mt-4 rounded-md border p-4">
          {status === "success" && (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium text-green-800">
                Clé API valide et fonctionnelle
              </span>
            </div>
          )}
          {status === "error" && (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-red-500"></div>
              <span className="text-sm font-medium text-red-800">
                Impossible de vérifier la clé API
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Settings;
