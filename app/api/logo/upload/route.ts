import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'


export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const token = formData.get('token') as string | null

    if (!file || !token) {
      return NextResponse.json({ error: 'Fichier ou authentification manquant' }, { status: 400 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Session invalide' }, { status: 403 })
    }

    const slug = user.id.slice(0, 8)
    const nomFichier = file.name.toLowerCase()

    if (!/\.(jpe?g|png|webp)$/.test(nomFichier)) {
      return NextResponse.json({ error: 'Format non supporté. Utilisez JPG, PNG ou WEBP.' }, { status: 400 })
    }

    const extension = nomFichier.split('.').pop()!
    const buffer = Buffer.from(await file.arrayBuffer())
    const cheminFichier = `${slug}/logo.${extension}`

    const { error: uploadError } = await supabase.storage
      .from('menus')
      .upload(cheminFichier, buffer, { contentType: file.type, upsert: true })

    if (uploadError) {
      return NextResponse.json({ error: "Erreur lors de l'envoi : " + uploadError.message }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage.from('menus').getPublicUrl(cheminFichier)
    const logoUrl = `${publicUrl}?v=${Date.now()}`

    await supabase
      .from('restaurants')
      .update({ logo_url: logoUrl })
      .eq('slug', slug)

    return NextResponse.json({ success: true, logoUrl })
  } catch (err: any) {
    console.error('Erreur upload logo:', err)
    return NextResponse.json({ error: 'Erreur serveur : ' + err.message }, { status: 500 })
  }
}
