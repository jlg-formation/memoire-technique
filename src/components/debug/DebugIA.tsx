import { useIAHistoryStore } from "../../store/useIAHistoryStore";

export default function DebugIA() {
  const history = useIAHistoryStore((s) => s.history);

  if (!history.length) {
    return <div className="p-4 text-gray-500">Aucun appel IA tracé.</div>;
  }

  return (
    <div className="space-y-6 p-4">
      {history.map((entry, idx) => (
        <div key={idx} className="rounded border bg-gray-50 p-4">
          <div className="mb-2 text-xs text-gray-400">
            {new Date(entry.timestamp).toLocaleString()} {" "}
            {entry.context && (
              <>
                | <span className="font-mono">{entry.context}</span>
              </>
            )}
          </div>
          <div className="mb-2">
            <strong>Messages envoyés à l'IA :</strong>
            <div className="space-y-2 mt-2">
              {Array.isArray(entry.messages)
                ? entry.messages.map((msg, i) => (
                    <div key={i} className="border-l-2 pl-2 text-xs bg-white">
                      <span className="font-semibold text-blue-700">{msg.role} :</span>
                      <pre className="whitespace-pre-wrap break-words bg-gray-100 p-2 mt-1">{msg.content}</pre>
                    </div>
                  ))
                : <pre className="overflow-x-auto bg-gray-100 p-2 text-xs">{JSON.stringify(entry.messages, null, 2)}</pre>
              }
            </div>
          </div>
          <div>
            <strong>Réponse IA :</strong>
            <pre className="overflow-x-auto whitespace-pre-wrap break-words bg-gray-100 p-2 text-xs">
              {typeof entry.response === "string"
                ? entry.response
                : JSON.stringify(entry.response, null, 2)}
            </pre>
          </div>
        </div>
      ))}
    </div>
  );
}
