'use client'

import { localStorageUtil } from "@/lib/localStorage_"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function Page() {
    const [userName, setUserName] = useState<string>('')
    const [userPassword, setUserPassword] = useState<string>('')
    const router = useRouter()

    const handleLoginNewAdmin = async () => {
        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: userName,
                    password: userPassword
                })
            })

            const returnedResponse = await response.json()

            console.log('FAZER LOGIN ADMIN: ', returnedResponse)

            if (returnedResponse.status === 200){
                alert('Novo admin logado com sucesso !!!')

                const tokenIsSet = localStorageUtil.setItem<string>('acessToken', returnedResponse.token)

                if(tokenIsSet) alert('Token setado com sucesso !!!')

                router.push('./dashboard')
            }
            else alert('Erro ao logar admin !!!')

            setUserName('')
            setUserPassword('')
        } catch (error) {
            console.log('Erro ao tentar logar admin: ', error)
        }
    }

    return (
        <div className="flex flex-col justify-center items-center gap-2">
            <h1>Bem vindo a página de login</h1>
            <input
                type="text"
                placeholder="Informe seu nome de usuário"
                className="p-5 border border-black"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
            />

            <input
                type="text"
                placeholder="Informe sua senha"
                className="p-5 border border-black"
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
            />

            <button
                className="p-5 bg-blue-500 hover:cursor-pointer hover:bg-blue-700 font-bold rounded-2xl"
                onClick={handleLoginNewAdmin}
            >
                Entrar
            </button>

            <Link
                href={'/'}
                className="p-5 bg-blue-500 hover:cursor-pointer hover:bg-blue-700 font-bold rounded-2xl"
            >
                Voltar a página inicial
            </Link>
        </div>
    )
}