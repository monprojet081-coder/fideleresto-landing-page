import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'


function estAdmin(email: string | undefined | null) {
  if (!email) return false
  const listeAdmins = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)
  return listeAdmins.includes(email.toLowerCase())
}

export async function POST(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  try {
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '')

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user || !estAdmin(user.email)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const { targetUserId } = await req.json()
    if (!targetUserId) {
      return NextResponse.json({ error: 'Restaurant manquant' }, { status: 400 })
    }

    const { data: targetUser, error: targetError } = await supabaseAdmin.auth.admin.getUserById(targetUserId)
    if (targetError || !targetUser?.user?.email) {
      return NextResponse.json({ error: 'Restaurateur introuvable' }, { status: 404 })
    }

    const { data: lien, error: lienError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: targetUser.user.email,
    })

    if (lienError || !lien?.properties?.hashed_token) {
      return NextResponse.json({ error: "Impossible de générer l'accès" }, { status: 500 })
    }

    return NextResponse.json({
      email: targetUser.user.email,
      hashedToken: lien.properties.hashed_token,
    })
  } catch (err: any) {
    return NextResponse.json({ error: 'Erreur serveur : ' + err.message }, { status: 500 })
  }
}
