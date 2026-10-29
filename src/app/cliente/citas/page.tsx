
'use client'

import { useEffect, useState } from 'react'
import {
  consultarMecanicos,
  solicitarCita
} from '@/lib/appointments'

type Mecanico = {
  user_id: string
  shop_name: string
  description: string
  city: string | null
}

export default function ReservarCitaPage() {
  const [mecanicos, setMecanicos] = useState<Mecanico[]>([])
  const [mecanicoId, setMecanicoId] = useState('')
  const [problema, setProblema] = useState('')
  const [marca, setMarca] = useState('')
  const [modelo, setModelo] = useState('')
  const [anio, setAnio] = useState('')
  const [fecha, setFecha] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    consultarMecanicos()
      .then(setMecanicos)
      .catch((error) => setMensaje(error.message))
      .finally(() => setCargando(false))
  }, [])

  useEffect(() => {
  const params = new URLSearchParams(window.location.search)
  const problemaInicial = params.get('problema')

  if (problemaInicial) {
    setProblema(problemaInicial)
  }
}, [])

  async function reservar(e: React.FormEvent) {
    e.preventDefault()
    setMensaje('')

    if (!mecanicoId || !problema.trim() || !fecha) {
      setMensaje('Completa el taller, el problema y la fecha.')
      return
    }

    const fechaSeleccionada = new Date(fecha)

    if (fechaSeleccionada <= new Date()) {
      setMensaje('Selecciona una fecha futura.')
      return
    }

    setEnviando(true)

    try {
      const cita = await solicitarCita({
        mechanicId: mecanicoId,
        issueDescription: problema.trim(),
        vehicleMake: marca.trim() || undefined,
        vehicleModel: modelo.trim() || undefined,
        vehicleYear: anio ? Number(anio) : undefined,
        appointmentAt: fechaSeleccionada.toISOString()
      })

      setMensaje(
        `¡Solicitud enviada! Folio: ${cita.id}. Está pendiente de aprobación.`
      )
      setProblema('')
      setFecha('')
    } catch (error) {
      setMensaje(
        error instanceof Error
          ? error.message
          : 'No se pudo crear la cita.'
      )
    } finally {
      setEnviando(false)
    }
  }

  if (cargando) return <p>Cargando talleres...</p>

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-2 text-3xl font-bold">
        Agenda con un mecánico
      </h1>
      <p className="mb-6 text-gray-600">
        Selecciona un taller y solicita el horario que prefieras.
        Tu cita quedará pendiente hasta que el mecánico la apruebe.
      </p>

      <form onSubmit={reservar} className="space-y-4">
        <label className="block">
          Taller
          <select
            className="mt-1 w-full rounded border p-3"
            value={mecanicoId}
            onChange={(e) => setMecanicoId(e.target.value)}
            required
          >
            <option value="">Selecciona un taller</option>
            {mecanicos.map((m) => (
              <option key={m.user_id} value={m.user_id}>
                {m.shop_name}
                {m.city ? ` — ${m.city}` : ''}
              </option>
            ))}
          </select>
        </label>

        {mecanicos
          .filter((m) => m.user_id === mecanicoId)
          .map((m) => (
            <p key={m.user_id} className="text-sm text-gray-600">
              {m.description}
            </p>
          ))}

        <label className="block">
          ¿Qué le sucede a tu coche?
          <textarea
            className="mt-1 w-full rounded border p-3"
            value={problema}
            onChange={(e) => setProblema(e.target.value)}
            placeholder="Ej. Vibra al frenar y hace un ruido..."
            required
          />
        </label>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label>
            Marca
            <input
              className="mt-1 w-full rounded border p-3"
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              placeholder="Nissan"
            />
          </label>

          <label>
            Modelo
            <input
              className="mt-1 w-full rounded border p-3"
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
              placeholder="Versa"
            />
          </label>

          <label>
            Año
            <input
              className="mt-1 w-full rounded border p-3"
              type="number"
              min="1950"
              max={new Date().getFullYear() + 1}
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
              placeholder="2020"
            />
          </label>
        </div>

        <label className="block">
          Fecha y hora
          <input
            className="mt-1 w-full rounded border p-3"
            type="datetime-local"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            min={new Date(Date.now() + 60000)
              .toISOString()
              .slice(0, 16)}
            required
          />
        </label>

        <button
          className="w-full rounded bg-black p-3 text-white disabled:opacity-50"
          disabled={enviando || mecanicos.length === 0}
          type="submit"
        >
          {enviando ? 'Enviando...' : 'Solicitar cita'}
        </button>

        {mensaje && (
          <p role="status" className="break-words text-sm">
            {mensaje}
          </p>
        )}
      </form>
    </main>
  )
}
