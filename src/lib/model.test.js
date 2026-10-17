import { describe, it, expect } from 'vitest'
import { newCalendar, newIdea, normalizeDay, dayStatus, summarize, parseMoney } from './model.js'
import { parseImport, buildExport } from './storage.js'

const withIdeas = (costs, mainIdx = 0) => ({
  theme: '',
  type: '',
  purchased: false,
  dailyMax: null,
  ideas: costs.map((c, k) => ({ ...newIdea(k === mainIdx), cost: c, text: `idea ${k}` })),
})

describe('model', () => {
  it('parsea importes con coma o punto', () => {
    expect(parseMoney('12,5')).toBe(12.5)
    expect(parseMoney('3.40')).toBe(3.4)
    expect(parseMoney('')).toBeNull()
    expect(parseMoney('-2')).toBeNull()
  })

  it('normalizeDay deja una sola idea principal y quita comprado si no hay ideas', () => {
    const d = normalizeDay({ ...withIdeas([5, 6, 7]), ideas: withIdeas([5, 6, 7]).ideas.map((i) => ({ ...i, main: true })) })
    expect(d.ideas.filter((i) => i.main)).toHaveLength(1)
    expect(normalizeDay({ ...withIdeas([]), purchased: true }).purchased).toBe(false)
  })

  it('estado: rojo, amarillo, verde', () => {
    expect(dayStatus(withIdeas([]))).toBe('empty')
    expect(dayStatus(withIdeas([10]))).toBe('ideas')
    expect(dayStatus({ ...withIdeas([10]), purchased: true })).toBe('bought')
  })

  it('el resumen solo suma la idea principal de cada día', () => {
    const cal = newCalendar({ name: 'x', budget: 100 })
    cal.days[0] = { ...withIdeas([10, 99], 0), type: 'Objeto' }
    cal.days[1] = { ...withIdeas([20, 5], 1), type: 'Objeto', purchased: true }
    cal.days[2] = { ...withIdeas([15]), type: 'Experiencia', dailyMax: 10 }
    const s = summarize(cal)
    expect(s.planned).toBe(10 + 5 + 15)
    expect(s.paid).toBe(5)
    expect(s.remaining).toBe(70)
    expect(s.counts).toEqual({ empty: 21, ideas: 2, bought: 1 })
    expect(s.byType.Objeto).toEqual({ count: 2, total: 15 })
    expect(s.byType.Experiencia.total).toBe(15)
    expect(s.overDays).toEqual([2])
  })
})

describe('máximos diarios', () => {
  it('la suma sube al subir el máximo de un día', () => {
    const cal = newCalendar({ name: 'x', budget: 400, defaultDailyMax: 15 })
    expect(summarize(cal).allocated).toBe(24 * 15)
    cal.days[4] = { ...cal.days[4], dailyMax: 30 }
    const s = summarize(cal)
    expect(s.allocated).toBe(23 * 15 + 30)
    expect(s.daysWithMax).toBe(24)
  })

  it('los días sin máximo (ni propio ni por defecto) no suman', () => {
    const cal = newCalendar({ name: 'x' })
    cal.days[0] = { ...cal.days[0], dailyMax: 20 }
    expect(summarize(cal)).toMatchObject({ allocated: 20, daysWithMax: 1 })
  })
})

describe('exportar / importar', () => {
  it('hace ida y vuelta y genera ids nuevos', () => {
    const cal = newCalendar({ name: 'Para mamá', budget: 80 })
    cal.days[3] = withIdeas([12.5])
    const text = JSON.stringify(buildExport([cal]))
    const [back] = parseImport(text)
    expect(back.id).not.toBe(cal.id)
    expect(back.name).toBe('Para mamá')
    expect(back.days).toHaveLength(24)
    expect(summarize(back).planned).toBe(12.5)
  })

  it('rechaza archivos que no valen', () => {
    expect(() => parseImport('no es json')).toThrow(/JSON/)
    expect(() => parseImport('{"calendars":[]}')).toThrow(/ningún calendario/)
  })
})
