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
import { useState, useEffect, useCallback } from "react";
import { Ticket, TicketApi } from "@/types/ticket";
import { maskCPF, validateCPF } from "@/lib/cpfUtils";
import { localStorageUtil } from "@/lib/localStorage_";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ticketsService } from "@/services/tickets";
import { isAxiosError } from "axios";

interface Props {
    ticketDataToBePossibleUpdated: TicketApi,
    onUpdatePage?: () => void
}

export default function TicketUpdateModal({ ticketDataToBePossibleUpdated, onUpdatePage }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        cpf: ticketDataToBePossibleUpdated.cpf,
        seat: ticketDataToBePossibleUpdated.seat,
        name: ticketDataToBePossibleUpdated.name,
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const router = useRouter()

    useEffect(() => {
        if (isOpen) {
            setFormData({
                cpf: ticketDataToBePossibleUpdated.cpf,
                seat: ticketDataToBePossibleUpdated.seat,
                name: ticketDataToBePossibleUpdated.name,
            });
            setErrors({});
        }
    }, [isOpen, ticketDataToBePossibleUpdated]);

    const hasChanges = useCallback(() => {
        return (
            formData.cpf !== ticketDataToBePossibleUpdated.cpf ||
            formData.seat !== ticketDataToBePossibleUpdated.seat ||
            formData.name !== ticketDataToBePossibleUpdated.name
        );
    }, [formData, ticketDataToBePossibleUpdated]);

    const validateForm = useCallback((): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.name.trim()) {
            newErrors.name = "Nome é obrigatório";
        }

        if (formData.name.trim().length < 2 || formData.name.trim().length > 100) {
            newErrors.name = "Nome deve conter entre 2 e 100 caracteres";
        }

        if (!formData.cpf.trim()) {
            newErrors.cpf = "CPF é obrigatório";
        } else if (!validateCPF(formData.cpf)) {
            newErrors.cpf = "CPF inválido";
        }

        if (!formData.seat || formData.seat <= 0) {
            newErrors.seat = "Assento é obrigatório";
        } else if (formData.seat > 122) { 
            newErrors.seat = "Assento inválido";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!hasChanges()) {
            toast.warning('Não houve alterações nos dados para atualização');
            setIsOpen(false);
            return;
        }

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const ticketData: Ticket = {
                name: formData.name.trim(),
                cpf: formData.cpf,
                seat: String(formData.seat),
                createdAt: ticketDataToBePossibleUpdated.createdAt,
                updatedAt: ticketDataToBePossibleUpdated.updatedAt
            };

            const response = await ticketsService.update(String(ticketDataToBePossibleUpdated._id), ticketData)

            if (response.status === 200) {
                toast.success('Reserva atualizada com sucesso!!!');
                setIsOpen(false)
                setIsLoading(false)

                if (onUpdatePage) onUpdatePage()
            } else {
                toast.error('Erro ao atualizar reserva, tente novamente mais tarde!');
                setIsLoading(false)
            }
        } catch (error) {
            console.log('Erro ao atualizar reserva:', error);

            if(isAxiosError(error) && error.response) {
                if(error.response.status === 401) {
                    toast.error('Sessão expirada. Por favor, faça login novamente.');
                    localStorageUtil.removeItem('acessToken')
                    setIsOpen(false)
                    setIsLoading(false)
                    router.push('/')
                    return
                }
            
                if(error.response.data && error.response.data.error) {
                    const errorMessage = error.response.data.error;
                    toast.error(errorMessage);
                } else {
                    toast.error('Erro ao atualizar reserva, tente novamente mais tarde!');
                }
            } else {
                toast.error('Erro ao atualizar reserva, tente novamente mais tarde!');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const maskedCpf = maskCPF(e.target.value);
        handleInputChange('cpf', maskedCpf);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-gray-200 hover:cursor-pointer w-9 h-9 p-0"
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

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Nome Completo *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className={`w-full p-2 rounded border focus:border-blue-500 outline-none transition-colors ${errors.name ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Fulano da Silva"
                                disabled={isLoading}
                            />
                            {errors.name && (
                                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                CPF *
                            </label>
                            <input
                                type="text"
                                value={formData.cpf}
                                onChange={handleCpfChange}
                                maxLength={14}
                                className={`w-full p-2 rounded border focus:border-blue-500 outline-none transition-colors ${errors.cpf ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="000.000.000-00"
                                disabled={isLoading}
                            />
                            {errors.cpf && (
                                <p className="text-red-500 text-xs mt-1">{errors.cpf}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Assento *
                            </label>
                            <input
                                type="number"
                                value={formData.seat}
                                onChange={(e) => handleInputChange('seat', Number(e.target.value))}
                                min="1"
                                max="122"
                                className={`w-full p-2 rounded border focus:border-blue-500 outline-none transition-colors ${errors.seat ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                disabled={isLoading}
                            />
                            {errors.seat && (
                                <p className="text-red-500 text-xs mt-1">{errors.seat}</p>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="mt-6 gap-2">
                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={isLoading}
                                className="hover:cursor-pointer border border-black"
                            >
                                Cancelar
                            </Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            disabled={isLoading || !hasChanges()}
                            className="min-w-20 hover:cursor-pointer"
                            variant={"destructive"}
                        >
                            {isLoading ? "Atualizando..." : "Atualizar"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}