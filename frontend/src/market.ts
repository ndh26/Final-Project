// Goliad Market Days: the 2nd Saturday of every month. Shared by the Market page and the
// assistant's server function, so this file must stay free of browser-only code.

export const MARKET = {
  name: 'Goliad Market Days',
  schedule: '2nd Saturday of every month',
  location: 'the historic Courthouse Square in downtown Goliad, Texas',
  mapQuery: 'Goliad County Courthouse, Goliad, TX',
}

function secondSaturday(year: number, month: number): Date {
  const first = new Date(year, month, 1)
  return new Date(year, month, 1 + ((6 - first.getDay() + 7) % 7) + 7)
}

/** The next market day on or after `from` (today counts if it's market day). */
export function nextMarketDay(from = new Date()): Date {
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  const thisMonth = secondSaturday(today.getFullYear(), today.getMonth())
  return thisMonth >= today ? thisMonth : secondSaturday(today.getFullYear(), today.getMonth() + 1)
}

export function isToday(date: Date, now = new Date()): boolean {
  return date.toDateString() === now.toDateString()
}

export function formatMarketDate(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

export function mapLink(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}
