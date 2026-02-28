import type { Metadata } from "next"
import { ThemeProvider } from "@/components/providers/theme-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "OKRA Do — OKR + Todo AI 코치",
  description: "목표를 세우고, 실행하고, 성장하세요. AI가 코치처럼 옆에서 도와주는 개인용 OKR + Todo 통합 앱.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Lora:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
