import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const body = await readBody<{
    email: string
    displayName: string
    affiliateId: string
    commissionPercentage: number
    websiteUrl?: string
  }>(event)

  if (!body.email || !body.displayName || !body.affiliateId || body.commissionPercentage == null) {
    throw createError({ statusCode: 400, message: 'Missing required fields' })
  }

  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }
  const token = authHeader.slice(7)

  // Service role client bypasses RLS — used for admin verification and all writes
  const serviceClient = createClient(
    process.env.SUPABASE_URL || '',
    config.supabaseServiceRoleKey,
  )

  // Verify the caller's token
  const { data: { user }, error: authError } = await serviceClient.auth.getUser(token)
  if (authError || !user) {
    throw createError({ statusCode: 401, message: 'Invalid token' })
  }

  // Check if the caller is an admin (service role bypasses RLS)
  const { data: adminRow } = await serviceClient
    .from('admins')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!adminRow) {
    throw createError({ statusCode: 403, message: 'Not an admin' })
  }

  const { data: inviteData, error: inviteError } = await serviceClient.auth.admin.inviteUserByEmail(body.email)
  if (inviteError) {
    throw createError({ statusCode: 400, message: inviteError.message })
  }

  const newUserId = inviteData.user.id

  const { error: affiliateError } = await serviceClient
    .from('affiliates')
    .insert({
      id: newUserId,
      affiliate_id: body.affiliateId,
      display_name: body.displayName,
      email: body.email,
      website_url: body.websiteUrl || null,
      is_active: true,
    })

  if (affiliateError) {
    throw createError({ statusCode: 400, message: affiliateError.message })
  }

  const { error: commissionError } = await serviceClient
    .from('affiliate_commissions')
    .insert({
      affiliate_id: body.affiliateId,
      commission_percentage: body.commissionPercentage,
    })

  if (commissionError) {
    throw createError({ statusCode: 400, message: commissionError.message })
  }

  return { success: true }
})
