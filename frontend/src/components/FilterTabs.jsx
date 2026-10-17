
export default function FilterTabs({ tabs, active, onChange }) {
  return (
    <div role="tablist" className="flex flex-wrap gap-2">
      {tabs.map(({ key, label, count }) => {
        const selected = key === active;
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(key)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              selected
                ? "border-[#29265f] bg-[#29265f] text-white"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {label}{" "}
            <span className={selected ? "text-white/70" : "text-slate-400"}>({count})</span>
          </button>
        );
      })}
    </div>
  );
}