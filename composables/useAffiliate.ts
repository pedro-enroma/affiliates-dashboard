import type { Affiliate, AffiliateCommission } from '~/types'

export function useAffiliate() {
  const client = useSupabaseClient()
  const user = useSupabaseUser()

  const affiliate = useState<Affiliate | null>('affiliate', () => null)
  const commission = useState<AffiliateCommission | null>('commission', () => null)
  const loading = useState('affiliate-loading', () => false)

  async function fetchProfile() {
    if (!user.value) return
    loading.value = true

    const { data } = await client
      .from('affiliates')
      .select('*')
      .eq('id', user.value.id)
      .single()

    affiliate.value = data as Affiliate | null

    if (affiliate.value) {
      const { data: commData } = await client
        .from('affiliate_commissions')
        .select('*')
        .eq('affiliate_id', affiliate.value.affiliate_id)
        .single()

      commission.value = commData as AffiliateCommission | null
    }

    loading.value = false
  }

  // Auto-fetch on first use
  if (!affiliate.value && user.value) {
    fetchProfile()
  }

  const commissionRate = computed(() => commission.value?.commission_percentage || 0)

  return {
    affiliate,
    commission,
    commissionRate,
    loading,
    fetchProfile,
  }
}
