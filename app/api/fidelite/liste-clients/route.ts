import { NextRequest, NextResponse } from 'next/server'
import { verifierRestaurateur } from '@/lib/verifierRestaurateur'

export async function GET(req: NextRequest) {
  try {
    const restaurantSlug = req.nextUrl.searchParams.get('slug') || ''
    const auth = await verifierRestaurateur(req.headers.get('authorization'), restaurantSlug)

    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: 403 })
    }

    const { data: cartes, error } = await auth.supabase
      .from('cartes_fidelite')
      .select('client_id, prenom, tampons, updated_at')
      .eq('restaurant_slug', restaurantSlug)
      .order('tampons', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Erreur lors de la récupération' }, { status: 500 })
    }

    return NextResponse.json({ clients: cartes ?? [] })
  } catch (err: any) {
    console.error('Erreur liste-clients:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
