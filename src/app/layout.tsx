
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Simple Oficios',
  description: 'Encuentra y agenda servicios de mecánica confiables.'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
