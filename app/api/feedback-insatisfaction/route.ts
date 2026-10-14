import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { envoyerEmailSansBloquer } from '@/lib/resend'
import { echapperHtml } from '@/lib/securite'



// Reçoit un retour négatif capté AVANT redirection Google (fonctionnalité Premium "alerte
// insatisfaction") : on ne publie rien nulle part, on prévient juste le restaurateur par email
// pour qu'il puisse rattraper le client avant qu'un mauvais avis n'atterrisse sur Google
export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  try {
    const { slug, note, commentaire, clientRowId } = await req.json()

    if (!slug || typeof note !== 'number' || note < 1 || note > 5 || !clientRowId) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
    }

    // Anti-abus : seul un client qui vient de jouer dans CE restaurant peut laisser un retour,
    // une seule fois par partie (prenom et email viennent de la base, pas du navigateur).
    const { data: partie } = await supabase
      .from('clients')
      .select('prenom, email, created_at')
      .eq('id', clientRowId)
      .eq('restaurant_slug', slug)
      .maybeSingle()
    if (!partie || Date.now() - new Date(partie.created_at).getTime() > 6 * 3600 * 1000) {
      return NextResponse.json({ error: 'Partie introuvable' }, { status: 403 })
    }
    const { prenom, email } = partie
    const { count: dejaEnvoye } = await supabase
      .from('avis_prives')
      .select('id', { count: 'exact', head: true })
      .eq('restaurant_slug', slug)
      .eq('email', email)
      .gte('created_at', new Date(Date.now() - 20 * 3600 * 1000).toISOString())
    if ((dejaEnvoye || 0) > 0) {
      return NextResponse.json({ success: true, deja: true })
    }
    const commentairePropre = commentaire ? String(commentaire).slice(0, 2000) : null

    const { data: resto } = await supabase
      .from('restaurants')
      .select('nom_restaurant, user_id, plan')
      .eq('slug', slug)
      .maybeSingle()

    if (!resto) {
      return NextResponse.json({ error: 'Restaurant introuvable' }, { status: 404 })
    }

    // Sécurité : la fonctionnalité est réservée au Premium. Si le resto n'est pas Premium,
    // on ne fait rien (le front ne devrait de toute façon pas appeler cette route)
    if (resto.plan !== 'essentiel' && resto.plan !== 'standard') {
      return NextResponse.json({ success: true, ignored: true })
    }

    // On enregistre toujours le retour en base : c'est la source de vérité, consultable
    // depuis l'onglet "Retours clients" du dashboard, même si l'email ci-dessous échoue
    const { error: erreurInsert } = await supabase
      .from('avis_prives')
      .insert([{ restaurant_slug: slug, note, commentaire: commentairePropre, prenom: prenom || null, email: email || null }])

    if (erreurInsert) {
      console.error('Erreur enregistrement avis_prives:', erreurInsert.message)
    }

    // Récupère l'email du restaurateur (propriétaire) pour l'alerter en plus, si possible
    const { data: userData } = await supabase.auth.admin.getUserById(resto.user_id)
    const emailResto = userData?.user?.email

    if (emailResto) {
      await envoyerEmailSansBloquer({
        from: 'FidèleResto <contact@fideleresto.fr>',
        to: [emailResto],
        subject: `⚠️ Retour client à traiter (${note}/5) — ${String(resto.nom_restaurant || '').replace(/[\r\n]/g, ' ')}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #6b1e2e; font-size: 22px;">Un client a laissé un retour mitigé</h1>
            <p style="color: #241914; line-height: 1.5;">
              Bonne nouvelle : ce retour reste privé, il n'a pas été publié sur Google.
              C'est l'occasion de recontacter ce client pour arranger les choses avant qu'un avis négatif ne parte en ligne.
            </p>
            <div style="background: #faf3e8; border: 1px solid #c9962c; border-radius: 12px; padding: 20px; margin: 24px 0;">
              <p style="margin: 0 0 10px; font-size: 15px;"><strong style="color: #6b1e2e;">Note :</strong> ${note}/5</p>
              ${prenom ? `<p style="margin: 0 0 10px; font-size: 15px;"><strong style="color: #6b1e2e;">Prénom :</strong> ${echapperHtml(prenom)}</p>` : ''}
              ${email ? `<p style="margin: 0 0 10px; font-size: 15px;"><strong style="color: #6b1e2e;">Email :</strong> ${echapperHtml(email)}</p>` : ''}
              <p style="margin: 10px 0 0; font-size: 15px;"><strong style="color: #6b1e2e;">Commentaire :</strong><br/>${commentairePropre ? echapperHtml(commentairePropre).replace(/\n/g, '<br/>') : "(aucun commentaire laissé)"}</p>
            </div>
            <p style="color: #6b7280; font-size: 13px;">
              Retrouvez et gérez tous vos retours clients dans votre dashboard, onglet « Retours clients ».
            </p>
          </div>
        `,
      }, 'alerte avis negatif')
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Erreur feedback-insatisfaction:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
