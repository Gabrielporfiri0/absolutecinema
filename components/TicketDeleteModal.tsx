'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteTicket } from "@/app/actions/tickets_";
import { localStorageUtil } from "@/lib/localStorage_";

interface Props {
    ticketID: string;
    onUpdatePage?: () => void;
}

export default function TicketDeleteModal({ ticketID, onUpdatePage }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        setIsLoading(true);

        const accessToken = localStorageUtil.getItem('acessToken');

        if (!accessToken) {
            toast.error('Sessão expirada. Por favor, faça login novamente.');
            localStorageUtil.clear();
            setIsLoading(false);
            setIsOpen(false);
            router.push('/');
            return;
        }

        try {
            const result = await deleteTicket(ticketID, accessToken);

            if (!result.success) {

                if(result.status === 401) {
                    toast.error('Token inválido, faça login novamente.');
                    localStorageUtil.clear();
                    setIsOpen(false);
                    setIsLoading(false);
                    router.push('/');
                    return;
                }

                if(result.status === 400) {
                    toast.error('ID inválido');
                    setIsOpen(false);
                    setIsLoading(false);
                    return;
                }

                if(result.status === 404) {
                    toast.error('Ingresso não encontrado');
                    setIsOpen(false);
                    setIsLoading(false);
                    return;
                }

                if(result.status === 500) {
                    toast.error('Erro ao deletar ingresso, tente novamente mais tarde');
                    setIsOpen(false);
                    setIsLoading(false);
                    return;
                }
            }

            toast.success(result.message);
            setIsOpen(false);

            if (onUpdatePage) {
                onUpdatePage();
            } else {
                router.refresh();
            }

        } catch (error) {
            console.log('Erro ao deletar ingresso:', error);

            toast.error('Erro ao deletar ingresso, por favor, faça login novamente.');
            localStorageUtil.clear();
            setIsLoading(false);
            setIsOpen(false);
            router.push('/');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-red-50 hover:text-red-600 hover:cursor-pointer w-9 h-9 p-0 text-red-500"
                >
                    <Trash size={18} />
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px] text-black">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="text-red-500" size={24} />
                        <DialogTitle className="text-red-500">
                            Confirmar Exclusão
                        </DialogTitle>
                    </div>
                    <DialogDescription className="pt-2">
                        Tem certeza que deseja excluir este ingresso?
                        <br />
                        <strong>Esta ação não poderá ser desfeita.</strong>
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                        disabled={isLoading}
                        className="flex-1 border border-black hover:cursor-pointer"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isLoading}
                        className="flex-1 gap-2 hover:cursor-pointer"
                    >
                        {isLoading ? (
                            <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                Excluindo...
                            </>
                        ) : (
                            <>
                                <Trash size={16} />
                                Excluir
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}