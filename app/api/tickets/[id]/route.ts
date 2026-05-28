import { NextResponse, NextRequest } from 'next/server'
import { getTicketsCollection } from '../mongodb'
import { ObjectId } from 'mongodb'
import { Ticket } from '@/types/ticket'
import { validateAuth } from '@/lib/auth-utils'

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {

        const { id } = await context.params

        if (!id) return NextResponse.json({ error: 'ID não fornecido' }, { status: 400 })

        if (!/^[0-9a-fA-F]{24}$/.test(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

        const aValidTokenWasSent = await validateAuth(request)

        if (aValidTokenWasSent.status === 401) return NextResponse.json({ error: 'Token inválido' }, { status: 401 })

        const collection = await getTicketsCollection()

        const tickeT = await collection.findOne({ _id: ObjectId.createFromHexString(id) })

        if (!tickeT) return NextResponse.json({ error: 'Reserva não encontrada' }, { status: 404 })

        return NextResponse.json({
            message: 'Reserva encontrada com sucesso',
            ticket_data: tickeT,
        }, { status: 200 })
    } catch (error) {
        console.log('Erro no GET detalhado de uma reserva: ', error)
        return NextResponse.json({ error: 'Erro ao buscar dados de uma reserva específica' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params

        if (!id) return NextResponse.json({ error: 'ID não fornecido' }, { status: 400 })

        if (!/^[0-9a-fA-F]{24}$/.test(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

        const aValidTokenWasSent = await validateAuth(request)

        if (aValidTokenWasSent.status === 401) return NextResponse.json({ error: 'Token inválido' }, { status: 401 })

        const collection = await getTicketsCollection()

        const ticket_ = await collection.findOne({ _id: ObjectId.createFromHexString(id) })

        if (!ticket_) return NextResponse.json({ error: 'Ingresso não encontrado' }, { status: 404 })

        await collection.deleteOne({ _id: ObjectId.createFromHexString(id) })

        return NextResponse.json({ status: 204 })
    } catch (error) {
        console.log('Erro ao realizar DELETE da reserva: ', error)
        return NextResponse.json({ error: 'Erro ao deletar reserva' }, { status: 500 })
    }
}

export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params

        if (!id) return NextResponse.json({ error: 'ID não fornecido!' }, { status: 400 })

        if (!/^[0-9a-fA-F]{24}$/.test(id)) return NextResponse.json({ error: 'ID inválido!' }, { status: 400 })

        const aValidTokenWasSent = await validateAuth(request)

        if (aValidTokenWasSent.status === 401) return NextResponse.json({ error: 'Token inválido!' }, { status: 401 })

        let data: Ticket = {
            name: '',
            email: '',
            seat: '',
            phone: '',
            createdAt: '',
            updatedAt: ''
        }

        try {
            data = await request.json()
            if (!data.name || !data.email || !Number(data.seat) || !data.phone || !data.createdAt || !data.updatedAt)
                return NextResponse.json({ error: 'Por favor, forneça todos os dados!' }, { status: 400 })
        } catch (error) {
            return NextResponse.json({ error: 'Por favor, forneça todos os dados!' }, { status: 400 })
        }

        const seatNumberInformed = Number(data.seat)

        if (Number.isNaN(seatNumberInformed) || seatNumberInformed < 1 || seatNumberInformed > 122) {
            return NextResponse.json({ error: 'Assento inválido! Por favor, informe um número de assento entre 1 e 122.' }, { status: 400 })
        }

        const collection = await getTicketsCollection()

        const ticketExists = await collection.findOne({ _id: ObjectId.createFromHexString(id) })

        if (!ticketExists) return NextResponse.json({ error: 'Reserva não encontrada!' }, { status: 404 })

        if (ticketExists.seat !== Number(data.seat)) {
            const sentSeatAlreadyRegistered = await collection.findOne({ seat: Number(data.seat) })

            if (sentSeatAlreadyRegistered) return NextResponse.json({ error: 'O Assento com o número informado já foi reservado!' }, { status: 400 })
        }

        if (ticketExists.email !== data.email) {
            const numberOfTicketsWithThisEmail = await collection.countDocuments({ email: data.email })

            if (numberOfTicketsWithThisEmail === 4) return NextResponse.json({ error: 'O email informado já foi registrado em 4 reservas!' }, { status: 400 })
        }


        await collection.updateOne(
            { _id: ObjectId.createFromHexString(id) },
            {
                $set: {
                    name: data.name,
                    email: data.email,
                    seat: Number(data.seat),
                    phone: data.phone,
                    createdAt: data.createdAt,
                    updatedAt: new Date()
                }
            }
        )

        return NextResponse.json({ message: 'Reserva atualizada com sucesso!' }, { status: 200 })
    } catch (error) {
        console.log('Erro ao realizar PUT da reserva: ', error)
        return NextResponse.json({ error: 'Erro ao atualizar reserva!' }, { status: 500 })
    }
}
