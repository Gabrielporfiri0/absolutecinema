import { NextResponse } from "next/server"
import { getTicketsCollection } from "../mongodb"

export async function GET() {
    try {
        const collection = await getTicketsCollection()
        const tickets_ = await collection.find().toArray()
        return NextResponse.json({ message: 'Ingressos encontrados com sucesso', status: 200, tickets__: tickets_ })
    } catch (error) {
        console.log('Erro ao realizar GET dos ingressos: ', error)
        return NextResponse.json({ error: 'Erro ao buscar ingressos', status: 500 })
    }
}