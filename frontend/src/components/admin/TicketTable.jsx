// src/components/admin/TicketTable.jsx
import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import TicketStatusBadge from "../TicketStatusBadge";
import PriorityBadge from "../PriorityBadge";
import { CATEGORY_LABELS } from "../../utils/constants";
import { formatDate, timeAgo } from "../../utils/format";

const STALE_AFTER_MS = 48 * 60 * 60 * 1000; // BookLeaf promises a reply within 48 hours

// Unresolved for more than 48 hours? Show the age in red so old tickets stand out.
const isStale = (ticket) =>
  (ticket.status === "OPEN" || ticket.status === "IN_PROGRESS") &&
  Date.now() - new Date(ticket.createdAt).getTime() > STALE_AFTER_MS;

function CategoryCell({ ticket }) {
  return (
    <div>
      <span className="text-slate-700">{CATEGORY_LABELS[ticket.category] ?? ticket.category}</span>
      {ticket.aiStatus === "PENDING" && <p className="text-xs italic text-slate-400">AI pending</p>}
      {ticket.aiStatus === "FALLBACK" && (
        <p className="text-xs text-slate-400" title="The AI was unavailable, so keyword rules chose this">
          Rules-based
        </p>
      )}
    </div>
  );
}

function AssignedCell({ ticket, onAssign, assigning }) {
  if (ticket.assignedTo) return <span className="text-slate-700">{ticket.assignedTo.name}</span>;

  if (ticket.status === "RESOLVED" || ticket.status === "CLOSED") {
    return <span className="text-slate-400">—</span>;
  }

  return (
    <button
      type="button"
      onClick={() => onAssign(ticket.id)}
      disabled={assigning}
      className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-[#29265f] hover:bg-slate-50 disabled:opacity-60"
    >
      {assigning ? "Assigning..." : "Assign to me"}
    </button>
  );
}

export default function TicketTable({ tickets, onAssign, assigningId }) {
  const headClass = "px-4 py-3 font-medium";

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[960px] text-left text-sm">
        <thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <th className={`${headClass} pl-5`}>Subject</th>
            <th className={headClass}>Author</th>
            <th className={headClass}>Category</th>
            <th className={headClass}>Priority</th>
            <th className={headClass}>Status</th>
            <th className={headClass}>Assigned</th>
            <th className={headClass}>Created</th>
            <th className="w-10" />
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {tickets.map((ticket) => (
            <tr key={ticket.id} className="hover:bg-slate-50">
              <td className="max-w-xs py-4 pl-5 pr-4">
                <Link to={`/admin/tickets/${ticket.id}`} className="block truncate font-medium text-[#171a35] hover:underline">
                  {ticket.subject}
                </Link>
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {ticket.book?.title ?? "General / Account Level"}
                </p>
              </td>
              <td className="px-4 py-4 text-slate-700">{ticket.author.name}</td>
              <td className="px-4 py-4">
                <CategoryCell ticket={ticket} />
              </td>
              <td className="px-4 py-4">
                <PriorityBadge priority={ticket.priority} />
              </td>
              <td className="px-4 py-4">
                <TicketStatusBadge status={ticket.status} />
              </td>
              <td className="px-4 py-4">
                <AssignedCell ticket={ticket} onAssign={onAssign} assigning={assigningId === ticket.id} />
              </td>
              <td className="px-4 py-4">
                <span
                  title={formatDate(ticket.createdAt)}
                  className={isStale(ticket) ? "font-medium text-red-600" : "text-slate-500"}
                >
                  {timeAgo(ticket.createdAt)}
                </span>
              </td>
              <td className="pr-4">
                <Link to={`/admin/tickets/${ticket.id}`} aria-label={`Open ticket: ${ticket.subject}`}>
                  <FiChevronRight className="text-slate-400" size={18} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}