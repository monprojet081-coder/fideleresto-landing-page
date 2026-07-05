import { NextRequest, NextResponse } from 'next/server'
import { verifierRestaurateur } from '@/lib/verifierRestaurateur'

export async function POST(req: NextRequest) {
  try {
    const { email, restaurantSlug, montant } = await req.json()
    const auth = await verifierRestaurateur(req.headers.get('authorization'), restaurantSlug)

    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: 403 })
    }

    if (!montant || montant < (auth.restaurant.fidelite_montant_min || 0)) {
      return NextResponse.json({
        error: `Le montant doit être d'au moins ${auth.restaurant.fidelite_montant_min}€`,
      }, { status: 400 })
    }

    const { data: usersList, error: listError } = await auth.supabase.auth.admin.listUsers()
    if (listError) {
      return NextResponse.json({ error: 'Erreur lors de la recherche' }, { status: 500 })
    }

    const client = usersList.users.find(u => u.email?.toLowerCase() === email.toLowerCase())
    if (!client) {
      return NextResponse.json({ error: 'Client introuvable' }, { status: 404 })
    }

    const { data: carteExistante } = await auth.supabase
      .from('cartes_fidelite')
      .select('*')
      .eq('client_id', client.id)
      .eq('restaurant_slug', restaurantSlug)
      .maybeSingle()

    const tamponsActuels = carteExistante?.tampons ?? 0
    const tamponsRequis = auth.restaurant.fidelite_tampons_requis || 8
    const nouveauTotal = tamponsActuels + 1
    const recompenseDebloquee = nouveauTotal >= tamponsRequis
    const tamponsFinal = recompenseDebloquee ? 0 : nouveauTotal

    if (carteExistante) {
      await auth.supabase
        .from('cartes_fidelite')
        .update({ tampons: tamponsFinal, updated_at: new Date().toISOString() })
        .eq('client_id', client.id)
        .eq('restaurant_slug', restaurantSlug)
    } else {
      await auth.supabase
        .from('cartes_fidelite')
        .insert([{ client_id: client.id, restaurant_slug: restaurantSlug, tampons: tamponsFinal }])
    }

    return NextResponse.json({ tampons: tamponsFinal, recompenseDebloquee })
  } catch (err: any) {
    console.error('Erreur valider-passage:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
