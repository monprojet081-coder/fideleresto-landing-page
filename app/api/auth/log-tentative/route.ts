import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  try {
    const { email, succes } = await req.json()
    await supabase.from('connexion_tentatives').insert([{
      email: email || null,
      succes: !!succes,
    }])
  } catch (err) {
    console.error('Erreur log tentative connexion:', err)
  }
  // Toujours 200 : un souci de log ne doit jamais gener la vraie connexion de l'utilisateur
  return NextResponse.json({ ok: true })
}
