import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { REWARDS_PAR_DEFAUT, LABEL_PERDU, type Lot as Reward } from '@/lib/roue'



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

    // A-t-il deja clique sur "Laisser un avis Google" lors d'une visite precedente ?
    // (en cas d'erreur, ex. colonne absente : on considere que non)
    let dejaAvis = false
    if (dejaVenu) {
      const { count: nbAvis, error: avisError } = await supabase
        .from('clients')
        .select('id', { count: 'exact', head: true })
        .eq('email', emailNormalise)
        .eq('restaurant_slug', slug)
        .eq('avis_google_clique', true)
      dejaAvis = !avisError && (nbAvis || 0) > 0
    }

    // Plafond par jour de chaque lot (colonne max_par_jour). Si la colonne n'existe pas encore,
    // on relit la roue sans elle : le jeu continue de fonctionner, simplement sans plafond.
    let roueData: (Reward & { max_par_jour?: number | null })[] | null = null
    {
      const avecPlafond = await supabase
        .from('roue_config')
        .select('label, probabilite, couleur, max_par_jour')
        .filter('restaurant_id', 'like', `${slug}%`)
      if (avecPlafond.error) {
        const sansPlafond = await supabase
          .from('roue_config')
          .select('label, probabilite, couleur')
          .filter('restaurant_id', 'like', `${slug}%`)
        roueData = sansPlafond.data
      } else {
        roueData = avecPlafond.data
      }
    }

    const rewardsList: (Reward & { max_par_jour?: number | null })[] =
      roueData && roueData.length > 0 ? [...roueData] : [...REWARDS_PAR_DEFAUT]

    // Tirage au sort reellement cote serveur : impossible a manipuler depuis le navigateur
    let reward: Reward & { max_par_jour?: number | null } = tirerRecompense(rewardsList)

    // Lot plafonne et deja sorti assez de fois aujourd'hui : on retire parmi les lots encore
    // disponibles (ou "Perdu"), pour que la roue ne coute jamais plus que prevu au restaurateur.
    const plafonnes = new Set<string>()
    for (let essai = 0; essai < rewardsList.length && reward.max_par_jour && reward.label !== LABEL_PERDU; essai++) {
      // minuit heure de Paris (le serveur tourne en UTC)
      const maintenant = new Date()
      const paris = new Date(maintenant.toLocaleString('en-US', { timeZone: 'Europe/Paris' }))
      const decalage = paris.getTime() - maintenant.getTime()
      paris.setHours(0, 0, 0, 0)
      const debutJour = new Date(paris.getTime() - decalage)
      const { count } = await supabase
        .from('clients')
        .select('id', { count: 'exact', head: true })
        .eq('restaurant_slug', slug)
        .eq('recompense', reward.label)
        .gte('created_at', debutJour.toISOString())
      if ((count || 0) < reward.max_par_jour) break
      plafonnes.add(reward.label)
      const restants = rewardsList.filter((l) => !plafonnes.has(l.label) && l.probabilite > 0)
      const perdu = rewardsList.find((l) => l.label === LABEL_PERDU)
      if (restants.length === 0) {
        reward = perdu || { label: LABEL_PERDU, probabilite: 0, couleur: '#a8536a' }
        break
      }
      // nouveau tirage parmi les lots restants, probabilites renormalisees
      const total = restants.reduce((s, l) => s + l.probabilite, 0)
      reward = tirerRecompense(restants.map((l) => ({ ...l, probabilite: (l.probabilite / total) * 100 })))
    }

    const { data: nouveauClient, error: insertError } = await supabase
      .from('clients')
      .insert([{
        prenom,
        email: emailNormalise,
        restaurant_slug: slug,
        a_gagne: reward.label !== LABEL_PERDU,
        recompense: reward.label,
        consentement_marketing: !!consentementMarketing,
      }])
      .select('id')
      .single()

    if (insertError) {
      console.error('Erreur insertion client:', insertError.message)
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    // Cas rare (tous les lots plafonnes et pas de case "Perdu") : on ajoute la case pour que la roue puisse s'y arreter
    if (!rewardsList.some((l) => l.label === reward.label)) rewardsList.push(reward)

    return NextResponse.json({ dejaJoue: false, dejaVenu, dejaAvis, reward, rewardsList, clientRowId: nouveauClient?.id, frequenceJours })
  } catch (err: any) {
    console.error('Erreur roue/jouer:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
