import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-black text-white p-4 sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo do Cinema */}
        <Link href="/" className="text-2xl font-bold text-red-600">
          CINEUEMS
        </Link>

        {/* Links de Navegação */}
        <div className="space-x-4">
          <Link href="/" className="hover:text-red-500">
            Início
          </Link>
          <Link href="/#filmes" className="hover:text-red-500">
            Filmes
          </Link>
          <Link href="/fale-conosco" className="hover:text-red-500">
            Fale Conosco
          </Link>
        </div>
      </div>
    </nav>
  );
}