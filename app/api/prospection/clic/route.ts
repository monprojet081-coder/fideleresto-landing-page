import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

// Chaque lien d'un email de prospection passe par cette route avant d'arriver à sa vraie
// destination : on enregistre le premier clic, puis on redirige immédiatement.
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id') || ''
  const url = req.nextUrl.searchParams.get('url') || 'https://fideleresto.fr'

  if (id) {
    try {
      const supabaseAdmin = getSupabaseAdmin()
      const { data: prospect } = await supabaseAdmin
        .from('prospects')
        .select('clique_le')
        .eq('id', id)
        .maybeSingle()

      if (prospect && !prospect.clique_le) {
        await supabaseAdmin
          .from('prospects')
          .update({ clique_le: new Date().toISOString() })
          .eq('id', id)
      }
    } catch (err) {
      console.error('Erreur tracking clic prospection:', err)
    }
  }

  return NextResponse.redirect(url)
}
