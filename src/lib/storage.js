import { sanitizeCalendar } from './model.js'

const KEY = 'calendario-adviento:v1'

const empty = () => ({ calendars: [], activeId: null, lastExportedAt: 0, lastChangeAt: 0 })

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return empty()
    const p = JSON.parse(raw)
    const calendars = Array.isArray(p.calendars) ? p.calendars.map((c) => sanitizeCalendar(c, true)) : []
    return {
      calendars,
      activeId: calendars.some((c) => c.id === p.activeId) ? p.activeId : calendars[0]?.id ?? null,
      lastExportedAt: Number(p.lastExportedAt) || 0,
      lastChangeAt: Number(p.lastChangeAt) || 0,
    }
  } catch {
    return empty()
  }
}

// Devuelve false si el navegador no ha podido guardar (modo privado, cuota llena...)
export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}

export const buildExport = (calendars) => ({
  app: 'calendario-adviento',
  version: 1,
  exportedAt: new Date().toISOString(),
  calendars,
})

export function downloadJson(obj, filename) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// Lee el texto de un archivo exportado. Genera ids nuevos para no chocar con los existentes.
export function parseImport(text) {
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('El archivo no es un JSON válido.')
  }
  const list = Array.isArray(data) ? data : data?.calendars
  if (!Array.isArray(list) || list.length === 0) {
    throw new Error('El archivo no contiene ningún calendario.')
  }
  return list.map((c) => sanitizeCalendar(c, false))
}
