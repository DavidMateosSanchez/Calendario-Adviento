import { useEffect, useRef, useState } from 'react'
import { loadState, saveState, buildExport, downloadJson, parseImport } from './lib/storage.js'
import { newCalendar, normalizeDay } from './lib/model.js'
import Welcome from './components/Welcome.jsx'
import CalendarForm from './components/CalendarForm.jsx'
import Summary from './components/Summary.jsx'
import DayGrid from './components/DayGrid.jsx'
import DayModal from './components/DayModal.jsx'
import Modal from './components/Modal.jsx'

export default function App() {
  const [state, setState] = useState(loadState)
  const [saveFailed, setSaveFailed] = useState(false)
  const [openDay, setOpenDay] = useState(null)
  const [modal, setModal] = useState(null) // 'new' | 'settings'
  const [pendingImport, setPendingImport] = useState(null)
  const [importError, setImportError] = useState('')
  const fileRef = useRef(null)

  const cal = state.calendars.find((c) => c.id === state.activeId) || state.calendars[0] || null
  const dirty = state.lastChangeAt > state.lastExportedAt

  useEffect(() => {
    setSaveFailed(!saveState(state))
  }, [state])

  // Aviso del navegador al cerrar o recargar si hay cambios sin exportar
  useEffect(() => {
    if (!dirty) return undefined
    const handler = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  const change = (fn) => setState((s) => ({ ...fn(s), lastChangeAt: Date.now() }))
  const updateCal = (fn) =>
    change((s) => ({ ...s, calendars: s.calendars.map((c) => (c.id === cal.id ? fn(c) : c)) }))
  const updateDay = (i, fn) =>
    updateCal((c) => ({ ...c, days: c.days.map((d, k) => (k === i ? normalizeDay(fn(d)) : d)) }))
  const swapDays = (a, b) => {
    if (a === b) return
    updateCal((c) => {
      const days = [...c.days]
      ;[days[a], days[b]] = [days[b], days[a]]
      return { ...c, days }
    })
  }

  const createCalendar = (values) => {
    const c = newCalendar(values)
    change((s) => ({ ...s, calendars: [...s.calendars, c], activeId: c.id }))
    setModal(null)
    setOpenDay(null)
  }
  const saveSettings = (values) => {
    updateCal((c) => ({ ...c, ...values }))
    setModal(null)
  }
  const deleteCalendar = () => {
    if (!window.confirm(`¿Borrar el calendario «${cal.name}»? No se puede deshacer, salvo que tengas una copia exportada.`)) return
    change((s) => {
      const rest = s.calendars.filter((c) => c.id !== cal.id)
      return { ...s, calendars: rest, activeId: rest[0]?.id ?? null }
    })
    setModal(null)
    setOpenDay(null)
  }
  const selectCalendar = (id) => {
    setState((s) => ({ ...s, activeId: id })) // cambiar de calendario no cuenta como cambio de datos
    setOpenDay(null)
  }

  const exportAll = () => {
    const date = new Date().toISOString().slice(0, 10)
    downloadJson(buildExport(state.calendars), `calendarios-adviento-${date}.json`)
    setState((s) => ({ ...s, lastExportedAt: Date.now() }))
  }
  const onFile = async (e) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    try {
      setPendingImport(parseImport(await f.text()))
      setImportError('')
    } catch (err) {
      setImportError(err.message || 'No se pudo leer el archivo.')
    }
  }
  const applyImport = (mode) => {
    const list = pendingImport
    change((s) => ({
      ...s,
      calendars: mode === 'add' ? [...s.calendars, ...list] : list,
      activeId: list[0].id,
    }))
    setPendingImport(null)
    setOpenDay(null)
  }

  const askImport = () => fileRef.current?.click()

  return (
    <div className="min-h-screen">
      <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={onFile} data-testid="import-input" />

      <header className="border-b-4 border-gold bg-pine text-cream shadow-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
          <h1 className="mr-auto font-serif text-2xl">🎄 Calendarios de Adviento</h1>
          {cal && (
            <>
              <label className="sr-only" htmlFor="cal-select">Calendario activo</label>
              <select
                id="cal-select"
                className="input w-auto max-w-56"
                value={cal.id}
                onChange={(e) => selectCalendar(e.target.value)}
              >
                {state.calendars.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <button type="button" className="btn" onClick={() => setModal('new')}>+ Nuevo calendario</button>
              <button type="button" className="btn" onClick={() => setModal('settings')}>Ajustes</button>
            </>
          )}
          <button type="button" className="btn" onClick={exportAll} disabled={state.calendars.length === 0}>Exportar</button>
          <button type="button" className="btn" onClick={askImport}>Importar</button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-5 px-4 py-6">
        {saveFailed && (
          <div role="alert" className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
            El navegador no está pudiendo guardar los datos (¿modo privado o almacenamiento lleno?). Exporta una copia para no perder nada.
          </div>
        )}
        {importError && (
          <div role="alert" className="flex items-center justify-between rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
            {importError}
            <button type="button" className="btn" onClick={() => setImportError('')}>Cerrar</button>
          </div>
        )}
        {dirty && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-900">
            <span>Tienes cambios sin exportar. Haz una copia de vez en cuando por si borras los datos del navegador.</span>
            <button type="button" className="btn" onClick={exportAll}>Exportar ahora</button>
          </div>
        )}

        {!cal ? (
          <Welcome onCreate={() => setModal('new')} onImport={askImport} />
        ) : (
          <>
            <div>
              <h2 className="font-serif text-3xl text-pine-dark">{cal.name}</h2>
              {cal.recipient && <p className="text-stone-600">Para {cal.recipient}</p>}
            </div>
            <Summary cal={cal} onOpen={setOpenDay} />
            <div>
              <h3 className="mb-1 font-serif text-xl text-pine-dark">Los 24 días</h3>
              <p className="mb-3 text-sm text-stone-500">
                Haz clic en un día para editarlo. Arrastra un día sobre otro para intercambiar todo su contenido.
              </p>
              <DayGrid cal={cal} onOpen={setOpenDay} onSwap={swapDays} />
            </div>
          </>
        )}

        <footer className="pt-6 text-center text-xs text-stone-500">
          Los datos se guardan solo en este navegador. Usa Exportar para guardar una copia.
        </footer>
      </main>

      {modal === 'new' && (
        <Modal title="Nuevo calendario" onClose={() => setModal(null)}>
          <CalendarForm submitLabel="Crear calendario" onSubmit={createCalendar} onCancel={() => setModal(null)} />
        </Modal>
      )}
      {modal === 'settings' && cal && (
        <Modal title="Ajustes del calendario" onClose={() => setModal(null)}>
          <CalendarForm
            initial={cal}
            submitLabel="Guardar"
            onSubmit={saveSettings}
            onCancel={() => setModal(null)}
            onDelete={deleteCalendar}
          />
        </Modal>
      )}
      {cal && openDay != null && (
        <DayModal
          cal={cal}
          index={openDay}
          onClose={() => setOpenDay(null)}
          onChange={(fn) => updateDay(openDay, fn)}
          onSwap={swapDays}
          onGo={setOpenDay}
        />
      )}
      {pendingImport && (
        <Modal title="Importar copia" onClose={() => setPendingImport(null)}>
          <p className="text-stone-700">
            El archivo contiene {pendingImport.length} {pendingImport.length === 1 ? 'calendario' : 'calendarios'}:{' '}
            <strong>{pendingImport.map((c) => c.name).join(', ')}</strong>.
          </p>
          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <button type="button" className="btn" onClick={() => setPendingImport(null)}>Cancelar</button>
            <button type="button" className="btn btn-danger" onClick={() => applyImport('replace')}>
              Reemplazar todo lo que tengo
            </button>
            <button type="button" className="btn btn-primary" onClick={() => applyImport('add')}>
              Añadir a mis calendarios
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
