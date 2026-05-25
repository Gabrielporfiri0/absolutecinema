import { NextRequest, NextResponse } from "next/server"
import { getTicketsCollection } from "../mongodb"
import { TicketDataToBeSent } from "@/types/ticket"

export async function POST(request: NextRequest) {
    try {
        let data: TicketDataToBeSent = {
            name: '',
            cpf: '',
            seat: ''
        }

        try {
            data = await request.json()
            if (!data.name || !data.cpf || !Number(data.seat)) return NextResponse.json({ error: 'Por favor, forneça todos os dados!' }, { status: 400 })
        } catch (error) {
            return NextResponse.json({ error: 'Por favor, forneça todos os dados!' }, { status: 400 })
        }

        const collection = await getTicketsCollection()

        const sentSeatAlreadyRegistered = await collection.findOne({ seat: Number(data.seat) })

        if (sentSeatAlreadyRegistered) return NextResponse.json({ error: 'O Assento com o número informado já foi reservado!' }, { status: 400 })

        const numberOfTicketsWithThisCPF = await collection.countDocuments({ cpf: data.cpf })

        if (numberOfTicketsWithThisCPF === 4) return NextResponse.json({ error: 'CPF já registrado em 4 reservas!' }, { status: 400 })

        const response = await collection.insertOne({
            name: data.name,
            cpf: data.cpf,
            seat: Number(data.seat),
            createdAt: new Date(),
            updatedAt: new Date()
        })

        return NextResponse.json({ message: "Reserva feita com sucesso!", id: String(response.insertedId) }, { status: 201 })
    } catch (error) {
        console.log('Erro ao realizar POST da reserva: ', error)
        return NextResponse.json({ error: 'Erro ao registrar reserva!' }, { status: 500 })
    }
}