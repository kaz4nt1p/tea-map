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
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
