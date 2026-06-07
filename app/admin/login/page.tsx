'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { localStorageUtil } from "@/lib/localStorage_"
import { adminsService } from "@/services/admins"
import { AdminFormData, AdminSchema } from "@/types/admin"
import { zodResolver } from "@hookform/resolvers/zod"
import { isAxiosError } from "axios"
import { Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

export default function Page() {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<AdminFormData>({
        resolver: zodResolver(AdminSchema),
        defaultValues: {
            name: "",
            password: "",
        },
    });

    const onSubmit = async (data: AdminFormData) => {
        try {
            const response = await adminsService.login({
                name: data.name.trim(),
                password: data.password.trim()
            })

            if (response.status === 200) {
                const tokenIsSet = localStorageUtil.setItem('accessToken', response.data.token || '')

                if (tokenIsSet) {
                    toast.success('Login realizado com sucesso!!!')
                    reset()
                    router.push('./dashboard')
                }
            } else {
                toast.error('Erro ao realizar login, tente novamente mais tarde!')
            }
        } catch (error) {
            console.log('Erro ao tentar logar admin: ', error)

            if (isAxiosError(error) && error.response) {
                if (error.response.data && error.response.data.error) {
                    toast.error(error.response.data.error)
                } else {
                    toast.error('Erro ao tentar logar admin, tente novamente mais tarde!');
                }
            } else {
                toast.error('Erro ao tentar logar admin, tente novamente mais tarde!');
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

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <Label className="block text-sm font-medium text-gray-300 mb-2">Usuário</Label>
                        <Input
                            id="name"
                            type="text"
                            {...register('name')}
                            className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white focus:border-red-600 focus:outline-none selection:bg-blue-700"
                            disabled={isSubmitting}
                        />

                        {errors.name && (
                            <span className="text-rose-400 text-xs sm:text-sm block pl-1 mt-1">
                                {errors.name.message}
                            </span>
                        )}
                    </div>

                    <div>
                        <Label className="block text-sm font-medium text-gray-300 mb-2">
                            Senha
                        </Label>

                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                {...register('password')}
                                className="w-full p-3 pr-12 bg-gray-800 border border-gray-700 rounded text-white focus:border-red-600 focus:outline-none selection:bg-blue-700"
                                disabled={isSubmitting}
                            />


                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword(!showPassword)
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white hover:cursor-pointer"
                                disabled={isSubmitting}
                            >
                                {showPassword ? (
                                    <EyeOff size={20} />
                                ) : (
                                    <Eye size={20} />
                                )}
                            </button>
                        </div>

                        {errors.password && (
                            <span className="text-rose-400 text-xs sm:text-sm block pl-1 mt-1">
                                {errors.password.message}
                            </span>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full hover:cursor-pointer bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded transition duration-200"
                        disabled={isSubmitting}
                        variant={'destructive'}
                    >
                        Entrar no Sistema
                    </Button>
                </form>
            </div>
        </div>
    )
}