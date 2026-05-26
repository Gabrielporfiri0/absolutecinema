// 'use client'

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
import { localStorageUtil } from "@/lib/localStorage_";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { adminsService } from "@/services/admins";
import { isAxiosError } from "axios";

interface Props {
    adminID: string;
    onUpdatePage?: () => void;
}

export default function AdminDeleteModal({ adminID, onUpdatePage }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        setIsLoading(true);

        try {
            const response = await adminsService.delete(adminID)

            if (response.status === 200) {
                toast.success('Admin excluído com sucesso!!!');
                setIsLoading(false);
                setIsOpen(false);
                if (onUpdatePage) onUpdatePage()
            } else {
                toast.error('Erro ao excluir admin, tente novamente mais tarde!');
                setIsLoading(false);
                setIsOpen(false);
            }
        } catch (error) {
            console.log('Erro ao excluir admin:', error);

            if (isAxiosError(error) && error.response) {
                switch (error.response.status) {
                    case 400:
                        toast.error('Erro: ID do admininválido!');
                        break;
                    case 401:
                        toast.error('Sessão expirada, faça login novamente!');
                        localStorageUtil.removeItem('accessToken');
                        setIsLoading(false);
                        setIsOpen(false);
                        router.push('/');
                        break;
                    case 404:
                        toast.error('Admin não encontrado!');
                        break;
                    case 500:
                        toast.error('Erro ao deletar admin, tente novamente mais tarde!');
                        break;
                    default:
                        toast.error('Erro ao excluir admin, tente novamente mais tarde!');
                        break;
                }
            } else {
                toast.error('Erro ao excluir admin, tente novamente mais tarde!');
            }
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

            <DialogContent className="sm:max-w-106.25 text-black">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="text-red-500" size={24} />
                        <DialogTitle className="text-red-500">
                            Confirmar Exclusão
                        </DialogTitle>
                    </div>
                    <DialogDescription className="pt-2">
                        Tem certeza que deseja excluir este admin?
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