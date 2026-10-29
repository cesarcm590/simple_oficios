
import { supabase } from './supabase'

export async function consultarMecanicos() {
  const { data, error } = await supabase
    .from('mechanic_profiles')
    .select('user_id, shop_name, description, city')
    .order('shop_name')

  console.log('Talleres obtenidos:', data)
  console.log('Error de Supabase:', error)

  if (error) throw error
  return data
}

export async function solicitarCita(input: {
  mechanicId: string
  issueDescription: string
  vehicleMake?: string
  vehicleModel?: string
  vehicleYear?: number
  appointmentAt: string
}) {
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (authError) throw authError
  if (!user) throw new Error('Inicia sesión para reservar')

  const { data, error } = await supabase
    .from('appointments')
    .insert({
      client_id: user.id,
      mechanic_id: input.mechanicId,
      issue_description: input.issueDescription,
      vehicle_make: input.vehicleMake || null,
      vehicle_model: input.vehicleModel || null,
      vehicle_year: input.vehicleYear || null,
      appointment_at: input.appointmentAt,
      status: 'pending'
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function consultarMisCitas() {
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (authError) throw authError
  if (!user) throw new Error('Inicia sesión')

  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .order('appointment_at', { ascending: true })

  if (error) throw error
  return data
}

export async function responderCita(
  appointmentId: string,
  aceptar: boolean
) {
  const { data, error } = await supabase.rpc(
    'respond_to_appointment',
    {
      p_appointment_id: appointmentId,
      p_accept: aceptar
    }
  )

  if (error) throw error
  return data
}
