import { validateAuth } from "@/lib/auth-utils"
import { NextRequest, NextResponse } from "next/server"
import { getTicketsCollection } from "../mongodb"

export async function DELETE(request: NextRequest) {
    try {
        const aValidTokenWasSent = await validateAuth(request)

        if (aValidTokenWasSent.status === 401) return NextResponse.json({ error: 'Token inválido' }, { status: 401 })

        const collection = await getTicketsCollection()
        const result = await collection.deleteMany({})
        const ticketsDeletedResult = result.deletedCount || 0

        return NextResponse.json({ message: 'Reservas excluídas com sucesso!', ticketsDeleted: ticketsDeletedResult }, { status: 200 })
    } catch (error) {
        console.log('Erro ao excluir todos as reservas: ', error)
        return NextResponse.json({ error: 'Erro interno no servidor ao excluir todas as reservas!' }, { status: 500 })
    }
}