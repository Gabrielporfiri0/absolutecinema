'use client'

import { localStorageUtil } from "@/lib/localStorage_";
import Link from "next/link";

export default function Page() {
    const seeToken = () => {
        const token_ = localStorageUtil.getItem<string>('acessToken')

        if(token_) alert(`Token: ${token_}`)
        else alert('Token não encontrado !!!')
    }

    return (
        <div className="flex flex-col gap-8 justify-center items-center h-dvh w-dvw">
            <h1>Bem vindo a página do dashboard</h1>

            <Link
                href={'/'}
                className="p-5 bg-blue-500 hover:cursor-pointer hover:bg-blue-700 font-bold rounded-2xl"
            >
                Voltar a página inicial
            </Link>

            <button
                className="p-5 bg-blue-500 hover:cursor-pointer hover:bg-blue-700 font-bold rounded-2xl"
                onClick={seeToken}
            >
                Ver Token
            </button>
        </div>
    )
}