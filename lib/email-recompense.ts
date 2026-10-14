import QRCode from 'qrcode'
import { getResend } from '@/lib/resend'
import { DUREE_VALIDITE_JOURS } from '@/lib/recompenses'
import { contenuQrRecompense, echapperHtml } from '@/lib/securite'

/**
 * Email envoye au client qui vient de gagner, avec le QR code SIGNE de sa recompense.
 * Appele uniquement par le serveur (/api/roue/jouer), jamais depuis le navigateur.
 */
export async function envoyerEmailRecompense(d: { id: string; prenom: string; email: string; recompense: string; restaurantNom?: string | null; slug: string }) {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fideleresto.fr'
    const lienCarte = `${siteUrl}/carte/${encodeURIComponent(d.slug)}`
    const p = echapperHtml(d.prenom)
    const r = echapperHtml(d.recompense)
    const resto = echapperHtml(d.restaurantNom || 'notre restaurant')
    let qrBuffer: Buffer | null = null
    try {
      qrBuffer = await QRCode.toBuffer(contenuQrRecompense(d.id), { width: 220, margin: 1, color: { dark: '#241914', light: '#ffffff' } })
    } catch (qrErr) {
      console.error('Erreur generation QR recompense:', qrErr)
    }
    const { error } = await getResend().emails.send({
      from: 'FidèleResto <contact@fideleresto.fr>',
      to: [d.email],
      subject: `🎉 Félicitations ${d.prenom.replace(/[\r\n]/g, ' ')} ! Votre récompense vous attend`,
      attachments: qrBuffer
        ? [{ filename: 'recompense-qr.png', content: qrBuffer, contentType: 'image/png', contentId: 'qr-recompense' }]
        : undefined,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #f59e0b; text-align: center;">🎉 Vous avez gagné !</h1>
          <p style="font-size: 18px;">Bonjour <strong>${p}</strong>,</p>
          <p>Félicitations ! Vous venez de remporter une récompense chez <strong>${resto}</strong> :</p>
          <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
            <p style="font-size: 24px; font-weight: bold; color: #92400e; margin: 0;">${r}</p>
          </div>
          ${qrBuffer ? `
          <div style="text-align: center; margin: 24px 0;">
            <p style="font-size: 14px; color: #4b5563; margin-bottom: 10px;">Présentez ce code au comptoir au moment de payer :</p>
            <img src="cid:qr-recompense" alt="QR code de votre récompense" width="180" height="180" style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px;" />
            <p style="font-size: 13px; color: #9ca3af; margin-top: 10px;">Valable ${DUREE_VALIDITE_JOURS} jours, utilisable une seule fois.</p>
          </div>
          ` : `
          <p>Présentez simplement cet email au restaurant pour bénéficier de votre récompense.</p>
          `}
          ${lienCarte ? `
          <div style="text-align: center; margin: 28px 0;">
            <a href="${lienCarte}" style="display: inline-block; background: #6b1e2e; color: #f5e6c8; text-decoration: none; font-weight: bold; padding: 14px 28px; border-radius: 8px;">
              🍽️ Voir le menu et ma carte de fidélité
            </a>
          </div>
          ` : ''}
          <hr style="border: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #6b7280; font-size: 14px; text-align: center;">
            Un avis Google positif nous ferait vraiment plaisir 😊<br/>
            Merci de votre visite !
          </p>
        </div>
      `,
    })
    if (error) console.error('Resend (recompense) :', JSON.stringify(error))
  } catch (err) {
    console.error('Erreur email recompense :', err)
  }
}
