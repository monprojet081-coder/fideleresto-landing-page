import { NextRequest, NextResponse } from 'next/server'
import { verifierRestaurateur } from '@/lib/verifierRestaurateur'

export async function GET(req: NextRequest) {
  try {
    const slug = req.nextUrl.searchParams.get('slug') || ''
    const email = req.nextUrl.searchParams.get('email') || ''
    if (!slug || !email) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
    }

    const auth = await verifierRestaurateur(req.headers.get('authorization'), slug)
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: 403 })
    }

    const { data: resultats, error } = await auth.supabase
      .from('clients')
      .select('id, prenom, email, recompense, recompense_utilisee, recompense_utilisee_le, created_at')
      .eq('restaurant_slug', slug)
      .eq('email', email.trim().toLowerCase())
      .eq('a_gagne', true)
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) {
      return NextResponse.json({ error: 'Erreur lors de la recherche' }, { status: 500 })
    }

    return NextResponse.json({ recompenses: resultats || [] })
  } catch (err: any) {
    console.error('Erreur rechercher-recompense:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
