import type { DateRange } from '~/types'

function defaultRange(): DateRange {
  const now = new Date()
  const end = now.toISOString().split('T')[0]
  const start = new Date(now)
  start.setDate(start.getDate() - 29)
  return { start: start.toISOString().split('T')[0], end }
}

export function useDateRange() {
  const range = useState<DateRange>('date-range', () => defaultRange())

  function setRange(newRange: DateRange) {
    range.value = newRange
  }

  return { range, setRange }
}
