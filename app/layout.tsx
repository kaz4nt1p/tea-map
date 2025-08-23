import './globals.css'
import ToastProvider from '../components/ToastProvider'
import { AuthProvider } from '../contexts/AuthContext'
import Navigation from '../components/Navigation'

export const metadata = {
  title: 'Tea Spot Map',
  description: 'Интерактивная карта чайных спотов',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full overflow-x-hidden">
      <body className="bg-gray-50 text-gray-900 h-full overflow-x-hidden">
        <AuthProvider>
          <Navigation />
          {children}
          <ToastProvider />
        </AuthProvider>
      </body>
    </html>
  );
}
