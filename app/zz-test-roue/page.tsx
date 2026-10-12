"use client"
import { RoueChance, LegendeLots } from "@/components/roue-chance"
import { MODELES_ROUE } from "@/lib/roue"
export default function T() {
  const lots = MODELES_ROUE[0].lots
  return (<div className="min-h-screen overflow-x-clip bg-ivory p-4"><div className="mx-auto max-w-md rounded-2xl border border-wine/10 bg-card p-8">
    <RoueChance rewards={lots} rotation={0} spinning={false} /><LegendeLots rewards={lots} /></div></div>)
}
