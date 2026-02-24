import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LINE Memory Assistant',
  description: 'Personal knowledge management bot for LINE',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  )
}
