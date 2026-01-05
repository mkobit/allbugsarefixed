import type { Temporal } from "@js-temporal/polyfill";

export function formatDateToHumanString(date: Date | Temporal.PlainDate): string {
  const dateObj = date instanceof Date ? date : new Date(date.toString());

  return dateObj.toLocaleDateString("en-US", {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}
