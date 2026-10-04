import { Resend, type CreateEmailOptions } from 'resend'

// Créé à la demande, pas au chargement du module — même raison que getSupabaseAdmin
// et getStripe : Resend valide la clé API immédiatement à la construction, ce qui
// fait planter le build Next.js si c'est fait au niveau module
export function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

// Envoie un email sans JAMAIS lever d'erreur : un probleme d'email (cle absente, quota,
// domaine non verifie...) ne doit pas bloquer une operation critique comme l'activation
// d'un abonnement paye ou l'enregistrement d'un avis. La vraie raison est journalisee.
export async function envoyerEmailSansBloquer(params: CreateEmailOptions, contexte: string) {
  try {
    const { error } = await getResend().emails.send(params)
    if (error) console.error(`Resend (${contexte}) :`, JSON.stringify(error))
  } catch (err) {
    console.error(`Resend (${contexte}) exception :`, err)
  }
}
