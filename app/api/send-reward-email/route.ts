import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { prenom, email, recompense, restaurantNom } = await req.json();

    if (!prenom || !email || !recompense) {
      return NextResponse.json(
        { error: 'Champs manquants' },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev', // à adapter selon ton domaine vérifié dans Resend
      to: [email],
      subject: `🎉 Félicitations ${prenom} ! Votre récompense vous attend`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #f59e0b; text-align: center;">🎉 Vous avez gagné !</h1>
          <p style="font-size: 18px;">Bonjour <strong>${prenom}</strong>,</p>
          <p>Félicitations ! Vous venez de remporter une récompense chez <strong>${restaurantNom || 'notre restaurant'}</strong> :</p>
          <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
            <p style="font-size: 24px; font-weight: bold; color: #92400e; margin: 0;">${recompense}</p>
          </div>
          <p>Présentez simplement cet email au restaurant pour bénéficier de votre récompense.</p>
          <hr style="border: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #6b7280; font-size: 14px; text-align: center;">
            Un avis Google positif nous ferait vraiment plaisir 😊<br/>
            Merci de votre visite !
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: 'Erreur envoi email' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}