// src/utils/dates.js
const DAY_MS = 86_400_000;
const PAYOUT_WINDOW_DAYS = 45;

const iso = (date) => date.toISOString().slice(0, 10);
// Last day of calendar quarter q (0 to 3) in the given year.
const quarterEnd = (year, q) => new Date(Date.UTC(year, q * 3 + 3, 0));
const addDays = (date, days) => new Date(date.getTime() + days * DAY_MS);


export function royaltyCalendar(now = new Date()) {
  const year = now.getUTCFullYear();
  const q = Math.floor(now.getUTCMonth() / 3);
  const currentEnd = quarterEnd(year, q);
  const previousEnd = q === 0 ? quarterEnd(year - 1, 3) : quarterEnd(year, q - 1);
  const previousDeadline = addDays(previousEnd, PAYOUT_WINDOW_DAYS);

  return {
    today: iso(now),
    lastQuarterEnded: iso(previousEnd),
    lastQuarterPayoutDeadline: iso(previousDeadline),
    lastQuarterPayoutDeadlinePassed: previousDeadline < now,
    nextPayoutDeadline: iso(previousDeadline < now ? addDays(currentEnd, PAYOUT_WINDOW_DAYS) : previousDeadline),
    currentQuarterEnds: iso(currentEnd),
    currentQuarterPayoutDeadline: iso(addDays(currentEnd, PAYOUT_WINDOW_DAYS)),
  };
}