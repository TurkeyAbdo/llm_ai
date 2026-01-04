import './globals.css'

export const metadata = {
  title: 'NexusMind',
  description: 'AI-powered document chat',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

