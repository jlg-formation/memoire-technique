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
            {new Date(entry.timestamp).toLocaleString()}{" "}
            {entry.context && (
              <>
                | <span className="font-mono">{entry.context}</span>
              </>
            )}
          </div>
          <div className="mb-2">
            <strong>Messages envoyés à l'IA :</strong>
            <div className="mt-2 space-y-2">
              {Array.isArray(entry.messages) ? (
                entry.messages.map((msg, i) => (
                  <div key={i} className="border-l-2 bg-white pl-2 text-xs">
                    <span className="font-semibold text-blue-700">
                      {msg.role} :
                    </span>
                    <pre className="mt-1 bg-gray-100 p-2 break-words whitespace-pre-wrap">
                      {typeof msg.content === "string"
                        ? msg.content
                        : Array.isArray(msg.content)
                          ? msg.content
                              .map((part) =>
                                typeof part === "string"
                                  ? part
                                  : JSON.stringify(part, null, 2),
                              )
                              .join("\n")
                          : msg.content != null
                            ? JSON.stringify(msg.content, null, 2)
                            : ""}
                    </pre>
                  </div>
                ))
              ) : (
                <pre className="overflow-x-auto bg-gray-100 p-2 text-xs">
                  {JSON.stringify(entry.messages, null, 2)}
                </pre>
              )}
            </div>
          </div>
          <div>
            <strong>Réponse IA :</strong>
            <pre className="overflow-x-auto bg-gray-100 p-2 text-xs break-words whitespace-pre-wrap">
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
