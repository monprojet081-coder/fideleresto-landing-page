import { supabase } from "@/lib/supabase"

// Lecture des infos PUBLIQUES d'un restaurant (pages client /r et /carte).
// Passe par la vue "restaurants_public", qui n'expose que les colonnes sans risque :
// la table "restaurants" elle-meme n'est lisible que par son proprietaire.
// Repli sur la table si la vue n'existe pas encore (avant le script SQL).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function lireRestaurantPublic(slug: string, colonnes: string): Promise<{ data: any; error: { message: string } | null }> {
  const viaVue = await supabase.from("restaurants_public").select(colonnes).eq("slug", slug).maybeSingle()
  if (!viaVue.error) return viaVue
  return supabase.from("restaurants").select(colonnes).eq("slug", slug).maybeSingle()
}
