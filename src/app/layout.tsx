import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '面试助手',
  description: '智能面试辅助系统',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  )
}
