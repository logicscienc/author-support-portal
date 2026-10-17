// src/components/admin/AiDraftPanel.jsx
// Shows the AI-written draft reply. The admin can use it, regenerate it, or ignore it and write by hand.
import { useState } from "react";
import { FiRefreshCw, FiZap } from "react-icons/fi";
import useFetch from "../../hooks/useFetch";
import { fetchDraft, regenerateDraft } from "../../api/tickets.api";

export default function AiDraftPanel({ ticketId, onUse }) {
  // Loaded once when the ticket opens. The backend saves the draft, so reopening costs nothing.
  const draftFetch = useFetch(() => fetchDraft(ticketId), { key: ticketId });
  const [regenerated, setRegenerated] = useState(null);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState("");

  const result = regenerated ?? draftFetch.data?.data;
  const busy = draftFetch.loading || regenerating;

  async function handleRegenerate() {
    setRegenerating(true);
    setError("");
    try {
      const response = await regenerateDraft(ticketId);
      setRegenerated(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <div className="rounded-xl border border-[#d9d6f0] bg-[#f6f5fc] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-semibold text-[#29265f]">
          <FiZap size={15} />
          AI suggested reply
        </p>
        <button
          type="button"
          onClick={handleRegenerate}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#d9d6f0] bg-white px-3 py-1.5 text-xs font-medium text-[#29265f] hover:bg-slate-50 disabled:opacity-60"
        >
          <FiRefreshCw size={13} className={regenerating ? "animate-spin" : ""} />
          Regenerate
        </button>
      </div>

      {draftFetch.loading && !result && (
        <p className="mt-3 text-sm text-slate-500">Drafting a reply...</p>
      )}

      {draftFetch.error && !result && (
        <p className="mt-3 text-sm text-red-600">Could not load the AI draft: {draftFetch.error}</p>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {result && !result.available && (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{result.reason}</p>
      )}

      {result?.available && (
        <>
          <p className="mt-3 max-h-64 overflow-y-auto whitespace-pre-wrap break-words rounded-lg bg-white px-3 py-3 text-sm leading-6 text-slate-700">
            {result.draft}
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-slate-500">
              AI drafts can contain mistakes. Check the numbers and dates before sending.
            </p>
            <button
              type="button"
              onClick={() => onUse(result.draft)}
              className="rounded-lg bg-[#29265f] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#393580]"
            >
              Use this draft
            </button>
          </div>
        </>
      )}
    </div>
  );
}