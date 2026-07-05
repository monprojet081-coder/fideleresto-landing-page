import { NextRequest, NextResponse } from 'next/server'
import { verifierRestaurateur } from '@/lib/verifierRestaurateur'

export async function POST(req: NextRequest) {
  try {
    const { email, restaurantSlug } = await req.json()
    const auth = await verifierRestaurateur(req.headers.get('authorization'), restaurantSlug)

    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: 403 })
    }

    // On cherche le compte client par email (nécessite les droits admin, indisponible côté navigateur)
    const { data: usersList, error: listError } = await auth.supabase.auth.admin.listUsers()
    if (listError) {
      return NextResponse.json({ error: 'Erreur lors de la recherche' }, { status: 500 })
    }

    const client = usersList.users.find(u => u.email?.toLowerCase() === email.toLowerCase())
    if (!client) {
      return NextResponse.json({ error: "Aucun client trouvé avec cet email. Il doit d'abord créer son compte sur la page carte de fidélité." }, { status: 404 })
    }

    const { data: carte } = await auth.supabase
      .from('cartes_fidelite')
      .select('tampons')
      .eq('client_id', client.id)
      .eq('restaurant_slug', restaurantSlug)
      .maybeSingle()

    return NextResponse.json({
      email: client.email,
      clientId: client.id,
      tampons: carte?.tampons ?? 0,
    })
  } catch (err: any) {
    console.error('Erreur rechercher-client:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
