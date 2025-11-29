'use client'; 

import { useState, useMemo } from 'react';

// --- FUNÇÕES UTILITÁRIAS ---

const mascaraCPF = (valor: string) => {
  return valor
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

const validarCPF = (cpf: string) => {
  const strCPF = cpf.replace(/[^\d]+/g, '');
  if (strCPF === '') return false;
  if (strCPF.length !== 11 || /^(\d)\1{10}$/.test(strCPF)) return false;

  let soma = 0;
  let resto;
  
  for (let i = 1; i <= 9; i++) 
    soma = soma + parseInt(strCPF.substring(i - 1, i)) * (11 - i);
  
  resto = (soma * 10) % 11;
  if ((resto === 10) || (resto === 11)) resto = 0;
  if (resto !== parseInt(strCPF.substring(9, 10))) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++) 
    soma = soma + parseInt(strCPF.substring(i - 1, i)) * (12 - i);
  
  resto = (soma * 10) % 11;
  if ((resto === 10) || (resto === 11)) resto = 0;
  if (resto !== parseInt(strCPF.substring(10, 11))) return false;
  
  return true;
};

// --- CONFIGURAÇÃO DO LAYOUT ---

type Reserva = {
  id: number;
  nome: string;
  cpf: string;
  assentos: string[]; 
  numerosAssentos: number[]; 
  data: string;
};

