import Image from 'next/image';
import Link from 'next/link';

// Dados do Filme em Destaque
const filmeDestaque = {
  id: 1,
  titulo: "Duna: Parte 2",
  sinopse: "Paul Atreides se une a Chani e aos Fremen enquanto busca vingança contra os conspiradores que destruíram sua família. Uma jornada épica de guerra e destino.",
  duracao: "2h 46m",
  genero: "Ficção Científica",
  posterUrl: "https://ingresso-a.akamaihd.net/prd/img/movie/duna-parte-2/3971d5d6-702d-40d8-b990-872d4ffe3e32.webp"
};

export default function HomePage() {
  return (
    <div className="container mx-auto p-4">
      
      {/* 1. SEÇÃO DE BEM-VINDO (Mantida conforme solicitado) */}
      <section className="text-center my-10">
        <h1 className="text-4xl font-bold mb-4 text-white">Bem-vindo ao CineUEMS</h1>
        <p className="text-xl text-gray-400">Os melhores filmes estão aqui.</p>
      </section>

      {/* 2. FILME EM DESTAQUE (Centralizado) */}
      <section className="flex justify-center mb-16">
        
        {/* Container do Card (Flexbox para imagem ao lado do texto em telas grandes) */}
        <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden max-w-5xl w-full flex flex-col md:flex-row">
          
          {/* LADO ESQUERDO: Imagem */}
          <div className="w-full md:w-1/3 relative min-h-[400px] md:min-h-full">
            <Image
              src={filmeDestaque.posterUrl}
              alt={`Poster de ${filmeDestaque.titulo}`}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* LADO DIREITO: Informações */}
          <div className="w-full md:w-2/3 p-8 flex flex-col justify-center text-left">
            
            <div className="mb-4">
              <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded uppercase tracking-wide">
                Estreia da Semana
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {filmeDestaque.titulo}
            </h2>

            <div className="flex items-center space-x-4 text-gray-400 text-sm mb-6">
              <span className="flex items-center gap-1">
                🕒 {filmeDestaque.duracao}
              </span>
              <span>|</span>
              <span>{filmeDestaque.genero}</span>
            </div>

            <p className="text-gray-300 mb-8 leading-relaxed">
              {filmeDestaque.sinopse}
            </p>

            {/* Botão de Reserva */}
            <div className="mt-auto">
              <Link 
                href={`/filme/${filmeDestaque.id}`}
                className="inline-block w-full md:w-auto text-center bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-red-600/40"
              >
                Reservar Assento
              </Link>
            </div>

          </div>
        </div>
      </section>

      <div className="flex gap-4">
        <Link
          href={'/adminPage/register'}
          className="p-5 bg-blue-500 hover:cursor-pointer hover:bg-blue-700 font-bold rounded-2xl"
        >
          Ir para página de registro do admin
        </Link>
        <Link
          href={'/adminPage/login'}
          className="p-5 bg-blue-500 hover:cursor-pointer hover:bg-blue-700 font-bold rounded-2xl"
        >
          Ir para página de login do admin
        </Link>
      </div>

      <button
        className="p-5 bg-blue-500 hover:cursor-pointer hover:bg-blue-700 font-bold rounded-2xl"
        onClick={removeToken}
      >
        Remover Token
      </button>
    </div>
  );
}