'use client'

import TicketDeleteModal from "@/components/TicketDeleteModal";
import TicketUpdateModal from "@/components/TicketUpdateModal";
import { localStorageUtil } from "@/lib/localStorage_";
import { TicketApi } from "@/types/ticket";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type AdminUser = {
    id: number;
    usuario: string;
    senha: string; // Em produção, isso seria um Hash, nunca a senha pura
};

const MOCK_ADMINS_INICIAIS: AdminUser[] = [
    { id: 1, usuario: 'admin', senha: '123' }, // Admin padrão
];

export default function Page() {
    const router = useRouter()

    const [inputUsuario, setInputUsuario] = useState('');
    const [activeTab, setActiveTab] = useState<'reservas' | 'admins'>('reservas'); // Controla qual aba está visível

    const [loading, setLoading] = useState(true);
    const [busca, setBusca] = useState('');

    const [reservas, setReservas] = useState<TicketApi[]>([]);
    const [listaAdmins, setListaAdmins] = useState<AdminUser[]>(MOCK_ADMINS_INICIAIS);

    // --- ESTADOS DE CADASTRO DE NOVO ADMIN ---
    const [novoAdminUser, setNovoAdminUser] = useState('');
    const [novoAdminPass, setNovoAdminPass] = useState('');

    const reservasFiltradas = reservas.filter((reserva) =>
        reserva.cpf.includes(busca) ||
        reserva.name.toLowerCase().includes(busca.toLowerCase())
    );

    const getAllReserves = async () => {
        try {
            const acessToken_ = localStorageUtil.getItem<string>('acessToken')

            if (!acessToken_) {
                alert('Token não encontrado !!!')
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
                alert('Token inválido')
                router.push('/')
                return
            }

            if (returnedResponse.status === 200) {
                setReservas(returnedResponse.tickets__)
            }
        } catch (error) {
            console.log('Erro ao buscar dados dos ingressos cadastrados: ', error)
            alert('Erro ao buscar dados dos ingressos cadastrados !!!')
        }
    }

    // --- LÓGICA DE CADASTRAR NOVO ADMIN ---
    const handleCadastrarAdmin = (e: React.FormEvent) => {
        e.preventDefault();

        if (!novoAdminUser || !novoAdminPass) {
            alert("Preencha usuário e senha");
            return;
        }

        // Verifica se já existe esse usuário
        if (listaAdmins.some(a => a.usuario === novoAdminUser)) {
            alert("Este nome de usuário já existe!");
            return;
        }

        const novoAdmin: AdminUser = {
            id: Date.now(),
            usuario: novoAdminUser,
            senha: novoAdminPass
        };

        setListaAdmins([...listaAdmins, novoAdmin]);
        setNovoAdminUser('');
        setNovoAdminPass('');
        alert(`Administrador "${novoAdminUser}" cadastrado com sucesso!`);
    };

    useEffect(() => {
        setLoading(true);
        getAllReserves()
        setLoading(false);
    }, []);

    const handleLogout = () => {
        const hasItWorked = localStorageUtil.removeItem('acessToken')

        if (hasItWorked) {
            alert('Logout realizado com sucesso !!!')
            router.push('/')
            return
        }

        alert('Erro ao realizar logout, tente novamente mais tarde')
    }

    function formatUTCToBR(dateUTC: string): string {
        const date = new Date(dateUTC);

        if (isNaN(date.getTime())) {
            return 'S/N'
        }

        const dia = String(date.getUTCDate()).padStart(2, "0");
        const mes = String(date.getUTCMonth() + 1).padStart(2, "0");
        const ano = date.getUTCFullYear();

        const hora = String(date.getUTCHours()).padStart(2, "0");
        const minuto = String(date.getUTCMinutes()).padStart(2, "0");

        return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
    }

    const handleUpdatePage = (): void => {
        getAllReserves();
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white p-8">
            <div className="max-w-6xl mx-auto">

                {/* Cabeçalho e Logout */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-gray-800 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-red-600">Painel Administrativo</h1>
                        <p className="text-gray-400">Bem-vindo, <span className="text-white font-bold">{inputUsuario}</span></p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="bg-red-900/50 hover:cursor-pointer hover:bg-red-900 text-red-200 px-4 py-2 rounded border border-red-800 transition"
                    >
                        Sair
                    </button>
                </div>

                {/* --- MENU DE ABAS --- */}
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

                {/* =======================================================
            CONTEÚDO DA ABA: RESERVAS
           ======================================================= */}
                {activeTab === 'reservas' && (
                    <>
                        {/* Barra de Pesquisa */}
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

                        {/* Tabela de Reservas */}
                        <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden border border-gray-800">
                            {loading ? (
                                <div className="p-12 text-center text-gray-400">Carregando dados...</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-black text-gray-300 uppercase text-sm font-semibold">
                                            <tr>
                                                {/* <th className="p-4 border-b border-gray-800">ID</th> */}
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
                                                    {/* <td className="p-4 text-xs text-gray-500">#{reserva._id}</td> */}
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

                {/* =======================================================
            CONTEÚDO DA ABA: ADMINISTRADORES
           ======================================================= */}
                {activeTab === 'admins' && (
                    <div className="grid md:grid-cols-2 gap-8">

                        {/* Esquerda: Lista de Admins Atuais */}
                        <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-800 p-6 h-fit">
                            <h2 className="text-xl font-bold text-white mb-4 border-l-4 border-red-600 pl-3">Admins Ativos</h2>
                            <ul className="space-y-3">
                                {listaAdmins.map((admin) => (
                                    <li key={admin.id} className="flex justify-between items-center bg-black p-3 rounded border border-gray-800">
                                        <span className="font-mono text-green-400">{admin.usuario}</span>
                                        <span className="text-xs text-gray-500">ID: {admin.id}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Direita: Formulário de Cadastro */}
                        <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-800 p-6">
                            <h2 className="text-xl font-bold text-white mb-4 border-l-4 border-green-600 pl-3">Novo Admin</h2>
                            <form onSubmit={handleCadastrarAdmin} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Novo Usuário</label>
                                    <input
                                        type="text"
                                        value={novoAdminUser}
                                        onChange={(e) => setNovoAdminUser(e.target.value)}
                                        className="w-full p-2 bg-black border border-gray-700 rounded text-white focus:border-green-500 focus:outline-none"
                                        placeholder="Ex: coordenador"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Senha de Acesso</label>
                                    <input
                                        type="text" // Deixei text para visualizar ao criar, pode mudar para password
                                        value={novoAdminPass}
                                        onChange={(e) => setNovoAdminPass(e.target.value)}
                                        className="w-full p-2 bg-black border border-gray-700 rounded text-white focus:border-green-500 focus:outline-none"
                                        placeholder="Defina uma senha"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-green-700 hover:bg-green-600 text-white font-bold py-2 rounded transition"
                                >
                                    + Cadastrar Administrador
                                </button>
                            </form>
                            <p className="mt-4 text-xs text-gray-500">
                                Nota: Como estamos sem Backend real, ao atualizar a página (F5), os novos admins criados aqui sumirão.
                            </p>
                        </div>

                    </div>
                )}

            </div>
        </div>
    )
}