import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { getResend } from '@/lib/resend'



// Reçoit un retour négatif capté AVANT redirection Google (fonctionnalité Premium "alerte
// insatisfaction") : on ne publie rien nulle part, on prévient juste le restaurateur par email
// pour qu'il puisse rattraper le client avant qu'un mauvais avis n'atterrisse sur Google
export async function POST(req: NextRequest) {
  const resend = getResend()
  const supabase = getSupabaseAdmin()
  try {
    const { slug, note, commentaire, prenom, email } = await req.json()

    if (!slug || typeof note !== 'number') {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
    }

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
    if (resto.plan !== 'premium') {
      return NextResponse.json({ success: true, ignored: true })
    }

    // On enregistre toujours le retour en base : c'est la source de vérité, consultable
    // depuis l'onglet "Retours clients" du dashboard, même si l'email ci-dessous échoue
    const { error: erreurInsert } = await supabase
      .from('avis_prives')
      .insert([{ restaurant_slug: slug, note, commentaire: commentaire || null, prenom: prenom || null, email: email || null }])

    if (erreurInsert) {
      console.error('Erreur enregistrement avis_prives:', erreurInsert.message)
    }

    // Récupère l'email du restaurateur (propriétaire) pour l'alerter en plus, si possible
    const { data: userData } = await supabase.auth.admin.getUserById(resto.user_id)
    const emailResto = userData?.user?.email

    if (emailResto) {
      await resend.emails.send({
        from: 'FidèleResto <contact@fideleresto.fr>',
        to: [emailResto],
        subject: `⚠️ Retour client à traiter (${note}/5) — ${resto.nom_restaurant}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #6b1e2e; font-size: 22px;">Un client a laissé un retour mitigé</h1>
            <p style="color: #241914; line-height: 1.5;">
              Bonne nouvelle : ce retour reste privé, il n'a pas été publié sur Google.
              C'est l'occasion de recontacter ce client pour arranger les choses avant qu'un avis négatif ne parte en ligne.
            </p>
            <div style="background: #faf3e8; border: 1px solid #c9962c; border-radius: 12px; padding: 20px; margin: 24px 0;">
              <p style="margin: 0 0 10px; font-size: 15px;"><strong style="color: #6b1e2e;">Note :</strong> ${note}/5</p>
              ${prenom ? `<p style="margin: 0 0 10px; font-size: 15px;"><strong style="color: #6b1e2e;">Prénom :</strong> ${prenom}</p>` : ''}
              ${email ? `<p style="margin: 0 0 10px; font-size: 15px;"><strong style="color: #6b1e2e;">Email :</strong> ${email}</p>` : ''}
              <p style="margin: 10px 0 0; font-size: 15px;"><strong style="color: #6b1e2e;">Commentaire :</strong><br/>${commentaire ? String(commentaire).replace(/</g, '&lt;') : "(aucun commentaire laissé)"}</p>
            </div>
            <p style="color: #6b7280; font-size: 13px;">
              Retrouvez et gérez tous vos retours clients dans votre dashboard, onglet « Retours clients ».
            </p>
          </div>
        `,
      }).catch((err) => console.error('Erreur envoi email alerte insatisfaction:', err))
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Erreur feedback-insatisfaction:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
