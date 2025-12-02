import Image from 'next/image';
import ReserveButtonGuard from '@/components/ReserveButtonGuard';

// Dados do Filme em Destaque
const filmeDestaque = {
  id: 1,
  titulo: "Duna: Parte 2",
  sinopse: "Paul Atreides se une a Chani e aos Fremen enquanto busca vingança contra os conspiradores que destruíram sua família. Uma jornada épica de guerra e destino.",
  duracao: "2h 46m",
  genero: "Ficção Científica",
  dataExibicao: "30/11/2025", 
  horarioSessao: "19:30",     
  posterUrl: "https://ingresso-a.akamaihd.net/prd/img/movie/duna-parte-2/3971d5d6-702d-40d8-b990-872d4ffe3e32.webp"
};

export default function HomePage() {
  return (
    <div className="container mx-auto p-4">
      
      {/* 1. SEÇÃO DE BEM-VINDO */}
      <section className="text-center my-10">
        <h1 className="text-4xl font-bold mb-4 text-white">Bem-vindo ao CineUEMS</h1>
        <p className="text-xl text-gray-400">Os melhores filmes estão aqui.</p>
      </section>

      {/* 2. FILME EM DESTAQUE */}
      <section className="flex justify-center mb-16">
        
        <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden max-w-5xl w-full flex flex-col md:flex-row">
          
          {/* LADO ESQUERDO: Imagem */}
          <div className="w-full md:w-1/3 relative min-h-[400px] md:min-h-full">
            <Image
              src={filmeDestaque.posterUrl}
              // CORREÇÃO 1: Adicionadas as crases (`) dentro das chaves
              alt={`Poster de ${filmeDestaque.titulo}`}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* LADO DIREITO: Informações */}
          <div className="w-full md:w-2/3 p-8 flex flex-col justify-center text-left">
            
            <div className="mb-4 flex items-center justify-between">
              <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded uppercase tracking-wide">
                Estreia da Semana
              </span>
              
              <div className="flex items-center gap-2 text-red-400 font-bold border border-red-900/50 bg-red-900/20 px-3 py-1 rounded-lg">
                <span>📅 {filmeDestaque.dataExibicao}</span>
                <span>•</span>
                <span>🕒 {filmeDestaque.horarioSessao}</span>
              </div>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {filmeDestaque.titulo}
            </h2>

            <div className="flex items-center flex-wrap gap-4 text-gray-400 text-sm mb-6">
              <div className="flex items-center gap-1 bg-gray-900/50 px-3 py-1 rounded-full">
                ⏳ {filmeDestaque.duracao}
              </div>
              <div className="flex items-center gap-1 bg-gray-900/50 px-3 py-1 rounded-full">
                🎭 {filmeDestaque.genero}
              </div>
            </div>

            <p className="text-gray-300 mb-8 leading-relaxed">
              {filmeDestaque.sinopse}
            </p>

            {/* Botão de Reserva */}
            <div className="mt-auto">
              <ReserveButtonGuard
                filmId={filmeDestaque.id}
                className="inline-block w-full md:w-auto text-center bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-red-600/40"
              >
                Reservar Assento
              </ReserveButtonGuard>
              <p className="text-center md:text-left text-xs text-gray-500 mt-2 ml-1">
                Sessão única às {filmeDestaque.horarioSessao}
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}