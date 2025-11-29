import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-black text-gray-400 p-8">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Coluna 1: Sobre Nós */}
        <div>
          <h3 className="text-lg font-bold text-white mb-4">Sobre Nós</h3>
          <p>
            O melhor cinema da cidade, trazendo a magia de Hollywood
            para você.
          </p>
        </div>

        {/* Coluna 2: Contato */}
        <div>
          <h3 className="text-lg font-bold text-white mb-4">Contato</h3>
          <p>Email: contato@uems.com.br</p>
          <p>Telefone: (67)3925-5184</p>
          <p>Endereço: R. Walter Hubacher, 138 - Vila Beatriz, Nova Andradina - MS, 79750-000, Brazil</p>
        </div>

        {/* Coluna 3: Logo */}
        <div className="flex items-center justify-center md:justify-end">
          <Image
            src="/logo_cine.jpeg"
            alt="Logo CINEUEMS"
            width={200} // Coloquei um pouco maior que a navbar para destaque
            height={70}
            className="object-contain"
          />
        </div>

      </div>
      <div className="text-center mt-8 border-t border-gray-800 pt-4">
        © {new Date().getFullYear()} CINEUEMS. Todos os direitos reservados.
      </div>
    </footer>
  );
}