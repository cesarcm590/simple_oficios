
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { registrarUsuario } from '@/lib/auth'

export default function AuthPage() {
  const router = useRouter()

  const [modo, setModo] = useState<'login' | 'registro'>('login')
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)

  async function redirigirPorRol(userId: string) {
    const { data: perfil, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (error) {
      throw new Error(
        'No pudimos consultar tu perfil. Comprueba que exista en Supabase.'
      )
    }

    if (perfil.role === 'mechanic') {
      router.replace('/mecanico/dashboard')
    } else {
      router.replace('/cliente/citas')
    }
  }

  async function enviarFormulario(e: React.FormEvent) {
    e.preventDefault()
    setCargando(true)
    setMensaje('')

    try {
      if (modo === 'registro') {
        const resultado = await registrarUsuario(
          email.trim(),
          password,
          nombre.trim(),
          'cliente'
        )

        if (resultado.session && resultado.user) {
          await redirigirPorRol(resultado.user.id)
        } else {
          setMensaje(
            'Cuenta creada. Si tu proyecto requiere confirmación, revisa tu correo antes de iniciar sesión.'
          )
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        })

        if (error) throw error
        if (!data.user) throw new Error('No se pudo iniciar sesión.')

        await redirigirPorRol(data.user.id)
      }
    } catch (error) {
      setMensaje(
        error instanceof Error
          ? error.message
          : 'Ocurrió un error inesperado.'
      )
    } finally {
      setCargando(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-5 py-12">
      <section className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
        <Link href="/" className="text-sm text-blue-700 hover:underline">
          ← Volver al inicio
        </Link>

        <h1 className="mt-6 text-3xl font-bold">
          {modo === 'login' ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
        </h1>

        <p className="mt-2 text-gray-600">
          {modo === 'login'
            ? 'Inicia sesión para gestionar tus citas.'
            : 'Regístrate para encontrar y reservar un mecánico.'}
        </p>

        <form onSubmit={enviarFormulario} className="mt-6 space-y-4">
          {modo === 'registro' && (
            <label className="block text-sm font-medium">
              Nombre completo
              <input
                className="mt-1 w-full rounded-lg border p-3"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                autoComplete="name"
                required
              />
            </label>
          )}

          <label className="block text-sm font-medium">
            Correo electrónico
            <input
              className="mt-1 w-full rounded-lg border p-3"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label className="block text-sm font-medium">
            Contraseña
            <input
              className="mt-1 w-full rounded-lg border p-3"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={
                modo === 'login' ? 'current-password' : 'new-password'
              }
              minLength={6}
              required
            />
          </label>

          <button
            type="submit"
            disabled={cargando}
            className="w-full rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
          >
            {cargando
              ? 'Procesando...'
              : modo === 'login'
                ? 'Iniciar sesión'
                : 'Crear cuenta'}
          </button>

          {mensaje && (
            <p role="status" className="break-words text-sm text-gray-700">
              {mensaje}
            </p>
          )}
        </form>

        <div className="mt-6 border-t pt-5 text-center text-sm">
          {modo === 'login' ? '¿Todavía no tienes cuenta?' : '¿Ya tienes cuenta?'}
          {' '}
          <button
            type="button"
            className="font-semibold text-blue-700 hover:underline"
            onClick={() => {
              setModo(modo === 'login' ? 'registro' : 'login')
              setMensaje('')
            }}
          >
            {modo === 'login' ? 'Registrarse' : 'Iniciar sesión'}
          </button>
        </div>
      </section>
    </main>
  )
}
