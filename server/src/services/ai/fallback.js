

const RULES = [
  { category: 'ISBN_METADATA', words: ['isbn', 'barcode', 'duplicate', 'wrong title', 'metadata'] },
  { category: 'ROYALTY_PAYMENTS', words: ['royalt', 'payout', 'payment', 'bank', 'paid', 'earning', 'commission'] },
  { category: 'PRINTING_QUALITY', words: ['print', 'blurry', 'binding', 'misprint', 'misaligned', 'defect', 'quality', 'damaged', 'reprint'] },
  { category: 'DISTRIBUTION_AVAILABILITY', words: ['unavailable', 'out of stock', 'amazon', 'flipkart', 'not listed', 'listing', 'not showing'] },
  { category: 'BOOK_STATUS_PRODUCTION', words: ['typesetting', 'proofread', 'cover design', 'editing', 'production', 'status', 'when will', 'timeline', 'delay'] },
];

function guessCategory(text) {
  let best = { category: 'GENERAL_INQUIRY', hits: 0 };
  for (const rule of RULES) {
    const hits = rule.words.filter((word) => text.includes(word)).length;
    if (hits > best.hits) best = { category: rule.category, hits };
  }
  return best.category;
}

function guessPriority(category, text) {
  if (/\b(lawyer|legal action|consumer court|fraud|scam)\b/.test(text)) return 'CRITICAL';

  if (category === 'ROYALTY_PAYMENTS') {
    const months = /(\d+)\s*months?/.exec(text);
    if (months && Number(months[1]) >= 6) return 'CRITICAL';
    const complaint = /(not received|haven't received|never received|still waiting|missing|overdue|not paid|too low|wrong)/;
    return complaint.test(text) ? 'HIGH' : 'MEDIUM';
  }
  if (['ISBN_METADATA', 'PRINTING_QUALITY', 'DISTRIBUTION_AVAILABILITY'].includes(category)) return 'HIGH';
  if (category === 'GENERAL_INQUIRY') return 'LOW';
  return 'MEDIUM';
}

export function keywordTriage({ subject, description }) {
  const text = `${subject} ${description}`.toLowerCase().replace(/\u2019/g, "'");
  const category = guessCategory(text);
  return {
    category,
    priority: guessPriority(category, text),
    reason: 'Classified by keyword rules because the AI was unavailable.',
  };
}