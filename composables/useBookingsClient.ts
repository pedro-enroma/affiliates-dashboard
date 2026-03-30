import { createClient } from '@supabase/supabase-js'

export function useBookingsClient() {
  const config = useRuntimeConfig()

  const client = createClient(
    config.public.bookingsSupabaseUrl,
    config.public.bookingsSupabaseKey,
  )

  return client
}
