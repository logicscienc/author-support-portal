
import { useState } from "react";
import useFetch from "../../hooks/useFetch";
import { fetchBooks } from "../../api/books.api";
import FilterTabs from "../../components/FilterTabs";
import BookCard from "../../components/BookCard";
import ErrorBox from "../../components/ErrorBox";

export default function MyBooksPage() {
  const { data, error, loading, refresh } = useFetch(fetchBooks);
  const [filter, setFilter] = useState("all");

  const books = data?.data ?? [];
  const published = books.filter((book) => book.status === "PUBLISHED");
  const inProduction = books.filter((book) => book.status !== "PUBLISHED");

  const tabs = [
    { key: "all", label: "All", count: books.length },
    { key: "published", label: "Published", count: published.length },
    { key: "production", label: "In Production", count: inProduction.length },
  ];

  const visible = { all: books, published, production: inProduction }[filter];

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold text-[#171a35] sm:text-3xl">My Books</h1>
      <p className="mt-1 text-sm text-slate-500">
        Your books, their publication status and royalties.
      </p>

      {loading && !data && <p className="mt-10 text-center text-slate-500">Loading your books...</p>}

      {error && !data && (
        <div className="mt-6">
          <ErrorBox message={error} onRetry={refresh} />
        </div>
      )}

      {data && (
        <>
          <div className="mt-6">
            <FilterTabs tabs={tabs} active={filter} onChange={setFilter} />
          </div>

          {books.length === 0 ? (
            <p className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
              There are no books on your account yet.
            </p>
          ) : visible.length === 0 ? (
            <p className="mt-8 text-center text-sm text-slate-500">No books in this category.</p>
          ) : (
            <div className="mt-6 space-y-4">
              {visible.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}