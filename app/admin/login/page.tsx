'use client'

import { loginUser } from "@/app/actions/login_"
import { localStorageUtil } from "@/lib/localStorage_"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export default function Page() {
    const [userName, setUserName] = useState<string>('')
    const [userPassword, setUserPassword] = useState<string>('')
    const [isProcessingLogin, setIsProcessingLogin] = useState<boolean>(false)
    const router = useRouter()

    const handleLoginNewAdmin = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsProcessingLogin(true)

        if(!userName || !userPassword){
            toast.error('Por favor, informe usuário e senha')
            setIsProcessingLogin(false)
            return
        }

        try {
            const result = await loginUser(userName, userPassword);

            if (!result.success) {
                if(result.status === 400) {
                    toast.error('Por favor, forneça todos os dados')
                    setIsProcessingLogin(false)
                    return
                }

                if(result.status === 404) {
                    toast.error('Usuário não encontrado')
                    setIsProcessingLogin(false)
                    return
                }

                if(result.status === 401) {
                    toast.error('Credenciais inválidas')
                    setIsProcessingLogin(false)
                    return
                }

                if(result.status === 500) {
                    toast.error('Erro ao realizar login, tente novamente mais tarde')
                    setIsProcessingLogin(false)
                    return
                }


            }

            if (result.status === 200) {
                
                const tokenIsSet = localStorageUtil.setItem('acessToken', result.token || '')
                
                if(tokenIsSet){
                    toast.success('Login realizado com sucesso !!!')
                    setUserName('')
                    setUserPassword('')
                    setIsProcessingLogin(false)

                    router.push('./dashboard')
                }

                setIsProcessingLogin(false)
            }
        } catch (error) {
            console.log('Erro ao tentar logar admin: ', error)
            toast.error('Erro ao tentar logar admin, tente novamente mais tarde');
            setIsProcessingLogin(false)
        }
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="bg-gray-900 p-8 rounded-lg shadow-2xl border border-gray-800 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-red-600 mb-2">Área Restrita</h1>
                    <p className="text-gray-400">Acesso exclusivo para administradores</p>
                </div>

                <form onSubmit={handleLoginNewAdmin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Usuário</label>
                        <input
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white focus:border-red-600 focus:outline-none"
                            disabled={isProcessingLogin}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Senha</label>
                        <input
                            type="password"
                            value={userPassword}
                            onChange={(e) => setUserPassword(e.target.value)}
                            className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white focus:border-red-600 focus:outline-none"
                            disabled={isProcessingLogin}
                        />
                    </div>
             
                    <button 
                        type="submit" 
                        className="w-full hover:cursor-pointer bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded transition duration-200"
                        disabled={isProcessingLogin}
                    >
                        Entrar no Sistema
                    </button>
                </form>
            </div>
        </div>
    )
}