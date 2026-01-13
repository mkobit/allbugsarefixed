import { Temporal } from "@js-temporal/polyfill";

// Use Temporal's Intl.DateTimeFormat (polyfilled) to format dates
export function formatDateToHumanString(date: Readonly<Temporal.PlainDate | Temporal.DateLike>): string {
  const plainDate = date instanceof Temporal.PlainDate ? date : Temporal.PlainDate.from(date);

  return plainDate.toLocaleString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
