import type { Temporal } from "@js-temporal/polyfill";

export function formatDateToHumanString(date: Date | Temporal.PlainDate): string {
  let dateObj: Date;

  if (date instanceof Date) {
    dateObj = date;
  } else {
    // Convert Temporal.PlainDate to JS Date
    // Note: PlainDate doesn't have a timezone, so we assume UTC or local.
    // toString() gives YYYY-MM-DD which strict-ish.
    // Better to use Temporal formatting if possible, but Intl.DateTimeFormat works with Date.
    // For simplicity in this hybrid env, we convert to string then Date or use fields.
    dateObj = new Date(date.toString());
  }

  return dateObj.toLocaleDateString("en-US", {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}
