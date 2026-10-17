export default function Welcome({ onCreate, onImport }) {
  return (
    <div className="mx-auto mt-16 max-w-xl rounded-3xl border border-gold/40 bg-cream p-10 text-center shadow-lg">
      <div className="text-5xl" aria-hidden="true">🎄</div>
      <h2 className="mt-4 font-serif text-3xl text-pine-dark">Todavía no tienes ningún calendario</h2>
      <p className="mt-3 text-stone-600">
        Crea el primero para ir apuntando las ideas, la temática y el presupuesto de cada día.
        Puedes tener varios, por ejemplo uno para cada persona.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <button type="button" className="btn btn-primary" onClick={onCreate}>Crear calendario</button>
        <button type="button" className="btn" onClick={onImport}>Importar copia</button>
      </div>
    </div>
  )
}
