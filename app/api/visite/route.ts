import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST() {
  const supabase = getSupabaseAdmin()
  try {
    await supabase.from('visites').insert([{}])
  } catch (err) {
    console.error('Erreur log visite:', err)
  }
  return NextResponse.json({ ok: true })
}
