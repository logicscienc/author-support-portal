// src/components/ticket/Conversation.jsx
// The author's original message, followed by the replies from BookLeaf.
import { formatDate, timeAgo } from "../../utils/format";

function Message({ name, content, createdAt, fromSupport = false }) {
  return (
    <div className="flex gap-3">
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${
          fromSupport ? "bg-[#29265f]" : "bg-[#7775b9]"
        }`}
      >
        {name?.[0]?.toUpperCase() ?? "?"}
      </span>

      <div
        className={`min-w-0 flex-1 rounded-2xl px-4 py-3 ${
          fromSupport ? "bg-[#eceaf7]" : "border border-slate-200 bg-white"
        }`}
      >
        <div className="flex items-baseline justify-between gap-3">
          <p className="truncate text-sm font-semibold text-[#171a35]">
            {name}
            {fromSupport && !name.includes("BookLeaf") && (
              <span className="ml-2 text-xs font-normal text-slate-500">BookLeaf support</span>
            )}
          </p>
          <p className="shrink-0 text-xs text-slate-400" title={formatDate(createdAt)}>
            {timeAgo(createdAt)}
          </p>
        </div>
        <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{content}</p>
      </div>
    </div>
  );
}

export default function Conversation({ ticket, authorName }) {
  return (
    <div className="space-y-4">
      <Message name={authorName} content={ticket.description} createdAt={ticket.createdAt} />
      {ticket.messages.map((message) => (
        <Message
          key={message.id}
          name={message.from}
          content={message.content}
          createdAt={message.createdAt}
          fromSupport
        />
      ))}
    </div>
  );
}