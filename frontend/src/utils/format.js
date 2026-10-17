

export const formatCurrency = (value) =>
  `₹${Number(value ?? 0).toLocaleString("en-IN")}`;

export const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

// "2h ago", "1d ago"
export function timeAgo(iso) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(iso);
}

export function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// COVER_DESIGN -> "Cover Design"
const titleCase = (value) =>
  value
    .toLowerCase()
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");


export function bookStatusInfo(book) {
  if (book.status === "PUBLISHED") {
    return {
      text: `Published • ${formatDate(book.publicationDate)}`,
      dot: "bg-emerald-500",
    };
  }
  return {
    text: `In production • ${titleCase(book.status)}`,
    dot: "bg-amber-500",
  };
}


export const PRODUCTION_STAGES = [
  "MANUSCRIPT_RECEIVED",
  "EDITING",
  "COVER_DESIGN",
  "TYPESETTING",
  "PROOFREADING",
  "ISBN_ASSIGNMENT",
  "PRINTING",
  "DISTRIBUTION_SETUP",
  "PUBLISHED",
];

export const stageLabel = (status) => titleCase(status);

export function productionProgress(status) {
  const index = PRODUCTION_STAGES.indexOf(status);
  const step = index === -1 ? 1 : index + 1;
  const total = PRODUCTION_STAGES.length;
  return { step, total, percent: Math.round((step / total) * 100) };
}