import { LegalLayout } from "@/components/legal-layout"

export const metadata = { title: "Mentions légales — FidèleResto" }

export default function MentionsLegalesPage() {
  return (
    <LegalLayout title="Mentions légales" majDate="13 juillet 2026">
      <section>
        <h2 className="font-display text-xl font-semibold text-wine">Éditeur du site</h2>
        <p className="mt-2">
          Le site FidèleResto (accessible à l'adresse fideleresto.fr) est édité par :
        </p>
        <ul className="mt-2 list-none space-y-1">
          <li><strong>Victor Ehrenbogen</strong>, entrepreneur individuel exerçant sous le régime de la micro-entreprise</li>
          <li>SIRET : 442 585 980 00026</li>
          <li>TVA non applicable, article 293 B du Code Général des Impôts</li>
          <li>Adresse : 32 Rue de la République, 67110 Niederbronn-les-Bains, France</li>
          <li>Email : <a href="mailto:contact@fideleresto.fr" className="text-wine underline underline-offset-2">contact@fideleresto.fr</a></li>
        </ul>
        <p className="mt-2 text-sm text-ink/55">
          Directeur de la publication : Victor Ehrenbogen.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-wine">Hébergement</h2>
        <p className="mt-2">Le site et l'application sont hébergés par :</p>
        <ul className="mt-2 list-none space-y-1">
          <li><strong>Vercel Inc.</strong> — 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis</li>
        </ul>
        <p className="mt-2">La base de données et l'authentification sont gérées par :</p>
        <ul className="mt-2 list-none space-y-1">
          <li><strong>Supabase Inc.</strong> — 970 Toa Payoh North #07-04, Singapour</li>
        </ul>
        <p className="mt-2">Le nom de domaine fideleresto.fr est enregistré auprès de :</p>
        <ul className="mt-2 list-none space-y-1">
          <li><strong>OVH SAS</strong> — 2 rue Kellermann, 59100 Roubaix, France</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-wine">Propriété intellectuelle</h2>
        <p className="mt-2">
          L'ensemble des éléments présents sur le site FidèleResto (textes, graphismes, logo, structure, code source)
          est protégé par le droit d'auteur et le droit des marques. Toute reproduction, représentation, modification
          ou exploitation, totale ou partielle, sans autorisation préalable, est interdite.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-wine">Responsabilité</h2>
        <p className="mt-2">
          FidèleResto met tout en œuvre pour assurer l'exactitude et la mise à jour des informations diffusées sur ce
          site, mais ne peut garantir l'absence totale d'erreurs ou d'interruptions de service. L'utilisation du site
          et de l'application se fait sous la responsabilité exclusive de l'utilisateur.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-wine">Contact</h2>
        <p className="mt-2">
          Pour toute question relative à ces mentions légales, vous pouvez nous contacter à l'adresse{" "}
          <a href="mailto:contact@fideleresto.fr" className="text-wine underline underline-offset-2">contact@fideleresto.fr</a>.
        </p>
      </section>
    </LegalLayout>
  )
}
