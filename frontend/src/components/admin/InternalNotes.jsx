// src/components/admin/InternalNotes.jsx
// Private notes for the BookLeaf team. The backend never sends these to authors.
import { useState } from "react";
import { FiLock } from "react-icons/fi";
import { addNote } from "../../api/tickets.api";
import { timeAgo } from "../../utils/format";

export default function InternalNotes({ ticket, onChanged }) {
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const notes = ticket.internalNotes ?? [];

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await addNote(ticket.id, { content: text.trim() });
      setText("");
      await onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="flex items-center gap-2 font-semibold text-[#171a35]">
        <FiLock size={15} />
        Internal notes
      </h2>
      <p className="mt-1 text-xs text-slate-500">Only the BookLeaf team can see these.</p>

      {notes.length > 0 && (
        <ul className="mt-4 space-y-3">
          {notes.map((note) => (
            <li key={note.id} className="rounded-xl bg-amber-50 px-4 py-3">
              <p className="whitespace-pre-wrap break-words text-sm text-slate-700">{note.content}</p>
              <p className="mt-1 text-xs text-slate-500">
                {note.from} • {timeAgo(note.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="mt-4">
        <label htmlFor="internal-note" className="sr-only">
          Add an internal note
        </label>
        <textarea
          id="internal-note"
          required
          maxLength={5000}
          rows={3}
          placeholder="Add a note for your team..."
          value={text}
          onChange={(event) => setText(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#7775b9] focus:ring-2 focus:ring-[#7775b9]/15"
        />
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={saving || !text.trim()}
          className="mt-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-[#29265f] hover:bg-slate-50 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Add note"}
        </button>
      </form>
    </section>
  );
}