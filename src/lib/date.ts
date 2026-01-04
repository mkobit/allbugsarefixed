import type { Temporal } from "@js-temporal/polyfill";

export function formatDateToHumanString(date: Readonly<Date | Temporal.PlainDate>): string {
  const dateObj: Date =
    date instanceof Date
      ? date
      : // Convert Temporal.PlainDate to JS Date
        // Note: PlainDate doesn't have a timezone, so we assume UTC or local.
        // toString() gives YYYY-MM-DD which strict-ish.
        // Better to use Temporal formatting if possible, but Intl.DateTimeFormat works with Date.
        // For simplicity in this hybrid env, we convert to string then Date or use fields.
        new Date(date.toString());

  return dateObj.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
