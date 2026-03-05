import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ subsets: ["latin"] });
const geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gestão de Clube Desportivo",
  description: "Sistema de gestão para clubes desportivos",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">
      <body
        className={`${geistSans.className} antialiased`}
        style={{
          "--font-mono": geistMono.style.fontFamily,
        } as React.CSSProperties}
      >
        {children}
      </body>
    </html>
  );
}
