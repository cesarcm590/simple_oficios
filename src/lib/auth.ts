import { supabase } from './supabase'

export async function registrarUsuario(
  email: string,
  password: string,
  nombre: string,
  tipo: 'cliente' | 'mecanico'
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nombre, tipo }
    }
  })

  if (error) throw error

  return data
}


export async function iniciarSesion(
  email: string,
  password: string
) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw error

  return data
}
  
