'use client'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SquarePen } from "lucide-react";
import { useState, useEffect } from "react";
import { ReservationFormData, ReservationSchema, Ticket, TicketApi } from "@/types/ticket";
import { localStorageUtil } from "@/lib/localStorage_";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ticketsService } from "@/services/tickets";
import { isAxiosError } from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { maskPhone } from "@/utils/masks";

interface Props {
    ticketDataToBePossibleUpdated: TicketApi;
    onUpdatePage?: () => void;
    shouldDisable?: boolean;
}

export default function TicketUpdateModal({ ticketDataToBePossibleUpdated, onUpdatePage, shouldDisable }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter()

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isDirty },
        reset,
        setValue
    } = useForm<ReservationFormData>({
        resolver: zodResolver(ReservationSchema),
        defaultValues: {
            name: ticketDataToBePossibleUpdated.name,
            email: ticketDataToBePossibleUpdated.email,
            seat: ticketDataToBePossibleUpdated.seat,
            phone: maskPhone(ticketDataToBePossibleUpdated.phone)
        }
    });

    useEffect(() => {
        if (isOpen) {
            reset({
                name: ticketDataToBePossibleUpdated.name,
                email: ticketDataToBePossibleUpdated.email,
                seat: ticketDataToBePossibleUpdated.seat,
                phone: maskPhone(ticketDataToBePossibleUpdated.phone)
            });
        }
    }, [isOpen, ticketDataToBePossibleUpdated, reset]);

    const onSubmit = async (data: ReservationFormData) => {
        try {
            const ticketData: Ticket = {
                name: data.name.trim(),
                email: data.email.trim(),
                seat: String(data.seat),
                phone: data.phone.trim(),
                createdAt: ticketDataToBePossibleUpdated.createdAt,
                updatedAt: ticketDataToBePossibleUpdated.updatedAt
            };

            const response = await ticketsService.update(String(ticketDataToBePossibleUpdated._id), ticketData)

            if (response.status === 200) {
                toast.success('Reserva atualizada com sucesso!!!');
                setIsOpen(false)
                if (onUpdatePage) onUpdatePage()
            } else {
                toast.error('Erro ao atualizar reserva, tente novamente mais tarde!');
            }
        } catch (error) {
            console.log('Erro ao atualizar reserva:', error);

            if (isAxiosError(error) && error.response) {
                if (error.response.status === 401) {
                    toast.error('Sessão expirada. Por favor, faça login novamente!');
                    localStorageUtil.removeItem('accessToken')
                    setIsOpen(false)
                    router.push('/')
                    return
                }

                if (error.response.data && error.response.data.error) {
                    const errorMessage = error.response.data.error;
                    toast.error(errorMessage);
                } else {
                    toast.error('Erro ao atualizar reserva, tente novamente mais tarde!');
                }
            } else {
                toast.error('Erro ao atualizar reserva, tente novamente mais tarde!');
            }
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-gray-200 hover:cursor-pointer w-9 h-9 p-0"
                    disabled={shouldDisable}
                >
                    <SquarePen size={18} />
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-106.25 text-black">
                <DialogHeader>
                    <DialogTitle>Atualização da Reserva</DialogTitle>
                    <DialogDescription>
                        Atualize os dados da reserva abaixo
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        <div>
                            <Label className="block text-sm font-medium mb-1">
                                Nome Completo *
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                {...register('name')}
                                className={`w-full p-2 rounded border focus:border-blue-500 outline-none transition-colors ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Fulano da Silva"
                                disabled={isSubmitting}
                            />

                            {errors.name && (
                                <span className="text-rose-400 text-xs sm:text-sm block pl-1 mt-1">
                                    {errors.name.message}
                                </span>
                            )}
                        </div>

                        <div>
                            <Label className="block text-sm font-medium mb-1">
                                Email *
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                {...register('email')}
                                maxLength={100}
                                className={`w-full p-2 rounded border focus:border-blue-500 outline-none transition-colors ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="fulano@exemplo.com"
                                disabled={isSubmitting}
                            />

                            {errors.email && (
                                <span className="text-rose-400 text-xs sm:text-sm block pl-1 mt-1">
                                    {errors.email.message}
                                </span>
                            )}
                        </div>

                        <div>
                            <Label className="block text-sm font-medium mb-1">
                                Assento *
                            </Label>
                            <Input
                                id="seat"
                                type="number"
                                {...register('seat', { valueAsNumber: true })}
                                min="1"
                                max="122"
                                className={`w-full p-2 rounded border focus:border-blue-500 outline-none transition-colors ${errors.seat ? 'border-red-500' : 'border-gray-300'}`}
                                disabled={isSubmitting}
                                placeholder="Número do assento (1-122)"
                            />

                            {errors.seat && (
                                <span className="text-rose-400 text-xs sm:text-sm block pl-1 mt-1">
                                    {errors.seat.message}
                                </span>
                            )}
                        </div>

                        <div>
                            <Label className="block text-sm font-medium mb-1">
                                Telefone *
                            </Label>
                            <Input
                                id="phone"
                                type="text"
                                {...register('phone')}
                                className={`w-full p-2 rounded border focus:border-blue-500 outline-none transition-colors ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
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
                    </div>

                    <DialogFooter className="mt-6 gap-2">
                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={isSubmitting}
                                className="hover:cursor-pointer border border-black"
                            >
                                Cancelar
                            </Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !isDirty}
                            className="min-w-20 hover:cursor-pointer"
                            variant={"destructive"}
                        >
                            {!isDirty ? "Sem alterações" : isSubmitting ? "Atualizando..." : "Atualizar"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}