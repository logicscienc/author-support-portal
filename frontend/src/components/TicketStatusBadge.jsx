
const LABELS = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

const STYLES = {
  OPEN: "bg-rose-50 text-rose-600",
  IN_PROGRESS: "bg-blue-50 text-blue-600",
  RESOLVED: "bg-emerald-50 text-emerald-600",
  CLOSED: "bg-slate-100 text-slate-600",
};

export default function TicketStatusBadge({ status }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
        STYLES[status] ?? STYLES.CLOSED
      }`}
    >
      {LABELS[status] ?? status}
    </span>
  );
}