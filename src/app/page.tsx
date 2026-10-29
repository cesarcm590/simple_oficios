
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [problema, setProblema] = useState('')
  const router = useRouter()

  function buscarMecanico(e: React.FormEvent) {
    e.preventDefault()

    if (!problema.trim()) return

    router.push(
      `/cliente/citas?problema=${encodeURIComponent(problema.trim())}`
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4 sm:px-10">
        <Link href="/" className="text-2xl font-bold">
          Simple Oficios
        </Link>

        <Link
          href="/auth"
          className="rounded-lg border border-gray-300 px-4 py-2 font-medium transition hover:bg-gray-100"
        >
          Iniciar sesión o registrarse
        </Link>
      </header>

      <section className="mx-auto flex max-w-4xl flex-col items-center px-5 py-20 text-center sm:py-28">
        <span className="mb-5 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800">
          Encuentra mecánicos confiables
        </span>

        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
          Tu coche necesita ayuda.
          <span className="mt-2 block text-blue-700">
            Encuentra al mecánico adecuado.
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-gray-600">
          Cuéntanos qué le sucede a tu coche y te ayudaremos a encontrar
          un mecánico que pueda solucionar el problema.
        </p>

        <form
          onSubmit={buscarMecanico}
          className="mt-10 w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-lg sm:p-6"
        >
          <label
            htmlFor="problema"
            className="mb-3 block text-lg font-semibold"
          >
            ¿Qué le sucede a tu coche?
          </label>

          <textarea
            id="problema"
            value={problema}
            onChange={(e) => setProblema(e.target.value)}
            placeholder="Ej. Vibra al frenar y hace un ruido..."
            rows={4}
            maxLength={2000}
            required
            className="w-full resize-y rounded-xl border border-gray-300 p-4 outline-none transition placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />

          <div className="mt-4 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
            <p className="text-sm text-gray-500">
              Describe los síntomas con tus propias palabras.
            </p>

            <button
              type="submit"
              disabled={!problema.trim()}
              className="rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Encontrar mecánico →
            </button>
          </div>
        </form>

        <p className="mt-5 text-sm text-gray-500">
          Sin llamadas. Solicita una cita directamente desde la plataforma.
        </p>
      </section>

      <footer className="border-t bg-white px-6 py-6 text-center text-sm text-gray-500">
        Simple Oficios · Conectando conductores con mecánicos.
      </footer>
    </main>
  )
}
