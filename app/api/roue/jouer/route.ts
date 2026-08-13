import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

type Reward = { label: string; probabilite: number; couleur: string }

const REWARDS_PAR_DEFAUT: Reward[] = [
  { label: "Boisson offerte 🥤", probabilite: 25, couleur: "#6b1e2e" },
  { label: "Dessert offert 🍰", probabilite: 25, couleur: "#c9962c" },
  { label: "10% de réduction 🏷️", probabilite: 25, couleur: "#3f6b4f" },
  { label: "Perdu 😢", probabilite: 25, couleur: "#a8536a" },
]

// Emails de test internes, jamais soumis a la limite d'un tirage par jour
const EMAILS_TEST = ["cokillage67@gmail.com", "monprojet081@gmail.com"]

function tirerRecompense(rewardsList: Reward[]): Reward {
  const rand = Math.random() * 100
  let cumulative = 0
  for (const reward of rewardsList) {
    cumulative += reward.probabilite
    if (rand < cumulative) return reward
  }
  return rewardsList[rewardsList.length - 1]
}

export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  try {
    const { slug, prenom, email, consentementMarketing } = await req.json()

    if (!slug || !prenom || !email) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
    }
    const emailNormalise = String(email).trim().toLowerCase()

    // Anti-triche : reinitialisation au jour calendaire (minuit), pas une fenetre
    // glissante en heures -- sinon quelqu'un venu lundi 13h ne pourrait pas retenter
    // sa chance mardi a 12h. La frequence (tous les combien de jours) est reglable
    // par le restaurateur, utile pour les petits etablissements qui veulent limiter
    // le nombre de recompenses offertes.
    const { data: restoConfig } = await supabase
      .from('restaurants')
      .select('roue_frequence_jours')
      .eq('slug', slug)
      .maybeSingle()
    const frequenceJours = restoConfig?.roue_frequence_jours || 1

    const debutFenetre = new Date()
    debutFenetre.setHours(0, 0, 0, 0)
    debutFenetre.setDate(debutFenetre.getDate() - (frequenceJours - 1))

    if (!EMAILS_TEST.includes(emailNormalise)) {
      const { data: existing } = await supabase
        .from('clients')
        .select('id')
        .eq('email', emailNormalise)
        .eq('restaurant_slug', slug)
        .gte('created_at', debutFenetre.toISOString())

      if (existing && existing.length > 0) {
        return NextResponse.json({ dejaJoue: true, frequenceJours })
      }
    }

    const { count: visitesPrecedentes } = await supabase
      .from('clients')
      .select('id', { count: 'exact', head: true })
      .eq('email', emailNormalise)
      .eq('restaurant_slug', slug)
    const dejaVenu = (visitesPrecedentes || 0) > 0

    const { data: roueData } = await supabase
      .from('roue_config')
      .select('label, probabilite, couleur')
      .filter('restaurant_id', 'like', `${slug}%`)

    const rewardsList = roueData && roueData.length > 0 ? roueData : REWARDS_PAR_DEFAUT

    // Tirage au sort reellement cote serveur : impossible a manipuler depuis le navigateur
    const reward = tirerRecompense(rewardsList)

    const { error: insertError } = await supabase
      .from('clients')
      .insert([{
        prenom,
        email: emailNormalise,
        restaurant_slug: slug,
        a_gagne: reward.label !== 'Perdu 😢',
        recompense: reward.label,
        consentement_marketing: !!consentementMarketing,
      }])

    if (insertError) {
      console.error('Erreur insertion client:', insertError.message)
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    return NextResponse.json({ dejaJoue: false, dejaVenu, reward, rewardsList })
  } catch (err: any) {
    console.error('Erreur roue/jouer:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
