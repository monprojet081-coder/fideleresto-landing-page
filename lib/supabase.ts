import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Le client n'est créé qu'au premier vrai usage (première fois que quelqu'un fait
// supabase.auth.xxx ou supabase.from(...)), jamais au chargement du fichier. Sinon,
// comme ce fichier est importé par des pages "use client", Next.js l'exécute une
// fois pendant le build pour générer le rendu initial (SSR), et le build plante si
// les variables d'env ne sont pas visibles à ce moment précis du build sur Vercel.
let _client: SupabaseClient | null = null

function creerClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return _client
}

export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    return Reflect.get(creerClient(), prop, receiver)
  },
})