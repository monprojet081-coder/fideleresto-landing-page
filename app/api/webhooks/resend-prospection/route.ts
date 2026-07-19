import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { getResend } from '@/lib/resend'

// Écoute les événements Resend (rebonds, plaintes spam, ouvertures, clics) pour la
// prospection. Le point critique : dès qu'un email rebondit ou déclenche une plainte,
// on retire immédiatement ce contact des envois futurs -- continuer à envoyer à une
// adresse morte abîme la réputation d'envoi de tout le domaine, y compris pour les
// emails transactionnels (récompenses, mots de passe) qui sont, eux, critiques.
export async function POST(req: NextRequest) {
  const resend = getResend()
  const supabaseAdmin = getSupabaseAdmin()

  try {
    const payload = await req.text()
    const event = resend.webhooks.verify({
      payload,
      headers: {
        id: req.headers.get('svix-id') || '',
        timestamp: req.headers.get('svix-timestamp') || '',
        signature: req.headers.get('svix-signature') || '',
      },
      webhookSecret: process.env.RESEND_WEBHOOK_SECRET!,
    })

    const email = (event.data as any)?.to?.[0]
    if (!email) {
      return NextResponse.json({ success: true, ignore: 'pas de destinataire dans l\'événement' })
    }

    if (event.type === 'email.bounced' || event.type === 'email.complained') {
      const nouveauStatut = event.type === 'email.bounced' ? 'email_invalide' : 'desabonne'
      await supabaseAdmin
        .from('prospects')
        .update({ statut: nouveauStatut, updated_at: new Date().toISOString() })
        .eq('email', email.toLowerCase())
        // Ne jamais écraser un statut déjà avancé (répondu, client) même en cas de
        // rebond tardif sur un ancien envoi
        .in('statut', ['a_contacter', 'envoye', 'en_attente'])
    }

    if (event.type === 'email.opened') {
      await supabaseAdmin
        .from('prospects')
        .update({ ouvert_le: new Date().toISOString() })
        .eq('email', email.toLowerCase())
        .is('ouvert_le', null)
    }

    if (event.type === 'email.clicked') {
      await supabaseAdmin
        .from('prospects')
        .update({ clique_le: new Date().toISOString() })
        .eq('email', email.toLowerCase())
        .is('clique_le', null)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Erreur webhook Resend prospection:', err)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
