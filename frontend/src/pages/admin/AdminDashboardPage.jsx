
import { useState } from "react";
import { FiAlertCircle, FiCheckCircle, FiClock, FiInbox } from "react-icons/fi";
import useFetch from "../../hooks/useFetch";
import { fetchTickets, fetchTicketStats, updateTicket } from "../../api/tickets.api";
import StatCard from "../../components/StatCard";
import ErrorBox from "../../components/ErrorBox";
import TicketFilters from "../../components/admin/TicketFilters";
import TicketTable from "../../components/admin/TicketTable";

const PAGE_SIZE = 20;
const POLL_MS = 10000; 
const EMPTY_FILTERS = { status: "", category: "", priority: "", assignedTo: "", from: "", to: "" };

export default function AdminDashboardPage() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [assigningId, setAssigningId] = useState("");
  const [actionError, setActionError] = useState("");

  const stats = useFetch(fetchTicketStats, { pollMs: POLL_MS });
  const tickets = useFetch(() => fetchTickets({ ...filters, page, limit: PAGE_SIZE }), {
    pollMs: POLL_MS,
    key: JSON.stringify([filters, page]), 
  });

  function changeFilters(patch) {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(1);
  }

  function clearFilters() {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  }

  async function handleAssign(ticketId) {
    setAssigningId(ticketId);
    setActionError("");
    try {
      await updateTicket(ticketId, { assignedTo: "me" });
      await Promise.all([tickets.refresh(), stats.refresh()]);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setAssigningId("");
    }
  }

  const counts = stats.data?.data;
  const rows = tickets.data?.data ?? [];
  const meta = tickets.data?.meta;
  const needsAttention = counts ? counts.critical + counts.unassigned > 0 : false;

  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="text-2xl font-semibold text-[#171a35] sm:text-3xl">Ticket Queue</h1>
      <p className="mt-1 text-sm text-slate-500">Manage and respond to author queries.</p>

      {counts && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={FiInbox} label="Total Tickets" value={counts.total} />
          <StatCard icon={FiAlertCircle} label="Open" value={counts.open} />
          <StatCard icon={FiClock} label="In Progress" value={counts.inProgress} />
          <StatCard icon={FiCheckCircle} label="Resolved" value={counts.resolved} />
        </div>
      )}

      {stats.error && !counts && (
        <div className="mt-6">
          <ErrorBox message={stats.error} onRetry={stats.refresh} />
        </div>
      )}

      {needsAttention && (
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <span className="font-medium">Needs attention:</span>
          {counts.critical > 0 && (
            <button type="button" onClick={() => changeFilters({ priority: "CRITICAL", status: "" })} className="underline">
              {counts.critical} critical
            </button>
          )}
          {counts.unassigned > 0 && (
            <button type="button" onClick={() => changeFilters({ assignedTo: "unassigned", status: "" })} className="underline">
              {counts.unassigned} unassigned
            </button>
          )}
        </div>
      )}

      <div className="mt-6">
        <TicketFilters filters={filters} onChange={changeFilters} onClear={clearFilters} />
      </div>

      {actionError && (
        <div className="mt-4">
          <ErrorBox message={actionError} />
        </div>
      )}

      {tickets.loading && !tickets.data && (
        <p className="mt-10 text-center text-slate-500">Loading tickets...</p>
      )}

      {tickets.error && !tickets.data && (
        <div className="mt-6">
          <ErrorBox message={tickets.error} onRetry={tickets.refresh} />
        </div>
      )}

      {tickets.data && (
        <div className="mt-4">
          {rows.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
              No tickets match these filters.
            </p>
          ) : (
            <>
              <p className="mb-2 text-xs text-slate-400">
                Most urgent first, then oldest first. Tickets unresolved for over 48 hours show their age in red.
              </p>
              <TicketTable tickets={rows} onAssign={handleAssign} assigningId={assigningId} />

              <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                <span>
                  Showing {(meta.page - 1) * meta.limit + 1}–{(meta.page - 1) * meta.limit + rows.length} of {meta.total}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((current) => current - 1)}
                    disabled={meta.page <= 1}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span>
                    Page {meta.page} of {meta.totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((current) => current + 1)}
                    disabled={meta.page >= meta.totalPages}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}