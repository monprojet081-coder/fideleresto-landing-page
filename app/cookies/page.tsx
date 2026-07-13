import { LegalLayout } from "@/components/legal-layout"

export const metadata = { title: "Cookies — FidèleResto" }

export default function CookiesPage() {
  return (
    <LegalLayout title="Politique de cookies" majDate="13 juillet 2026">
      <section>
        <p>
          Un cookie est un petit fichier stocké sur votre appareil lors de votre navigation. Cette page explique
          quels cookies sont utilisés sur FidèleResto et pourquoi.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-wine">Les cookies que nous utilisons</h2>
        <p className="mt-2">
          FidèleResto n'utilise actuellement <strong>aucun cookie publicitaire ni de mesure d'audience</strong>
          (pas de Google Analytics, pas de pixel Facebook, ni aucun outil similaire).
        </p>
        <p className="mt-2">
          Nous utilisons uniquement des cookies <strong>strictement nécessaires</strong> au fonctionnement du
          service, notamment pour maintenir votre session connectée lorsque vous utilisez votre espace restaurateur.
          Conformément aux recommandations de la CNIL, ces cookies techniques, indispensables au fonctionnement du
          site, sont exemptés de consentement préalable.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-wine">Évolution de cette politique</h2>
        <p className="mt-2">
          Si nous venions à intégrer à l'avenir des outils de mesure d'audience ou des cookies publicitaires, cette
          page serait mise à jour et un bandeau de consentement vous serait proposé lors de votre première visite,
          conformément à la réglementation en vigueur.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-wine">Gérer les cookies</h2>
        <p className="mt-2">
          Vous pouvez à tout moment configurer votre navigateur pour refuser les cookies ou être averti de leur
          dépôt. Notez que le blocage des cookies strictement nécessaires peut empêcher le bon fonctionnement de
          votre espace de connexion.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-wine">Contact</h2>
        <p className="mt-2">
          Pour toute question :{" "}
          <a href="mailto:contact@fideleresto.fr" className="text-wine underline underline-offset-2">contact@fideleresto.fr</a>.
        </p>
      </section>
    </LegalLayout>
  )
}
