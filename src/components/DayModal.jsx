import { TYPES, mainIdea, dayStatus, effectiveMax, newIdea, newDay, DAYS } from '../lib/model.js'
import { eur, safeUrl, STATUS } from '../lib/format.js'
import Modal from './Modal.jsx'
import MoneyInput from './MoneyInput.jsx'

function IdeaRow({ idea, n, onPatch, onMain, onRemove }) {
  const link = safeUrl(idea.url)
  return (
    <div
      className={`rounded-xl border p-3 ${idea.main ? 'border-gold bg-amber-50/60 shadow-sm' : 'border-stone-200 bg-white'}`}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onMain}
          aria-pressed={idea.main}
          aria-label={idea.main ? `Idea ${n} es la principal` : `Hacer principal la idea ${n}`}
          title={idea.main ? 'Idea principal (suma al total)' : 'Hacer principal'}
          className={`cursor-pointer rounded-md px-2 py-1 text-xl leading-none ${
            idea.main ? 'text-gold' : 'text-stone-300 hover:text-gold'
          }`}
        >
          {idea.main ? '★' : '☆'}
        </button>
        <input
          className="input"
          aria-label={`Idea ${n}`}
          placeholder="Describe la idea"
          autoFocus={!idea.text && !idea.cost && !idea.url}
          value={idea.text}
          onChange={(e) => onPatch({ text: e.target.value })}
        />
        <MoneyInput
          className="w-28 shrink-0"
          aria-label={`Coste de la idea ${n}`}
          value={idea.cost}
          onChange={(v) => onPatch({ cost: v ?? 0 })}
        />
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Borrar idea ${n}`}
          title="Borrar idea"
          className="cursor-pointer rounded-md px-2 py-1 text-stone-400 hover:bg-red-50 hover:text-red-600"
        >
          🗑
        </button>
      </div>
      <div className="mt-2 flex items-center gap-2 pl-10">
        <input
          className="input"
          aria-label={`Enlace de compra de la idea ${n}`}
          placeholder="Enlace de compra (opcional)"
          value={idea.url}
          onChange={(e) => onPatch({ url: e.target.value })}
        />
        {link && (
          <a className="btn shrink-0" href={link} target="_blank" rel="noopener noreferrer">
            Abrir ↗
          </a>
        )}
      </div>
      {idea.main && <p className="mt-1.5 pl-10 text-xs font-medium text-amber-700">Idea principal · es la que suma al total</p>}
    </div>
  )
}

export default function DayModal({ cal, index, onClose, onChange, onSwap, onGo }) {
  const day = cal.days[index]
  const main = mainIdea(day)
  const status = dayStatus(day)
  const st = STATUS[status]
  const max = effectiveMax(cal, day)
  const cost = main?.cost ?? 0
  const over = max != null && cost > max

  const patchIdea = (id, patch) =>
    onChange((d) => ({ ...d, ideas: d.ideas.map((i) => (i.id === id ? { ...i, ...patch } : i)) }))
  const setMain = (id) => onChange((d) => ({ ...d, ideas: d.ideas.map((i) => ({ ...i, main: i.id === id })) }))
  const removeIdea = (id) => onChange((d) => ({ ...d, ideas: d.ideas.filter((i) => i.id !== id) }))
  const addIdea = () => onChange((d) => ({ ...d, ideas: [...d.ideas, newIdea(d.ideas.length === 0)] }))

  return (
    <Modal title={`Día ${index + 1}`} onClose={onClose} wide>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${st.chip}`}>
            <span className={`h-2.5 w-2.5 rounded-full ${st.dot}`} />
            {st.label}
          </span>
          <button
            type="button"
            className={`btn ${day.purchased ? 'border-emerald-500 bg-emerald-100' : ''}`}
            disabled={!main}
            aria-pressed={day.purchased}
            title={main ? '' : 'Añade al menos una idea para poder marcarlo'}
            onClick={() => onChange((d) => ({ ...d, purchased: !d.purchased }))}
          >
            {day.purchased ? '✓ Comprado (clic para desmarcar)' : 'Marcar como comprado'}
          </button>
        </div>

        <div>
          <label className="label" htmlFor="day-theme">Título / temática del día</label>
          <input
            id="day-theme"
            className="input"
            placeholder="Noche de cine, día del chocolate…"
            value={day.theme}
            onChange={(e) => onChange((d) => ({ ...d, theme: e.target.value }))}
          />
        </div>

        <div>
          <span className="label">Tipo de regalo</span>
          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={day.type === t}
                onClick={() => onChange((d) => ({ ...d, type: d.type === t ? '' : t }))}
                className={`cursor-pointer rounded-full border px-3 py-1 text-sm transition ${
                  day.type === t
                    ? 'border-pine bg-pine text-white'
                    : 'border-stone-300 bg-white text-stone-600 hover:border-pine'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="label !mb-0">Ideas</span>
            <button type="button" className="btn" onClick={addIdea}>+ Añadir idea</button>
          </div>
          {day.ideas.length === 0 ? (
            <p className="rounded-xl border border-dashed border-stone-300 p-4 text-center text-sm text-stone-500">
              Todavía no hay ideas para este día.
            </p>
          ) : (
            <div className="space-y-2">
              {day.ideas.map((idea, k) => (
                <IdeaRow
                  key={idea.id}
                  idea={idea}
                  n={k + 1}
                  onPatch={(p) => patchIdea(idea.id, p)}
                  onMain={() => setMain(idea.id)}
                  onRemove={() => removeIdea(idea.id)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="grid items-end gap-4 rounded-xl bg-pine-light/60 p-4 sm:grid-cols-2">
          <div>
            <span className="label">Suma al total</span>
            <div className="font-serif text-2xl text-pine-dark">{eur(cost)}</div>
            {over && <p className="text-sm font-medium text-red-600">Te pasas {eur(cost - max)} del máximo de este día</p>}
          </div>
          <div>
            <label className="label" htmlFor="day-max">Máximo de este día</label>
            <MoneyInput
              id="day-max"
              allowEmpty
              placeholder={
                cal.defaultDailyMax != null
                  ? `${cal.defaultDailyMax.toFixed(2).replace('.', ',')} (por defecto)`
                  : 'Sin límite'
              }
              value={day.dailyMax}
              onChange={(v) => onChange((d) => ({ ...d, dailyMax: v }))}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gold/30 pt-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-stone-600" htmlFor="day-swap">Intercambiar con</label>
            <select
              id="day-swap"
              className="input w-auto"
              value=""
              onChange={(e) => {
                const j = Number(e.target.value)
                onSwap(index, j)
                onGo(j)
              }}
            >
              <option value="">Elegir día…</option>
              {cal.days.map((d, j) =>
                j === index ? null : (
                  <option key={j} value={j}>
                    {`Día ${j + 1}${d.theme ? ` · ${d.theme}` : ''}`}
                  </option>
                ),
              )}
            </select>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                if (window.confirm(`¿Vaciar por completo el día ${index + 1}?`)) onChange(() => newDay())
              }}
            >
              Vaciar día
            </button>
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn" disabled={index === 0} onClick={() => onGo(index - 1)}>
              ← Día anterior
            </button>
            <button type="button" className="btn" disabled={index === DAYS - 1} onClick={() => onGo(index + 1)}>
              Día siguiente →
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
