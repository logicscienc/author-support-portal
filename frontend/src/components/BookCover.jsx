
import { FiBook } from "react-icons/fi";

export default function BookCover({ url, title, className = "h-16 w-12" }) {
  if (!url) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center rounded-md bg-slate-200 text-slate-400 ${className}`}
      >
        <FiBook size={18} />
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={`Cover of ${title}`}
      loading="lazy"
      className={`shrink-0 rounded-md object-cover shadow-sm ${className}`}
    />
  );
}