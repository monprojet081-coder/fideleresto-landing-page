import { NextResponse } from 'next/server'

// Ancienne route : l'email de recompense part desormais directement du serveur
// (/api/roue/jouer). Elle ne doit plus permettre d'envoyer un email a n'importe qui.
export async function POST() {
  return NextResponse.json({ error: 'Route supprimée' }, { status: 410 })
}
