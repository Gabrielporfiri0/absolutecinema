'use client'

// import { localStorageUtil } from "@/lib/localStorage_"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function Page() {
    const [userName, setUserName] = useState<string>('')
    const [userPassword, setUserPassword] = useState<string>('')
    const router = useRouter()

    const handleRegisterNewAdmin = async () => {
        // const acessToken_ = localStorageUtil.getItem<string>('acessToken')

        // if(!acessToken_){
        //     alert('Token não encontrado !!!')
        //     return
        // } 

        try {
            const response = await fetch('/api/admin/register', {
                method: 'POST',
                body: JSON.stringify({
                    name: userName,
                    password: userPassword
                })
            })

            const returnedResponse = await response.json()

            console.log('CRIAR ADMIN: ', returnedResponse)

            if (returnedResponse.status === 201){
                alert('Novo admin cadastrado com sucesso !!!')
                router.push('./login')
            }
            if (returnedResponse.status === 400 || returnedResponse.status === 500) alert('Erro ao criar novo admin !!!')

            setUserName('')
            setUserPassword('')
        } catch (error) {
            console.log('Erro ao tentar cadastrar novo admin: ', error)
        }
    }

    return (
        <div className="flex flex-col justify-center items-center gap-2">
            <h1>Bem vindo a página de cadastro</h1>
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
                onClick={handleRegisterNewAdmin}
            >
                Cadastrar
            </button>
        </div>
    )
}