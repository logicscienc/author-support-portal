// src/components/admin/TicketFilters.jsx
// Filter bar for the admin queue. `filters` is an object, onChange gets the part that changed.
import { CATEGORY_LABELS, PRIORITY_LABELS } from "../../utils/constants";

const fieldClass =
  "rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#7775b9] focus:ring-2 focus:ring-[#7775b9]/15";

const STATUS_OPTIONS = [
  ["", "Unresolved (default)"],
  ["ALL", "All statuses"],
  ["OPEN", "Open"],
  ["IN_PROGRESS", "In Progress"],
  ["RESOLVED", "Resolved"],
  ["CLOSED", "Closed"],
];
const CATEGORY_OPTIONS = [["", "All categories"], ...Object.entries(CATEGORY_LABELS)];
const PRIORITY_OPTIONS = [["", "All priorities"], ...Object.entries(PRIORITY_LABELS)];
const ASSIGNED_OPTIONS = [
  ["", "Anyone"],
  ["me", "Assigned to me"],
  ["unassigned", "Unassigned"],
];

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
      {label}
      {children}
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <Field label={label}>
      <select value={value} onChange={(event) => onChange(event.target.value)} className={fieldClass}>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </Field>
  );
}

export default function TicketFilters({ filters, onChange, onClear }) {
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <Select label="Status" value={filters.status} onChange={(status) => onChange({ status })} options={STATUS_OPTIONS} />
      <Select label="Category" value={filters.category} onChange={(category) => onChange({ category })} options={CATEGORY_OPTIONS} />
      <Select label="Priority" value={filters.priority} onChange={(priority) => onChange({ priority })} options={PRIORITY_OPTIONS} />
      <Select label="Assigned" value={filters.assignedTo} onChange={(assignedTo) => onChange({ assignedTo })} options={ASSIGNED_OPTIONS} />

      <Field label="Created from">
        <input
          type="date"
          value={filters.from}
          max={filters.to || undefined}
          onChange={(event) => onChange({ from: event.target.value })}
          className={fieldClass}
        />
      </Field>
      <Field label="Created to">
        <input
          type="date"
          value={filters.to}
          min={filters.from || undefined}
          onChange={(event) => onChange({ to: event.target.value })}
          className={fieldClass}
        />
      </Field>

      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="pb-2 text-sm font-medium text-[#29265f] hover:underline"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}