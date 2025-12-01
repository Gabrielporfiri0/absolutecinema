'use client'; 

import { mascaraCPF, validarCPF } from '@/lib/cpfUtils';
import { TicketDataToBeSent } from '@/types/ticket';
import { useState, useEffect } from 'react';
// import { toast } from 'sonner';

// --- FUNÇÕES UTILITÁRIAS (Helpers) ---

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

// Função para gerar o mapa de assentos com números
const gerarMapaAssentos = () => {
  const mapa: { numero: number; fileira: number; assento: number; status: string }[] = [];
  let contador = 1;

  layoutInicial.forEach((fileira, fIndex) => {
    fileira.forEach((status, aIndex) => {
      if (status === 'l') {
        mapa.push({
          numero: contador,
          fileira: fIndex,
          assento: aIndex,
          status: 'l'
        });
        contador++;
      }
    });
  });

  return mapa;
};

const mapaAssentos = gerarMapaAssentos();

export default function SeatPicker() {
  const [selecionadas, setSelecionadas] = useState<number[]>([]);
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [seatsReserved, setSeatsReserved] = useState<number[]>([]);

  // Buscar assentos reservados quando o componente carregar
  useEffect(() => {
    getSeatsThatAreReserved();
  }, []);

  const getSeatsThatAreReserved = async () => {
    try {
      const response = await fetch('/api/tickets/getAllSeats');
      const returnedData = await response.json();

      if (returnedData.status === 200) {
        setSeatsReserved(returnedData.seats__);
      }

      if (returnedData.status === 500) {
        console.error('Erro ao buscar dados dos assentos');
      }
    } catch (error) {
      console.log('Erro ao buscar dados de todos os assentos registrados: ', error);
    }
  };

  // Atualiza o CPF aplicando a máscara
  const handleChangeCpf = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(mascaraCPF(e.target.value));
  };

  const handleSeatClick = (numeroAssento: number, fileira: number, assento: number) => {
    // Verifica se o assento já está reservado
    if (seatsReserved.includes(numeroAssento)) {
      alert("Este assento já está reservado!");
      return;
    }

    // Se o assento já está selecionado, removemos ele (sempre permitido)
    if (selecionadas.includes(numeroAssento)) {
      setSelecionadas(selecionadas.filter(num => num !== numeroAssento));
    } else {
      // Tenta selecionar um NOVO assento
      // VERIFICAÇÃO DE LIMITE AQUI:
      if (selecionadas.length >= 4) {
        alert("Você atingiu o limite máximo de 4 assentos por reserva.");
        // toast('Você atingiu o limite máximo de 4 assentos por reserva')
        return;
      }
      
      setSelecionadas([...selecionadas, numeroAssento]);
    }
  };

  const handleConfirmarReserva = async (e: React.FormEvent) => {
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

    try {
      
      for(let i = 0; i < selecionadas.length; i++){
        const novaReserva: TicketDataToBeSent = {
          name: nome,
          cpf: cpf,
          seat: selecionadas[i].toString() // Converte para string se a API espera string
        };

        // Enviar reserva para a API
        const response = await fetch('/api/tickets/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(novaReserva),
        });
        
        const returnedData = await response.json()

        if(returnedData.status === 400){
          alert(`Erro ao reservar cadeira ${selecionadas[i]}: ${returnedData.error}`)
          continue
        }

        if(returnedData.status === 500){
          alert(`Erro ao reservar cadeira ${selecionadas[i]}: ${returnedData.error}`)
          continue
        }

        if (returnedData.status === 201) alert(`Reserva da cadeira ${selecionadas[i]} feita com sucesso !!!`);
      }

      // Atualizar lista de assentos reservados
      await getSeatsThatAreReserved();
      
      // Limpa
      setSelecionadas([]);
      setNome('');
      setCpf('');
    } catch (error) {
      console.error('Erro ao enviar reserva:', error);
      alert("Erro ao realizar reserva. Tente novamente.");
    }
  };

  const getSeatClass = (numeroAssento: number, status: string) => {
    if (seatsReserved.includes(numeroAssento)) return 'bg-red-700 cursor-not-allowed'; 
    if (status === '1') return 'invisible';
    if (selecionadas.includes(numeroAssento)) return 'bg-green-500';
    return 'bg-gray-600 hover:bg-gray-500';
  };

  // Função para obter o número do assento baseado na fileira e posição
  const getNumeroAssento = (fileira: number, assento: number) => {
    const assentoInfo = mapaAssentos.find(a => a.fileira === fileira && a.assento === assento);
    return assentoInfo ? assentoInfo.numero : 0;
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      
      {/* Wrapper Externo: Cria a barra de rolagem (scroll) se precisar */}
      <div className="w-full overflow-x-auto pb-8 mb-4 no-scrollbar">
        
        {/* Wrapper Interno: min-w-max força os assentos a terem o tamanho real */}
        <div className="min-w-max flex flex-col gap-2 items-center mx-auto px-4">
          
          {/* Renderização das Fileiras */}
          {layoutInicial.map((fileira, fIndex) => (
            <div key={fIndex} className="flex gap-2 justify-center">
              {fileira.map((status, aIndex) => {
                const numeroAssento = getNumeroAssento(fIndex, aIndex);
                
                return (
                  <div
                    key={aIndex}
                    className={`w-8 h-8 rounded-md cursor-pointer flex items-center justify-center text-xs transition-transform hover:scale-110 ${getSeatClass(numeroAssento, status)} ${
                      numeroAssento > 0 && !seatsReserved.includes(numeroAssento) && status !== '1' ? 'text-white' : 'text-transparent'
                    }`}
                    onClick={() => {
                      if (numeroAssento > 0 && status !== '1') {
                        handleSeatClick(numeroAssento, fIndex, aIndex);
                      }
                    }}
                  >
                    {numeroAssento > 0 && status !== '1' ? numeroAssento : ''}
                  </div>
                );
              })}
            </div>
          ))}

        </div>
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
            <p className="text-sm text-gray-400 mb-2">
              Assentos: <span className="text-white font-mono">
                {selecionadas.sort((a, b) => a - b).join(', ')}
              </span>
            </p>
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
                onChange={handleChangeCpf}
                maxLength={14}
                className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-red-500 outline-none"
                placeholder="000.000.000-00"
                required
              />
            </div>
            
            <button type="submit" className="w-full hover:cursor-pointer bg-red-600 py-3 rounded font-bold text-white hover:bg-red-700 transition">
              Confirmar e Salvar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}