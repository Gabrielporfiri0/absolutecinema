'use client'; 

import { useState } from 'react';

// --- FUNÇÕES UTILITÁRIAS (Helpers) ---

// 1. Formata o CPF visualmente (000.000.000-00)
const mascaraCPF = (valor: string) => {
  return valor
    .replace(/\D/g, '') // Remove tudo o que não é dígito
    .replace(/(\d{3})(\d)/, '$1.$2') // Coloca ponto após o 3º digito
    .replace(/(\d{3})(\d)/, '$1.$2') // Coloca ponto após o 6º digito
    .replace(/(\d{3})(\d{1,2})/, '$1-$2') // Coloca traço após o 9º digito
    .replace(/(-\d{2})\d+?$/, '$1'); // Impede digitar mais que 11 dígitos
};

// 2. Valida matematicamente se o CPF é real
const validarCPF = (cpf: string) => {
  const strCPF = cpf.replace(/[^\d]+/g, ''); // Remove pontos e traços
  if (strCPF === '') return false;
  
  // Elimina CPFs invalidos conhecidos (ex: 111.111.111-11)
  if (strCPF.length !== 11 || /^(\d)\1{10}$/.test(strCPF)) return false;

  let soma;
  let resto;
  soma = 0;
  
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

// --- COMPONENTE PRINCIPAL ---

type Reserva = {
  id: number;
  nome: string;
  cpf: string;
  assentos: string[];
  data: string;
};

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

  // Atualiza o CPF aplicando a máscara
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
    
    // Se o assento já está selecionado, removemos ele (sempre permitido)
    if (selecionadas.includes(seatId)) {
      setSelecionadas(selecionadas.filter(id => id !== seatId));
    } else {
      // Tenta selecionar um NOVO assento
      // VERIFICAÇÃO DE LIMITE AQUI:
      if (selecionadas.length >= 4) {
        alert("Você atingiu o limite máximo de 4 assentos por reserva.");
        return;
      }
      
      setSelecionadas([...selecionadas, seatId]);
    }
  };

  const handleConfirmarReserva = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validação de preenchimento básico
    if (!nome || !cpf) {
      alert("Por favor, preencha nome e CPF.");
      return;
    }

    // 2. Validação Matemática do CPF
    if (!validarCPF(cpf)) {
      alert("CPF Inválido! Por favor verifique o número.");
      return;
    }

    // 3. Validação de Unicidade
    // Verifica se o CPF já existe na lista de reservas
    const cpfJaExiste = reservas.some((reserva) => reserva.cpf === cpf);
    
    if (cpfJaExiste) {
      alert("ERRO: Este CPF já possui uma reserva ativa!");
      return; // Para a execução aqui
    }

    // --- Se passou por tudo, salva a reserva ---

    const novaReserva: Reserva = {
      id: Date.now(),
      nome,
      cpf,
      assentos: selecionadas,
      data: new Date().toLocaleString()
    };

    setReservas([...reservas, novaReserva]);

    // Atualiza visualmente as cadeiras para 'Ocupadas'
    const novasFileiras = [...fileiras];
    selecionadas.forEach(seat => {
      const [f, a] = seat.split('-').map(Number);
      novasFileiras[f] = [...novasFileiras[f]];
      novasFileiras[f][a] = 'u';
    });
    setFileiras(novasFileiras);

    // Limpa
    setSelecionadas([]);
    setNome('');
    setCpf('');
    alert("Reserva realizada com sucesso!");
  };

  const getSeatClass = (seatId: string, status: string) => {
    if (status === 'u') return 'bg-red-700 cursor-not-allowed'; 
    if (status === '1') return 'invisible';
    if (selecionadas.includes(seatId)) return 'bg-green-500';
    return 'bg-gray-600 hover:bg-gray-500';
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      
      {/* Cadeiras */}
      <div className="grid gap-2 mb-8">
        {fileiras.map((fileira, fIndex) => (
          <div key={fIndex} className="flex gap-2 justify-center">
            {fileira.map((status, aIndex) => {
              const seatId = `${fIndex}-${aIndex}`;
              return (
                <div
                  key={aIndex}
                  className={`w-8 h-8 rounded-md cursor-pointer flex items-center justify-center text-xs text-transparent ${getSeatClass(seatId, status)}`}
                  onClick={() => handleSeatClick(fIndex, aIndex, status)}
                />
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex gap-4 mb-8 text-sm">
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-gray-600"></div> Livre</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-green-500"></div> Selecionada</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-red-700"></div> Ocupada</div>
      </div>

      {/* Formulário */}
      {selecionadas.length > 0 && (
        <form onSubmit={handleConfirmarReserva} className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md mb-8">
          <h3 className="text-xl font-bold mb-4 text-white">Dados da Reserva</h3>
          
          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-2">Assentos: <span className="text-white font-mono">{selecionadas.join(', ')}</span></p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Nome Completo</label>
              <input 
                type="text" 
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-red-500 outline-none"
                placeholder="Fulano Ciclano Bertlano"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">CPF</label>
              <input 
                type="text" 
                value={cpf}
                // Usamos o handle específico para aplicar a máscara
                onChange={handleChangeCpf}
                maxLength={14} // 11 digitos + 3 simbolos
                className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-red-500 outline-none"
                placeholder="000.000.000-00"
                required
              />
            </div>
            
            <button type="submit" className="w-full bg-red-600 py-3 rounded font-bold text-white hover:bg-red-700 transition">
              Confirmar e Salvar
            </button>
          </div>
        </form>
      )}

      {/* Tabela */}
      <div className="w-full mt-8">
        <h2 className="text-2xl font-bold mb-4 text-left border-l-4 border-red-600 pl-3">
          Banco de Dados (Simulação)
        </h2>
        
        {reservas.length === 0 ? (
          <p className="text-gray-500 italic">Nenhuma reserva feita ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse bg-gray-900 rounded-lg overflow-hidden">
              <thead className="bg-gray-800 text-gray-300">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Nome</th>
                  <th className="p-3">CPF</th>
                  <th className="p-3">Assentos</th>
                  <th className="p-3">Data/Hora</th>
                </tr>
              </thead>
              <tbody className="text-gray-400">
                {reservas.map((reserva) => (
                  <tr key={reserva.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="p-3 font-mono text-xs">{reserva.id}</td>
                    <td className="p-3">{reserva.nome}</td>
                    <td className="p-3">{reserva.cpf}</td>
                    <td className="p-3">{reserva.assentos.join(', ')}</td>
                    <td className="p-3 text-sm">{reserva.data}</td>
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