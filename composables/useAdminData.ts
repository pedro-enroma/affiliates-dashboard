import type { Affiliate, AffiliateCommission, DailyTraffic, ActivityBooking } from '~/types'
import { fetchAllRows } from '~/composables/usePaginatedFetch'

export function useAdminData() {
  const client = useSupabaseClient()

  async function fetchAllAffiliates(): Promise<Affiliate[]> {
    return fetchAllRows<Affiliate>((from, to) => {
      return client
        .from('affiliates')
        .select('*')
        .order('display_name', { ascending: true })
        .range(from, to)
    })
  }

  async function fetchAffiliateCommission(affiliateId: string): Promise<number> {
    const { data, error } = await client
      .from('affiliate_commissions')
      .select('commission_percentage')
      .eq('affiliate_id', affiliateId)
      .maybeSingle()

    if (error) throw error
    return data?.commission_percentage || 0
  }

  function groupTrafficByAffiliate(traffic: DailyTraffic[]): Map<string, number> {
    const map = new Map<string, number>()
    for (const row of traffic) {
      map.set(row.affiliate_id, (map.get(row.affiliate_id) || 0) + row.sessions)
    }
    return map
  }

  function groupBookingsByAffiliate(bookings: ActivityBooking[]): Map<string, { count: number; revenue: number }> {
    const map = new Map<string, { count: number; revenue: number }>()
    for (const b of bookings) {
      const aid = b.affiliate_id || ''
      const existing = map.get(aid) || { count: 0, revenue: 0 }
      existing.count++
      existing.revenue += b.total_price
      map.set(aid, existing)
    }
    return map
  }

  async function updateAffiliate(
    userId: string,
    updates: { display_name?: string; website_url?: string | null; bio?: string | null; is_active?: boolean },
  ): Promise<void> {
    const { error } = await client
      .from('affiliates')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)

    if (error) throw error
  }

  async function updateAffiliateCommission(affiliateId: string, commissionPercentage: number): Promise<void> {
    const { error } = await client
      .from('affiliate_commissions')
      .update({ commission_percentage: commissionPercentage, updated_at: new Date().toISOString() })
      .eq('affiliate_id', affiliateId)

    if (error) throw error
  }

  async function fetchAllCommissions(): Promise<AffiliateCommission[]> {
    const { data, error } = await client
      .from('affiliate_commissions')
      .select('*')

    if (error) throw error
    return (data || []) as AffiliateCommission[]
  }

  return {
    fetchAllAffiliates,
    fetchAffiliateCommission,
    groupTrafficByAffiliate,
    groupBookingsByAffiliate,
    updateAffiliate,
    updateAffiliateCommission,
    fetchAllCommissions,
  }
}
