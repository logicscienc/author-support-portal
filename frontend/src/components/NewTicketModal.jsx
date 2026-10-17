
import { useEffect, useState } from "react";
import { FiPaperclip, FiX } from "react-icons/fi";
import { createTicket } from "../api/tickets.api";

const inputClass =
  "mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#7775b9] focus:ring-2 focus:ring-[#7775b9]/15";


const errorText = (err) =>
  err.details?.length ? err.details.map((detail) => detail.message).join(" ") : err.message;

export default function NewTicketModal({ books, presetBookId = "", onClose, onCreated }) {
  const [bookId, setBookId] = useState(presetBookId);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);


  useEffect(() => {
    function handleKey(event) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const result = await createTicket({
        bookId: bookId || null, 
        subject: subject.trim(),
        description: description.trim(),
      });
      onCreated(result.data);
    } catch (err) {
      setError(errorText(err));
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose(); 
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-ticket-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="new-ticket-title" className="text-xl font-semibold text-[#171a35]">
              Submit a support query
            </h2>
            <p className="mt-1 text-sm text-slate-500">Tell us what's going on and we'll get back to you.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="ticket-book" className="text-sm font-medium text-slate-700">
              Which book is this about?
            </label>
            <select
              id="ticket-book"
              value={bookId}
              onChange={(event) => setBookId(event.target.value)}
              className={inputClass}
            >
              <option value="">General / Account Level</option>
              {books.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="ticket-subject" className="text-sm font-medium text-slate-700">
              Subject
            </label>
            <input
              id="ticket-subject"
              type="text"
              required
              minLength={5}
              maxLength={150}
              placeholder="e.g. Royalty not received"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="ticket-description" className="text-sm font-medium text-slate-700">
              Describe the issue
            </label>
            <textarea
              id="ticket-description"
              required
              minLength={10}
              maxLength={5000}
              rows={5}
              placeholder="The more detail you share, the faster we can help."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <span className="text-sm font-medium text-slate-700">Attachment (optional)</span>
            <label className="mt-1 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 hover:bg-slate-50">
              <FiPaperclip size={16} />
              <span className="truncate">{fileName || "Choose a photo or PDF"}</span>
              <input
                type="file"
                accept="image/*,.pdf"
                className="sr-only"
                onChange={(event) => setFileName(event.target.files[0]?.name ?? "")}
              />
            </label>
            <p className="mt-1 text-xs text-slate-400">
              Attachments are not uploaded yet. If we need photos, we'll ask for them in our reply.
            </p>
          </div>

          {error && (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-[#29265f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#393580] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit query"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}