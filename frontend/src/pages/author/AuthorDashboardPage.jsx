
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiBookOpen, FiMessageCircle } from "react-icons/fi";
import { useAuth } from "../../context/useAuth";
import { fetchBooks } from "../../api/books.api";
import { fetchTickets } from "../../api/tickets.api";
import StatCard from "../../components/StatCard";
import BookCover from "../../components/BookCover";
import TicketStatusBadge from "../../components/TicketStatusBadge";
import RoyaltyBars from "../../components/RoyaltyBars";
import { formatCurrency, timeAgo, greeting, bookStatusInfo } from "../../utils/format";


const RupeeIcon = ({ size }) => (
  <span style={{ fontSize: size }} className="font-semibold leading-none">₹</span>
);

const cardClass = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";

function CardHeader({ title, to }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="font-semibold text-[#171a35]">{title}</h2>
      {to && (
        <Link to={to} className="text-sm font-medium text-[#29265f] hover:underline">
          View all
        </Link>
      )}
    </div>
  );
}

function DashboardContent({ books, tickets }) {
  const published = books.filter((book) => book.status === "PUBLISHED").length;
  const inProduction = books.length - published;
  const pendingRoyalty = books.reduce((sum, book) => sum + (book.royaltyPending ?? 0), 0);
  const totalEarned = books.reduce((sum, book) => sum + (book.totalRoyalty ?? 0), 0);

  const waiting = tickets.filter((ticket) => ticket.status === "OPEN").length;
  const inProgress = tickets.filter((ticket) => ticket.status === "IN_PROGRESS").length;

  return (
    <>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={FiBookOpen}
          label="Total Books"
          value={books.length}
          hint={`${published} published${inProduction ? `, ${inProduction} in production` : ""}`}
        />
        <StatCard
          icon={RupeeIcon}
          label="Pending Royalties"
          value={formatCurrency(pendingRoyalty)}
          hint={`${formatCurrency(totalEarned)} earned in total`}
        />
        <StatCard
          icon={FiMessageCircle}
          label="Open Tickets"
          value={waiting + inProgress}
          hint={waiting + inProgress === 0 ? "All caught up" : `${waiting} waiting, ${inProgress} in progress`}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        {/* Recent books */}
        <section className={`${cardClass} lg:col-span-2`}>
          <CardHeader title="Recent Books" to="/author/books" />
          {books.length === 0 ? (
            <p className="py-6 text-sm text-slate-500">No books on your account yet.</p>
          ) : (
            <ul className="space-y-4">
              {books.slice(0, 3).map((book) => {
                const status = bookStatusInfo(book);
                return (
                  <li key={book.id} className="flex items-center gap-4">
                    <BookCover url={book.coverImageUrl} title={book.title} />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-[#171a35]">{book.title}</p>
                      <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                        <span className={`h-2 w-2 shrink-0 rounded-full ${status.dot}`} />
                        {status.text}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div className="space-y-6 lg:col-span-3">
          {/* Royalty chart */}
          <section className={cardClass}>
            <CardHeader title="Royalties Overview" />
            <RoyaltyBars books={books} />
          </section>

          {/* Recent tickets */}
          <section className={cardClass}>
            <CardHeader title="Recent Tickets" to="/author/tickets" />
            {tickets.length === 0 ? (
              <p className="py-4 text-sm text-slate-500">
                You haven't raised any tickets yet. Need help? Open{" "}
                <Link to="/author/tickets" className="font-medium text-[#29265f] hover:underline">
                  Support Tickets
                </Link>
                .
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {tickets.slice(0, 4).map((ticket) => (
                  <li key={ticket.id}>
                    <Link
                      to={`/author/tickets/${ticket.id}`}
                      className="flex items-center justify-between gap-3 py-3 hover:bg-slate-50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[#171a35]">{ticket.subject}</p>
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {ticket.book?.title ?? "General / Account"}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <TicketStatusBadge status={ticket.status} />
                        <span className="hidden text-xs text-slate-400 sm:inline">
                          {timeAgo(ticket.updatedAt)}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

export default function AuthorDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    Promise.all([fetchBooks(), fetchTickets({ limit: 100 })])
      .then(([booksResult, ticketsResult]) => {
        if (!cancelled) setData({ books: booksResult.data, tickets: ticketsResult.data });
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  function retry() {
    setLoading(true);
    setError("");
    setReloadKey((key) => key + 1);
  }

  const firstName = user.name.split(" ")[0];

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-semibold text-[#171a35] sm:text-3xl">
        {greeting()}, {firstName}!
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Here's what's happening with your books and support tickets.
      </p>

      {loading && <p className="mt-10 text-center text-slate-500">Loading your dashboard...</p>}

      {!loading && error && (
        <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}{" "}
          <button type="button" onClick={retry} className="font-medium underline">
            Try again
          </button>
        </div>
      )}

      {!loading && !error && data && <DashboardContent books={data.books} tickets={data.tickets} />}
    </div>
  );
}