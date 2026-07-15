import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'


export async function GET(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  const email = req.nextUrl.searchParams.get('email')
  const slug = req.nextUrl.searchParams.get('slug')

  if (!email || !slug) {
    return new NextResponse('Lien invalide.', { status: 400 })
  }

  await supabaseAdmin
    .from('clients')
    .update({ consentement_marketing: false })
    .eq('email', email)
    .eq('restaurant_slug', slug)

  return new NextResponse(
    `<!DOCTYPE html>
    <html lang="fr">
      <head><meta charset="utf-8" /><title>Désinscription</title></head>
      <body style="font-family: Arial, sans-serif; max-width: 480px; margin: 80px auto; text-align: center; color: #241914;">
        <h2>Vous êtes désinscrit</h2>
        <p>Vous ne recevrez plus d'emails promotionnels de ce restaurant. Vous pouvez toujours rejouer à la roue quand vous le souhaitez.</p>
      </body>
    </html>`,
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  )
}
