import './globals.css'
import ToastProvider from '../components/ToastProvider'
import { AuthProvider } from '../contexts/AuthContext'
import Navigation from '../components/Navigation'

export const metadata = {
  title: 'Tea Spot Map',
  description: 'Интерактивная карта чайных спотов',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="bg-gray-50 text-gray-900 h-full">
        <AuthProvider>
          <Navigation />
          {children}
          <ToastProvider />
        </AuthProvider>
      </body>
    </html>
  );
}
