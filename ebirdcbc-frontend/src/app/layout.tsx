import type { Metadata } from 'next'
import './globals.css'
import { Auth } from '@/components/auth/Auth'
import { Navbar } from '@/components/navigation/Navbar'
import 'maplibre-gl/dist/maplibre-gl.css'

export const metadata: Metadata = {
  title: 'eBirdCBC',
  description: 'For the birds!',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <Auth>
        <body className='h-screen overflow-hidden'>
          <Navbar />
          <div className='overflow-auto h-full'>{children}</div>
        </body>
      </Auth>
    </html>
  )
}
