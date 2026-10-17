// src/components/ticket/TicketInfoPanel.jsx
import TicketStatusBadge from "../TicketStatusBadge";
import { timeAgo } from "../../utils/format";

const formatDateTime = (iso) =>
  new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

function Row({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-800">{children}</dd>
    </div>
  );
}

export default function TicketInfoPanel({ ticket, isAdmin }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-[#171a35]">Ticket Info</h2>
      <dl className="mt-2 divide-y divide-slate-100">
        <Row label="Status">
          <TicketStatusBadge status={ticket.status} />
        </Row>
        <Row label="Book">{ticket.book?.title ?? "General / Account Level"}</Row>
        {isAdmin && <Row label="Author">{ticket.author.name}</Row>}
        <Row label="Created">{formatDateTime(ticket.createdAt)}</Row>
        <Row label="Last updated">{timeAgo(ticket.updatedAt)}</Row>
      </dl>
    </section>
  );
}