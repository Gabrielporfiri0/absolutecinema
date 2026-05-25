'use client'

import Image from 'next/image';
import ReserveButtonGuard from '@/components/ReserveButtonGuard';
import { useEffect, useState } from 'react';
import { movieService } from '@/services/movie';
import { toast } from 'sonner';
import { Movies } from '@/types/movies';

function formatDateBR(date: string) {
  try {
    const [year, month, day] = date.split("-")
    return `${day}/${month}/${year}`
  } catch {
    return date
  }
}

export default function HomePage() {
  const [movieData, setMovieData] = useState<Movies>();

  useEffect(() => {
    async function fetchMovieData() {
      try {
        const response = await movieService.get();

        if (response.status === 200 && response.data.movies__.length > 0) {
          const movie = response.data.movies__[0];

          setMovieData(movie);
        } else if (response.status === 200 && response.data.movies__.length === 0) {
          toast.error("Nenhum filme em cartaz no momento, por favor volte mais tarde para conferir as novidades!");
        } else {
          toast.error("Erro desconhecido ao buscar dados do filme em cartaz, tente novamente mais tarde!");
        }
      } catch (error) {
        toast.error("Erro desconhecido ao buscar dados do filme em cartaz, tente novamente mais tarde!");
      }
    }

    fetchMovieData();
  }, []);

  return (
    <div className="container mx-auto p-4">
      {movieData ? (
        <>
          <section className="text-center my-10">
            <h1 className="text-4xl font-bold mb-4 text-white">Bem-vindo ao CineUEMS</h1>
            <p className="text-xl text-gray-400">Os melhores filmes estão aqui.</p>
          </section>

          <section className="flex justify-center mb-16">
            <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden max-w-5xl w-full flex flex-col md:flex-row">
              <div className="w-full md:w-1/3 relative min-h-100 md:min-h-full">
                <Image
                  src={movieData.photo}
                  alt={`Poster de ${movieData.title}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  priority
                />
              </div>

              <div className="w-full md:w-2/3 p-8 flex flex-col justify-center text-left">

                <div className="mb-4 flex items-center justify-between">
                  <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded uppercase tracking-wide">
                    Estreia da Semana
                  </span>

                  <div className="flex items-center gap-2 text-red-400 font-bold border border-red-900/50 bg-red-900/20 px-3 py-1 rounded-lg">
                    <span>📅 {formatDateBR(movieData.session_date)}</span>
                    <span>•</span>
                    <span>🕒 {movieData.session_time}</span>
                  </div>
                </div>

                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {movieData.title}
                </h2>

                <div className="flex items-center flex-wrap gap-4 text-gray-400 text-sm mb-6">
                  <div className="flex items-center gap-1 bg-gray-900/50 px-3 py-1 rounded-full">
                    ⏳ {movieData.duration}
                  </div>
                  <div className="flex items-center gap-1 bg-gray-900/50 px-3 py-1 rounded-full">
                    🎭 {movieData.movie_genre}
                  </div>
                </div>

                <p className="text-gray-300 mb-8 leading-relaxed">
                  {movieData.synopsis}
                </p>

                <div className="mt-auto">
                  <ReserveButtonGuard
                    filmId={String(movieData._id)}
                    className="inline-block w-full md:w-auto text-center bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-red-600/40 hover:cursor-pointer"
                  >
                    Reservar Assento
                  </ReserveButtonGuard>
                  <p className="text-center md:text-left text-xs text-white mt-2 ml-1">
                    Sessão única às {movieData.session_time} no dia {formatDateBR(movieData.session_date)}. Não perca!
                  </p>
                </div>

              </div>
            </div>
          </section>
        </>
      ) : (
        <section className="text-center my-10">
          <h1 className="text-4xl font-bold mb-4 text-white">Sem filmes em cartaz no momento!</h1>
          <p className="text-xl text-gray-400">Por favor, volte em outro momento para conferir as novidades.</p>
        </section>
      )}
    </div >
  );
}