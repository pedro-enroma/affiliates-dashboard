export function useAuth() {
  const user = useSupabaseUser()
  const client = useSupabaseClient()

  const isAdmin = useState<boolean>('auth-is-admin', () => false)
  const authLoading = useState<boolean>('auth-loading', () => true)
  const authChecked = useState<boolean>('auth-checked', () => false)

  async function checkRole() {
    if (!user.value) {
      isAdmin.value = false
      authLoading.value = false
      authChecked.value = true
      return
    }

    if (authChecked.value) {
      authLoading.value = false
      return
    }

    const { data } = await client
      .from('admins')
      .select('id')
      .eq('user_id', user.value.id)
      .maybeSingle()

    isAdmin.value = !!data
    authLoading.value = false
    authChecked.value = true
  }

  const isAffiliate = computed(() => !isAdmin.value)
  const role = computed<'admin' | 'affiliate'>(() => isAdmin.value ? 'admin' : 'affiliate')

  return { isAdmin, isAffiliate, role, authLoading, authChecked, checkRole }
}
