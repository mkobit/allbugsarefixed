// Use Temporal's Intl.DateTimeFormat to format dates
export function formatDateToHumanString(date: Readonly<Temporal.PlainDateLike | string>): string {
  const plainDate = date instanceof Temporal.PlainDate ? date : Temporal.PlainDate.from(date)

  return plainDate.toLocaleString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
