import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

// Importe os componentes que vamos criar


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Meu Cinema",
  description: "Seu cinema favorito",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className={`${inter.className} bg-gray-900 text-white`}>
        {/* Navbar no topo */}
        <Navbar />

        {/* O 'children' é o conteúdo da página atual (page.tsx) */}
        <main className="min-h-screen">
          {children}
        </main>

        {/* Footer na base */}
        <Footer />
      </body>
    </html>
  );
}