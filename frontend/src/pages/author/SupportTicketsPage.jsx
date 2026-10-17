
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FiChevronRight, FiMessageCircle, FiPlus } from "react-icons/fi";
import useFetch from "../../hooks/useFetch";
import { fetchTickets } from "../../api/tickets.api";
import { fetchBooks } from "../../api/books.api";
import FilterTabs from "../../components/FilterTabs";
import TicketStatusBadge from "../../components/TicketStatusBadge";
import NewTicketModal from "../../components/NewTicketModal";
import ErrorBox from "../../components/ErrorBox";
import { timeAgo } from "../../utils/format";

const TABS = [
  { key: "ALL", label: "All" },
  { key: "OPEN", label: "Open" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "RESOLVED", label: "Resolved" },
  { key: "CLOSED", label: "Closed" },
];

export default function SupportTicketsPage() {
  
  const [searchParams, setSearchParams] = useSearchParams();
  const [modalOpen, setModalOpen] = useState(() => searchParams.get("new") === "1");
  const [presetBookId] = useState(() => searchParams.get("book") ?? "");

  const [filter, setFilter] = useState("ALL");
  const [notice, setNotice] = useState("");

  
  const tickets = useFetch(() => fetchTickets({ limit: 100 }), { pollMs: 10000 });
  const books = useFetch(fetchBooks);

  const allTickets = tickets.data?.data ?? [];
  const visible = filter === "ALL" ? allTickets : allTickets.filter((ticket) => ticket.status === filter);
  const tabs = TABS.map((tab) => ({
    ...tab,
    count: tab.key === "ALL" ? allTickets.length : allTickets.filter((t) => t.status === tab.key).length,
  }));

  function closeModal() {
    setModalOpen(false);
    if (searchParams.size > 0) setSearchParams({}, { replace: true }); // remove ?new=1&book=...
  }

  function handleCreated() {
    closeModal();
    setNotice("Your query has been submitted. Our team will reply as soon as possible.");
    tickets.refresh();
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#171a35] sm:text-3xl">Support Tickets</h1>
          <p className="mt-1 text-sm text-slate-500">Track your queries and get help from our team.</p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#29265f] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#393580]"
        >
          <FiPlus size={16} />
          Create Ticket
        </button>
      </div>

      {notice && (
        <div
          role="status"
          className="mt-5 flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice("")} className="font-medium underline">
            Dismiss
          </button>
        </div>
      )}

      {tickets.loading && !tickets.data && (
        <p className="mt-10 text-center text-slate-500">Loading your tickets...</p>
      )}

      {tickets.error && !tickets.data && (
        <div className="mt-6">
          <ErrorBox message={tickets.error} onRetry={tickets.refresh} />
        </div>
      )}

      {tickets.data && (
        <>
          <div className="mt-6">
            <FilterTabs tabs={tabs} active={filter} onChange={setFilter} />
          </div>

          {allTickets.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <p className="font-medium text-[#171a35]">You haven't raised any tickets yet</p>
              <p className="mt-1 text-sm text-slate-500">
                Questions about royalties, ISBNs, printing or your book's status? We're here to help.
              </p>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="mt-4 rounded-xl bg-[#29265f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#393580]"
              >
                Create your first ticket
              </button>
            </div>
          ) : visible.length === 0 ? (
            <p className="mt-8 text-center text-sm text-slate-500">No tickets in this category.</p>
          ) : (
            <ul className="mt-6 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {visible.map((ticket) => (
                <li key={ticket.id}>
                  <Link
                    to={`/author/tickets/${ticket.id}`}
                    className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-[#171a35]">{ticket.subject}</p>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {ticket.book?.title ?? "General / Account Level"} • Created {timeAgo(ticket.createdAt)}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      {ticket.replyCount > 0 && (
                        <span className="hidden items-center gap-1 text-xs text-slate-500 sm:flex">
                          <FiMessageCircle size={14} />
                          {ticket.replyCount} {ticket.replyCount === 1 ? "reply" : "replies"}
                        </span>
                      )}
                      <TicketStatusBadge status={ticket.status} />
                      <FiChevronRight className="text-slate-400" size={18} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {modalOpen && (
        <NewTicketModal
          books={books.data?.data ?? []}
          presetBookId={presetBookId}
          onClose={closeModal}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}