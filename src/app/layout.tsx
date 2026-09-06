import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Elo Acadêmico | Gestão de pessoas",
  description: "Informações conectadas. Uma gestão mais humana.",
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
