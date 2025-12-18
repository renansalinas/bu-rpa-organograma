import "./globals.css";
import type { ReactNode } from "react";
import { Urbanist } from "next/font/google";

const urbanist = Urbanist({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-urbanist",
  display: "swap",
});

export const metadata = {
  title: "BU RPA – Organograma",
  description: "Sistema de gerenciamento de organogramas organizacionais",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={urbanist.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
