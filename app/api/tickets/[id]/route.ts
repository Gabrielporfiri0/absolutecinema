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
        
        if (!id) return NextResponse.json({ error: 'ID não fornecido', status: 400 })
            
        if (!/^[0-9a-fA-F]{24}$/.test(id)) return NextResponse.json({ error: 'ID inválido', status: 400 })
            
        const aValidTokenWasSent = validateAuth(request)
        
        if(aValidTokenWasSent.status === 401) return NextResponse.json({ error: 'Token inválido', status: 401 })
                
        const collection = await getTicketsCollection()

        const tickeT = await collection.findOne({ _id: ObjectId.createFromHexString(id) })

        if (!tickeT) return NextResponse.json({ error: 'Ingresso não encontrado', status: 404 })

        return NextResponse.json({
            message: 'Ingresso encontrado com sucesso',
            ticket_data: tickeT,
            status: 200
        })
    } catch (error) {
        console.log('Erro no GET detalhado de um ingresso: ', error)
        return NextResponse.json({ error: 'Erro ao buscar dados de um ingresso específico', status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params

        if (!id) return NextResponse.json({ error: 'ID não fornecido', status: 400 })

        if (!/^[0-9a-fA-F]{24}$/.test(id)) return NextResponse.json({ error: 'ID inválido', status: 400 })

        const aValidTokenWasSent = validateAuth(request)

        if(aValidTokenWasSent.status === 401) return NextResponse.json({ error: 'Token inválido', status: 401 })

        const collection = await getTicketsCollection()

        const ticket_ = await collection.findOne({ _id: ObjectId.createFromHexString(id) })

        if (!ticket_) return NextResponse.json({ error: 'Ingresso não encontrado', status: 404 })

        await collection.deleteOne({ _id: ObjectId.createFromHexString(id) })

        return NextResponse.json({ message: 'Ingresso deletado com sucesso', status: 200 })
    } catch (error) {
        console.log('Erro ao realizar DELETE do ingresso: ', error)
        return NextResponse.json({ error: 'Erro ao deletar ingresso', status: 500 })
    }
}

export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params

        if (!id) return NextResponse.json({ error: 'ID não fornecido', status: 400 })

        if (!/^[0-9a-fA-F]{24}$/.test(id)) return NextResponse.json({ error: 'ID inválido', status: 400 })

        const aValidTokenWasSent = validateAuth(request)

        if(aValidTokenWasSent.status === 401) return NextResponse.json({ error: 'Token inválido', status: 401 })

        let data: Ticket = {
            name: '',
            cpf: '',
            seat: '',
            createdAt: '',
            updatedAt: ''
        }

        try {
            data = await request.json()
            if (!data.name || !data.cpf || !Number(data.seat) || !data.createdAt || !data.updatedAt)
                return NextResponse.json({ error: 'Por favor, forneça todos os dados', status: 400 })
        } catch (error) {
            return NextResponse.json({ error: 'Por favor, forneça todos os dados', status: 400 })
        }

        const collection = await getTicketsCollection()

        const ticketExists = await collection.findOne({ _id: ObjectId.createFromHexString(id) })

        if (!ticketExists) return NextResponse.json({ error: 'Ingresso não encontrado', status: 404 })

        const sentSeatAlreadyRegistered = await collection.findOne({ seat: Number(data.seat) })

        if (sentSeatAlreadyRegistered) return NextResponse.json({ error: 'O Assento já foi reservado', status: 400 })

        const numberOfTicketsWithThisCPF = await collection.countDocuments({ cpf: data.cpf })

        if (numberOfTicketsWithThisCPF === 4) return NextResponse.json({ error: 'CPF já registrado em 4 tickets', status: 400 })

        await collection.updateOne(
            { _id: ObjectId.createFromHexString(id) },
            {
                $set: {
                    name: data.name,
                    cpf: data.cpf,
                    seat: Number(data.seat),
                    createdAt: data.createdAt,
                    updatedAt: new Date()
                }
            }
        )

        return NextResponse.json({ message: 'Ingresso atualizado com sucesso', status: 200 })
    } catch (error) {
        console.log('Erro ao realizar PUT do ingresso: ', error)
        return NextResponse.json({ error: 'Erro ao atualizar ingresso', status: 500 })
    }
}
