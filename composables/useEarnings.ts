import type { ActivityBooking, DateRange } from '~/types'

export function useEarnings() {
  const bookingsClient = useBookingsClient()
  const { commissionRate } = useAffiliate()

  async function fetchBookings(range: DateRange, affiliateId?: string): Promise<ActivityBooking[]> {
    let query = bookingsClient
      .from('activity_bookings')
      .select('id, booking_id, product_title, start_date_time, total_price, currency, status, affiliate_id, first_campaign, created_at')
      .gte('start_date_time', range.start)
      .lte('start_date_time', range.end + 'T23:59:59')
      .in('status', ['CONFIRMED', 'confirmed'])
      .order('start_date_time', { ascending: false })

    if (affiliateId) {
      query = query.eq('affiliate_id', affiliateId)
    }

    const { data, error } = await query
    if (error) throw error
    return (data || []) as ActivityBooking[]
  }

  async function fetchAllBookings(range: DateRange, affiliateId?: string): Promise<ActivityBooking[]> {
    let query = bookingsClient
      .from('activity_bookings')
      .select('id, booking_id, product_title, start_date_time, total_price, currency, status, affiliate_id, first_campaign, created_at')
      .gte('start_date_time', range.start)
      .lte('start_date_time', range.end + 'T23:59:59')
      .order('start_date_time', { ascending: false })

    if (affiliateId) {
      query = query.eq('affiliate_id', affiliateId)
    }

    const { data, error } = await query
    if (error) throw error
    return (data || []) as ActivityBooking[]
  }

  function calculateCommission(price: number): number {
    return price * (commissionRate.value / 100)
  }

  function summarizeByMonth(bookings: ActivityBooking[]) {
    const map = new Map<string, { bookings: number; revenue: number; commission: number }>()

    for (const b of bookings) {
      const month = b.start_date_time.slice(0, 7)
      const existing = map.get(month) || { bookings: 0, revenue: 0, commission: 0 }
      existing.bookings++
      existing.revenue += b.total_price
      existing.commission += calculateCommission(b.total_price)
      map.set(month, existing)
    }

    return [...map.entries()]
      .map(([month, val]) => ({ month, ...val }))
      .sort((a, b) => b.month.localeCompare(a.month))
  }

  return {
    fetchBookings,
    fetchAllBookings,
    calculateCommission,
    summarizeByMonth,
  }
}
