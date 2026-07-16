import nodemailer from 'nodemailer'

// Canal d'envoi totalement separe de Resend, utilise uniquement pour la prospection a froid.
// But : ne jamais risquer qu'une campagne de demarchage consomme le quota partage de Resend
// et empeche un email transactionnel important (recompense roue, relance client) de partir
// a un vrai client payant.
export function getGmailTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })
}
