import type { Metadata } from "next"
import { Inter } from "next/font/google"

import "./globals.css"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "CAP - Clube Amigos de Polvoreira",
  description: "Sistema de gestao do Clube Amigos de Polvoreira",
  icons: {
    icon: "/images/logo-cap.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt" suppressHydrationWarning className={cn("antialiased bg-background", inter.variable)}>
      <body className="font-sans">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  )
}
