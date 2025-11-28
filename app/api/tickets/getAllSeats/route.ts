import { NextResponse } from "next/server"
import { getTicketsCollection } from "../mongodb"

export async function GET() {
    try {
        const collection = await getTicketsCollection()
        const tickets_ = await collection.find().toArray()

        const arrayOfRegisteredSeats:number[] = []

        tickets_.map((ticket_) => {
            arrayOfRegisteredSeats.push(ticket_.seat)
        })

        return NextResponse.json({ message: 'Assentos encontrados com sucesso', status: 200, seats__: arrayOfRegisteredSeats })
    } catch (error) {
        console.log('Erro ao realizar GET dos assentos: ', error)
        return NextResponse.json({ error: 'Erro ao buscar assentos', status: 500 })
    }
}