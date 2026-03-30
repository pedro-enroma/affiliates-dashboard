import type { DateRange, ActivityBooking, AffiliateCampaign, DailyTraffic, CampaignPerformance } from '~/types'

export function useDashboardStats() {
  function getPreviousPeriod(range: DateRange): DateRange {
    const startDate = new Date(range.start)
    const endDate = new Date(range.end)
    const durationMs = endDate.getTime() - startDate.getTime()

    const prevEnd = new Date(startDate.getTime() - 1) // day before current start
    const prevStart = new Date(prevEnd.getTime() - durationMs)

    return {
      start: prevStart.toISOString().split('T')[0],
      end: prevEnd.toISOString().split('T')[0],
    }
  }

  function percentChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0
    return Number((((current - previous) / previous) * 100).toFixed(1))
  }

  function getTopCampaigns(
    bookings: ActivityBooking[],
    campaigns: AffiliateCampaign[],
    trafficData: DailyTraffic[],
  ): CampaignPerformance[] {
    const revenueMap = new Map<string, number>()
    for (const b of bookings) {
      const slug = b.first_campaign || ''
      revenueMap.set(slug, (revenueMap.get(slug) || 0) + b.total_price)
    }

    const totalSessions = trafficData.reduce((sum, t) => sum + t.sessions, 0)
    const sessionMap = new Map<string, number>()
    for (const t of trafficData) {
      sessionMap.set(t.campaign, (sessionMap.get(t.campaign) || 0) + t.sessions)
    }

    const results: CampaignPerformance[] = campaigns.map((c) => {
      const revenue = revenueMap.get(c.campaign_slug) || 0
      const sessions = sessionMap.get(c.campaign_slug) || 0
      const clickThrough = totalSessions > 0 ? Number(((sessions / totalSessions) * 100).toFixed(1)) : 0

      return {
        campaign: c,
        trafficSource: c.campaign_name,
        clickThrough,
        revenue,
        status: c.is_active ? 'Active' as const : 'Pending' as const,
      }
    })

    return results.sort((a, b) => b.revenue - a.revenue)
  }

  function getTopDestination(
    bookings: ActivityBooking[],
    campaigns: AffiliateCampaign[],
    trafficData: DailyTraffic[],
  ): { campaign: AffiliateCampaign; revenue: number; conversionRate: number; healthPercent: number } | null {
    const revenueMap = new Map<string, { revenue: number; count: number }>()
    for (const b of bookings) {
      const slug = b.first_campaign || ''
      const existing = revenueMap.get(slug) || { revenue: 0, count: 0 }
      existing.revenue += b.total_price
      existing.count++
      revenueMap.set(slug, existing)
    }

    let topSlug = ''
    let topRevenue = 0
    for (const [slug, data] of revenueMap) {
      if (data.revenue > topRevenue) {
        topSlug = slug
        topRevenue = data.revenue
      }
    }

    if (!topSlug) return null

    const campaign = campaigns.find((c) => c.campaign_slug === topSlug)
    if (!campaign) return null

    const bookingCount = revenueMap.get(topSlug)?.count || 0

    const sessions = trafficData
      .filter((t) => t.campaign === topSlug)
      .reduce((sum, t) => sum + t.sessions, 0)

    const conversionRate = sessions > 0 ? Number(((bookingCount / sessions) * 100).toFixed(1)) : 0
    const healthPercent = sessions > 0 ? Math.min(100, Math.round((bookingCount / sessions) * 100)) : 0

    return { campaign, revenue: topRevenue, conversionRate, healthPercent }
  }

  return { getPreviousPeriod, percentChange, getTopCampaigns, getTopDestination }
}
