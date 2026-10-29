
'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  consultarMisCitas,
  responderCita
} from '@/lib/appointments'

type Cita = {
  id: string
  client_id: string
  mechanic_id: string
  issue_description: string
  vehicle_make: string | null
  vehicle_model: string | null
  vehicle_year: number | null
  appointment_at: string
  status: string
}

export default function DashboardMecanico() {
  const [citas, setCitas] = useState<Cita[]>([])
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(true)
  const [procesando, setProcesando] = useState<string | null>(null)

  const cargarCitas = useCallback(async () => {
    try {
      const data = await consultarMisCitas()
      setCitas(data as Cita[])
      setMensaje('')
    } catch (error) {
      setMensaje(
        error instanceof Error
          ? error.message
          : 'No se pudieron cargar las citas.'
      )
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    void cargarCitas()
  }, [cargarCitas])

  async function responder(id: string, aceptar: boolean) {
    setProcesando(id)
    setMensaje('')

    try {
      await responderCita(id, aceptar)
      setMensaje(
        aceptar
          ? 'Cita confirmada correctamente.'
          : 'Solicitud rechazada.'
      )
      await cargarCitas()
    } catch (error) {
      setMensaje(
        error instanceof Error
          ? error.message
          : 'No se pudo actualizar la cita.'
      )
    } finally {
      setProcesando(null)
    }
  }

  if (cargando) return <p className="p-6">Cargando solicitudes...</p>

  const pendientes = citas.filter((c) => c.status === 'pending')
  const anteriores = citas.filter((c) => c.status !== 'pending')

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-3xl font-bold">
        Dashboard del mecánico
      </h1>
      <p className="mb-6 mt-2 text-gray-600">
        Revisa las solicitudes y confirma los horarios que puedes atender.
      </p>

      {mensaje && (
        <p role="status" className="mb-4 break-words rounded bg-gray-100 p-3">
          {mensaje}
        </p>
      )}

      <h2 className="mb-3 text-xl font-semibold">
        Solicitudes pendientes ({pendientes.length})
      </h2>

      {pendientes.length === 0 && (
        <p className="mb-6 text-gray-500">
          No tienes solicitudes pendientes.
        </p>
      )}

      <div className="space-y-4">
        {pendientes.map((cita) => (
          <article key={cita.id} className="rounded-xl border p-4">
            <p className="text-sm text-gray-500">
              Folio: {cita.id}
            </p>

            <h3 className="mt-2 text-lg font-semibold">
              {[
                cita.vehicle_make,
                cita.vehicle_model,
                cita.vehicle_year
              ].filter(Boolean).join(' ') || 'Vehículo no especificado'}
            </h3>

            <p className="my-2">{cita.issue_description}</p>

            <p className="text-sm">
              <strong>Fecha:</strong>{' '}
              {new Date(cita.appointment_at).toLocaleString('es-MX', {
                dateStyle: 'medium',
                timeStyle: 'short'
              })}
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                className="rounded bg-green-700 px-4 py-2 text-white disabled:opacity-50"
                disabled={procesando !== null}
                onClick={() => responder(cita.id, true)}
              >
                {procesando === cita.id
                  ? 'Procesando...'
                  : 'Aceptar cita'}
              </button>

              <button
                className="rounded border border-red-600 px-4 py-2 text-red-700 disabled:opacity-50"
                disabled={procesando !== null}
                onClick={() => responder(cita.id, false)}
              >
                Rechazar
              </button>
            </div>
          </article>
        ))}
      </div>

      <h2 className="mb-3 mt-8 text-xl font-semibold">
        Historial de solicitudes
      </h2>

      <div className="space-y-3">
        {anteriores.map((cita) => (
          <article key={cita.id} className="rounded-lg border p-3">
            <p className="font-medium">
              {cita.issue_description}
            </p>
            <p className="text-sm text-gray-600">
              {new Date(cita.appointment_at).toLocaleString('es-MX')}
              {' · Estado: '}
              {cita.status}
            </p>
          </article>
        ))}
      </div>
    </main>
  )
}
