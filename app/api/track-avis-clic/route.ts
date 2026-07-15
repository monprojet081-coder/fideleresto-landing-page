import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'


export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  try {
    const { slug } = await req.json()
    if (!slug) {
      return NextResponse.json({ error: 'Slug manquant' }, { status: 400 })
    }

    const { data: resto } = await supabase
      .from('restaurants')
      .select('avis_google_clics')
      .eq('slug', slug)
      .maybeSingle()

    if (resto) {
      await supabase
        .from('restaurants')
        .update({ avis_google_clics: (resto.avis_google_clics || 0) + 1 })
        .eq('slug', slug)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Erreur track-avis-clic:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
