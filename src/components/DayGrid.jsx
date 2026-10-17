import { useState } from 'react'
import { dayStatus, mainIdea, effectiveMax, dayCost } from '../lib/model.js'
import { eur, STATUS } from '../lib/format.js'

export default function DayGrid({ cal, onOpen, onSwap }) {
  const [dragFrom, setDragFrom] = useState(null)
  const [dragOver, setDragOver] = useState(null)

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
      {cal.days.map((d, i) => {
        const status = dayStatus(d)
        const st = STATUS[status]
        const main = mainIdea(d)
        const cost = dayCost(d)
        const max = effectiveMax(cal, d)
        const over = max != null && cost > max
        const extra = d.ideas.length - 1
        return (
          <div
            key={i}
            role="button"
            tabIndex={0}
            draggable
            aria-label={`Día ${i + 1}, ${st.label}`}
            onClick={() => onOpen(i)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onOpen(i)
              }
            }}
            onDragStart={(e) => {
              setDragFrom(i)
              e.dataTransfer.effectAllowed = 'move'
              e.dataTransfer.setData('text/plain', String(i))
            }}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(i)
            }}
            onDragLeave={() => setDragOver((v) => (v === i ? null : v))}
            onDrop={(e) => {
              e.preventDefault()
              if (dragFrom != null) onSwap(dragFrom, i)
              setDragFrom(null)
              setDragOver(null)
            }}
            onDragEnd={() => {
              setDragFrom(null)
              setDragOver(null)
            }}
            className={`flex min-h-44 cursor-pointer flex-col rounded-2xl border-2 p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine ${st.card} ${
              dragOver === i && dragFrom !== i ? 'ring-4 ring-gold' : ''
            } ${dragFrom === i ? 'opacity-40' : ''}`}
          >
            <div className="flex items-start justify-between">
              <span className="font-serif text-4xl leading-none text-pine-dark">{i + 1}</span>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${st.chip}`}>
                <span className={`h-2 w-2 rounded-full ${st.dot}`} />
                {st.label}
              </span>
            </div>
            <div className="mt-2 text-sm font-semibold text-stone-800">
              {d.theme || <span className="font-normal text-stone-400 italic">Sin temática</span>}
            </div>
            {d.type && (
              <span className="mt-1 w-fit rounded-md bg-white/70 px-1.5 py-0.5 text-[11px] text-stone-600">{d.type}</span>
            )}
            <div className="mt-1.5 line-clamp-2 text-xs text-stone-600">{main?.text}</div>
            <div className="mt-auto flex items-end justify-between pt-2 text-xs">
              <span className="text-stone-500">{extra > 0 ? `+${extra} alternativa${extra > 1 ? 's' : ''}` : ''}</span>
              <span className="text-right">
                {over && <span className="mr-1 text-red-600" title="Supera el máximo del día">⚠</span>}
                <span className="text-sm font-semibold text-pine-dark">{main ? eur(cost) : ''}</span>
                {max != null && <span className="block text-[11px] text-stone-400">máx. {eur(max)}</span>}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
