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

// Route légère : dit juste si l'utilisateur connecté est admin ou non,
// pour afficher (ou pas) un lien vers /admin dans le dashboard
export async function GET(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  try {
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '')

    const { data: { user } } = await supabaseAdmin.auth.getUser(token)

    return NextResponse.json({ isAdmin: estAdmin(user?.email) })
  } catch {
    return NextResponse.json({ isAdmin: false })
  }
}
