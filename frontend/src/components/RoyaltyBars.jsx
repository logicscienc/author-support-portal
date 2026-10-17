
import { formatCurrency } from "../utils/format";

function Legend({ color, label }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      {label}
    </span>
  );
}

export default function RoyaltyBars({ books }) {
  // Top 5 books by royalty earned. Books that have earned nothing are left out.
  const earning = books
    .filter((book) => book.totalRoyalty > 0)
    .sort((a, b) => b.totalRoyalty - a.totalRoyalty)
    .slice(0, 5);

  if (earning.length === 0) {
    return (
      <p className="py-6 text-sm text-slate-500">
        No royalties earned yet. Once your books start selling, they will appear here.
      </p>
    );
  }

  const largest = earning[0].totalRoyalty;

  return (
    <div>
      <div className="mb-4 flex gap-4 text-xs text-slate-500">
        <Legend color="bg-[#29265f]" label="Paid" />
        <Legend color="bg-amber-400" label="Pending" />
      </div>

      <ul className="space-y-4">
        {earning.map((book) => {
          const barWidth = Math.max((book.totalRoyalty / largest) * 100, 4); 
          const paidPercent = (book.royaltyPaid / book.totalRoyalty) * 100;
          const pendingPercent = (book.royaltyPending / book.totalRoyalty) * 100;

          return (
            <li key={book.id}>
              <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate font-medium text-slate-700">{book.title}</span>
                <span className="shrink-0 text-slate-500">{formatCurrency(book.totalRoyalty)}</span>
              </div>
              <div
                role="img"
                aria-label={`${book.title}: ${formatCurrency(book.royaltyPaid)} paid, ${formatCurrency(book.royaltyPending)} pending`}
                className="flex h-3 overflow-hidden rounded-full"
                style={{ width: `${barWidth}%` }}
              >
                <div className="bg-[#29265f]" style={{ width: `${paidPercent}%` }} />
                <div className="bg-amber-400" style={{ width: `${pendingPercent}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}