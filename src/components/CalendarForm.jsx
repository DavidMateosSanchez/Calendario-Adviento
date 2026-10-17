import { useState } from 'react'
import MoneyInput from './MoneyInput.jsx'

export default function CalendarForm({ initial, submitLabel, onSubmit, onCancel, onDelete }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [recipient, setRecipient] = useState(initial?.recipient ?? '')
  const [budget, setBudget] = useState(initial?.budget ?? 0)
  const [dailyMax, setDailyMax] = useState(initial?.defaultDailyMax ?? null)

  const submit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({
      name: name.trim(),
      recipient: recipient.trim(),
      budget: budget ?? 0,
      defaultDailyMax: dailyMax,
    })
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="label" htmlFor="cal-name">Nombre del calendario</label>
        <input
          id="cal-name"
          className="input"
          autoFocus
          placeholder="Adviento 2026 para…"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label className="label" htmlFor="cal-recipient">Para quién es</label>
        <input
          id="cal-recipient"
          className="input"
          placeholder="Mi pareja, mi madre…"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="cal-budget">Presupuesto total objetivo</label>
          <MoneyInput id="cal-budget" value={budget} onChange={setBudget} />
        </div>
        <div>
          <label className="label" htmlFor="cal-dmax">Máximo diario por defecto</label>
          <MoneyInput id="cal-dmax" allowEmpty placeholder="Sin límite" value={dailyMax} onChange={setDailyMax} />
        </div>
      </div>
      <p className="text-xs text-stone-500">
        El máximo diario se puede cambiar después día por día. Todo esto se puede editar cuando quieras.
      </p>
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
        <div>
          {onDelete && (
            <button type="button" className="btn btn-danger" onClick={onDelete}>
              Borrar calendario
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn" onClick={onCancel}>Cancelar</button>
          <button type="submit" className="btn btn-primary">{submitLabel}</button>
        </div>
      </div>
    </form>
  )
}
