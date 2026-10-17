const nf = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })
export const eur = (n) => nf.format(n || 0)

// Evita enlaces con esquemas peligrosos: si no empieza por http(s), se antepone https://
export function safeUrl(url) {
  const u = (url || '').trim()
  if (!u) return null
  return /^https?:\/\//i.test(u) ? u : `https://${u}`
}

export const STATUS = {
  empty: {
    label: 'Sin nada',
    card: 'bg-red-50 border-red-300',
    dot: 'bg-red-500',
    chip: 'bg-red-100 text-red-800',
    btn: 'border-red-300 bg-red-50 text-red-800 hover:bg-red-100',
  },
  ideas: {
    label: 'Con ideas',
    card: 'bg-amber-50 border-amber-300',
    dot: 'bg-amber-500',
    chip: 'bg-amber-100 text-amber-800',
    btn: 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100',
  },
  bought: {
    label: 'Comprado',
    card: 'bg-emerald-50 border-emerald-400',
    dot: 'bg-emerald-500',
    chip: 'bg-emerald-100 text-emerald-800',
    btn: 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100',
  },
}
