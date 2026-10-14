import { NextRequest, NextResponse, after } from 'next/server'
import { randomUUID } from 'crypto'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { REWARDS_PAR_DEFAUT, LABEL_PERDU, type Lot as Reward } from '@/lib/roue'
import { EMAIL_VALIDE, emailCanonique, estEmailJetable, hashIp } from '@/lib/securite'
import { envoyerEmailRecompense } from '@/lib/email-recompense'

// Garde-fous contre ceux qui voudraient tourner la roue en boucle jusqu'a gagner
const MAX_PARTIES_APPAREIL = 2 // par appareil (telephone), par periode de jeu (1 jour par defaut)
const MAX_PARTIES_IP_10MIN = 8 // depuis la meme connexion, en 10 minutes
const MAX_PARTIES_IP_JOUR = 40 // depuis la meme connexion, en 24 h (wifi du restaurant partage)
const COOKIE_APPAREIL = 'fr_app'

/** Minuit (heure de Paris) il y a `joursAvant` jours, en date UTC */
function minuitParis(joursAvant = 0): Date {
  const maintenant = new Date()
  const paris = new Date(maintenant.toLocaleString('en-US', { timeZone: 'Europe/Paris' }))
  const decalage = paris.getTime() - maintenant.getTime()
  paris.setHours(0, 0, 0, 0)
  paris.setDate(paris.getDate() - joursAvant)
  return new Date(paris.getTime() - decalage)
}

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
    const prenomPropre = String(prenom).trim().slice(0, 40)
    const emailBrut = String(email).trim().toLowerCase()
    if (!prenomPropre || !EMAIL_VALIDE.test(emailBrut) || emailBrut.length > 120) {
      return NextResponse.json({ error: 'Adresse email invalide' }, { status: 400 })
    }
    if (estEmailJetable(emailBrut)) {
      return NextResponse.json({ error: 'Merci d\'utiliser votre adresse email habituelle (les adresses temporaires ne sont pas acceptées).' }, { status: 400 })
    }
    // Forme canonique : jean.dupont+2@gmail.com et jeandupont@gmail.com = la meme personne
    const emailNormalise = emailCanonique(emailBrut)
    const variantesEmail = [...new Set([emailNormalise, emailBrut])]
    const estTest = EMAILS_TEST.includes(emailNormalise)

    const appareil = req.cookies.get(COOKIE_APPAREIL)?.value || randomUUID()
    const ipHash = hashIp(req.headers)
    // On renvoie toujours le cookie d'appareil (cree s'il n'existait pas)
    const repondre = (body: any, init?: { status?: number }) => {
      const res = NextResponse.json(body, init)
      res.cookies.set(COOKIE_APPAREIL, appareil, { httpOnly: true, sameSite: 'lax', secure: true, path: '/', maxAge: 60 * 60 * 24 * 400 })
      return res
    }

    const { data: restoConfig } = await supabase
      .from('restaurants')
      .select('roue_frequence_jours, nom_restaurant')
      .eq('slug', slug)
      .maybeSingle()
    if (!restoConfig) {
      return NextResponse.json({ error: 'Restaurant introuvable' }, { status: 404 })
    }
    const frequenceJours = restoConfig?.roue_frequence_jours || 1

    // Une partie par periode de jeu, remise a zero a minuit (heure de Paris)
    const debutFenetre = minuitParis(frequenceJours - 1)

    if (!estTest) {
      const { data: existing } = await supabase
        .from('clients')
        .select('id')
        .in('email', variantesEmail)
        .eq('restaurant_slug', slug)
        .gte('created_at', debutFenetre.toISOString())
        .limit(1)

      if (existing && existing.length > 0) {
        return repondre({ dejaJoue: true, frequenceJours })
      }

      // Meme telephone avec d'autres adresses email
      const parAppareil = await supabase
        .from('clients')
        .select('id', { count: 'exact', head: true })
        .eq('restaurant_slug', slug)
        .eq('appareil', appareil)
        .gte('created_at', debutFenetre.toISOString())
      if (!parAppareil.error && (parAppareil.count || 0) >= MAX_PARTIES_APPAREIL) {
        return repondre({ dejaJoue: true, frequenceJours })
      }

      // Meme connexion internet : rafale ou volume anormal
      if (ipHash) {
        const depuis = (minutes: number) => new Date(Date.now() - minutes * 60000).toISOString()
        const [rafale, jour] = await Promise.all([
          supabase.from('clients').select('id', { count: 'exact', head: true }).eq('restaurant_slug', slug).eq('ip_hash', ipHash).gte('created_at', depuis(10)),
          supabase.from('clients').select('id', { count: 'exact', head: true }).eq('restaurant_slug', slug).eq('ip_hash', ipHash).gte('created_at', depuis(24 * 60)),
        ])
        if ((!rafale.error && (rafale.count || 0) >= MAX_PARTIES_IP_10MIN) || (!jour.error && (jour.count || 0) >= MAX_PARTIES_IP_JOUR)) {
          return repondre({ error: 'Trop de parties depuis cette connexion. Réessayez un peu plus tard.' }, { status: 429 })
        }
      }
    }

    const { count: visitesPrecedentes } = await supabase
      .from('clients')
      .select('id', { count: 'exact', head: true })
      .in('email', variantesEmail)
      .eq('restaurant_slug', slug)
    const dejaVenu = (visitesPrecedentes || 0) > 0

    // A-t-il deja clique sur "Laisser un avis Google" lors d'une visite precedente ?
    // (en cas d'erreur, ex. colonne absente : on considere que non)
    let dejaAvis = false
    if (dejaVenu) {
      const { count: nbAvis, error: avisError } = await supabase
        .from('clients')
        .select('id', { count: 'exact', head: true })
        .in('email', variantesEmail)
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
        .select('label, probabilite, couleur, max_par_jour, garanti_apres_visites')
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

    // Lot "offert a coup sur tous les N passages" : a la Ne (2Ne, 3Ne...) partie de ce client
    // dans ce restaurant, il gagne ce lot quoi qu'il arrive.
    const numeroPassage = (visitesPrecedentes || 0) + 1
    const garanti = rewardsList.find(
      (l) => l.garanti_apres_visites && l.garanti_apres_visites > 0 && numeroPassage % l.garanti_apres_visites === 0,
    )
    if (garanti) reward = garanti

    // Progression vers le lot garanti, affichee au client apres sa partie
    const lotGaranti = rewardsList.find((l) => l.garanti_apres_visites && l.garanti_apres_visites > 0)
    const progression = lotGaranti
      ? { label: lotGaranti.label, tous: lotGaranti.garanti_apres_visites as number, passage: numeroPassage }
      : null

    // Lot plafonne et deja sorti assez de fois aujourd'hui : on retire parmi les lots encore
    // disponibles (ou "Perdu"), pour que la roue ne coute jamais plus que prevu au restaurateur.
    const plafonnes = new Set<string>()
    // (un lot garanti est toujours donne, meme si son plafond du jour est atteint)
    for (let essai = 0; !garanti && essai < rewardsList.length && reward.max_par_jour && reward.label !== LABEL_PERDU; essai++) {
      const debutJour = minuitParis(0)
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

    const ligne = {
      prenom: prenomPropre,
      email: emailNormalise,
      restaurant_slug: slug,
      a_gagne: reward.label !== LABEL_PERDU,
      recompense: reward.label,
      consentement_marketing: !!consentementMarketing,
    }
    let { data: nouveauClient, error: insertError } = await supabase
      .from('clients')
      .insert([{ ...ligne, appareil, ip_hash: ipHash }])
      .select('id')
      .single()
    if (insertError && /appareil|ip_hash/.test(insertError.message)) {
      // colonnes anti-triche pas encore creees : on enregistre quand meme la partie
      ;({ data: nouveauClient, error: insertError } = await supabase.from('clients').insert([ligne]).select('id').single())
    }

    if (insertError) {
      console.error('Erreur insertion client:', insertError.message)
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    // Cas rare (tous les lots plafonnes et pas de case "Perdu") : on ajoute la case pour que la roue puisse s'y arreter
    if (!rewardsList.some((l) => l.label === reward.label)) rewardsList.push(reward)

    // L'email de la recompense part du serveur, juste apres la reponse : personne ne peut
    // declencher un envoi a sa place, et le QR code (signe) n'est visible que dans l'email.
    if (reward.label !== LABEL_PERDU && nouveauClient?.id) {
      const id = String(nouveauClient.id)
      after(() => envoyerEmailRecompense({ id, prenom: prenomPropre, email: emailNormalise, recompense: reward.label, restaurantNom: restoConfig?.nom_restaurant, slug }))
    }

    return repondre({ dejaJoue: false, dejaVenu, dejaAvis, reward, rewardsList, clientRowId: nouveauClient?.id, frequenceJours, progression })
  } catch (err: any) {
    console.error('Erreur roue/jouer:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
