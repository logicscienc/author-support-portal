
import { PRIORITY_LABELS } from "../utils/constants";

const STYLES = {
  CRITICAL: "bg-red-600 text-white",
  HIGH: "bg-rose-50 text-rose-600",
  MEDIUM: "bg-amber-50 text-amber-700",
  LOW: "bg-emerald-50 text-emerald-700",
};

export default function PriorityBadge({ priority }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
        STYLES[priority] ?? STYLES.LOW
      }`}
    >
      {PRIORITY_LABELS[priority] ?? priority}
    </span>
  );
}