import type { SupabaseClient } from "@supabase/supabase-js"
import { LABEL_PERDU, type Lot } from "@/lib/roue"

/**
 * Insere les lots d'une roue dans roue_config, en restant compatible avec une base pas encore
 * migree : sans les colonnes cout / max_par_jour / garanti_apres_visites, ou avec des
 * probabilites entieres (on arrondit alors et la case "Perdu" absorbe la difference).
 */
export async function insererLotsRoue(supabase: SupabaseClient, slug: string, lots: Lot[]) {
  const lignes = lots.map((r) => ({
    label: r.label,
    probabilite: r.probabilite,
    couleur: r.couleur,
    cout: r.cout === null || r.cout === undefined || (r.cout as unknown) === "" ? null : Number(r.cout),
    max_par_jour: r.max_par_jour ? Number(r.max_par_jour) : null,
    garanti_apres_visites: r.garanti_apres_visites ? Number(r.garanti_apres_visites) : null,
    restaurant_id: slug,
  }))
  let { error } = await supabase.from("roue_config").insert(lignes)
  let arrondi = false
  if (error && /cout|max_par_jour|garanti|column/i.test(error.message)) {
    ;({ error } = await supabase.from("roue_config").insert(lignes.map(({ cout, max_par_jour, garanti_apres_visites, ...l }) => l)))
  }
  if (error && /integer/i.test(error.message)) {
    const arrondies = lignes.map(({ cout, max_par_jour, garanti_apres_visites, ...l }) => ({ ...l, probabilite: Math.round(l.probabilite) }))
    const somme = arrondies.filter((l) => l.label !== LABEL_PERDU).reduce((a, l) => a + l.probabilite, 0)
    const perdu = arrondies.find((l) => l.label === LABEL_PERDU)
    if (perdu) perdu.probabilite = Math.max(0, 100 - somme)
    ;({ error } = await supabase.from("roue_config").insert(arrondies))
    arrondi = !error
  }
  return { error, arrondi }
}
