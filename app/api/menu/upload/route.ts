import { NextRequest, NextResponse } from 'next/server'
import sanitizeHtml from 'sanitize-html'
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
    const buffer = Buffer.from(await file.arrayBuffer())

    let menuType: 'pdf' | 'image' | 'document'
    let extension: string
    let menuHtml: string | null = null

    if (nomFichier.endsWith('.pdf')) {
      menuType = 'pdf'
      extension = 'pdf'
    } else if (/\.(jpe?g|png|webp)$/.test(nomFichier)) {
      menuType = 'image'
      extension = nomFichier.split('.').pop()!
    } else if (nomFichier.endsWith('.docx')) {
      menuType = 'document'
      extension = 'docx'
      const mammoth = await import('mammoth')
      const result = await mammoth.convertToHtml({ buffer })
      menuHtml = result.value
    } else if (/\.(xlsx|xls)$/.test(nomFichier)) {
      menuType = 'document'
      extension = nomFichier.split('.').pop()!
      const XLSX = await import('xlsx')
      const workbook = XLSX.read(buffer, { type: 'buffer' })
      const feuilles = workbook.SheetNames.map((nom) => {
        const html = XLSX.utils.sheet_to_html(workbook.Sheets[nom], { header: '', footer: '' })
        return `<h3>${nom}</h3>${html}`
      })
      menuHtml = feuilles.join('<hr/>')
    } else {
      return NextResponse.json({ error: 'Format non supporté. Utilisez PDF, JPG, PNG, DOCX ou XLSX.' }, { status: 400 })
    }

    // Le HTML vient de la conversion d'un fichier importé par le restaurateur (mammoth pour
    // .docx, sheet_to_html pour .xlsx) : on le nettoie avant stockage pour ne jamais publier
    // de script ou d'attribut exécutable sur la page publique /carte/[slug]
    if (menuHtml) {
      menuHtml = sanitizeHtml(menuHtml, {
        allowedTags: ['p', 'br', 'strong', 'em', 'b', 'i', 'u', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'span', 'div', 'hr', 'a'],
        allowedAttributes: { a: ['href'], td: ['colspan', 'rowspan'], th: ['colspan', 'rowspan'] },
        allowedSchemes: ['http', 'https', 'mailto'],
        disallowedTagsMode: 'discard',
      })
    }

    const cheminFichier = `${slug}/menu.${extension}`
    const { error: uploadError } = await supabase.storage
      .from('menus')
      .upload(cheminFichier, buffer, { contentType: file.type, upsert: true })

    if (uploadError) {
      return NextResponse.json({ error: "Erreur lors de l'envoi : " + uploadError.message }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage.from('menus').getPublicUrl(cheminFichier)

    await supabase
      .from('restaurants')
      .update({ menu_type: menuType, menu_url: publicUrl, menu_html: menuHtml })
      .eq('slug', slug)

    return NextResponse.json({ success: true, menuType, menuUrl: publicUrl })
  } catch (err: any) {
    console.error('Erreur upload menu:', err)
    return NextResponse.json({ error: 'Erreur serveur : ' + err.message }, { status: 500 })
  }
}
