

export const CLASSIFY_SYSTEM = `You triage support tickets for BookLeaf Publishing, a self-publishing company in India and the US. Authors write in about their books.

Choose exactly one CATEGORY:
- ROYALTY_PAYMENTS: royalty amounts, missing or late payouts, payment cycle, bank details
- ISBN_METADATA: wrong, duplicate or mismatched ISBN; wrong title, description or other book details
- PRINTING_QUALITY: misprints, blurry images, misaligned pages, binding defects, damaged copies
- DISTRIBUTION_AVAILABILITY: book unavailable or not listed on Amazon, Flipkart or other platforms
- BOOK_STATUS_PRODUCTION: where the book is in production (editing, cover design, typesetting, proofreading), delays, timelines
- GENERAL_INQUIRY: anything else, such as profile changes or how-to questions

Choose exactly one PRIORITY:
- CRITICAL: long-running or severe impact on the author's income or a live book. Examples: no royalty for 6 months or more, ISBN mismatch on a book that is selling, legal or public-complaint threats.
- HIGH: needs prompt action. Examples: any ISBN error, royalty missing or overdue or clearly wrong, defective printed copies, book unavailable on a platform.
- MEDIUM: normal requests. Examples: production status or delay questions, listing not live yet, questions about how royalties are calculated.
- LOW: informational or minor. Examples: updating a bio or description, general how-to questions.

Judge by what the author actually describes, not by how angry or polite the message sounds.
Reply with JSON only, in exactly this shape:
{"category": "<CATEGORY>", "priority": "<PRIORITY>", "reason": "<one short sentence, max 20 words>"}`;

const clip = (text, max) => (text.length > max ? `${text.slice(0, max)}...` : text);


export function buildClassifyUser({ subject, description, book }) {
  return [
    `Subject: ${clip(subject, 200)}`,
    `Description: ${clip(description, 1500)}`,
    book ? `Book: ${book.title} (production status: ${book.status})` : 'Book: none (account-level question)',
  ].join('\n');
}

/* ---------- 2. Drafting a reply ---------- */

const TONE_GUIDELINES = `- Always empathetic and professional. Authors are our partners, not customers to be managed.
- Acknowledge the author's concern before jumping to solutions.
- Be specific: use the actual numbers, dates and statuses from the data you are given instead of vague reassurances.
- If something is BookLeaf's fault (delayed royalties, ISBN error), own it directly. No corporate deflection.
- If the issue needs escalation or investigation, give a clear timeline (for example "Our team will look into this and get back to you within 48 hours"), never an open-ended promise.
- Always end with a clear next step for the author and/or the BookLeaf team.`;

export function buildDraftSystem(knowledge) {
  return `You are a senior author-support representative at BookLeaf Publishing. You write the reply to an author's support ticket. A human admin will review and edit it before sending.

TONE
${TONE_GUIDELINES}

RULES
- Use only the policies in the KNOWLEDGE BASE and the facts in the data you are given. Never invent numbers, dates, statuses or policies. If you do not have a fact, say the team will check and give a clear timeline.
- If a book is still in production, it is not earning royalties yet. Explain that instead of treating it as overdue.
- Write plain text only: no markdown, no subject line, no placeholders in square brackets.
- Only state what the data shows. Never explain why a figure is zero or low unless the data makes the reason clear.
- Never repeat the author's own claims about dates or amounts. Use only the dates and figures in the data you are given.
- Follow the note in brackets next to each pending royalty amount. Never compare amounts to the Rs 1,000 minimum yourself.
- Do not say how long ago the book was published unless the data gives it. Never use durations from the author's message.
- Do not use "However" or contradict the author. Start by acknowledging their concern, then give the facts.
- Start with "Hi <first name>,". Keep it between 120 and 200 words. Finish with a clear next step, then sign off with:
Warm regards,
BookLeaf Author Support

KNOWLEDGE BASE
${knowledge}`;
}

const inr = (value) =>
  value === null || value === undefined ? 'n/a' : `Rs ${Number(value).toLocaleString('en-IN')}`;
const day = (date) => (date ? new Date(date).toISOString().slice(0, 10) : null);

