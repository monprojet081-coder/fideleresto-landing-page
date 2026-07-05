import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function verifierRestaurateur(authHeader: string | null, restaurantSlug: string) {
  const token = authHeader?.replace('Bearer ', '')
  if (!token) return { ok: false as const, error: 'Non authentifié' }

  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return { ok: false as const, error: 'Session invalide' }

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('*')
    .eq('slug', restaurantSlug)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!restaurant) return { ok: false as const, error: "Vous n'êtes pas le propriétaire de ce restaurant" }

  return { ok: true as const, restaurant, supabase }
}
