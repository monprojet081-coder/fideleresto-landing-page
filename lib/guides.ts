// Guides SEO : pages de contenu qui repondent aux questions que les restaurateurs tapent
// dans Google. Chaque guide = une page /guides/<slug>, listee dans le sitemap.
// Regle : du contenu utile et honnete, pas de chiffres inventes.

export type BlocGuide =
  | { type: "p"; texte: string }
  | { type: "liste"; items: string[] }

export type Guide = {
  slug: string
  titre: string // H1
  metaTitre: string // <title>, ~60 caracteres
  description: string // meta description, ~155 caracteres
  intro: string
  publieLe: string // ISO
  sections: { titre: string; blocs: BlocGuide[] }[]
}

export const guides: Guide[] = [
  {
    slug: "carte-de-fidelite-digitale-restaurant",
    titre: "Carte de fidélité digitale pour restaurant : le guide complet",
    metaTitre: "Carte de fidélité digitale pour restaurant : le guide",
    description:
      "Comment fonctionne une carte de fidélité digitale pour restaurant, pourquoi elle remplace la carte papier et comment la mettre en place en quelques minutes.",
    intro:
      "La carte de fidélité en carton a fait son temps : elle se perd, s'oublie dans un autre manteau et ne vous apprend rien sur vos clients. La version digitale garde le même principe (un tampon par visite, une récompense au bout), mais sur le téléphone du client.",
    publieLe: "2026-10-07",
    sections: [
      {
        titre: "Qu'est-ce qu'une carte de fidélité digitale ?",
        blocs: [
          {
            type: "p",
            texte:
              "C'est une carte de fidélité qui vit sur le téléphone du client au lieu de son portefeuille. Le client y accède depuis un lien ou un QR code, sans application à télécharger. À chaque passage, vous validez un tampon ; quand la carte est pleine, il obtient la récompense que vous avez choisie.",
          },
        ],
      },
      {
        titre: "Pourquoi abandonner la carte papier ?",
        blocs: [
          {
            type: "liste",
            items: [
              "Elle ne se perd plus : le client l'a toujours sur lui, dans son téléphone.",
              "Pas d'impression ni de tampon encreur à racheter.",
              "Pas de triche avec un tampon imité : chaque passage est validé par vous.",
              "Vous savez enfin qui sont vos clients réguliers, et combien de fois ils reviennent.",
              "Vous pouvez recontacter un client qui ne revient plus (avec son accord).",
            ],
          },
        ],
      },
      {
        titre: "Comment ça marche au quotidien",
        blocs: [
          {
            type: "p",
            texte:
              "Côté client, il scanne le QR code du restaurant et retrouve sa carte avec ses tampons. Côté restaurant, au moment de payer, vous scannez le QR code de sa carte depuis votre tableau de bord (ou vous le retrouvez par son email) et vous validez le passage. Vous pouvez fixer un montant minimum pour qu'un passage compte, et le nombre de tampons nécessaires.",
          },
        ],
      },
      {
        titre: "Bien choisir la récompense",
        blocs: [
          {
            type: "p",
            texte:
              "La récompense doit être assez attirante pour donner envie de revenir, sans peser sur votre marge. Les formules qui marchent bien : un plat ou un menu offert après un certain nombre de visites, une boisson ou un dessert, ou une réduction sur l'addition. Un nombre de tampons raisonnable (souvent entre 6 et 10) évite que le client abandonne en cours de route.",
          },
        ],
      },
      {
        titre: "Combiner la carte avec d'autres leviers",
        blocs: [
          {
            type: "p",
            texte:
              "La carte de fidélité récompense ceux qui reviennent déjà. Pour faire revenir les autres, on l'associe souvent à un jeu au premier passage (une roue de la fidélité, par exemple) et à des emails de relance envoyés aux clients qui ne sont pas revenus depuis un moment.",
          },
        ],
      },
    ],
  },
  {
    slug: "avoir-plus-avis-google-restaurant",
    titre: "Comment avoir plus d'avis Google pour son restaurant (en respectant les règles)",
    metaTitre: "Plus d'avis Google pour son restaurant : la bonne méthode",
    description:
      "Les méthodes qui marchent pour obtenir plus d'avis Google dans un restaurant, et celles à éviter car interdites par Google : avis achetés, cadeaux contre un avis.",
    intro:
      "Les avis Google pèsent lourd dans le choix d'un restaurant, et dans son classement sur Google Maps. Bonne nouvelle : la plupart des clients satisfaits sont prêts à en laisser un. Il suffit souvent de leur demander au bon moment, de la bonne façon.",
    publieLe: "2026-10-07",
    sections: [
      {
        titre: "Pourquoi les avis Google comptent autant",
        blocs: [
          {
            type: "p",
            texte:
              "Quand quelqu'un cherche « restaurant » autour de lui, Google Maps met en avant les établissements avec une bonne note et des avis nombreux et récents. Les avis rassurent aussi les nouveaux clients : un restaurant avec peu d'avis paraît moins fiable, même si la cuisine est excellente.",
          },
        ],
      },
      {
        titre: "Ce qui est interdit (et peut vous coûter cher)",
        blocs: [
          {
            type: "p",
            texte:
              "Google sanctionne les pratiques qui faussent les avis. Les sanctions peuvent aller de la suppression d'avis à un message d'avertissement affiché publiquement sur votre fiche. À éviter absolument :",
          },
          {
            type: "liste",
            items: [
              "Offrir un cadeau, une réduction ou un avantage en échange d'un avis.",
              "Acheter des avis ou en faire écrire par des proches ou des employés.",
              "Rédiger des avis à la place des clients, ou leur dicter quoi écrire.",
              "Tendre la tablette ou le téléphone du restaurant pour que le client publie sur place.",
            ],
          },
        ],
      },
      {
        titre: "Les méthodes qui marchent",
        blocs: [
          {
            type: "liste",
            items: [
              "Demander à tous vos clients, pas seulement à ceux qui semblent contents.",
              "Rendre la démarche ultra simple : un lien ou un QR code qui ouvre directement la page d'avis.",
              "Choisir le bon moment : en fin de repas, quand l'expérience est encore fraîche.",
              "Répondre à tous les avis, positifs comme négatifs : ça montre que vous écoutez et encourage d'autres clients à écrire.",
              "Offrir aux clients mécontents un moyen de vous écrire directement, pour régler le problème rapidement.",
            ],
          },
        ],
      },
      {
        titre: "Utiliser un QR code sur les tables",
        blocs: [
          {
            type: "p",
            texte:
              "Un QR code sur la table ou sur l'addition permet au client d'arriver sur votre page d'avis en deux secondes, depuis son propre téléphone. Avec FidèleResto, ce QR code ouvre d'abord une roue de la fidélité : le client tente sa chance pour gagner une récompense, puis il est invité à laisser un avis s'il le souhaite. La récompense ne dépend jamais de l'avis, ce qui reste conforme aux règles de Google.",
          },
        ],
      },
      {
        titre: "Que faire d'un avis négatif ?",
        blocs: [
          {
            type: "p",
            texte:
              "Répondez calmement, rapidement et sans vous justifier à l'excès. Remerciez pour le retour, reconnaissez le problème s'il est réel et proposez une solution. Un avis négatif bien traité rassure souvent plus qu'une note parfaite.",
          },
        ],
      },
    ],
  },
  {
    slug: "roue-de-la-fortune-qr-code-restaurant",
    titre: "Roue de la fortune avec QR code pour restaurant : comment ça marche",
    metaTitre: "Roue de la fortune QR code pour restaurant : le principe",
    description:
      "Une roue de la fortune accessible par QR code pour faire jouer vos clients, leur offrir une récompense et les faire revenir. Fonctionnement, lots et bonnes pratiques.",
    intro:
      "La roue de la fortune est un petit jeu que vos clients lancent depuis leur téléphone, en scannant un QR code. Ils gagnent une récompense à utiliser lors d'une prochaine venue ou au moment de payer. C'est simple, ludique, et ça donne une vraie raison de revenir.",
    publieLe: "2026-10-07",
    sections: [
      {
        titre: "Le principe en 3 étapes",
        blocs: [
          {
            type: "liste",
            items: [
              "Le client scanne le QR code posé sur la table, le comptoir ou l'addition.",
              "Il indique son prénom et son email, puis fait tourner la roue.",
              "Il reçoit sa récompense par email, avec un QR code à présenter au moment de payer.",
            ],
          },
        ],
      },
      {
        titre: "Quels lots mettre sur la roue ?",
        blocs: [
          {
            type: "p",
            texte:
              "Les meilleurs lots coûtent peu au restaurant mais font plaisir : un café, une boisson, un dessert, une petite réduction. Vous pouvez ajouter un lot plus rare (un plat offert, par exemple) avec une faible probabilité pour créer de l'envie. Avec FidèleResto, vous réglez vous-même chaque lot, sa probabilité et la couleur de sa case.",
          },
        ],
      },
      {
        titre: "Éviter les abus",
        blocs: [
          {
            type: "p",
            texte:
              "Pour qu'un client ne rejoue pas dix fois de suite, le tirage se fait côté serveur et chaque email ne peut jouer qu'une fois sur la période que vous choisissez (tous les jours, toutes les semaines...). Chaque récompense a un QR code unique, valable 10 jours et utilisable une seule fois.",
          },
        ],
      },
      {
        titre: "Ce que la roue vous rapporte",
        blocs: [
          {
            type: "liste",
            items: [
              "Une raison concrète pour le client de revenir chercher sa récompense.",
              "Le prénom et l'email de vos clients, pour les recontacter avec leur accord.",
              "Un moment idéal pour proposer de laisser un avis Google, sans contrepartie.",
              "Une animation qui fait parler de votre restaurant.",
            ],
          },
        ],
      },
      {
        titre: "Les règles à respecter",
        blocs: [
          {
            type: "p",
            texte:
              "La récompense ne doit jamais être conditionnée à un avis Google : c'est interdit par Google. Le jeu doit aussi rester gratuit et sans obligation d'achat pour participer. Enfin, l'email du client ne peut servir à lui envoyer des offres que s'il l'a accepté.",
          },
        ],
      },
    ],
  },
  {
    slug: "fideliser-clients-restaurant",
    titre: "Fidéliser les clients de son restaurant : 7 idées concrètes",
    metaTitre: "Fidéliser les clients de son restaurant : 7 idées",
    description:
      "7 idées concrètes pour fidéliser les clients d'un restaurant indépendant : carte de fidélité digitale, jeu QR code, relances email, avis Google et accueil.",
    intro:
      "Faire revenir un client coûte bien moins cher que d'en attirer un nouveau. Pour un restaurant indépendant, une base de clients réguliers, c'est un chiffre d'affaires plus stable et plus prévisible. Voici sept idées simples à mettre en place.",
    publieLe: "2026-10-07",
    sections: [
      {
        titre: "1. Soigner l'accueil et se souvenir des habitués",
        blocs: [
          {
            type: "p",
            texte:
              "C'est la base, et aucun outil ne la remplace. Reconnaître un client, se souvenir de sa commande habituelle ou de son prénom crée un lien que les grandes chaînes ne peuvent pas offrir.",
          },
        ],
      },
      {
        titre: "2. Passer à la carte de fidélité digitale",
        blocs: [
          {
            type: "p",
            texte:
              "Elle ne se perd pas, ne coûte rien à imprimer et vous montre qui revient vraiment. Le client la retrouve sur son téléphone, sans application.",
          },
        ],
      },
      {
        titre: "3. Donner une raison de revenir dès la première visite",
        blocs: [
          {
            type: "p",
            texte:
              "Un petit jeu au premier passage, comme une roue de la fidélité accessible par QR code, permet d'offrir une récompense à venir chercher. Le client repart avec une bonne raison de repasser.",
          },
        ],
      },
      {
        titre: "4. Garder le contact (avec l'accord du client)",
        blocs: [
          {
            type: "p",
            texte:
              "Sans coordonnées, un client qui ne revient plus est perdu. Avec son email et son accord, vous pouvez le prévenir d'une nouveauté ou lui envoyer une petite offre.",
          },
        ],
      },
      {
        titre: "5. Relancer ceux qui ne reviennent plus",
        blocs: [
          {
            type: "p",
            texte:
              "Un email automatique envoyé à un client qu'on n'a pas vu depuis quelques semaines, avec une petite attention, suffit souvent à le faire revenir. L'automatisation évite d'y penser chaque semaine.",
          },
        ],
      },
      {
        titre: "6. Écouter les clients mécontents",
        blocs: [
          {
            type: "p",
            texte:
              "Un client déçu qui peut vous écrire directement vous donne la chance de corriger le problème. Répondez vite et sincèrement : un client bien traité après un raté devient souvent un fidèle.",
          },
        ],
      },
      {
        titre: "7. Inviter à laisser un avis Google",
        blocs: [
          {
            type: "p",
            texte:
              "Les avis attirent de nouveaux clients et rappellent aux anciens pourquoi ils vous aiment. Proposez à tous vos clients de laisser un avis, simplement, sans rien offrir en échange : c'est la règle chez Google.",
          },
        ],
      },
    ],
  },
]

export function trouverGuide(slug: string) {
  return guides.find((g) => g.slug === slug)
}