function monthsAgo(date) {
  const d = new Date(date);
  const now = new Date();
  return (now.getUTCFullYear() - d.getUTCFullYear()) * 12 + (now.getUTCMonth() - d.getUTCMonth());
}
const published = (date) => (date ? `${day(date)} (about ${monthsAgo(date)} months ago)` : null);


const MIN_PAYOUT = 1000;
const payoutNote = (pending) => {
  const amount = Number(pending);
  if (!amount) return 'nothing pending';
  return amount >= MIN_PAYOUT
    ? 'above the Rs 1,000 minimum, so it is included in the next payout'
    : 'below the Rs 1,000 minimum, so it rolls over to the next quarter';
};


export function statusLabel(status) {
  if (status === 'PUBLISHED') return 'Published & Live';
  const words = status.toLowerCase().split('_').map((w) => w[0].toUpperCase() + w.slice(1));
  return `In production: ${words.join(' ')}`;
}

function formatBook(book) {
  return [
    `Title: ${book.title}`,
    `Genre: ${book.genre ?? 'n/a'}`,
    `ISBN: ${book.isbn ?? 'not assigned yet'}`,
    `Status: ${statusLabel(book.status)}`,
        `Publication date: ${published(book.publicationDate) ?? 'not published yet'}`,
    `MRP: ${inr(book.mrp)}`,
    `Copies sold: ${book.copiesSold}`,
    `Author royalty per copy: ${inr(book.royaltyPerCopy)}`,
    `Total royalty earned: ${inr(book.totalRoyalty)}`,
    `Royalty paid so far: ${inr(book.royaltyPaid)}`,
        `Royalty pending: ${inr(book.royaltyPending)} (${payoutNote(book.royaltyPending)})`,
        `Last royalty payout actually paid on: ${day(book.lastPayoutDate) ?? 'no payout made yet'}`,
    `Print partner: ${book.printPartner ?? 'n/a'}`,
    `Available on: ${book.availableOn.length ? book.availableOn.join(', ') : 'not listed yet'}`,
  ].join('\n');
}

function formatBookList(books) {
  if (books.length === 0) return 'No books on this account.';
  return books
    .map(
      (b) =>
        `- ${b.title} | ${statusLabel(b.status)} | published ${published(b.publicationDate) ?? 'not yet'} | earned ${inr(b.totalRoyalty)}, paid ${inr(b.royaltyPaid)}, pending ${inr(b.royaltyPending)} (${payoutNote(b.royaltyPending)}) | last payout ${day(b.lastPayoutDate) ?? 'none yet'}`,
    )
    .join('\n');
}

function formatCalendar(cal) {
  const lines = [
    `Today: ${cal.today}`,
        `NEXT PAYOUT DEADLINE: ${cal.nextPayoutDeadline}. Royalties are paid by this date. Say "by ${cal.nextPayoutDeadline}" rather than "on" it. This is the only payout date to give the author. Do not mention any other quarter or payout date.`,
  ];
  if (cal.lastQuarterPayoutDeadlinePassed) {
    lines.push(
      `Note: the payout deadline for the quarter that ended ${cal.lastQuarterEnded} (${cal.lastQuarterPayoutDeadline}) has already passed, so any unpaid royalty from that quarter is overdue.`,
    );
  }
  return lines.join('\n');
}

// Only the facts this reply needs: this one book (or a short list), the ticket, and the last few replies.
export function buildDraftUser({ firstName, categoryLabel, ticket, book, otherBooks, calendar, previousReplies }) {
  const parts = [
    `AUTHOR FIRST NAME: ${firstName}`,
    `TICKET CATEGORY: ${categoryLabel}`,
    book
      ? `BOOK DATA (the book this ticket is about):\n${formatBook(book)}`
      : `The author did not pick a specific book (account-level question). Their books:\n${formatBookList(otherBooks)}`,
  ];

  if (calendar) parts.push(`ROYALTY CALENDAR:\n${formatCalendar(calendar)}`);

  if (previousReplies.length > 0) {
    parts.push(
      `REPLIES ALREADY SENT ON THIS TICKET (oldest first):\n${previousReplies.map((r) => `- ${clip(r, 400)}`).join('\n')}`,
    );
  }

  parts.push(`TICKET SUBJECT: ${clip(ticket.subject, 200)}\nTICKET MESSAGE:\n${clip(ticket.description, 1500)}`);
  parts.push('Write the reply now.');

  return parts.join('\n\n');
}