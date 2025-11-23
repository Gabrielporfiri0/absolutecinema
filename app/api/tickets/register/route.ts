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
            if (!data.name || !data.cpf || !Number(data.seat)) return NextResponse.json({ error: 'Por favor, forneça todos os dados', status: 400 })
        } catch (error) {
            return NextResponse.json({ error: 'Por favor, forneça todos os dados', status: 400 })
        }

        const collection = await getTicketsCollection()

        // const sentCpfAlreadyExists = await collection.findOne({ cpf: data.cpf })
        const sentSeatAlreadyRegistered = await collection.findOne({ seat: Number(data.seat) })

        // if (sentCpfAlreadyExists) return NextResponse.json({ error: 'O CPF já existe', status: 400 })
        if (sentSeatAlreadyRegistered) return NextResponse.json({ error: 'O Assento já foi reservado', status: 400 })

        const response = await collection.insertOne({
            name: data.name,
            cpf: data.cpf,
            seat: Number(data.seat),
            createdAt: new Date(),
            updatedAt: new Date()
        })

        return NextResponse.json({ message: "Ingresso cadastrado com sucesso", id: response.insertedId, status: 201 })
    } catch (error) {
        console.log('Erro ao realizar POST do ingresso: ', error)
        return NextResponse.json({ error: 'Erro ao adicionar ingresso', status: 500 })
    }
}