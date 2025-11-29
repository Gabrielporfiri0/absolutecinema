'use client'; // 1. Obrigatório para usar estado no Next.js App Router

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  // Estado para controlar abrir/fechar o menu
  const [isOpen, setIsOpen] = useState(false);

  return (
    // Mudei z-10 para z-50 para garantir que o menu fique sobre tudo
    <nav className="bg-black text-white p-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        
        {/* --- Logo do Cinema --- */}
        <Link href="/" onClick={() => setIsOpen(false)}>
          <Image
            src="/logo_cine.jpeg" // Mantido o .jpeg do seu código
            alt="Logo CINEUEMS"
            width={150}
            height={50}
            className="object-contain hover:opacity-80 transition-opacity"
            priority
          />
        </Link>

        {/* --- Links Desktop (Visível apenas em telas médias 'md' para cima) --- */}
        <div className="hidden md:flex space-x-4">
          <Link href="/" className="hover:text-red-500 transition-colors">
            Início
          </Link>
          <Link href="/#filmes" className="hover:text-red-500 transition-colors">
            Filmes
          </Link>
          <Link href="/fale-conosco" className="hover:text-red-500 transition-colors">
            Fale Conosco
          </Link>
        </div>

        {/* --- Botão Sanduíche (Visível apenas em Mobile 'md:hidden') --- */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white hover:text-red-500 focus:outline-none"
          >
            {/* Ícone muda dependendo se está aberto ou fechado */}
            {isOpen ? (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* --- Menu Mobile (Lista Dropdown) --- */}
      {/* Só aparece se isOpen for true */}
      {isOpen && (
        <div className="md:hidden mt-4 pb-4 border-t border-gray-800 bg-black">
          <div className="flex flex-col space-y-4 mt-4">
            <Link 
              href="/" 
              className="block hover:text-red-500 pl-2"
              onClick={() => setIsOpen(false)} // Fecha ao clicar
            >
              Início
            </Link>
            <Link 
              href="/#filmes" 
              className="block hover:text-red-500 pl-2"
              onClick={() => setIsOpen(false)}
            >
              Filmes
            </Link>
            <Link 
              href="/fale-conosco" 
              className="block hover:text-red-500 pl-2"
              onClick={() => setIsOpen(false)}
            >
              Fale Conosco
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}