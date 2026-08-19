import { LegalLayout } from "@/components/legal-layout"

export const metadata = { title: "Conditions générales — FidèleResto" }

export default function ConditionsGeneralesPage() {
  return (
    <LegalLayout title="Conditions générales d'utilisation et de vente" majDate="8 août 2026">
      <section>
        <p>
          Les présentes conditions régissent l'utilisation de la plateforme FidèleResto, éditée par Victor
          Ehrenbogen, micro-entrepreneur (SIRET 442 585 980 00026), et la souscription aux abonnements proposés.
          Toute inscription sur FidèleResto implique l'acceptation pleine et entière des présentes conditions.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-wine">1. Description du service</h2>
        <p className="mt-2">
          FidèleResto est une plateforme SaaS destinée aux restaurateurs, proposant : une roue de la fidélité
          digitale accessible par QR code, un dispositif d'incitation aux avis Google, une carte de fidélité
          digitale, et un menu digital consultable en ligne.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-wine">2. Inscription et compte</h2>
        <p className="mt-2">
          L'inscription est réservée aux professionnels de la restauration. Le restaurateur s'engage à fournir des
          informations exactes lors de son inscription et à maintenir la confidentialité de ses identifiants de
          connexion. Toute action réalisée depuis son compte est réputée effectuée par lui.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-wine">3. Abonnements et tarifs</h2>
        <p className="mt-2">
          FidèleResto propose plusieurs formules d'abonnement, dont le détail et les tarifs en vigueur sont
          consultables sur la page tarifs du site. Un essai gratuit peut être proposé pour certaines offres, dont la
          durée est précisée au moment de la souscription. Sauf mention contraire, les abonnements sont facturés
          mensuellement ou annuellement, par avance, et se renouvellent automatiquement à chaque échéance jusqu'à
          résiliation.
        </p>
        <p className="mt-2">
          Les tarifs sont indiqués en euros. FidèleResto étant soumis au régime de la micro-entreprise en franchise
          en base de TVA, les prix affichés ne comportent pas de TVA (article 293 B du Code Général des Impôts).
        </p>
        <p className="mt-2">
          En cas de modification des tarifs, les restaurateurs déjà abonnés en seront informés par email au moins 30
          jours avant l'entrée en vigueur du nouveau tarif. Le restaurateur qui n'accepte pas cette modification peut
          résilier son abonnement avant la date d'application, sans pénalité.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-wine">4. Paiement</h2>
        <p className="mt-2">
          Les paiements sont traités par notre prestataire Stripe. FidèleResto n'a à aucun moment accès aux
          coordonnées bancaires complètes du restaurateur. En cas d'échec de paiement, l'accès à certaines
          fonctionnalités peut être suspendu jusqu'à régularisation.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-wine">5. Résiliation par le restaurateur</h2>
        <p className="mt-2">
          Le restaurateur peut résilier son abonnement à tout moment depuis son espace de gestion ou en nous
          contactant à contact@fideleresto.fr. La résiliation prend effet à la fin de la période déjà payée ; aucun
          remboursement au prorata n'est effectué pour la période en cours, sauf disposition légale contraire.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-wine">6. Suspension et résiliation par FidèleResto</h2>
        <p className="mt-2">
          FidèleResto se réserve le droit de suspendre ou de résilier, sans préavis en cas d'urgence et après mise
          en demeure restée sans effet dans les autres cas, l'accès d'un restaurateur qui manquerait à ses
          obligations au titre des présentes conditions, notamment en cas d'usage frauduleux de la plateforme, de
          non-paiement, ou d'utilisation contraire à la réglementation applicable. Cette suspension ou résiliation
          n'ouvre droit à aucun remboursement des sommes déjà versées.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-wine">7. Droit de rétractation</h2>
        <p className="mt-2">
          Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne s'applique pas
          aux contrats conclus entre professionnels dans le cadre de leur activité. Les restaurateurs souscrivant à
          FidèleResto agissent en qualité de professionnels.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-wine">8. Obligations du restaurateur</h2>
        <p className="mt-2">
          Le restaurateur s'engage à utiliser la plateforme conformément à sa destination, à ne pas détourner le
          service à des fins frauduleuses, et à respecter la réglementation applicable à la collecte de données de
          ses propres clients (notamment le RGPD). Le restaurateur reste seul responsable des récompenses proposées
          via la roue de la fidélité et de leur bonne remise aux clients gagnants.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-wine">9. Protection des données personnelles</h2>

        <h3 className="mt-4 font-display text-base font-semibold text-ink">9.1 Données du restaurateur</h3>
        <p className="mt-2">
          FidèleResto collecte et traite les données personnelles du restaurateur nécessaires à la gestion de son
          compte et de son abonnement (identité, coordonnées, informations de facturation), conformément au
          Règlement Général sur la Protection des Données (RGPD). Ces données sont conservées pendant la durée de la
          relation contractuelle et pendant la durée légale de conservation applicable en matière comptable et
          fiscale à l'issue de celle-ci.
        </p>

        <h3 className="mt-4 font-display text-base font-semibold text-ink">9.2 Données des clients du restaurateur</h3>
        <p className="mt-2">
          Dans le cadre de l'utilisation de la roue de la fidélité, de la carte de fidélité digitale et des
          dispositifs associés, FidèleResto est amené à collecter et héberger, pour le compte du restaurateur, des
          données personnelles relatives aux clients de ce dernier (nom, email, numéro de téléphone notamment).
        </p>
        <p className="mt-2">
          Dans ce cadre, FidèleResto agit en qualité de sous-traitant au sens de l'article 28 du RGPD, et le
          restaurateur en qualité de responsable de traitement. À ce titre, FidèleResto s'engage à :
        </p>
        <ul className="mt-2 list-disc space-y-1.5 pl-5">
          <li>traiter ces données uniquement sur instruction documentée du restaurateur et aux fins prévues par le service ;</li>
          <li>garantir la confidentialité des données traitées ;</li>
          <li>mettre en œuvre les mesures de sécurité techniques et organisationnelles appropriées pour protéger ces données ;</li>
          <li>assister le restaurateur, dans la mesure du possible, pour répondre aux demandes d'exercice des droits des personnes concernées (accès, rectification, effacement, etc.) ;</li>
          <li>supprimer ou restituer, au choix du restaurateur, l'ensemble des données collectées pour son compte à l'issue de la relation contractuelle, sauf obligation légale de conservation contraire ;</li>
          <li>ne pas transférer ces données hors de l'Union Européenne sans garanties appropriées.</li>
        </ul>
        <p className="mt-2">
          Le restaurateur reste seul responsable de la licéité de la collecte de ces données auprès de ses propres
          clients et de l'information qui leur est donnée à ce titre.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-wine">10. Cookies</h2>
        <p className="mt-2">
          Le site FidèleResto utilise des cookies techniques nécessaires à son fonctionnement, notamment un cookie
          permettant d'associer une inscription au lien de parrainage par lequel le visiteur est arrivé sur le site.
          Ce cookie ne collecte aucune donnée personnelle sensible et est conservé pour une durée maximale de 30
          jours. Des informations complémentaires sur l'utilisation des cookies sont disponibles sur simple demande
          à contact@fideleresto.fr.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-wine">11. Disponibilité du service</h2>
        <p className="mt-2">
          FidèleResto s'efforce d'assurer un accès continu à la plateforme, sans garantie de disponibilité absolue.
          Des interruptions pour maintenance peuvent survenir, avec un préavis lorsque cela est possible.
          FidèleResto ne saurait être tenu responsable des conséquences d'une indisponibilité temporaire du service.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-wine">12. Responsabilité</h2>
        <p className="mt-2">
          FidèleResto met en œuvre les moyens raisonnables pour assurer la fiabilité du service. Sa responsabilité
          ne saurait être engagée en cas de dommage indirect, de perte de données résultant d'un usage non conforme,
          ou d'un cas de force majeure. La responsabilité de FidèleResto, si elle devait être retenue, est en tout
          état de cause limitée aux sommes versées par le restaurateur au titre des douze derniers mois
          d'abonnement.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-wine">13. Propriété intellectuelle</h2>
        <p className="mt-2">
          La plateforme FidèleResto, sa marque, son code source et ses éléments graphiques restent la propriété
          exclusive de son éditeur. Les contenus téléversés par le restaurateur (logo, menu) restent sa propriété ;
          il garantit détenir les droits nécessaires à leur utilisation sur la plateforme.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-wine">14. Modification des conditions</h2>
        <p className="mt-2">
          FidèleResto se réserve le droit de modifier les présentes conditions à tout moment. Les restaurateurs
          seront informés de toute modification substantielle par email, avec un préavis raisonnable avant son
          entrée en vigueur.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-wine">15. Droit applicable et litiges</h2>
        <p className="mt-2">
          Les présentes conditions sont soumises au droit français. En cas de litige, une solution amiable sera
          recherchée en priorité. À défaut, les tribunaux français compétents seront seuls saisis.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-wine">Contact</h2>
        <p className="mt-2">
          Pour toute question relative à ces conditions :{" "}
          <a href="mailto:contact@fideleresto.fr" className="text-wine underline underline-offset-2">contact@fideleresto.fr</a>.
        </p>
      </section>
    </LegalLayout>
  )
}
