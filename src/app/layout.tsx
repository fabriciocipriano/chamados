import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sistema de Chamados",
  description: "Sistema de gerenciamento de chamados",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full bg-gray-50" suppressHydrationWarning>{children}</body>
    </html>
  );
}
