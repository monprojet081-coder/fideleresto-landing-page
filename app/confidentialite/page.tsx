import { LegalLayout } from "@/components/legal-layout"

export const metadata = { title: "Politique de confidentialité — FidèleResto" }

export default function ConfidentialitePage() {
  return (
    <LegalLayout title="Politique de confidentialité" majDate="13 juillet 2026">
      <section>
        <p>
          FidèleResto (Victor Ehrenbogen, micro-entrepreneur, SIRET 442 585 980 00026) attache une grande importance
          à la protection de vos données personnelles. Cette politique explique quelles données sont collectées,
          pourquoi, et comment vous pouvez exercer vos droits, conformément au Règlement Général sur la Protection
          des Données (RGPD).
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-wine">Deux types d'utilisateurs, deux traitements différents</h2>
        <p className="mt-2">
          FidèleResto s'adresse à deux populations distinctes : les <strong>restaurateurs</strong> qui souscrivent à
          notre service, et les <strong>clients de ces restaurants</strong> qui participent à la roue de la fidélité.
          Les données collectées et leur usage diffèrent selon le cas.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-wine">1. Données des restaurateurs</h2>
        <p className="mt-2"><strong>Données collectées :</strong> nom du restaurant, adresse email, mot de passe (chiffré), informations de paiement (traitées directement par Stripe, jamais stockées par nos soins), lien vers votre fiche Google Avis, logo et menu que vous téléversez, configuration de votre roue et de votre carte de fidélité.</p>
        <p className="mt-2"><strong>Finalité :</strong> création et gestion de votre compte, fourniture du service souscrit, facturation, support client.</p>
        <p className="mt-2"><strong>Base légale :</strong> exécution du contrat d'abonnement.</p>
        <p className="mt-2"><strong>Durée de conservation :</strong> pendant toute la durée de votre abonnement, puis 3 ans après la clôture du compte à des fins de preuve comptable, sauf obligation légale de conservation plus longue.</p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-wine">2. Données des clients des restaurants</h2>
        <p className="mt-2"><strong>Données collectées :</strong> prénom, adresse email, historique de vos passages (dates), récompenses obtenues, statut de votre carte de fidélité (nombre de tampons).</p>
        <p className="mt-2"><strong>Finalité :</strong> faire fonctionner la roue de la fidélité et la carte de fidélité digitale, vous envoyer votre récompense par email, et — uniquement si vous avez explicitement coché la case prévue à cet effet lors de votre participation — vous envoyer des offres promotionnelles du restaurant concerné en cas d'inactivité prolongée.</p>
        <p className="mt-2"><strong>Base légale :</strong> exécution du service demandé (jeu-concours) pour les données de base ; consentement explicite pour les emails promotionnels.</p>
        <p className="mt-2"><strong>Durée de conservation :</strong> 3 ans à compter de votre dernier passage, ou jusqu'à votre demande de suppression.</p>
        <p className="mt-2">
          Vous pouvez à tout moment retirer votre consentement aux emails promotionnels en cliquant sur le lien de
          désinscription présent dans chacun de ces emails, sans que cela n'affecte votre carte de fidélité ni votre
          possibilité de rejouer à la roue.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-wine">Sous-traitants et destinataires des données</h2>
        <p className="mt-2">Certaines de vos données sont transmises aux prestataires suivants, strictement nécessaires au fonctionnement du service :</p>
        <ul className="mt-2 list-disc space-y-1.5 pl-5">
          <li><strong>Supabase</strong> (hébergement de la base de données et authentification)</li>
          <li><strong>Vercel</strong> (hébergement de l'application)</li>
          <li><strong>Stripe</strong> (traitement des paiements des restaurateurs — FidèleResto n'a jamais accès à vos coordonnées bancaires complètes)</li>
          <li><strong>Resend</strong> (envoi des emails transactionnels et de relance)</li>
        </ul>
        <p className="mt-2">
          Ces prestataires peuvent être situés hors de l'Union Européenne. Ils s'engagent contractuellement à
          respecter un niveau de protection des données conforme au RGPD (clauses contractuelles types ou
          équivalent).
        </p>
        <p className="mt-2">Vos données ne sont jamais vendues à des tiers.</p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-wine">Vos droits</h2>
        <p className="mt-2">Conformément au RGPD, vous disposez des droits suivants sur vos données personnelles :</p>
        <ul className="mt-2 list-disc space-y-1.5 pl-5">
          <li>Droit d'accès : obtenir une copie des données que nous détenons sur vous</li>
          <li>Droit de rectification : corriger des données inexactes</li>
          <li>Droit à l'effacement : demander la suppression de vos données</li>
          <li>Droit d'opposition : vous opposer à un traitement, notamment aux emails promotionnels</li>
          <li>Droit à la portabilité : recevoir vos données dans un format structuré</li>
          <li>Droit à la limitation du traitement</li>
        </ul>
        <p className="mt-2">
          Pour exercer l'un de ces droits, écrivez-nous à{" "}
          <a href="mailto:contact@fideleresto.fr" className="text-wine underline underline-offset-2">contact@fideleresto.fr</a>.
          Nous répondons sous un délai maximum d'un mois. Vous disposez également du droit d'introduire une
          réclamation auprès de la CNIL (cnil.fr) si vous estimez que vos droits ne sont pas respectés.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-wine">Sécurité</h2>
        <p className="mt-2">
          Nous mettons en œuvre des mesures techniques appropriées pour protéger vos données (chiffrement des mots
          de passe, accès restreint aux données, cloisonnement strict entre les comptes de chaque restaurant via des
          règles de sécurité au niveau de la base de données).
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-wine">Contact</h2>
        <p className="mt-2">
          Pour toute question relative à cette politique ou à vos données personnelles :{" "}
          <a href="mailto:contact@fideleresto.fr" className="text-wine underline underline-offset-2">contact@fideleresto.fr</a>.
        </p>
      </section>
    </LegalLayout>
  )
}
