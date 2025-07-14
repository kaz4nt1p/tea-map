import './globals.css'
import ToastProvider from '../components/ToastProvider'

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
      <body className="bg-tea-50 text-gray-900 h-full">
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
