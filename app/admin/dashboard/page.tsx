'use client'

import AdminDeleteModal from "@/components/AdminDeleteModal";
import TicketDeleteModal from "@/components/TicketDeleteModal";
import TicketUpdateModal from "@/components/TicketUpdateModal";
import { formatUTCToBR } from "@/lib/dates";
import { localStorageUtil } from "@/lib/localStorage_";
import { AdminUser } from "@/types/admin";
import { TicketApi } from "@/types/ticket";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff } from 'lucide-react';

export default function Page() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<'reservas' | 'admins'>('reservas'); // Controla qual aba está visível

    const [loading, setLoading] = useState(true);
    const [newAdminBeingRegistered, setNewAdminBeingRegistered] = useState(false);
    const [busca, setBusca] = useState('');

    const [reservas, setReservas] = useState<TicketApi[]>([]);
    const [admins, setAdmins] = useState<AdminUser[]>([]);

    const [newAdminUser, setNewAdminUser] = useState<string>('');
    const [newAdminPassword, setNewAdminPassword] = useState<string>('');

    const [showPassword, setShowPassword] = useState(false);
    const [isProcessingLogout, setIsProcessingLogout] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const reservasFiltradas = reservas.filter((reserva) =>
        reserva.cpf.includes(busca) ||
        reserva.name.toLowerCase().includes(busca.toLowerCase())
    );

    const getAllReserves = async () => {
        try {
            const acessToken_ = localStorageUtil.getItem('acessToken')

            if (!acessToken_) {
                toast.error('Token não encontrado !!!');
                router.push('/')
                return
            }

            const response = await fetch('/api/tickets/getAllTickets', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${acessToken_}`,
                    'Content-Type': 'application/json',
                }
            })

            const returnedResponse = await response.json()

            if (returnedResponse.status === 401) {
                toast.error('Token inválido, faça login novamente');
                router.push('/')
                return
            }

            if (returnedResponse.status === 200) {
                setReservas(returnedResponse.tickets__)
            }
        } catch (error) {
            console.log('Erro ao buscar dados dos ingressos cadastrados: ', error)
            toast.error('Erro ao buscar dados dos ingressos cadastrados !!!');
        }
    }

    const getAllAdmins = async () => {
        try {
            const acessToken_ = localStorageUtil.getItem('acessToken')

            if (!acessToken_) {
                toast.error('Token não encontrado, faça login novamente');
                router.push('/')
                return
            }

            const response = await fetch('/api/admin/getAll', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${acessToken_}`,
                    'Content-Type': 'application/json',
                }
            })

            const returnedResponse = await response.json()

            if (returnedResponse.status === 401) {
                toast.error('Token inválido, faça login novamente');
                router.push('/')
                return
            }

            if (returnedResponse.status === 200) {
                setAdmins(returnedResponse.admin__)
            }
        } catch (error) {
            console.log('Erro ao buscar dados dos admins cadastrados: ', error)
            toast.error('Erro ao buscar dados dos admins cadastrados !!!');
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

        const acessToken_ = localStorageUtil.getItem('acessToken')

        if (!acessToken_) {
            toast.error('Token não encontrado, faça login novamente');
            setIsProcessingLogout(false);
            router.push('/')
            return
        }

        try {
            const response = await fetch('/api/admin/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${acessToken_}`,
                    'Content-Type': 'application/json',
                }
            })

            const returnedResponse = await response.json()

            if (returnedResponse.status === 500) {
                toast.error('Erro ao realizar logout, tente novamente mais tarde');
                setIsProcessingLogout(false);
                return
            }

            if (returnedResponse.status === 401) {
                toast.error('Token inválido, faça login novamente');
                setIsProcessingLogout(false);
                router.push('/')
                return
            }

            const hasItWorked = localStorageUtil.removeItem('acessToken')

            if (!hasItWorked) {
                toast.error('Erro ao realizar logout, tente novamente mais tarde');
                setIsProcessingLogout(false);
                return
            }

            toast.success('Logout realizado com sucesso !!!');
            setIsProcessingLogout(false);
            router.push('/')
            return
        } catch (error) {
            console.log('Erro ao deslogar admin: ', error)
            toast.error('Erro ao realizar logout, tente novamente mais tarde');
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

        const acessToken_ = localStorageUtil.getItem('acessToken')

        if (!acessToken_) {
            toast.error('Token não encontrado, faça login novamente');
            setNewAdminBeingRegistered(false);
            router.push('/')
            return
        }

        if (!newAdminUser || !newAdminPassword) {
            toast.error('Preencha usuário e senha para o novo admin');
            setNewAdminBeingRegistered(false);
            return
        }

        try {
            const response = await fetch('/api/admin/register', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${acessToken_}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: newAdminUser,
                    password: newAdminPassword
                })
            })

            const returnedResponse = await response.json()

            if (returnedResponse.status === 201) {
                toast.success(`Administrador "${newAdminUser}" cadastrado com sucesso!`);
                setNewAdminUser('')
                setNewAdminPassword('')
                getAllAdmins()
                setNewAdminBeingRegistered(false);
                return
            }
            else if (returnedResponse.status === 401) {
                toast.error('Token inválido, faça login novamente');
                setNewAdminBeingRegistered(false);
                router.push('/')
                return
            } else {
                toast.error(`Erro ao cadastrar novo admin: ${returnedResponse.error}`);
                setNewAdminBeingRegistered(false);
                return
            }
        } catch (error) {
            console.log('Erro ao cadastrar novo admin: ', error)
            toast.error('Erro ao cadastrar novo admin, tente novamente mais tarde');
        } finally {
            setNewAdminBeingRegistered(false);
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
                        disabled={isProcessingLogout}
                    >
                        Sair
                    </button>
                </div>

                <div className="flex gap-4 mb-8 border-b border-gray-800">
                    <button
                        onClick={() => setActiveTab('reservas')}
                        className={`pb-2 hover:cursor-pointer px-4 font-medium transition ${activeTab === 'reservas' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-400 hover:text-white'}`}
                    >
                        Gerenciar Reservas
                    </button>
                    <button
                        onClick={() => setActiveTab('admins')}
                        className={`pb-2 hover:cursor-pointer px-4 font-medium transition ${activeTab === 'admins' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-400 hover:text-white'}`}
                    >
                        Gerenciar Administradores
                    </button>
                </div>

                {activeTab === 'reservas' && (
                    <>
                        <div className="bg-gray-900 p-6 rounded-lg shadow-lg mb-8 border border-gray-800">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Pesquisar Inscrito</label>
                            <input
                                type="text"
                                placeholder="Digite o CPF ou Nome..."
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                                className="w-full p-3 bg-black border border-gray-700 rounded text-white focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                            />
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
                                                <th className="p-4 border-b border-gray-800">CPF</th>
                                                <th className="p-4 border-b border-gray-800">Cadeira</th>
                                                <th className="p-4 border-b border-gray-800">Data</th>
                                                <th className="p-4 border-b border-gray-800">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800 text-gray-300">
                                            {reservasFiltradas.map((reserva) => (
                                                <tr key={String(reserva._id)} className="hover:bg-gray-800/50">
                                                    <td className="p-4 text-white">{reserva.name}</td>
                                                    <td className="p-4 text-sm">{reserva.cpf}</td>
                                                    <td className="p-4 text-sm">{reserva.seat}</td>
                                                    <td className="p-4 text-sm">{formatUTCToBR(reserva.createdAt)}</td>
                                                    <td className="p-4 text-sm flex">
                                                        <TicketDeleteModal
                                                            ticketID={String(reserva._id)}
                                                            onUpdatePage={handleUpdatePage}
                                                        />

                                                        <TicketUpdateModal
                                                            ticketDataToBePossibleUpdated={reserva}
                                                            onUpdatePage={handleUpdatePage}
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
                                        >
                                            {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
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
            </div>
        </div>
    )
}