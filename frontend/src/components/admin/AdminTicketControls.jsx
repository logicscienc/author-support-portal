// src/components/admin/AdminTicketControls.jsx
// Admin only: change status, override the AI's category and priority, assign the ticket.
import { useState } from "react";
import { useAuth } from "../../context/useAuth";
import { updateTicket } from "../../api/tickets.api";
import { CATEGORY_LABELS, PRIORITY_LABELS, STATUS_LABELS } from "../../utils/constants";

const selectClass =
  "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#7775b9] focus:ring-2 focus:ring-[#7775b9]/15 disabled:opacity-60";

function Select({ label, value, options, onChange, disabled }) {
  return (
    <label className="block text-xs font-medium text-slate-500">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className={selectClass}
      >
        {Object.entries(options).map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

// A short sentence explaining where the current category and priority came from.
function aiNote(ticket) {
  if (ticket.aiStatus === "PENDING") return "The AI is still classifying this ticket.";
  if (ticket.aiStatus === "FALLBACK") {
    return "The AI was unavailable, so keyword rules chose the category and priority. Please check them.";
  }
  const suggestion = `AI suggested ${CATEGORY_LABELS[ticket.aiCategory]} / ${PRIORITY_LABELS[ticket.aiPriority]}. ${ticket.aiReason ?? ""}`;
  const changed = ticket.aiCategory !== ticket.category || ticket.aiPriority !== ticket.priority;
  return changed ? `${suggestion} You have changed this.` : suggestion;
}

export default function AdminTicketControls({ ticket, onChanged }) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const assignedToMe = ticket.assignedTo?.id === user.id;

  async function apply(patch) {
    setSaving(true);
    setError("");
    try {
      await updateTicket(ticket.id, patch);
      await onChanged(Boolean(patch.category)); // a new category means the AI draft must be redone
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-[#171a35]">Manage ticket</h2>

      <div className="mt-4 space-y-4">
        <Select label="Status" value={ticket.status} options={STATUS_LABELS} disabled={saving} onChange={(status) => apply({ status })} />
        <Select label="Category" value={ticket.category} options={CATEGORY_LABELS} disabled={saving} onChange={(category) => apply({ category })} />
        <Select label="Priority" value={ticket.priority} options={PRIORITY_LABELS} disabled={saving} onChange={(priority) => apply({ priority })} />
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-500">{aiNote(ticket)}</p>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <p className="text-xs font-medium text-slate-500">Assigned to</p>
        <div className="mt-1 flex items-center justify-between gap-3">
          <span className="text-sm text-slate-800">{ticket.assignedTo?.name ?? "Unassigned"}</span>
          <button
            type="button"
            disabled={saving}
            onClick={() => apply({ assignedTo: assignedToMe ? null : "me" })}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-[#29265f] hover:bg-slate-50 disabled:opacity-60"
          >
            {assignedToMe ? "Unassign me" : "Assign to me"}
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}
    </section>
  );
}