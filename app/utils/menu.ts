export type MenuLabel = {
  id: string
  label: string
  icon?: string
}

// The owner types prices by hand in Studio, in whatever shape is at hand:
// `5,3`, `5.6`, `6-7`, `11,5-16`, `2,5 / 3,3`. Each part is read as a number
// and written back as a price in the reader's locale ("€5.30", "5,30 €"); a
// range keeps its dash, a choice of sizes its slash. Anything that is not a
// number is shown as typed, so an odd entry is never lost.
export const formatMenuPrice = (price: string, locale: string): string => {
  const text = String(price).trim()
  if (text.includes('/')) {
    return text.split('/').map(part => formatMenuPrice(part, locale)).join(' / ')
  }
  if (/^[\d.,]+\s*-\s*[\d.,]+$/.test(text)) {
    return text.split('-').map(part => formatMenuPrice(part, locale)).join('–')
  }
  const value = Number(text.replace(',', '.'))
  if (!text || Number.isNaN(value)) {
    return text
  }
  return new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-GB', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2
  }).format(value)
}

// Everything at Café Prana is vegan and gluten-free, and the page says so once
// at the top. Repeating it on every dish turns it into noise, so a dish only
// shows the labels that set it apart (Seasonal, or any the owner adds later).
export const UNIVERSAL_LABELS: readonly string[] = ['vegan', 'gluten-free']

export const distinctLabels = (ids: string[] | undefined, lookup: Record<string, MenuLabel>): MenuLabel[] =>
  (ids ?? [])
    .filter(id => !UNIVERSAL_LABELS.includes(id))
    .map(id => lookup[id])
    .filter((label): label is MenuLabel => Boolean(label))
