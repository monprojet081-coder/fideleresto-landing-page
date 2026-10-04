import { NextRequest, NextResponse } from 'next/server'
import { verifierRestaurateur } from '@/lib/verifierRestaurateur'
import { DUREE_VALIDITE_JOURS } from '@/lib/recompenses'

export async function POST(req: NextRequest) {
  try {
    const { slug, clientRowId } = await req.json()
    if (!slug || !clientRowId) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
    }

    const auth = await verifierRestaurateur(req.headers.get('authorization'), slug)
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: 403 })
    }

    const { data: client, error } = await auth.supabase
      .from('clients')
      .select('id, prenom, email, recompense, a_gagne, recompense_utilisee, recompense_utilisee_le, created_at')
      .eq('id', clientRowId)
      .eq('restaurant_slug', slug)
      .maybeSingle()

    if (error || !client) {
      return NextResponse.json({ error: 'Récompense introuvable' }, { status: 404 })
    }

    if (!client.a_gagne) {
      return NextResponse.json({ error: "Ce code ne correspond pas à un gain" }, { status: 400 })
    }

    if (client.recompense_utilisee) {
      const dateUtilisation = client.recompense_utilisee_le
        ? new Date(client.recompense_utilisee_le).toLocaleDateString('fr-FR')
        : 'déjà'
      return NextResponse.json({
        error: `Récompense déjà utilisée le ${dateUtilisation}`,
        dejaUtilisee: true,
        prenom: client.prenom,
        recompense: client.recompense,
      }, { status: 409 })
    }

    const dateExpiration = new Date(client.created_at)
    dateExpiration.setDate(dateExpiration.getDate() + DUREE_VALIDITE_JOURS)
    if (dateExpiration < new Date()) {
      return NextResponse.json({
        error: `Récompense expirée depuis le ${dateExpiration.toLocaleDateString('fr-FR')}`,
        expiree: true,
        prenom: client.prenom,
        recompense: client.recompense,
      }, { status: 410 })
    }

    const { error: updateError } = await auth.supabase
      .from('clients')
      .update({ recompense_utilisee: true, recompense_utilisee_le: new Date().toISOString() })
      .eq('id', clientRowId)

    if (updateError) {
      return NextResponse.json({ error: 'Erreur lors de la validation' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      prenom: client.prenom,
      recompense: client.recompense,
    })
  } catch (err: any) {
    console.error('Erreur valider-recompense:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
