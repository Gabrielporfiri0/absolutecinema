import { NextRequest, NextResponse } from "next/server"
import { getTicketsCollection } from "../mongodb"
import { validateAuth } from "@/lib/auth-utils"

export async function GET(request: NextRequest) {
    try {
        const aValidTokenWasSent = await validateAuth(request)

        if (aValidTokenWasSent.status === 401) return NextResponse.json({ error: 'Token inválido' }, { status: 401 })

        const collection = await getTicketsCollection()
        const tickets_ = await collection.find().toArray()
        return NextResponse.json({ message: 'Ingressos encontrados com sucesso', tickets__: tickets_ }, { status: 200 })
    } catch (error) {
        console.log('Erro ao realizar GET dos ingressos: ', error)
        return NextResponse.json({ error: 'Erro ao buscar ingressos' }, { status: 500 })
    }
}