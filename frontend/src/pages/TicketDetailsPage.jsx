
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { useAuth } from "../context/useAuth";
import useFetch from "../hooks/useFetch";
import { fetchTicket } from "../api/tickets.api";
import ErrorBox from "../components/ErrorBox";
import TicketStatusBadge from "../components/TicketStatusBadge";
import PriorityBadge from "../components/PriorityBadge";
import Conversation from "../components/ticket/Conversation";
import TicketInfoPanel from "../components/ticket/TicketInfoPanel";
import AdminTicketControls from "../components/admin/AdminTicketControls";
import InternalNotes from "../components/admin/InternalNotes";
import ReplyComposer from "../components/admin/ReplyComposer";
import { timeAgo } from "../utils/format";

const cardClass = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";

export default function TicketDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const isAdmin = user.role === "ADMIN";

  
  const ticketFetch = useFetch(() => fetchTicket(id), { pollMs: 10000, key: id });
  const [draftKey, setDraftKey] = useState(0);

  const loaded = ticketFetch.data?.data;
  const ticket = loaded?.id === id ? loaded : null; 

  const backTo = isAdmin ? "/admin/dashboard" : "/author/tickets";
  const backLabel = isAdmin ? "Back to ticket queue" : "Back to support tickets";

  async function handleChanged(categoryChanged = false) {
    await ticketFetch.refresh();
    if (categoryChanged) setDraftKey((key) => key + 1); 
  }

  return (
    <div className="mx-auto max-w-6xl">
      <Link to={backTo} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#29265f]">
        <FiArrowLeft size={16} />
        {backLabel}
      </Link>

      {!ticket && ticketFetch.loading && <p className="mt-10 text-center text-slate-500">Loading ticket...</p>}

      {!ticket && ticketFetch.error && (
        <div className="mt-6">
          <ErrorBox message={ticketFetch.error} onRetry={ticketFetch.refresh} />
        </div>
      )}

      {ticket && (
        <div className="mt-4 grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className={cardClass}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h1 className="min-w-0 break-words text-xl font-semibold text-[#171a35] sm:text-2xl">
                  {ticket.subject}
                </h1>
                <div className="flex shrink-0 gap-2">
                  <TicketStatusBadge status={ticket.status} />
                  {isAdmin && <PriorityBadge priority={ticket.priority} />}
                </div>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                {ticket.book?.title ?? "General / Account Level"} • Created {timeAgo(ticket.createdAt)}
                {isAdmin && ` • ${ticket.author.name}`}
              </p>
            </section>

            <Conversation ticket={ticket} authorName={isAdmin ? ticket.author.name : user.name} />

            {!isAdmin && ticket.messages.length === 0 && (
              <p className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
                Our team will reply here. This page updates by itself, so you don't need to refresh.
              </p>
            )}

            {!isAdmin && (ticket.status === "RESOLVED" || ticket.status === "CLOSED") && (
              <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                This ticket is {ticket.status === "RESOLVED" ? "resolved" : "closed"}. If you still need help, please
                create a new ticket from the Support Tickets page.
              </p>
            )}

            {isAdmin && <ReplyComposer ticket={ticket} draftKey={draftKey} onSent={handleChanged} />}
          </div>

          <div className="space-y-6">
            <TicketInfoPanel ticket={ticket} isAdmin={isAdmin} />
            {isAdmin && <AdminTicketControls ticket={ticket} onChanged={handleChanged} />}
            {isAdmin && <InternalNotes ticket={ticket} onChanged={handleChanged} />}
          </div>
        </div>
      )}
    </div>
  );
}