import type { AffiliateCampaign } from '~/types'

export function useCampaigns() {
  const client = useSupabaseClient()
  const { affiliate } = useAffiliate()

  async function fetchCampaigns(affiliateId?: string): Promise<AffiliateCampaign[]> {
    let query = client
      .from('affiliate_campaigns')
      .select('*')
      .order('created_at', { ascending: false })

    if (affiliateId) {
      query = query.eq('affiliate_id', affiliateId)
    }

    const { data, error } = await query
    if (error) throw error
    return (data || []) as AffiliateCampaign[]
  }

  async function createCampaign(campaign: {
    campaign_slug: string
    campaign_name: string
    destination_url: string
    activity_id?: string
    campaign_type?: string
    widget_config?: Record<string, any>
  }): Promise<AffiliateCampaign> {
    if (!affiliate.value) throw new Error('Not authenticated')

    const { data, error } = await client
      .from('affiliate_campaigns')
      .insert({
        affiliate_id: affiliate.value.affiliate_id,
        ...campaign,
      })
      .select()
      .single()

    if (error) throw error
    return data as AffiliateCampaign
  }

  async function updateCampaign(id: number, updates: Partial<AffiliateCampaign>): Promise<void> {
    const { error } = await client
      .from('affiliate_campaigns')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
  }

  async function deleteCampaign(id: number): Promise<void> {
    const { error } = await client
      .from('affiliate_campaigns')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  function generateLink(affiliateId: string, campaignSlug: string, destinationUrl: string): string {
    const url = new URL(destinationUrl)
    url.searchParams.set('affiliate_id', affiliateId)
    url.searchParams.set('first_campaign_id', campaignSlug)
    return url.toString()
  }

  return {
    fetchCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    generateLink,
  }
}
