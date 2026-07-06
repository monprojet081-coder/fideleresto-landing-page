import { NextRequest, NextResponse } from 'next/server'
import { verifierRestaurateur } from '@/lib/verifierRestaurateur'

export async function POST(req: NextRequest) {
  try {
    const { clientId, restaurantSlug } = await req.json()
    const auth = await verifierRestaurateur(req.headers.get('authorization'), restaurantSlug)

    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: 403 })
    }

    const { data: userData, error: userError } = await auth.supabase.auth.admin.getUserById(clientId)
    if (userError || !userData?.user) {
      return NextResponse.json({ error: 'QR code invalide ou client introuvable' }, { status: 404 })
    }

    const { data: carte } = await auth.supabase
      .from('cartes_fidelite')
      .select('tampons')
      .eq('client_id', clientId)
      .eq('restaurant_slug', restaurantSlug)
      .maybeSingle()

    return NextResponse.json({
      email: userData.user.email,
      clientId,
      tampons: carte?.tampons ?? 0,
    })
  } catch (err: any) {
    console.error('Erreur rechercher-client-id:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
