// src/components/admin/ReplyComposer.jsx
// Admin only: the AI draft on top, and the box where the admin writes or edits the reply.
import { useState } from "react";
import { sendMessage } from "../../api/tickets.api";
import AiDraftPanel from "./AiDraftPanel";

export default function ReplyComposer({ ticket, draftKey, onSent }) {
  const [text, setText] = useState("");
  const [usedDraft, setUsedDraft] = useState(false); // did this reply start from the AI draft?
  const [markResolved, setMarkResolved] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  function handleUseDraft(draft) {
    setText(draft);
    setUsedDraft(true);
  }

  function handleChange(value) {
    setText(value);
    if (!value.trim()) setUsedDraft(false); // cleared the box: it is a fresh reply again
  }

  async function handleSend(event) {
    event.preventDefault();
    setSending(true);
    setError("");
    try {
      await sendMessage(ticket.id, {
        content: text.trim(),
        isAssisted: usedDraft,
        ...(markResolved && { status: "RESOLVED" }),
      });
      setText("");
      setUsedDraft(false);
      setMarkResolved(false);
      await onSent();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-[#171a35]">Reply to author</h2>

      <div className="mt-4">
        {/* A new key makes the panel load a fresh draft, for example after the category changes */}
        <AiDraftPanel key={`${ticket.id}-${draftKey}`} ticketId={ticket.id} onUse={handleUseDraft} />
      </div>

      <form onSubmit={handleSend} className="mt-4">
        <label htmlFor="reply-text" className="text-sm font-medium text-slate-700">
          Your reply
        </label>
        <textarea
          id="reply-text"
          required
          maxLength={5000}
          rows={8}
          placeholder="Write your reply, or use the AI draft above and edit it."
          value={text}
          onChange={(event) => handleChange(event.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#7775b9] focus:ring-2 focus:ring-[#7775b9]/15"
        />

        {usedDraft && <p className="mt-1 text-xs text-slate-500">This reply started from the AI draft.</p>}

        {error && (
          <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={markResolved}
              onChange={(event) => setMarkResolved(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            Mark as resolved after sending
          </label>
          <button
            type="submit"
            disabled={sending || !text.trim()}
            className="rounded-xl bg-[#29265f] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#393580] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending ? "Sending..." : "Send reply"}
          </button>
        </div>
      </form>
    </section>
  );
}