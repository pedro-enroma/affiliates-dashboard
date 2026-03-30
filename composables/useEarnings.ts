import type { ActivityBooking, DateRange } from '~/types'
import { fetchAllRows } from '~/composables/usePaginatedFetch'

const MV = 'activity_bookings_participants_mv'
const MV_SELECT = 'id, booking_id, product_title, start_date_time, total_price, status, affiliate_id, first_campaign, affiliate_commission, affiliate_commission_percentage, participant_count, created_at'

export function useEarnings() {
  const bookingsClient = useBookingsClient()

  async function fetchBookings(range: DateRange, affiliateId?: string): Promise<ActivityBooking[]> {
    return fetchAllRows<ActivityBooking>((from, to) => {
      let query = bookingsClient
        .from(MV)
        .select(MV_SELECT)
        .gte('start_date_time', range.start)
        .lte('start_date_time', range.end + 'T23:59:59')
        .in('status', ['CONFIRMED', 'confirmed'])
        .order('start_date_time', { ascending: false })
        .range(from, to)

      if (affiliateId) {
        query = query.eq('affiliate_id', affiliateId)
      }

      return query
    })
  }

  async function fetchAllBookings(range: DateRange, affiliateId?: string): Promise<ActivityBooking[]> {
    return fetchAllRows<ActivityBooking>((from, to) => {
      let query = bookingsClient
        .from(MV)
        .select(MV_SELECT)
        .gte('start_date_time', range.start)
        .lte('start_date_time', range.end + 'T23:59:59')
        .order('start_date_time', { ascending: false })
        .range(from, to)

      if (affiliateId) {
        query = query.eq('affiliate_id', affiliateId)
      }

      return query
    })
  }

  function calculateCommission(price: number, booking?: ActivityBooking): number {
    // Use pre-calculated commission from MV if available
    if (booking?.affiliate_commission != null) {
      return booking.affiliate_commission
    }
    return 0
  }

  function summarizeByMonth(bookings: ActivityBooking[]) {
    const map = new Map<string, { bookings: number; revenue: number; commission: number }>()

    for (const b of bookings) {
      const month = b.start_date_time.slice(0, 7)
      const existing = map.get(month) || { bookings: 0, revenue: 0, commission: 0 }
      existing.bookings++
      existing.revenue += b.total_price
      existing.commission += b.affiliate_commission || 0
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
