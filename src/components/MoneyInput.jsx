import { useEffect, useState } from 'react'
import { parseMoney } from '../lib/model.js'

const toRaw = (value, allowEmpty) =>
  value == null || (!allowEmpty && value === 0) ? '' : String(value).replace('.', ',')

// Campo de importe en euros: admite coma o punto y hasta 2 decimales.
// onChange recibe un número, o null si el campo está vacío.
export default function MoneyInput({ value, onChange, placeholder = '0', allowEmpty = false, className = '', ...rest }) {
  const [raw, setRaw] = useState(() => toRaw(value, allowEmpty))

  useEffect(() => {
    const norm = (v) => v ?? (allowEmpty ? null : 0)
    if (norm(parseMoney(raw)) !== norm(value)) setRaw(toRaw(value, allowEmpty))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <div className={`relative ${className}`}>
      <input
        {...rest}
        inputMode="decimal"
        className="input pr-7 text-right"
        placeholder={placeholder}
        value={raw}
        onChange={(e) => {
          const r = e.target.value
          if (!/^[0-9]*[.,]?[0-9]{0,2}$/.test(r)) return
          setRaw(r)
          onChange(parseMoney(r))
        }}
      />
      <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-stone-400">€</span>
    </div>
  )
}