// 'l' = livre, 'u' = ocupada, '1' = corredor (invisível)
const layoutInicial = [
  ['l','l', 'l', 'l', 'l', 'l', 'l', '1', 'l', 'l', 'l', 'l', 'l', 'l'],
  ['l','l','l', 'l', 'l', 'l', 'l', 'l', '1', 'l', 'l', 'l', 'l', 'l', 'l', 'l'],
  ['l','l','l','l', 'l', 'l', 'l', 'l', 'l', '1', 'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l'],
  ['l','l','l','l','l', 'l', 'l', 'l', 'l', 'l', '1', 'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l'],
  ['l','l','l','l','l', 'l', 'l', 'l', 'l', 'l', '1', 'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l'],
  ['l','l','l','l','l', 'l', 'l', 'l', 'l', 'l', '1', 'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l'],
  ['l','l','l','l','l', 'l', 'l', 'l', 'l', 'l', '1', 'l', 'l', 'l', 'l', 'l', '1', '1', '1', '1'],
  ['1', '1', '1', '1', '1','l','l', 'l', 'l', 'l', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1'],
];

export default function SeatPicker() {
  const [fileiras, setFileiras] = useState(layoutInicial);
  const [selecionadas, setSelecionadas] = useState<string[]>([]); 
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [reservas, setReservas] = useState<Reserva[]>([]);

  // --- LÓGICA DE NUMERAÇÃO DE CADEIRAS ---
  // Memoizamos isso para não recalcular toda hora.
  const mapaDeNumeros = useMemo(() => {
    const mapa: Record<string, number> = {};
    let contador = 1;

    // Iteramos do COMEÇO (topo/perto da tela) para o final
    for (let i = 0; i < layoutInicial.length; i++) {
      // Iteramos da esquerda para a direita na linha
      for (let j = 0; j < layoutInicial[i].length; j++) {
        // Se não for corredor ('1'), ganha um número
        if (layoutInicial[i][j] !== '1') {
          mapa[`${i}-${j}`] = contador;
          contador++;
        }
      }
    }
    return mapa;
  }, []);

  const handleChangeCpf = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(mascaraCPF(e.target.value));
  };

  const handleSeatClick = (fileira: number, assento: number, status: string) => {
    if (status === 'u') {
      alert("Este assento já está ocupado!");
      return;
    }
    if (status === '1') return;

    const seatId = `${fileira}-${assento}`;
    
    if (selecionadas.includes(seatId)) {
      setSelecionadas(selecionadas.filter(id => id !== seatId));
    } else {
      if (selecionadas.length >= 4) {
        alert("Você atingiu o limite máximo de 4 assentos por reserva.");
        return;
      }
      setSelecionadas([...selecionadas, seatId]);
    }
  };

  const handleConfirmarReserva = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome || !cpf) {
      alert("Por favor, preencha nome e CPF.");
      return;
    }

    if (!validarCPF(cpf)) {
      alert("CPF Inválido!");
      return;
    }

    const cpfJaExiste = reservas.some((reserva) => reserva.cpf === cpf);
    if (cpfJaExiste) {
      alert("ERRO: Este CPF já possui uma reserva ativa!");
      return;
    }

    // Pega os números reais das cadeiras para salvar
    const numerosDasCadeiras = selecionadas.map(id => mapaDeNumeros[id]).sort((a, b) => a - b);

    const novaReserva: Reserva = {
      id: Date.now(),
      nome,
      cpf,
      assentos: selecionadas,
      numerosAssentos: numerosDasCadeiras,
      data: new Date().toLocaleString()
    };

    setReservas([...reservas, novaReserva]);

    const novasFileiras = [...fileiras];
    selecionadas.forEach(seat => {
      const [f, a] = seat.split('-').map(Number);
      novasFileiras[f] = [...novasFileiras[f]];
      novasFileiras[f][a] = 'u';
    });
    setFileiras(novasFileiras);

    setSelecionadas([]);
    setNome('');
    setCpf('');
    alert(`Reserva confirmada! Assentos: ${numerosDasCadeiras.join(', ')}`);
  };

  const getSeatClass = (seatId: string, status: string) => {
    if (status === 'u') return 'bg-gray-700 cursor-not-allowed border border-gray-600'; // Ocupada
    if (status === '1') return 'invisible'; // Corredor
    
    if (selecionadas.includes(seatId)) {
      // SELECIONADA
      return 'bg-yellow-400 text-black font-bold border border-yellow-500 shadow-[0_0_10px_rgba(250,204,21,0.5)]'; 
    }
    
    // LIVRE
    return 'bg-slate-400 hover:bg-slate-300 text-transparent hover:text-gray-600 transition-all duration-200';
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto py-8">
      
     

      {/* CADEIRAS */}
      <div className="flex flex-col gap-2 mb-12 relative">
        {fileiras.map((fileira, fIndex) => (
          <div key={fIndex} className="flex gap-2 justify-center">
            {fileira.map((status, aIndex) => {
              const seatId = `${fIndex}-${aIndex}`;
              const numeroAssento = mapaDeNumeros[seatId];
              const isSelected = selecionadas.includes(seatId);

              return (
                <div
                  key={aIndex}
                  className={`
                    w-8 h-8 md:w-10 md:h-10 rounded-full md:rounded-lg 
                    flex items-center justify-center text-xs md:text-sm select-none
                    ${getSeatClass(seatId, status)}
                  `}
                  onClick={() => handleSeatClick(fIndex, aIndex, status)}
                  title={`Assento ${numeroAssento}`} 
                >
                  {(isSelected) && numeroAssento}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* LEGENDA */}
      <div className="flex gap-6 mb-8 text-sm bg-gray-900 px-6 py-3 rounded-full border border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-slate-400"></div> 
          <span className="text-gray-300">Livre</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-yellow-400 border border-yellow-500"></div> 
          <span className="text-white font-bold">Selecionada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gray-700 border border-gray-600"></div> 
          <span className="text-gray-400">Ocupada</span>
        </div>
      </div>

      {/* FORMULÁRIO */}
      {selecionadas.length > 0 && (
        <form onSubmit={handleConfirmarReserva} className="bg-gray-800 p-6 rounded-lg shadow-2xl border border-gray-700 w-full max-w-md mb-8 animation-fade-in">
          <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
            <span className="text-yellow-400">🎟️</span> Confirmar Reserva
          </h3>
          
          <div className="mb-4 bg-gray-900 p-3 rounded border border-gray-700">
            <p className="text-sm text-gray-400 mb-1">Assentos Escolhidos:</p>
            <div className="flex flex-wrap gap-2">
              {selecionadas.map(id => (
                <span key={id} className="bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded">
                  #{mapaDeNumeros[id]}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Nome Completo</label>
              <input 
                type="text" 
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full p-2 rounded bg-black text-white border border-gray-600 focus:border-yellow-400 outline-none transition-colors"
                placeholder="Ex: João da Silva"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">CPF</label>
              <input 
                type="text" 
                value={cpf}
                onChange={handleChangeCpf}
                maxLength={14}
                className="w-full p-2 rounded bg-black text-white border border-gray-600 focus:border-yellow-400 outline-none transition-colors"
                placeholder="000.000.000-00"
                required
              />
            </div>
            
            <button type="submit" className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3 rounded transition-all transform active:scale-95 shadow-lg">
              Confirmar Reserva
            </button>
          </div>
        </form>
      )}

      {/* TABELA ADMIN (Simulação) */}
      <div className="w-full mt-8 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold mb-4 text-gray-400">
          Simulação de Banco de Dados
        </h2>
        
        {reservas.length === 0 ? (
          <p className="text-gray-600 italic text-sm">Nenhuma reserva feita ainda.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-700">
            <table className="w-full text-left bg-gray-900">
              <thead className="bg-black text-gray-400 text-xs uppercase">
                <tr>
                  <th className="p-3">Nome</th>
                  <th className="p-3">CPF</th>
                  <th className="p-3">Assentos (Nº)</th>
                </tr>
              </thead>
              <tbody className="text-gray-300 text-sm">
                {reservas.map((reserva) => (
                  <tr key={reserva.id} className="border-t border-gray-800 hover:bg-gray-800">
                    <td className="p-3">{reserva.nome}</td>
                    <td className="p-3 font-mono">{reserva.cpf}</td>
                    <td className="p-3 text-yellow-400 font-bold">
                      {reserva.numerosAssentos.join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}