export const DAYS = 24
export const TYPES = ['Objeto', 'Experiencia', 'Comida y bebida', 'Plan juntos', 'Mensaje o nota', 'Otro']

export const uid = () =>
  globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36)

const str = (v) => (typeof v === 'string' ? v : '')
const round2 = (n) => Math.round(n * 100) / 100

// Acepta "12,5", "12.5" o números. Devuelve null si está vacío o no es válido.
export const parseMoney = (raw) => {
  if (raw === '' || raw == null) return null
  const n = parseFloat(String(raw).replace(',', '.'))
  return Number.isFinite(n) && n >= 0 ? n : null
}
const money = (v) => parseMoney(v) ?? 0

export const newIdea = (main = false) => ({ id: uid(), text: '', cost: 0, url: '', main })
export const newDay = () => ({ theme: '', type: '', ideas: [], purchased: false, dailyMax: null })

export const newCalendar = ({ name, recipient = '', budget = 0, defaultDailyMax = null }) => ({
  id: uid(),
  name,
  recipient,
  budget,
  defaultDailyMax,
  days: Array.from({ length: DAYS }, newDay),
})

// Reglas de coherencia de un día:
// - siempre hay exactamente una idea principal si hay ideas
// - sin ideas no puede estar comprado
export function normalizeDay(d) {
  if (d.ideas.length === 0) return { ...d, purchased: false }
  let m = d.ideas.findIndex((i) => i.main)
  if (m < 0) m = 0
  return { ...d, ideas: d.ideas.map((i, k) => ({ ...i, main: k === m })) }
}

export const mainIdea = (day) => day.ideas.find((i) => i.main) || null
export const dayCost = (day) => mainIdea(day)?.cost || 0
// Rojo = sin nada, amarillo = con ideas, verde = comprado
export const dayStatus = (day) =>
  day.purchased && mainIdea(day) ? 'bought' : day.ideas.length > 0 ? 'ideas' : 'empty'
export const effectiveMax = (cal, day) => day.dailyMax ?? cal.defaultDailyMax ?? null

export function summarize(cal) {
  const s = {
    budget: cal.budget || 0,
    planned: 0,
    paid: 0,
    allocated: 0, // suma de los máximos diarios (el propio de cada día o el de por defecto)
    daysWithMax: 0,
    counts: { empty: 0, ideas: 0, bought: 0 },
    emptyDays: [],
    pendingDays: [],
    overDays: [],
    byType: {},
  }
  cal.days.forEach((d, i) => {
    const st = dayStatus(d)
    const cost = dayCost(d)
    const max = effectiveMax(cal, d)
    s.counts[st]++
    s.planned += cost
    if (st === 'bought') s.paid += cost
    if (st === 'empty') s.emptyDays.push(i)
    if (st === 'ideas') s.pendingDays.push(i)
    if (max != null) {
      s.allocated += max
      s.daysWithMax++
    }
    if (max != null && cost > max) s.overDays.push(i)
    const key = d.type || (cost > 0 ? 'Sin etiqueta' : null)
    if (key) {
      const t = (s.byType[key] ||= { count: 0, total: 0 })
      t.count++
      t.total += cost
    }
  })
  s.planned = round2(s.planned)
  s.paid = round2(s.paid)
  s.allocated = round2(s.allocated)
  s.remaining = round2(s.budget - s.planned)
  Object.values(s.byType).forEach((t) => (t.total = round2(t.total)))
  return s
}

// ---------- Saneado de datos importados / guardados ----------
function sanitizeIdea(r) {
  return {
    id: typeof r?.id === 'string' && r.id ? r.id : uid(),
    text: str(r?.text),
    cost: money(r?.cost),
    url: str(r?.url),
    main: !!r?.main,
  }
}

function sanitizeDay(raw) {
  const ideas = Array.isArray(raw?.ideas) ? raw.ideas.map(sanitizeIdea) : []
  return normalizeDay({
    theme: str(raw?.theme),
    type: TYPES.includes(raw?.type) ? raw.type : '',
    ideas,
    purchased: !!raw?.purchased,
    dailyMax: parseMoney(raw?.dailyMax),
  })
}

export function sanitizeCalendar(raw, keepId) {
  return {
    id: keepId && typeof raw?.id === 'string' && raw.id ? raw.id : uid(),
    name: str(raw?.name).trim() || 'Calendario sin nombre',
    recipient: str(raw?.recipient),
    budget: money(raw?.budget),
    defaultDailyMax: parseMoney(raw?.defaultDailyMax),
    days: Array.from({ length: DAYS }, (_, i) => sanitizeDay(raw?.days?.[i])),
  }
}
