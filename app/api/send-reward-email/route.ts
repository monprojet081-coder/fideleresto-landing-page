import { NextRequest, NextResponse } from 'next/server';
import { getResend } from '@/lib/resend'
import QRCode from 'qrcode'
import { DUREE_VALIDITE_JOURS } from '@/lib/recompenses'

export async function POST(req: NextRequest) {
  try {
    const { prenom, email, recompense, restaurantNom, slug, clientRowId } = await req.json();

    if (!prenom || !email || !recompense) {
      return NextResponse.json(
        { error: 'Champs manquants' },
        { status: 400 }
      );
    }

    // Cree ICI, dans le try : si RESEND_API_KEY est absente, getResend() leve une erreur.
    // Hors du try, elle donnait un 500 muet, impossible a diagnostiquer.
    const resend = getResend()

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fideleresto.fr'
    const lienCarte = slug ? `${siteUrl}/carte/${slug}` : null

    // QR code unique par recompense : le restaurateur le scanne en caisse pour la valider.
    // Empeche qu'un meme gain soit presente plusieurs fois (le QR est invalide des qu'il a
    // ete scanne une fois) et donne au restaurateur une tracabilite complete (qui a gagne
    // quoi, et quand c'est utilise).
    // Le QR est envoye comme image integree a l'email (identifiant cid:) et non en
    // base64 dans le HTML : Gmail et Outlook n'affichent generalement pas les images data:.
    let qrBuffer: Buffer | null = null
    if (clientRowId) {
      try {
        qrBuffer = await QRCode.toBuffer(`fideleresto:recompense:${clientRowId}`, {
          width: 220,
          margin: 1,
          color: { dark: '#241914', light: '#ffffff' },
        })
      } catch (qrErr) {
        console.error('Erreur generation QR recompense:', qrErr)
      }
    }

    const { data, error } = await resend.emails.send({
      from: 'FidèleResto <contact@fideleresto.fr>',
      to: [email],
      subject: `🎉 Félicitations ${prenom} ! Votre récompense vous attend`,
      attachments: qrBuffer
        ? [{ filename: 'recompense-qr.png', content: qrBuffer, contentType: 'image/png', contentId: 'qr-recompense' }]
        : undefined,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #f59e0b; text-align: center;">🎉 Vous avez gagné !</h1>
          <p style="font-size: 18px;">Bonjour <strong>${prenom}</strong>,</p>
          <p>Félicitations ! Vous venez de remporter une récompense chez <strong>${restaurantNom || 'notre restaurant'}</strong> :</p>
          <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
            <p style="font-size: 24px; font-weight: bold; color: #92400e; margin: 0;">${recompense}</p>
          </div>
          ${qrBuffer ? `
          <div style="text-align: center; margin: 24px 0;">
            <p style="font-size: 14px; color: #4b5563; margin-bottom: 10px;">Présentez ce code au comptoir lors de votre prochaine visite :</p>
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
    });

    if (error) {
      console.error('Resend error:', JSON.stringify(error));
      return NextResponse.json(
        { error: 'Erreur envoi email', detail: `${error.name}: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Server error send-reward-email:', err);
    return NextResponse.json(
      { error: 'Erreur serveur', detail: err?.message || 'inconnue' },
      { status: 500 }
    );
  }
}