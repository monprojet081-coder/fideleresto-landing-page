// Questions frequentes : affichees sur la landing (faq-section.tsx) ET envoyees a Google
// en donnees structurees (FAQPage, dans app/page.tsx). Une seule source pour les deux.
import { plans, OFFRE_LANCEMENT_ACTIVE } from "@/lib/pricing"

const essentiel = plans.find((p) => p.key === "essentiel")!
const complet = plans.find((p) => p.key === "standard")!

export const faq: { question: string; reponse: string }[] = [
  {
    question: "Mes clients doivent-ils installer une application ?",
    reponse:
      "Non. Le client scanne le QR code posé sur la table ou sur l'addition avec l'appareil photo de son téléphone : la roue s'ouvre directement dans son navigateur. Il indique son prénom et son email, tourne la roue et reçoit sa récompense par email.",
  },
  {
    question: "Combien coûte FidèleResto ?",
    reponse: `Le plan Essentiel coûte ${essentiel.prixMensuel} € par mois (${essentiel.prixSemestriel} €/mois en semestriel, ${essentiel.prixAnnuel} €/mois en annuel). Le plan Complet coûte ${complet.prixMensuel} € par mois${
      OFFRE_LANCEMENT_ACTIVE && complet.prixBarre ? ` pendant l'offre de lancement, au lieu de ${complet.prixBarre} €` : ""
    }, avec 14 jours d'essai gratuit. Sans engagement et sans frais cachés.`,
  },
  {
    question: "Quelle est la différence entre le plan Essentiel et le plan Complet ?",
    reponse:
      "L'Essentiel comprend la roue de la fidélité, le tri des avis négatifs et le tableau de bord. Le Complet ajoute la carte de fidélité digitale, le menu digital, les emails de relance automatiques, les statistiques avancées, l'accompagnement personnalisé et des flyers fournis.",
  },
  {
    question: "Comment le client récupère-t-il sa récompense ?",
    reponse:
      "Il reçoit un email avec un QR code unique, valable 10 jours et utilisable une seule fois. Il le présente au moment de payer : vous le scannez depuis votre tableau de bord et la récompense est validée.",
  },
  {
    question: "Puis-je choisir les récompenses de la roue ?",
    reponse:
      "Oui. Vous choisissez les lots (un café, un dessert, une réduction...), la probabilité de chacun, la couleur des cases et le délai avant qu'un même client puisse rejouer.",
  },
  {
    question: "Faut-il laisser un avis Google pour jouer ou pour recevoir sa récompense ?",
    reponse:
      "Non, jamais. La récompense ne dépend pas d'un avis. Après la roue, le client est simplement invité à laisser un avis s'il le souhaite, et un client mécontent peut aussi vous écrire en privé pour que vous puissiez réagir.",
  },
  {
    question: "Combien de temps faut-il pour tout mettre en place ?",
    reponse:
      "Quelques minutes : vous créez votre compte, réglez votre roue, puis imprimez votre QR code ou l'un des flyers prêts à poser sur vos tables.",
  },
]
