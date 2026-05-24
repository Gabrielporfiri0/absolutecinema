'use client'

import { localStorageUtil } from "@/lib/localStorage_"
import { adminsService } from "@/services/admins"
import { isAxiosError } from "axios"
import { Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export default function Page() {
    const [userName, setUserName] = useState<string>('')
    const [userPassword, setUserPassword] = useState<string>('')
    const [isProcessingLogin, setIsProcessingLogin] = useState<boolean>(false)
    const router = useRouter()

    const [showPassword, setShowPassword] = useState(false)

    const handleLoginNewAdmin = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsProcessingLogin(true)

        if(!userName || !userPassword){
            toast.error('Por favor, informe usuário e senha')
            setIsProcessingLogin(false)
            return
        }

        if(userName.trim() === '' || userPassword.trim() === '') {
            toast.error('Usuário e senha não podem conter apenas espaços em branco!')
            setIsProcessingLogin(false)
            return
        }

        if(userName.trim().length < 3 || userName.trim().length > 20) {
            toast.error('Usuário deve ter entre 3 e 20 caracteres')
            setIsProcessingLogin(false)
            return
        }

        if(userPassword.trim().length < 6 || userPassword.trim().length > 20) {
            toast.error('Senha deve ter entre 6 e 20 caracteres')
            setIsProcessingLogin(false)
            return
        }

        try {
            const response = await adminsService.login({
                name: userName.trim(),
                password: userPassword.trim()
            })

            if (response.status === 200) {
                const tokenIsSet = localStorageUtil.setItem('acessToken', response.data.token || '')
                
                if(tokenIsSet){
                    toast.success('Login realizado com sucesso!!!')
                    setUserName('')
                    setUserPassword('')
                    setIsProcessingLogin(false)

                    router.push('./dashboard')
                }

                setIsProcessingLogin(false)
            } else {
                toast.error('Erro ao realizar login, tente novamente mais tarde!')
                setIsProcessingLogin(false)
            }
        } catch (error) {
            console.log('Erro ao tentar logar admin: ', error)

            if(isAxiosError(error) && error.response) {
                if(error.response.data && error.response.data.error) {
                    toast.error(error.response.data.error)
                    setIsProcessingLogin(false)
                    return
                } else {
                    toast.error('Erro ao tentar logar admin, tente novamente mais tarde');
                    setIsProcessingLogin(false)
                    return
                }
            } else {
                toast.error('Erro ao tentar logar admin, tente novamente mais tarde');
                setIsProcessingLogin(false)
                return
            }
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
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Senha
                        </label>

                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={userPassword}
                                onChange={(e) =>
                                    setUserPassword(e.target.value)
                                }
                                className="w-full p-3 pr-12 bg-gray-800 border border-gray-700 rounded text-white focus:border-red-600 focus:outline-none"
                                disabled={isProcessingLogin}
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword(!showPassword)
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                disabled={isProcessingLogin}
                            >
                                {showPassword ? (
                                    <EyeOff size={20} />
                                ) : (
                                    <Eye size={20} />
                                )}
                            </button>
                        </div>
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