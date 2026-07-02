import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { slug } = await req.json()
    if (!slug) {
      return NextResponse.json({ error: 'Slug manquant' }, { status: 400 })
    }

    const { data: resto } = await supabase
      .from('restaurants')
      .select('scan_qr')
      .eq('slug', slug)
      .maybeSingle()

    if (resto) {
      await supabase
        .from('restaurants')
        .update({ scan_qr: (resto.scan_qr || 0) + 1 })
        .eq('slug', slug)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Erreur track-scan:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}