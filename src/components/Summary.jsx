import { summarize } from '../lib/model.js'
import { eur, STATUS } from '../lib/format.js'

function Stat({ label, value, hint, tone = 'default' }) {
  const color = tone === 'red' ? 'text-red-600' : tone === 'green' ? 'text-emerald-700' : 'text-pine-dark'
  return (
    <div className="rounded-2xl border border-gold/30 bg-cream p-4 shadow-sm">
      <div className="text-xs font-semibold tracking-wide text-stone-500 uppercase">{label}</div>
      <div className={`mt-1 font-serif text-2xl ${color}`}>{value}</div>
      {hint && <div className="mt-0.5 text-xs text-stone-500">{hint}</div>}
    </div>
  )
}

function DayButtons({ days, status, onOpen }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {days.map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onOpen(i)}
          className={`cursor-pointer rounded-md border px-2 py-0.5 text-sm ${STATUS[status].btn}`}
        >
          {`Día ${i + 1}`}
        </button>
      ))}
    </div>
  )
}

export default function Summary({ cal, onOpen }) {
  const s = summarize(cal)
  const hasBudget = s.budget > 0
  const over = hasBudget && s.planned > s.budget
  const pct = (v) => (hasBudget ? Math.min(100, (v / s.budget) * 100) : 0)
  const types = Object.entries(s.byType)

  return (
    <section aria-label="Resumen" className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Stat label="Presupuesto objetivo" value={hasBudget ? eur(s.budget) : 'Sin definir'} />
        <Stat
          label="Suma de máximos diarios"
          value={eur(s.allocated)}
          hint={
            hasBudget && s.allocated > s.budget
              ? `Superas el objetivo en ${eur(s.allocated - s.budget)}`
              : `${s.daysWithMax} ${s.daysWithMax === 1 ? 'día' : 'días'} con máximo`
          }
          tone={hasBudget && s.allocated > s.budget ? 'red' : 'default'}
        />
        <Stat
          label="Coste total previsto"
          value={eur(s.planned)}
          hint={`Por pagar: ${eur(s.planned - s.paid)}`}
        />
        <Stat label="Ya pagado" value={eur(s.paid)} hint="Días en verde" tone="green" />
        <Stat
          label={over ? 'Te pasas' : 'Te queda'}
          value={hasBudget ? eur(Math.abs(s.remaining)) : '—'}
          hint={hasBudget ? 'Sobre el coste total previsto' : 'Define un presupuesto objetivo'}
          tone={over ? 'red' : 'default'}
        />
      </div>

      {hasBudget && (
        <div
          className="h-3 w-full overflow-hidden rounded-full bg-stone-200"
          role="img"
          aria-label={`Previsto ${eur(s.planned)} de ${eur(s.budget)}, pagado ${eur(s.paid)}`}
        >
          <div className="relative h-full">
            <div className={`absolute inset-y-0 left-0 ${over ? 'bg-red-300' : 'bg-pine/40'}`} style={{ width: `${pct(s.planned)}%` }} />
            <div className="absolute inset-y-0 left-0 bg-emerald-500" style={{ width: `${pct(s.paid)}%` }} />
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-gold/30 bg-cream p-4 shadow-sm">
          <h3 className="mb-2 font-serif text-lg text-pine-dark">Estado de los días</h3>
          <div className="mb-3 flex flex-wrap gap-2 text-sm">
            {['empty', 'ideas', 'bought'].map((k) => (
              <span key={k} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium ${STATUS[k].chip}`}>
                <span className={`h-2 w-2 rounded-full ${STATUS[k].dot}`} />
                {STATUS[k].label}: {s.counts[k]}
              </span>
            ))}
          </div>
          {s.emptyDays.length > 0 && (
            <div className="mb-3">
              <div className="mb-1 text-sm text-stone-600">Sin ideas ({s.emptyDays.length})</div>
              <DayButtons days={s.emptyDays} status="empty" onOpen={onOpen} />
            </div>
          )}
          {s.pendingDays.length > 0 && (
            <div className="mb-3">
              <div className="mb-1 text-sm text-stone-600">Con ideas, pendientes de comprar ({s.pendingDays.length})</div>
              <DayButtons days={s.pendingDays} status="ideas" onOpen={onOpen} />
            </div>
          )}
          {s.overDays.length > 0 && (
            <div>
              <div className="mb-1 text-sm text-red-700">Superan su máximo diario ({s.overDays.length})</div>
              <DayButtons days={s.overDays} status="empty" onOpen={onOpen} />
            </div>
          )}
          {s.counts.bought === cal.days.length && <p className="text-sm text-emerald-700">¡Todo comprado! 🎁</p>}
        </div>

        <div className="rounded-2xl border border-gold/30 bg-cream p-4 shadow-sm">
          <h3 className="mb-2 font-serif text-lg text-pine-dark">Por tipo de regalo</h3>
          {types.length === 0 ? (
            <p className="text-sm text-stone-500">Etiqueta los días con un tipo para ver aquí el total de cada uno.</p>
          ) : (
            <ul className="space-y-1.5">
              {types.map(([name, t]) => (
                <li key={name} className="flex items-center justify-between rounded-lg bg-white px-3 py-1.5 text-sm">
                  <span className="text-stone-700">
                    {name} <span className="text-stone-400">· {t.count} {t.count === 1 ? 'día' : 'días'}</span>
                  </span>
                  <span className="font-semibold text-pine-dark">{eur(t.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
