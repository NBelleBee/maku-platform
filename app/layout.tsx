import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MAKU Technologies',
  description: 'Personalised Business Assistants designed around your business, your services and your customers.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
