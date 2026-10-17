import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App.jsx'

beforeEach(() => {
  cleanup()
  localStorage.clear()
})

async function createCalendar(user, name = 'Para mi pareja', budget = '200') {
  await user.click(screen.getByRole('button', { name: 'Crear calendario' }))
  await user.type(screen.getByLabelText('Nombre del calendario'), name)
  await user.type(screen.getByLabelText('Presupuesto total objetivo'), budget)
  await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Crear calendario' }))
}

describe('App', () => {
  it('muestra el mensaje de bienvenida cuando no hay calendarios', () => {
    render(<App />)
    expect(screen.getByText(/Todavía no tienes ningún calendario/)).toBeTruthy()
  })

  it('crea un calendario con 24 días en rojo', async () => {
    const user = userEvent.setup()
    render(<App />)
    await createCalendar(user)
    expect(screen.getByRole('heading', { name: 'Para mi pareja' })).toBeTruthy()
    expect(screen.getAllByRole('button', { name: /^Día \d+, Sin nada$/ })).toHaveLength(24)
  })

  it('flujo de ideas: principal cambiable, suma al total y comprado', async () => {
    const user = userEvent.setup()
    render(<App />)
    await createCalendar(user)

    await user.click(screen.getByRole('button', { name: 'Día 1, Sin nada' }))
    const dialog = screen.getByRole('dialog')
    await user.type(within(dialog).getByLabelText('Título / temática del día'), 'Noche de cine')
    await user.click(within(dialog).getByRole('button', { name: 'Experiencia' }))

    await user.click(within(dialog).getByRole('button', { name: '+ Añadir idea' }))
    await user.type(within(dialog).getByLabelText('Idea 1'), 'Entradas')
    await user.type(within(dialog).getByLabelText('Coste de la idea 1'), '25,5')

    await user.click(within(dialog).getByRole('button', { name: '+ Añadir idea' }))
    await user.type(within(dialog).getByLabelText('Idea 2'), 'Proyector')
    await user.type(within(dialog).getByLabelText('Coste de la idea 2'), '40')

    // La primera es la principal: suma 25,50
    expect(dialog.textContent).toMatch(/25,50/)
    // Cambio de opinión: la segunda pasa a ser la principal
    await user.click(within(dialog).getByRole('button', { name: 'Hacer principal la idea 2' }))
    expect(within(dialog).getByRole('button', { name: 'Idea 2 es la principal' })).toBeTruthy()

    await user.click(within(dialog).getByRole('button', { name: 'Marcar como comprado' }))
    await user.click(within(dialog).getByRole('button', { name: 'Cerrar' }))

    expect(screen.getByRole('button', { name: 'Día 1, Comprado' })).toBeTruthy()
    const summary = screen.getByRole('region', { name: 'Resumen' })
    expect(summary.textContent).toMatch(/Comprado: 1/)
    expect(summary.textContent).toMatch(/Experiencia/)
    expect(summary.textContent).toMatch(/40,00/)
    expect(summary.textContent).not.toMatch(/65,50/) // las alternativas no suman

    // Se ha guardado en el navegador
    expect(JSON.parse(localStorage.getItem('calendario-adviento:v1')).calendars[0].days[0].theme).toBe('Noche de cine')
  })

  it('puede tener varios calendarios y cambiar entre ellos', async () => {
    const user = userEvent.setup()
    render(<App />)
    await createCalendar(user, 'Pareja')
    await user.click(screen.getByRole('button', { name: '+ Nuevo calendario' }))
    await user.type(screen.getByLabelText('Nombre del calendario'), 'Madre')
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Crear calendario' }))
    expect(screen.getByRole('heading', { name: 'Madre' })).toBeTruthy()
    await user.selectOptions(screen.getByLabelText('Calendario activo'), screen.getByRole('option', { name: 'Pareja' }))
    expect(screen.getByRole('heading', { name: 'Pareja' })).toBeTruthy()
  })

  it('intercambia dos días completos desde el editor', async () => {
    const user = userEvent.setup()
    render(<App />)
    await createCalendar(user)
    await user.click(screen.getByRole('button', { name: 'Día 1, Sin nada' }))
    const dialog = screen.getByRole('dialog')
    await user.type(within(dialog).getByLabelText('Título / temática del día'), 'Chocolate')
    await user.selectOptions(within(dialog).getByLabelText('Intercambiar con'), 'Día 3')
    // Tras intercambiar, el editor sigue al bloque: ahora estamos en el día 3 con "Chocolate"
    expect(within(screen.getByRole('dialog')).getByRole('heading', { name: 'Día 3' })).toBeTruthy()
    expect(within(screen.getByRole('dialog')).getByLabelText('Título / temática del día').value).toBe('Chocolate')
  })

  it('al subir el máximo de un día sube la suma de máximos diarios', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Crear calendario' }))
    await user.type(screen.getByLabelText('Nombre del calendario'), 'Pareja')
    await user.type(screen.getByLabelText('Máximo diario por defecto'), '15')
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Crear calendario' }))

    const card = () => screen.getByText('Suma de máximos diarios').parentElement
    expect(card().textContent).toMatch(/360,00/)

    await user.click(screen.getByRole('button', { name: 'Día 1, Sin nada' }))
    await user.type(within(screen.getByRole('dialog')).getByLabelText('Máximo de este día'), '30')
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cerrar' }))
    expect(card().textContent).toMatch(/375,00/)
  })

  it('avisa de cambios sin exportar y lo quita al exportar', async () => {
    const user = userEvent.setup()
    URL.createObjectURL = () => 'blob:test'
    URL.revokeObjectURL = () => {}
    render(<App />)
    await createCalendar(user)
    expect(screen.getByText(/Tienes cambios sin exportar/)).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Exportar ahora' }))
    expect(screen.queryByText(/Tienes cambios sin exportar/)).toBeNull()
  })
})
