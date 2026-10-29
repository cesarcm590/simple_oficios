import dotenv from 'dotenv'

dotenv.config({
  path: '.env.local'
})

async function main() {
  const { registrarUsuario } = await import('./auth')

  const resultado = await registrarUsuario(
    'jorginhorolon@gmail.com',
    'CAMBIA_ESTA_POR_UNA_CONTRASEÑA_DE_PRUEBA',
    'Usuario de prueba',
    'cliente'
  )

  console.log('Usuario:', resultado.user?.id)
}

main().catch(console.error)