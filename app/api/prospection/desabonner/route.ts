import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

// Lien de désinscription présent dans chaque email de prospection : pas d'authentification
// nécessaire (le lien est la preuve suffisante), marque juste le contact comme desabonne
// pour qu'il ne soit plus jamais selectionne par le cron d'envoi
export async function GET(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  const id = req.nextUrl.searchParams.get('id') || ''

  if (id) {
    await supabaseAdmin
      .from('prospects')
      .update({ statut: 'desabonne', updated_at: new Date().toISOString() })
      .eq('id', id)
  }

  return new NextResponse(
    `<!DOCTYPE html>
    <html lang="fr">
    <head><meta charset="utf-8" /><title>Désinscription</title></head>
    <body style="font-family: Arial, sans-serif; max-width: 480px; margin: 80px auto; text-align: center; color: #241914;">
      <h1 style="color: #6b1e2e;">Vous avez bien été désinscrit</h1>
      <p>Vous ne recevrez plus d'email de notre part.</p>
    </body>
    </html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  )
}
