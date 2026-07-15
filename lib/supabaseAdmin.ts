import { createClient } from '@supabase/supabase-js'

// Créé à la demande (pas au chargement du module) : si ce client était instancié
// au niveau module dans chaque route, Next.js essaierait de l'exécuter pendant
// l'étape de build "Collecting page data", où les variables d'env peuvent ne pas
// être disponibles — ce qui fait planter tout le build (vu en prod le 15/07/2026).
export function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
