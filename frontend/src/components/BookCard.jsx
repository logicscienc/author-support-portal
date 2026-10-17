
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import BookCover from "./BookCover";
import { formatCurrency, formatDate, productionProgress, stageLabel } from "../utils/format";

function Info({ label, value }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="truncate text-sm text-slate-700">{value}</dd>
    </div>
  );
}

function Figure({ label, value, highlight = false }) {
  return (
    <div className={`rounded-xl px-4 py-3 ${highlight ? "bg-amber-50" : "bg-slate-50"}`}>
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${highlight ? "text-amber-700" : "text-[#171a35]"}`}>
        {value}
      </p>
    </div>
  );
}

export default function BookCard({ book }) {
  const published = book.status === "PUBLISHED";
  const progress = productionProgress(book.status);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex gap-4">
        <BookCover url={book.coverImageUrl} title={book.title} className="h-28 w-20 sm:h-36 sm:w-24" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="font-semibold text-[#171a35]">{book.title}</h2>
              <p className="mt-0.5 text-sm text-slate-500">{book.genre ?? "Genre not set"}</p>
            </div>
            <span
              className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
                published ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
              }`}
            >
              {published ? "Published" : "In production"}
            </span>
          </div>

          <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-3">
            <Info label="ISBN" value={book.isbn ?? "Not assigned yet"} />
            <Info
              label="Publication date"
              value={book.publicationDate ? formatDate(book.publicationDate) : "Not published yet"}
            />
            <Info label="MRP" value={book.mrp != null ? formatCurrency(book.mrp) : "Not set yet"} />
          </dl>

          {book.availableOn.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400">Available on</span>
              {book.availableOn.map((platform) => (
                <span key={platform} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
                  {platform}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {published ? (
        <div className="mt-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Figure label="Copies sold" value={book.copiesSold.toLocaleString("en-IN")} />
            <Figure label="Royalty earned" value={formatCurrency(book.totalRoyalty)} />
            <Figure label="Royalty paid" value={formatCurrency(book.royaltyPaid)} />
            <Figure
              label="Royalty pending"
              value={formatCurrency(book.royaltyPending)}
              highlight={book.royaltyPending > 0}
            />
          </div>
          <p className="mt-3 text-xs text-slate-500">
            {book.lastPayoutDate
              ? `Last payout: ${formatDate(book.lastPayoutDate)}`
              : "No payout has been made for this book yet."}
          </p>
        </div>
      ) : (
        <div className="mt-5 rounded-xl bg-slate-50 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">Current stage: {stageLabel(book.status)}</span>
            <span className="text-xs text-slate-500">
              Stage {progress.step} of {progress.total}
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-2 rounded-full bg-[#29265f]" style={{ width: `${progress.percent}%` }} />
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Royalties start once your book is published and begins selling.
          </p>
        </div>
      )}

      <div className="mt-4 flex justify-end border-t border-slate-100 pt-4">
        <Link
          to={`/author/tickets?new=1&book=${book.id}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#29265f] hover:underline"
        >
          Raise a query about this book
          <FiArrowRight size={15} />
        </Link>
      </div>
    </article>
  );
}