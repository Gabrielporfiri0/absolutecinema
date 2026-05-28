'use client'

import AdminDeleteModal from "@/components/AdminDeleteModal";
import TicketDeleteModal from "@/components/TicketDeleteModal";
import TicketUpdateModal from "@/components/TicketUpdateModal";
import { localStorageUtil } from "@/lib/localStorage_";
import { AdminUser } from "@/types/admin";
import { TicketApi } from "@/types/ticket";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Eye, EyeOff, Trash, X } from 'lucide-react';
import HandleMovieInformations from "@/components/HandleMovieInformations";
import { isAxiosError } from "axios";
import { ticketsService } from "@/services/tickets";
import { adminsService } from "@/services/admins";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { maskPhone } from "@/utils/masks";

export default function Page() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<'reservas' | 'admins' | 'movie'>('reservas'); // Controla qual aba está visível

    const [isDeleteAllReservationModalOpen, setIsDeleteAllReservationModalOpen] = useState(false);

    const [loading, setLoading] = useState(true);
    const [isProcessingTheExclusionOfAllReservations, setIsProcessingTheExclusionOfAllReservations] = useState(false);
    const [newAdminBeingRegistered, setNewAdminBeingRegistered] = useState(false);
    const [busca, setBusca] = useState('');

    const [reservations, setReservations] = useState<TicketApi[]>([]);
    const [admins, setAdmins] = useState<AdminUser[]>([]);

    const [newAdminUser, setNewAdminUser] = useState<string>('');
    const [newAdminPassword, setNewAdminPassword] = useState<string>('');

    const [showPassword, setShowPassword] = useState(false);
    const [isProcessingLogout, setIsProcessingLogout] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const filteredReservations = reservations.filter((reservation) =>
        reservation.email.includes(busca) ||
        reservation.name.toLowerCase().includes(busca.toLowerCase())
    );

    const getAllReserves = async () => {
        try {
            const response = await ticketsService.getAll()

            if (response.status === 200) {
                setReservations(response.data.tickets__)
            } else {
                toast.error('Erro ao buscar dados das reservas feitas!!!');
            }
        } catch (error) {
            console.log('Erro ao buscar dados das reservas feitas: ', error)

            if (isAxiosError(error) && error.response) {
                switch (error.response.status) {
                    case 401:
                        toast.error('Sessão expirada, faça login novamente!');
                        localStorageUtil.removeItem('accessToken')
                        router.push('/')
                        break;
                    case 500:
                        toast.error('Erro no servidor ao buscar dados das reservas feitas, tente novamente mais tarde!');
                        break;
                    default:
                        toast.error('Erro ao buscar dados das reservas feitas!!!');
                        break;
                }
            } else {
                toast.error('Erro ao buscar dados das reservas feitas!!!');
            }
        }
    }

    const getAllAdmins = async () => {
        try {
            const response = await adminsService.getAll()

            if (response.status === 200) {
                setAdmins(response.data.admin__)
            } else {
                toast.error('Erro ao buscar dados dos admins cadastrados!!!');
            }
        } catch (error) {
            console.log('Erro ao buscar dados dos admins cadastrados: ', error)

            if (isAxiosError(error) && error.response) {
                switch (error.response.status) {
                    case 401:
                        toast.error('Sessão expirada, faça login novamente!');
                        localStorageUtil.removeItem('accessToken')
                        router.push('/')
                        break;
                    case 500:
                        toast.error('Erro interno no servidor ao buscar dados dos admins cadastrados, tente novamente mais tarde!');
                        break;
                    default:
                        toast.error('Erro ao buscar dados dos admins cadastrados!!!');
                        break;
                }
            } else {
                toast.error('Erro ao buscar dados dos admins cadastrados!!!');
            }
        }
    }

    useEffect(() => {
        setLoading(true);
        getAllReserves()
        getAllAdmins()
        setLoading(false);
    }, []);

    const handleLogout = async () => {
        setIsProcessingLogout(true);

        try {
            const response = await adminsService.logout()

            if (response.status === 200) {

                const hasItWorked = localStorageUtil.removeItem('accessToken')

                if (!hasItWorked) {
                    toast.error('Erro ao realizar logout, tente novamente mais tarde!');
                    setIsProcessingLogout(false);
                    return
                }

                toast.success('Você saiu com sucesso!!!');
                setIsProcessingLogout(false);
                router.push('/')
                return
            } else {
                toast.error('Erro ao realizar logout, tente novamente mais tarde!');
                setIsProcessingLogout(false);
                return
            }
        } catch (error) {
            console.log('Erro ao deslogar admin: ', error)

            if (isAxiosError(error) && error.response) {
                switch (error.response.status) {
                    case 401:
                        toast.error('Sessão expirada, faça login novamente!');
                        setIsProcessingLogout(false);
                        localStorageUtil.removeItem('accessToken')
                        router.push('/')
                        break;
                    case 500:
                        toast.error('Erro no servidor ao realizar logout, tente novamente mais tarde!');
                        break;
                    default:
                        toast.error('Erro ao realizar logout, tente novamente mais tarde!');
                        break;
                }
            } else {
                toast.error('Erro ao realizar logout, tente novamente mais tarde!');
            }
        } finally {
            setIsProcessingLogout(false);
        }
    }

    const handleUpdatePage = (): void => {
        getAllReserves();
        getAllAdmins()
    };

    const handleCreateANewAdmin = async (e: React.FormEvent) => {
        e.preventDefault();

        setNewAdminBeingRegistered(true);

        if (!newAdminUser || !newAdminPassword) {
            toast.error('Preencha usuário e senha para o novo admin!');
            setNewAdminBeingRegistered(false);
            return
        }

        if (newAdminUser.trim().length === 0) {
            toast.error('O nome de usuário não pode conter apenas espaços em branco!');
            setNewAdminBeingRegistered(false);
            return
        }

        if (newAdminPassword.trim().length === 0) {
            toast.error('A senha não pode conter apenas espaços em branco!');
            setNewAdminBeingRegistered(false);
            return
        }

        if (newAdminUser.trim().length < 3 || newAdminUser.trim().length > 20) {
            toast.error('O nome de usuário deve conter no mínimo 3 caracteres e no máximo 20!');
            setNewAdminBeingRegistered(false);
            return
        }

        if (newAdminPassword.trim().length < 6 || newAdminPassword.trim().length > 20) {
            toast.error('A senha deve conter no mínimo 6 caracteres e no máximo 20!');
            setNewAdminBeingRegistered(false);
            return
        }

        try {
            const response = await adminsService.create({
                name: newAdminUser.trim(),
                password: newAdminPassword.trim()
            })

            if (response.status === 201) {
                toast.success(`Administrador "${newAdminUser}" cadastrado com sucesso!`);
                setNewAdminUser('')
                setNewAdminPassword('')
                await getAllAdmins()
                setNewAdminBeingRegistered(false);
                return
            } else {
                toast.error('Erro ao cadastrar novo admin, tente novamente mais tarde!')
            }
        } catch (error) {
            console.log('Erro ao cadastrar novo admin: ', error)

            if (isAxiosError(error) && error.response) {
                if (error.response.status === 401) {
                    toast.error('Sessão expirada, faça login novamente!');
                    setNewAdminBeingRegistered(false);
                    router.push('/')
                    return
                } else if (error.response.data && error.response.data.error) {
                    toast.error(error.response.data.error);
                } else {
                    toast.error('Erro ao cadastrar novo admin, tente novamente mais tarde!');
                }
            } else {
                toast.error('Erro ao cadastrar novo admin, tente novamente mais tarde!');
            }
        } finally {
            setNewAdminBeingRegistered(false);
        }
    }

    const handleDeleteAllReservations = async () => {
        setIsProcessingTheExclusionOfAllReservations(true);

        try {
            const response = await ticketsService.deleteAll()

            if (response.status === 200) {
                toast.success('Todas as reservas foram excluídas com sucesso!');
                await getAllReserves();
                setIsDeleteAllReservationModalOpen(false)
            } else {
                toast.error('Erro ao excluir todas as reservas, tente novamente mais tarde!');
            }
        } catch (error) {
            console.log('Erro ao excluir todas as reservas: ', error)

            if (isAxiosError(error) && error.response) {
                if (error.response.status === 401) {
                    toast.error('Sessão expirada, faça login novamente!');
                    setIsProcessingTheExclusionOfAllReservations(false);
                    router.push('/')
                    return
                } else {
                    toast.error('Erro ao excluir todas as reservas, tente novamente mais tarde!');
                }
            } else {
                toast.error('Erro ao excluir todas as reservas, tente novamente mais tarde!');
            }
        } finally {
            setIsProcessingTheExclusionOfAllReservations(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white p-8">
            <div className="max-w-6xl mx-auto">

                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-gray-800 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-red-600">Painel Administrativo</h1>
                        <p className="text-gray-400">Bem-vindo</p>
                    </div>
                    
                    <button
                        onClick={handleLogout}
                        className="bg-red-900/50 hover:cursor-pointer hover:bg-red-900 text-red-200 px-4 py-2 rounded border border-red-800 transition"
                        disabled={isProcessingLogout || isProcessingTheExclusionOfAllReservations}
                    >
                        Sair
                    </button>
                </div>

                <div className="flex gap-4 mb-8 border-b border-gray-800">
                    <button
                        onClick={() => setActiveTab('reservas')}
                        className={`pb-2 hover:cursor-pointer px-4 font-medium transition ${activeTab === 'reservas' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-400 hover:text-white'}`}
                        disabled={isProcessingTheExclusionOfAllReservations || isProcessingLogout || newAdminBeingRegistered || loading}
                    >
                        Gerenciar Reservas
                    </button>

                    <button
                        onClick={() => setActiveTab('admins')}
                        className={`pb-2 hover:cursor-pointer px-4 font-medium transition ${activeTab === 'admins' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-400 hover:text-white'}`}
                        disabled={isProcessingTheExclusionOfAllReservations || isProcessingLogout || newAdminBeingRegistered || loading}
                    >
                        Gerenciar Administradores
                    </button>

                    <button
                        onClick={() => setActiveTab('movie')}
                        className={`pb-2 hover:cursor-pointer px-4 font-medium transition ${activeTab === 'movie' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-400 hover:text-white'}`}
                        disabled={isProcessingTheExclusionOfAllReservations || isProcessingLogout || newAdminBeingRegistered || loading}
                    >
                        Gerenciar Filme em cartaz
                    </button>
                </div>

                {activeTab === 'reservas' && (
                    <>
                        <div className="bg-gray-900 p-6 rounded-lg shadow-lg mb-8 border border-gray-800">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Pesquisar Reserva</label>
                            <input
                                type="text"
                                placeholder="Digite o Email ou Nome..."
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                                className="w-full p-3 bg-black border border-gray-700 rounded text-white focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                                disabled={loading || reservations.length === 0 || isProcessingTheExclusionOfAllReservations || isProcessingLogout}
                            />

                            <Dialog
                                open={isDeleteAllReservationModalOpen}
                                onOpenChange={(open) => {
                                    if (!isProcessingTheExclusionOfAllReservations && !isProcessingLogout) {
                                        setIsDeleteAllReservationModalOpen(open)
                                    }
                                }}
                            >
                                <DialogTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        className="mt-4 hover:cursor-pointer hover:bg-white hover:text-red-600 border-red-600 text-white"
                                        disabled={isProcessingTheExclusionOfAllReservations || reservations.length === 0 || isProcessingLogout || loading}
                                    >
                                        <Trash size={16} />
                                        {reservations.length > 0 ? `Excluir todas as reservas (${reservations.length})` : 'Nenhuma reserva para excluir'}
                                    </Button>
                                </DialogTrigger>

                                <DialogContent className="sm:max-w-md">
                                    <DialogClose asChild>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            disabled={isProcessingTheExclusionOfAllReservations}
                                            className="absolute right-4 top-4 h-8 w-8 p-0 hover:cursor-pointer text-black"
                                        >
                                            <X size={18} />
                                        </Button>
                                    </DialogClose>

                                    <DialogHeader>
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-full bg-red-100 p-2">
                                                <AlertTriangle
                                                    size={22}
                                                    className="text-red-600"
                                                />
                                            </div>

                                            <div>
                                                <DialogTitle className="text-red-600">
                                                    Excluir todas as reservas
                                                </DialogTitle>

                                                <DialogDescription className="mt-1">
                                                    Esta ação removerá todas as reservas cadastradas.
                                                </DialogDescription>
                                            </div>
                                        </div>
                                    </DialogHeader>

                                    <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                        Esta ação é permanente e não poderá ser desfeita.
                                    </div>

                                    <DialogFooter className="mt-2">
                                        <DialogClose asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                disabled={isProcessingTheExclusionOfAllReservations}
                                                className="text-black border-black hover:cursor-pointer"
                                            >
                                                Cancelar
                                            </Button>
                                        </DialogClose>

                                        <Button
                                            type="button"
                                            variant="destructive"
                                            disabled={isProcessingTheExclusionOfAllReservations}
                                            onClick={async () => {
                                                await handleDeleteAllReservations()

                                                setIsDeleteAllReservationModalOpen(false)
                                            }}
                                            className="hover:cursor-pointer"
                                        >
                                            {isProcessingTheExclusionOfAllReservations ? (
                                                <>
                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                    Excluindo...
                                                </>
                                            ) : (
                                                <>
                                                    <Trash size={16} />
                                                    Confirmar exclusão
                                                </>
                                            )}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden border border-gray-800">
                            {loading ? (
                                <div className="p-12 text-center text-gray-400">Carregando dados...</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-black text-gray-300 uppercase text-sm font-semibold">
                                            <tr>
                                                <th className="p-4 border-b border-gray-800">Nome</th>
                                                <th className="p-4 border-b border-gray-800">Email</th>
                                                <th className="p-4 border-b border-gray-800">Cadeira</th>
                                                <th className="p-4 border-b border-gray-800">Telefone</th>
                                                <th className="p-4 border-b border-gray-800">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800 text-gray-300">
                                            {filteredReservations.map((reservation) => (
                                                <tr key={String(reservation._id)} className="hover:bg-gray-800/50">
                                                    <td className="p-4 text-white">{reservation.name}</td>
                                                    <td className="p-4 text-sm">{reservation.email}</td>
                                                    <td className="p-4 text-sm">{reservation.seat}</td>
                                                    <td className="p-4 text-sm">{maskPhone(reservation.phone)}</td>
                                                    <td className="p-4 text-sm flex">
                                                        <TicketDeleteModal
                                                            ticketID={String(reservation._id)}
                                                            onUpdatePage={handleUpdatePage}
                                                            shouldDisable={isProcessingTheExclusionOfAllReservations || isProcessingLogout}
                                                        />

                                                        <TicketUpdateModal
                                                            ticketDataToBePossibleUpdated={reservation}
                                                            onUpdatePage={handleUpdatePage}
                                                            shouldDisable={isProcessingTheExclusionOfAllReservations || isProcessingLogout}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {activeTab === 'admins' && (
                    <div className="grid md:grid-cols-2 gap-8">

                        {/* Esquerda: Lista de Admins Atuais */}
                        <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-800 p-6 h-fit">
                            <h2 className="text-xl font-bold text-white mb-4 border-l-4 border-red-600 pl-3">Admins Ativos</h2>
                            <ul className="space-y-3">
                                {admins.map((admin) => (
                                    <li key={String(admin._id)} className="flex justify-between items-center bg-black p-3 rounded border border-gray-800">
                                        <span className="font-mono text-green-400">{admin.name}</span>

                                        <AdminDeleteModal
                                            adminID={String(admin._id)}
                                            onUpdatePage={handleUpdatePage}
                                            shouldDisable={newAdminBeingRegistered}
                                        />
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Direita: Formulário de Cadastro */}
                        <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-800 p-6">
                            <h2 className="text-xl font-bold text-white mb-4 border-l-4 border-green-600 pl-3">Novo Admin</h2>
                            <form onSubmit={handleCreateANewAdmin} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Novo Usuário</label>
                                    <input
                                        type="text"
                                        value={newAdminUser}
                                        onChange={(e) => setNewAdminUser(e.target.value)}
                                        className="w-full p-2 bg-black border border-gray-700 rounded text-white focus:border-green-500 focus:outline-none"
                                        placeholder="Ex: coordenador"
                                        disabled={newAdminBeingRegistered}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Senha de Acesso</label>
                                    <div className="flex gap-2">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={newAdminPassword}
                                            onChange={(e) => setNewAdminPassword(e.target.value)}
                                            className="w-full p-2 bg-black border border-gray-700 rounded text-white focus:border-green-500 focus:outline-none"
                                            placeholder="Defina uma senha"
                                            disabled={newAdminBeingRegistered}
                                        />

                                        <button
                                            type="button"
                                            onClick={togglePasswordVisibility}
                                            className="hover:cursor-pointer"
                                            disabled={newAdminBeingRegistered}
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>
                                
                                <button
                                    type="submit"
                                    className="w-full hover:cursor-pointer bg-green-700 hover:bg-green-600 text-white font-bold py-2 rounded transition"
                                    disabled={newAdminBeingRegistered}
                                >
                                    + Cadastrar Administrador
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {activeTab === 'movie' && (
                    <div>
                        <HandleMovieInformations />
                    </div>
                )}
            </div>
        </div>
    )
}