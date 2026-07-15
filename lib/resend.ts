import { Resend } from 'resend'

// Créé à la demande, pas au chargement du module — même raison que getSupabaseAdmin
// et getStripe : Resend valide la clé API immédiatement à la construction, ce qui
// fait planter le build Next.js si c'est fait au niveau module
export function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}
