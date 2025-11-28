'use client';

import { useState, useEffect } from 'react';

type Reserva = {
  id: number;
  nome: string;
  cpf: string;
  assentos: string[];
  data: string;
};

// Dados falsos para simular o banco de dados da API
const MOCK_API_DATA: Reserva[] = [
  { id: 1715001, nome: "Gabriel Moreira", cpf: "111.222.333-44", assentos: ["3-4", "3-5"], data: "28/11/2025 10:00" },
  { id: 1715002, nome: "Eduardo Silva", cpf: "555.666.777-88", assentos: ["4-5"], data: "28/11/2025 11:30" },
  { id: 1715003, nome: "Ana Souza", cpf: "999.888.777-66", assentos: ["2-1", "2-2", "2-3"], data: "28/11/2025 14:15" },
  { id: 1715004, nome: "Carlos Oliveira", cpf: "123.456.789-00", assentos: ["5-5"], data: "29/11/2025 09:00" },
];

export default function AdminPage() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');

  // Simula a consulta à API ao carregar a página
  useEffect(() => {
    // Aqui seria: fetch('https://sua-api.com/reservas').then(...)
    
    // Simulando um delay de rede (carregamento)
    setTimeout(() => {
      setReservas(MOCK_API_DATA);
      setLoading(false);
    }, 1000); 
  }, []);

  // Lógica de Filtro (Pesquisa por CPF)
  const reservasFiltradas = reservas.filter((reserva) => 
    reserva.cpf.includes(busca) || 
    reserva.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-red-600">Painel Administrativo</h1>
            <p className="text-gray-400">Gerenciamento de reservas do CineUEMS</p>
          </div>
          
          {/* Botão de Atualizar (Simulação) */}
          <button 
            onClick={() => window.location.reload()}
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded border border-gray-700 transition"
          >
            🔄 Atualizar Dados
          </button>
        </div>

        {/* Barra de Pesquisa */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8 border border-gray-700">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Pesquisar Inscrito
          </label>
          <input
            type="text"
            placeholder="Digite o CPF ou Nome para buscar..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full p-3 bg-gray-900 border border-gray-600 rounded text-white focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition"
          />
        </div>

        {/* Tabela de Resultados */}
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
          {loading ? (
            <div className="p-12 text-center text-gray-400">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent rounded-full text-red-600 mb-2" role="status"></div>
              <p>Carregando dados da API...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-900 text-gray-300 uppercase text-sm font-semibold">
                  <tr>
                    <th className="p-4 border-b border-gray-700">ID</th>
                    <th className="p-4 border-b border-gray-700">Nome do Inscrito</th>
                    <th className="p-4 border-b border-gray-700">CPF</th>
                    <th className="p-4 border-b border-gray-700">Cadeiras</th>
                    <th className="p-4 border-b border-gray-700">Data da Reserva</th>
                    <th className="p-4 border-b border-gray-700 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700 text-gray-300">
                  {reservasFiltradas.length > 0 ? (
                    reservasFiltradas.map((reserva) => (
                      <tr key={reserva.id} className="hover:bg-gray-700/50 transition duration-150">
                        <td className="p-4 font-mono text-xs text-gray-500">#{reserva.id}</td>
                        <td className="p-4 font-medium text-white">{reserva.nome}</td>
                        <td className="p-4 font-mono bg-gray-800/30 rounded">{reserva.cpf}</td>
                        <td className="p-4">
                          <div className="flex gap-2 flex-wrap">
                            {reserva.assentos.map((seat) => (
                              <span key={seat} className="bg-red-900/50 text-red-200 text-xs px-2 py-1 rounded border border-red-900">
                                {seat}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 text-sm">{reserva.data}</td>
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center gap-1 bg-green-900/30 text-green-400 px-2 py-1 rounded-full text-xs font-bold border border-green-900">
                            Confirmado
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500 italic">
                        Nenhum registro encontrado para "{busca}".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          
          <div className="bg-gray-900 p-4 text-xs text-gray-500 border-t border-gray-700 flex justify-between">
            <span>Total de registros: {reservasFiltradas.length}</span>
            <span>Sistema CineUEMS v1.0</span>
          </div>
        </div>

      </div>
    </div>
  );
}