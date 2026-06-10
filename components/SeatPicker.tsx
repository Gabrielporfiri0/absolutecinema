'use client';

import { ticketsService } from '@/services/tickets';
import { ReservationFormData, ReservationSchema, TicketDataToBeSent } from '@/types/ticket';
import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { maskPhone } from '@/utils/masks';
import { Button } from './ui/button';

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
  const [seatsReserved, setSeatsReserved] = useState<number[]>([]);
  const [hasErrorInGettingSeatsReserved, setHasErrorInGettingSeatsReserved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
  } = useForm<ReservationFormData>({
    resolver: zodResolver(ReservationSchema),
    defaultValues: {
      name: "",
      email: "",
      seat: 1,
      phone: "",
    },
  });

  useEffect(() => {
    getSeatsThatAreReserved();
  }, []);

  const getSeatsThatAreReserved = async () => {
    try {
      const response = await ticketsService.getAllSeats();

      if (response.status === 200) {
        setSeatsReserved(response.data.seats__);
      } else {
        setHasErrorInGettingSeatsReserved(true);
      }
    } catch (error) {
      setHasErrorInGettingSeatsReserved(true);
    }
  };

  const handleSeatClick = (seatNumber: number) => {
    if (seatsReserved.includes(seatNumber)) {
      toast.warning('Este assento já está reservado!');
      setValue('seat', 0);
      setSeatSelected(undefined);
      return;
    }

    if (seatSelected === seatNumber) {
      setSeatSelected(undefined);
      setValue('seat', 0);
    } else {
      if (seatSelected !== undefined) {
        toast.error('Só é possível reservar 1 assento por vez, para reservar mais assentos, finalize a reserva atual e inicie uma nova reserva!');
        setValue('seat', 0);
        return;
      }

      setSeatSelected(seatNumber);
      setValue('seat', seatNumber);
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

  const onSubmit = async (data: ReservationFormData) => {
    if (seatSelected === undefined) {
      toast.error('Por favor, selecione um assento para reservar!');
      return;
    }

    try {
      const reservationData: TicketDataToBeSent = {
        name: data.name.trim(),
        email: data.email.trim(),
        seat: data.seat.toString(),
        phone: data.phone.trim()
      };

      const response = await ticketsService.create(reservationData);

      if (response.status === 201) {
        toast.success(`Assento de número ${seatSelected} reservado com sucesso!`);
        reset();
        setSeatSelected(undefined);
        await getSeatsThatAreReserved();
      } else {
        toast.error(`Erro ao reservar assento ${seatSelected}, tente novamente mais tarde!`);
      }
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        if (error.response.data && error.response.data.error) {
          toast.error(`Não foi possível reservar o assento ${seatSelected}: ${error.response.data.error}`);
          return;
        } else {
          toast.error(`Erro ao reservar assento ${seatSelected}, tente novamente mais tarde!`);
          return;
        }
      } else {
        toast.error('Erro ao realizar reserva, tente novamente mais tarde!');
      }
    }
  }

  if (hasErrorInGettingSeatsReserved) {
    return (
      <section className="text-center my-10">
        <h1 className="text-4xl font-bold mb-4 text-white">
          Erro ao buscar dados dos assentos reservados!
        </h1>
        <p className="text-xl text-gray-400">
          Tente novamente mais tarde.
        </p>
      </section>
    );
  }

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

      <div className="flex gap-4 mb-8 text-sm flex-col">
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-gray-600"></div> Livre</div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-green-500"></div> Selecionada</div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-red-700"></div> Ocupada</div>
        </div>
      </div>

      {seatSelected !== undefined && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md mb-8">
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
              <Label className="block text-sm text-gray-300 mb-1">Nome Completo</Label>
              <Input
                id="name"
                type="text"
                {...register('name')}
                className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-red-500 outline-none selection:bg-blue-700 selection:text-white"
                placeholder="Fulano Ciclano Bertlano"
                disabled={isSubmitting}
              />

              {errors.name && (
                <span className="text-rose-400 text-xs sm:text-sm block pl-1 mt-1">
                  {errors.name.message}
                </span>
              )}
            </div>

            <div>
              <Label className="block text-sm text-gray-300 mb-1">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                maxLength={100}
                className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-red-500 outline-none selection:bg-blue-700 selection:text-white"
                placeholder="fulano@example.com"
                disabled={isSubmitting}
              />

              {errors.email && (
                <span className="text-rose-400 text-xs sm:text-sm block pl-1 mt-1">
                  {errors.email.message}
                </span>
              )}
            </div>

            <div>
              <Label className="block text-sm text-gray-300 mb-1">Telefone</Label>
              <Input
                id="phone"
                type="text"
                {...register('phone')}
                className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-red-500 outline-none selection:bg-blue-700 selection:text-white"
                placeholder="(00) 00000-0000 ou (00) 0000-0000"
                disabled={isSubmitting}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setValue("phone", maskPhone(e.target.value), {
                    shouldValidate: true,
                    shouldDirty: true,
                  })}
              />

              {errors.phone && (
                <span className="text-rose-400 text-xs sm:text-sm block pl-1 mt-1">
                  {errors.phone.message}
                </span>
              )}
            </div>

            <Button
              type="submit"
              className="w-full hover:cursor-pointer bg-red-600 py-3 rounded font-bold text-white hover:bg-red-700 transition"
              disabled={isSubmitting}
              variant={"default"}
            >
              Confirmar e Salvar
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}