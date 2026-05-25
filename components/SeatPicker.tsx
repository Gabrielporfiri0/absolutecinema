'use client';

import { maskCPF, validateCPF } from '@/lib/cpfUtils';
import { ticketsService } from '@/services/tickets';
import { TicketDataToBeSent } from '@/types/ticket';
import { isAxiosError } from 'axios';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const initialLayout = [
  ['l', 'l', 'l', 'l', 'l', 'l', 'l', '1', 'l', 'l', 'l', 'l', 'l', 'l'],
  ['l', 'l', 'l', 'l', 'l', 'l', 'l', 'l', '1', 'l', 'l', 'l', 'l', 'l', 'l', 'l'],
  ['l', 'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l', '1', 'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l'],
  ['l', 'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l', '1', 'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l'],
  ['l', 'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l', '1', 'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l'],
  ['l', 'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l', '1', 'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l'],
  ['l', 'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l', '1', 'l', 'l', 'l', 'l', 'l', '1', '1', '1', '1'],
  ['1', '1', '1', '1', '1', 'l', 'l', 'l', 'l', 'l', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1'],
];

const generateMapSeats = () => {
  const map: { number: number; row: number; seat: number; status: string }[] = [];
  let counter = 1;

  initialLayout.forEach((row, rIndex) => {
    row.forEach((status, sIndex) => {
      if (status === 'l') {
        map.push({
          number: counter,
          row: rIndex,
          seat: sIndex,
          status: 'l'
        });
        counter++;
      }
    });
  });

  return map;
};

const seatsMap = generateMapSeats();

export default function SeatPicker() {
  const [seatSelected, setSeatSelected] = useState<number>();
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [seatsReserved, setSeatsReserved] = useState<number[]>([]);
  const [isProcessingReservation, setIsProcessingReservation] = useState(false);

  useEffect(() => {
    getSeatsThatAreReserved();
  }, []);

  const getSeatsThatAreReserved = async () => {
    try {
      const response = await ticketsService.getAllSeats();

      if (response.status === 200) {
        setSeatsReserved(response.data.seats__);
      } else {
        console.log('Erro ao buscar dados dos assentos!');
      }
    } catch (error) {
      console.log('Erro ao buscar dados de todos os assentos registrados: ', error);
    }
  };

  const handleChangeCpf = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(maskCPF(e.target.value));
  };

  const handleSeatClick = (seatNumber: number) => {
    if (seatsReserved.includes(seatNumber)) {
      toast.warning('Este assento já está reservado!');
      return;
    }

    if (seatSelected === seatNumber) {
      setSeatSelected(undefined);
    } else {
      if (seatSelected !== undefined) {
        toast.error('Só é possível reservar 1 assento por vez, para reservar mais assentos, finalize a reserva atual e inicie uma nova reserva!');
        return;
      }

      setSeatSelected(seatNumber);
    }
  };

  const handleCreateReservation = async (e: React.FormEvent) => {
    setIsProcessingReservation(true);
    e.preventDefault();

    if (!name || !cpf) {
      toast.error('Por favor, preencha nome e CPF!');
      return;
    }

    if (!validateCPF(cpf)) {
      toast.error('CPF Inválido! Por favor verifique o número!');
      return;
    }

    if (name.trim().length === 0) {
      toast.error('Nome não pode ser vazio!');
      return;
    }

    if (name.trim().length >= 50) {
      toast.error('Nome muito longo! Por favor, use um nome com até 50 caracteres!');
      return;
    }

    if (seatSelected === undefined) {
      toast.error('Por favor, selecione pelo menos um assento para reservar!');
      return;
    }

    try {
      const newReservation: TicketDataToBeSent = {
        name: name.trim(),
        cpf: cpf,
        seat: seatSelected.toString() // Converte para string pois a api espera string
      };

      const response = await ticketsService.create(newReservation);

      if (response.status === 201) {
        toast.success(`Assento de número ${seatSelected} reservado com sucesso!`);
      } else {
        toast.error(`Erro ao reservar assento ${seatSelected}, tente novamente mais tarde!`);
      }

      await getSeatsThatAreReserved();

      setSeatSelected(undefined);
      setName('');
      setCpf('');
    } catch (error) {
      console.log('Erro ao enviar reserva:', error);

      if(isAxiosError(error) && error.response) {
        if(error.response.data && error.response.data.error) {
          toast.error(`Não foi possível reservar o assento ${seatSelected}: ${error.response.data.error}`);
          return;
        } else {
          toast.error(`Erro ao reservar assento ${seatSelected}, tente novamente mais tarde!`);
          return;
        }
      } else {
        toast.error('Erro ao realizar reserva, tente novamente mais tarde!');
      }
    } finally {
      setIsProcessingReservation(false);
    }
  };

  const getSeatClass = (seatNumber: number, status: string) => {
    if (seatsReserved.includes(seatNumber)) return 'bg-red-700 cursor-not-allowed';
    if (status === '1') return 'invisible';
    if (seatSelected === seatNumber) return 'bg-green-500';
    return 'bg-gray-600 hover:bg-gray-500';
  };

  const getSeatNumber = (row: number, seat: number) => {
    const seatInfo = seatsMap.find(a => a.row === row && a.seat === seat);
    return seatInfo ? seatInfo.number : 0;
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      <div className="w-full overflow-x-auto pb-8 mb-4 no-scrollbar">
        <div className="min-w-max flex flex-col gap-2 items-center mx-auto px-4">
          {initialLayout.map((fileira, fIndex) => (
            <div key={fIndex} className="flex gap-2 justify-center">
              {fileira.map((status, aIndex) => {
                const seatNumber = getSeatNumber(fIndex, aIndex);

                return (
                  <div
                    key={aIndex}
                    className={`w-8 h-8 rounded-md cursor-pointer flex items-center justify-center text-xs transition-transform hover:scale-110 ${getSeatClass(seatNumber, status)} ${seatNumber > 0 && !seatsReserved.includes(seatNumber) && status !== '1' ? 'text-white' : 'text-transparent'
                      }`}
                    onClick={() => {
                      if (seatNumber > 0 && status !== '1') {
                        handleSeatClick(seatNumber);
                      }
                    }}
                  >
                    {seatNumber > 0 && status !== '1' ? seatNumber : ''}
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

      {seatSelected !== undefined && (
        <form onSubmit={handleCreateReservation} className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md mb-8">
          <h3 className="text-xl font-bold mb-4 text-white">Dados da Reserva</h3>

          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-2">
              Assento: <span className="text-white font-mono">
                {seatSelected.toString()}
              </span>
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Nome Completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-red-500 outline-none"
                placeholder="Fulano Ciclano Bertlano"
                required
                disabled={isProcessingReservation}
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
                disabled={isProcessingReservation}
              />
            </div>

            <button
              type="submit"
              className="w-full hover:cursor-pointer bg-red-600 py-3 rounded font-bold text-white hover:bg-red-700 transition"
              disabled={isProcessingReservation}
            >
              Confirmar e Salvar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}