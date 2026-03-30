import type { DailyTraffic, DailyEvent, TrafficDemographic, DateRange } from '~/types'

export function useTraffic() {
  const client = useSupabaseClient()

  async function fetchDailyTraffic(range: DateRange, affiliateId?: string): Promise<DailyTraffic[]> {
    let query = client
      .from('affiliate_daily_traffic')
      .select('*')
      .gte('date', range.start)
      .lte('date', range.end)
      .order('date', { ascending: true })

    if (affiliateId) {
      query = query.eq('affiliate_id', affiliateId)
    }

    const { data, error } = await query
    if (error) throw error
    return (data || []) as DailyTraffic[]
  }

  async function fetchDailyEvents(range: DateRange, affiliateId?: string): Promise<DailyEvent[]> {
    let query = client
      .from('affiliate_daily_events')
      .select('*')
      .gte('date', range.start)
      .lte('date', range.end)
      .order('date', { ascending: true })

    if (affiliateId) {
      query = query.eq('affiliate_id', affiliateId)
    }

    const { data, error } = await query
    if (error) throw error
    return (data || []) as DailyEvent[]
  }

  async function fetchDemographics(range: DateRange, dimensionType: string, affiliateId?: string): Promise<TrafficDemographic[]> {
    let query = client
      .from('affiliate_traffic_demographics')
      .select('*')
      .gte('date', range.start)
      .lte('date', range.end)
      .eq('dimension_type', dimensionType)
      .order('date', { ascending: true })

    if (affiliateId) {
      query = query.eq('affiliate_id', affiliateId)
    }

    const { data, error } = await query
    if (error) throw error
    return (data || []) as TrafficDemographic[]
  }

  function aggregateTraffic(rows: DailyTraffic[]) {
    return rows.reduce(
      (acc, row) => ({
        sessions: acc.sessions + row.sessions,
        totalUsers: acc.totalUsers + row.total_users,
        newUsers: acc.newUsers + row.new_users,
        pageViews: acc.pageViews + row.page_views,
      }),
      { sessions: 0, totalUsers: 0, newUsers: 0, pageViews: 0 },
    )
  }

  function aggregateDemographics(rows: TrafficDemographic[]) {
    const map = new Map<string, { sessions: number; users: number }>()
    for (const row of rows) {
      const existing = map.get(row.dimension_value) || { sessions: 0, users: 0 }
      existing.sessions += row.sessions
      existing.users += row.users
      map.set(row.dimension_value, existing)
    }
    return [...map.entries()]
      .map(([label, val]) => ({ label, ...val }))
      .sort((a, b) => b.sessions - a.sessions)
  }

  return {
    fetchDailyTraffic,
    fetchDailyEvents,
    fetchDemographics,
    aggregateTraffic,
    aggregateDemographics,
  }
}
