export interface Affiliate {
  id: string
  affiliate_id: string
  display_name: string
  email: string
  website_url: string | null
  avatar_url: string | null
  bio: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AffiliateCommission {
  id: number
  affiliate_id: string
  commission_percentage: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface AffiliateCampaign {
  id: number
  affiliate_id: string
  campaign_slug: string
  campaign_name: string
  destination_url: string
  activity_id: string | null
  campaign_type: 'link' | 'widget' | 'banner'
  widget_config: Record<string, any> | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DailyTraffic {
  id: number
  affiliate_id: string
  campaign: string
  date: string
  sessions: number
  total_users: number
  new_users: number
  page_views: number
  avg_session_duration: number
  bounce_rate: number
}

export interface DailyEvent {
  id: number
  affiliate_id: string
  campaign: string
  date: string
  event_name: string
  event_count: number
  unique_users: number
}

export interface TrafficDemographic {
  id: number
  affiliate_id: string
  date: string
  dimension_type: string
  dimension_value: string
  sessions: number
  users: number
}

export interface ActivityBooking {
  id: number
  booking_id: number
  product_title: string
  start_date_time: string
  total_price: number
  currency: string
  status: string
  affiliate_id: string | null
  first_campaign: string | null
  created_at: string
}

export interface DateRange {
  start: string
  end: string
}

export interface KpiData {
  sessions: number
  bookings: number
  revenue: number
  commission: number
  conversionRate: number
}

export interface CampaignPerformance {
  campaign: AffiliateCampaign
  trafficSource: string
  clickThrough: number
  revenue: number
  status: 'Active' | 'Pending'
}
