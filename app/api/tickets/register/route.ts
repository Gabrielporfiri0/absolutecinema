import { NextRequest, NextResponse } from "next/server"
import { getTicketsCollection } from "../mongodb"
import { TicketDataToBeSent } from "@/types/ticket"

export async function POST(request: NextRequest) {
    try {
        let data: TicketDataToBeSent = {
            name: '',
            email: '',
            seat: '',
            phone: ''
        }

        try {
            data = await request.json()
            if (!data.name || !data.email || !Number(data.seat) || !data.phone) return NextResponse.json({ error: 'Por favor, forneça todos os dados!' }, { status: 400 })
        } catch (error) {
            return NextResponse.json({ error: 'Por favor, forneça todos os dados!' }, { status: 400 })
        }

        const seatNumberInformed = Number(data.seat)

        if (Number.isNaN(seatNumberInformed) || seatNumberInformed < 1 || seatNumberInformed > 122) {
            return NextResponse.json({ error: 'Assento inválido! Por favor, informe um número de assento entre 1 e 122.' }, { status: 400 })
        }

        const collection = await getTicketsCollection()

        const sentSeatAlreadyRegistered = await collection.findOne({ seat: Number(data.seat) })

        if (sentSeatAlreadyRegistered) return NextResponse.json({ error: 'O Assento com o número informado já foi reservado!' }, { status: 400 })

        const numberOfTicketsWithThisEmail = await collection.countDocuments({ email: data.email })

        if (numberOfTicketsWithThisEmail === 4) return NextResponse.json({ error: 'O email informado já foi registrado em 4 reservas!' }, { status: 400 })

        const response = await collection.insertOne({
            name: data.name,
            email: data.email,
            seat: Number(data.seat),
            phone: data.phone,
            createdAt: new Date(),
            updatedAt: new Date()
        })

        return NextResponse.json({ message: "Reserva feita com sucesso!", id: String(response.insertedId) }, { status: 201 })
    } catch (error) {
        console.log('Erro ao realizar POST da reserva: ', error)
        return NextResponse.json({ error: 'Erro ao registrar reserva!' }, { status: 500 })
    }
}