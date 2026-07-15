import { NextRequest, NextResponse } from 'next/server'
import { verifierRestaurateur } from '@/lib/verifierRestaurateur'

// Liste les retours clients privés (alerte insatisfaction) d'un restaurant, du plus récent
// au plus ancien. Le restaurateur choisit de les lire pour s'améliorer ou de les supprimer.
export async function GET(req: NextRequest) {
  const restaurantSlug = req.nextUrl.searchParams.get('slug') || ''
  const auth = await verifierRestaurateur(req.headers.get('authorization'), restaurantSlug)

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 403 })
  }

  const { data, error } = await auth.supabase
    .from('avis_prives')
    .select('*')
    .eq('restaurant_slug', restaurantSlug)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ avis: data })
}

// Supprime un retour client privé (le restaurateur l'a lu et n'a plus besoin de le garder)
export async function DELETE(req: NextRequest) {
  const restaurantSlug = req.nextUrl.searchParams.get('slug') || ''
  const id = req.nextUrl.searchParams.get('id') || ''
  const auth = await verifierRestaurateur(req.headers.get('authorization'), restaurantSlug)

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 403 })
  }
  if (!id) {
    return NextResponse.json({ error: 'Identifiant manquant' }, { status: 400 })
  }

  const { error } = await auth.supabase
    .from('avis_prives')
    .delete()
    .eq('id', id)
    .eq('restaurant_slug', restaurantSlug)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
