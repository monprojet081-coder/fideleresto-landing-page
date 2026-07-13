import { LegalLayout } from "@/components/legal-layout"

export const metadata = { title: "Conditions générales — FidèleResto" }

export default function ConditionsGeneralesPage() {
  return (
    <LegalLayout title="Conditions générales d'utilisation et de vente" majDate="13 juillet 2026">
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
        <h2 className="font-display text-xl font-semibold text-wine">5. Résiliation</h2>
        <p className="mt-2">
          Le restaurateur peut résilier son abonnement à tout moment depuis son espace de gestion ou en nous
          contactant à contact@fideleresto.fr. La résiliation prend effet à la fin de la période déjà payée ; aucun
          remboursement au prorata n'est effectué pour la période en cours, sauf disposition légale contraire.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-wine">6. Droit de rétractation</h2>
        <p className="mt-2">
          Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne s'applique pas
          aux contrats conclus entre professionnels dans le cadre de leur activité. Les restaurateurs souscrivant à
          FidèleResto agissent en qualité de professionnels.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-wine">7. Obligations du restaurateur</h2>
        <p className="mt-2">
          Le restaurateur s'engage à utiliser la plateforme conformément à sa destination, à ne pas détourner le
          service à des fins frauduleuses, et à respecter la réglementation applicable à la collecte de données de
          ses propres clients (notamment le RGPD). Le restaurateur reste seul responsable des récompenses proposées
          via la roue de la fidélité et de leur bonne remise aux clients gagnants.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-wine">8. Disponibilité du service</h2>
        <p className="mt-2">
          FidèleResto s'efforce d'assurer un accès continu à la plateforme, sans garantie de disponibilité absolue.
          Des interruptions pour maintenance peuvent survenir, avec un préavis lorsque cela est possible.
          FidèleResto ne saurait être tenu responsable des conséquences d'une indisponibilité temporaire du service.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-wine">9. Responsabilité</h2>
        <p className="mt-2">
          FidèleResto met en œuvre les moyens raisonnables pour assurer la fiabilité du service. Sa responsabilité
          ne saurait être engagée en cas de dommage indirect, de perte de données résultant d'un usage non conforme,
          ou d'un cas de force majeure. La responsabilité de FidèleResto, si elle devait être retenue, est en tout
          état de cause limitée aux sommes versées par le restaurateur au titre des douze derniers mois
          d'abonnement.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-wine">10. Propriété intellectuelle</h2>
        <p className="mt-2">
          La plateforme FidèleResto, sa marque, son code source et ses éléments graphiques restent la propriété
          exclusive de son éditeur. Les contenus téléversés par le restaurateur (logo, menu) restent sa propriété ;
          il garantit détenir les droits nécessaires à leur utilisation sur la plateforme.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-wine">11. Modification des conditions</h2>
        <p className="mt-2">
          FidèleResto se réserve le droit de modifier les présentes conditions à tout moment. Les restaurateurs
          seront informés de toute modification substantielle par email, avec un préavis raisonnable avant son
          entrée en vigueur.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-wine">12. Droit applicable et litiges</h2>
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
