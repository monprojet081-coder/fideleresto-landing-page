import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

// PNG transparent 1x1, le plus petit possible
const PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64'
)

// Pixel invisible inséré dans chaque email de prospection : quand le client mail charge
// les images (ce qui arrive à l'ouverture pour la plupart des clients mail), cette route
// est appelée et on enregistre la première ouverture. Toujours renvoyer le pixel, même en
// cas d'erreur, pour ne jamais casser l'affichage de l'email.
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id') || ''

  if (id) {
    try {
      const supabaseAdmin = getSupabaseAdmin()
      const { data: prospect } = await supabaseAdmin
        .from('prospects')
        .select('ouvert_le')
        .eq('id', id)
        .maybeSingle()

      if (prospect && !prospect.ouvert_le) {
        await supabaseAdmin
          .from('prospects')
          .update({ ouvert_le: new Date().toISOString() })
          .eq('id', id)
      }
    } catch (err) {
      console.error('Erreur tracking ouverture prospection:', err)
    }
  }

  return new NextResponse(PIXEL, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}
