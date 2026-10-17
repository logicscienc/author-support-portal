

export const CATEGORY_LABELS = {
  ROYALTY_PAYMENTS: 'Royalty & Payments',
  ISBN_METADATA: 'ISBN & Metadata Issues',
  PRINTING_QUALITY: 'Printing & Quality',
  DISTRIBUTION_AVAILABILITY: 'Distribution & Availability',
  BOOK_STATUS_PRODUCTION: 'Book Status & Production Updates',
  GENERAL_INQUIRY: 'General Inquiry',
};

const COMPANY = `BookLeaf Publishing is a self-publishing company operating in India and the US.
Packages: Standard Free (no upfront cost) and Bestseller Breakthrough (premium, paid, with marketing and distribution add-ons).
We handle cover design, typesetting, ISBN assignment, printing, distribution and royalty management.
Our in-house printing facility and warehouse are in Delhi. Print partners: Repro India and Epitome Books.`;

const POLICIES = {
  ROYALTY_PAYMENTS: `- Royalty split is 80/20: 80% of the net profit per book goes to the author, 20% to BookLeaf.
- Net profit = MRP minus printing cost, platform commission (Amazon/Flipkart) and shipping charges.
- Royalties are calculated quarterly and paid within 45 days of the quarter ending.
- Minimum payout threshold is Rs 1,000. If accumulated royalties are below this, they roll over to the next quarter.
- Payouts are made by bank transfer to the account linked in the author's dashboard.
- Authors can see a detailed royalty breakdown in their dashboard, with sales figures per platform.`,

  ISBN_METADATA: `- Every book published through BookLeaf gets a unique ISBN assigned by BookLeaf, registered under BookLeaf's publisher imprint.
- If an author wants an ISBN under their own imprint, they need to obtain it independently.
- An ISBN error (duplicate, or wrong book linked) is treated as high priority and escalated to the production team.
- Metadata updates (such as the book description) can be submitted through the dashboard or by emailing the BookLeaf team. Changes typically reflect on platforms within 3-5 business days.`,

  PRINTING_QUALITY: `- In-house printing handles most orders. Overflow or specific format requirements go to Repro India or Epitome Books.
- Standard print turnaround is 5-7 business days from order confirmation.
- If an author reports a quality issue (misprints, binding defects, colour inconsistency), BookLeaf arranges a free reprint after verification. The author may need to share photos of the defective copy.`,

  DISTRIBUTION_AVAILABILITY: `- Books are listed on Amazon India, Flipkart, Amazon US, Amazon UK and the BookLeaf Store.
- New listings typically go live within 7-10 business days after publication is complete.
- If a book shows as unavailable on a platform, it usually means a stock sync issue. BookLeaf's team can trigger a re-sync within 24-48 hours.`,

  BOOK_STATUS_PRODUCTION: `- Production stages: Manuscript Received, Editing (if opted), Cover Design, Typesetting, Proofreading, ISBN Assignment, Printing, Distribution Setup, Published & Live.
- Authors are updated by email at each stage.
- Delays typically happen at Cover Design (waiting for author approval) and Proofreading (revision rounds).`,

  GENERAL_INQUIRY: `- Metadata updates (such as the book description on a platform) can be submitted through the dashboard or by emailing the BookLeaf team. Changes typically reflect on platforms within 3-5 business days.
- Authors can see a detailed royalty breakdown in their dashboard.`,
};

// How a reply should be framed for each kind of query (from BookLeaf's examples).
const GUIDANCE = {
  ROYALTY_PAYMENTS: `- Acknowledge the frustration or concern first.
- If no royalty has been received: explain the quarterly cycle and the 45-day payout window, ask them to confirm their bank details are linked in the dashboard, and give the specific next payout date from the ROYALTY CALENDAR.
- If a payout is genuinely overdue (the payout deadline has passed and the book has pending royalty above Rs 1,000), own it directly and escalate with a 48-hour resolution timeline.
- If pending royalty is below Rs 1,000, explain that it rolls over to the next quarter.
- If the author thinks the amount is too low: explain the net profit calculation (MRP minus printing, platform commission and shipping), offer a detailed line-by-line royalty breakdown, and do not be defensive.
- If the book is still in production, it is not earning royalties yet. Say so kindly.`,

  ISBN_METADATA: `- Treat as high priority. Acknowledge that this is a serious data issue.
- Confirm you are escalating to the production team immediately.
- Give a 48-hour resolution timeline.`,

  PRINTING_QUALITY: `- Apologise sincerely.
- Ask the author to share photos of the defective copies.
- Confirm BookLeaf will arrange a free reprint once the issue is verified.
- Give a timeline of 5-7 business days for the reprint.`,

  DISTRIBUTION_AVAILABILITY: `- Explain that this is typically a stock sync issue.
- Confirm you are triggering a re-sync with the distribution team.
- Set the expectation: 24-48 hours for the book to go live again.
- If the book was only recently published, mention that new listings take 7-10 business days to go live.`,

  BOOK_STATUS_PRODUCTION: `- Use the production status in BOOK DATA. Do not guess any other stage.
- If the book is delayed, be honest about the typical reasons (waiting for author approval at Cover Design, revision rounds at Proofreading). Never blame the author; frame it collaboratively.
- You do not have exact stage dates, so say the team will confirm a specific updated timeline within 48 hours.`,

  GENERAL_INQUIRY: `- Answer the question directly using the policy above.
- If you cannot answer from the policy, say the team will look into it and reply within 48 hours.`,
};

export function getKnowledge(category) {
  const key = POLICIES[category] ? category : 'GENERAL_INQUIRY';
  return [
    `COMPANY\n${COMPANY}`,
    `POLICY (${CATEGORY_LABELS[key]})\n${POLICIES[key]}`,
    `HOW TO REPLY TO THIS KIND OF QUERY\n${GUIDANCE[key]}`,
  ].join('\n\n');
}