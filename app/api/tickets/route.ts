import { NextRequest, NextResponse } from 'next/server'
import { getTicketsCollection } from './mongodb'
import { Ticket } from '@/types/ticket'
import { ObjectId } from 'mongodb'

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

export async function POST(request: NextRequest) {
    try {
        const data: Ticket = await request.json()

        const collection = await getTicketsCollection()

        if (data) {
            const sentCpfAlreadyExists = await collection.findOne({ cpf: data.cpf })
            const sentSeatAlreadyRegistered = await collection.findOne({ seat: data.seat })

            if (sentCpfAlreadyExists) return NextResponse.json({ error: 'O CPF já existe', status: 400 })
            if (sentSeatAlreadyRegistered) return NextResponse.json({ error: 'O Assento já foi reservado', status: 400 })

            const newTicket: Omit<Ticket, '_id'> = {
                name: data.name,
                cpf: data.cpf,
                seat: data.seat,
                createdAt: new Date(),
                updatedAt: new Date()
            }

            const response = await collection.insertOne(newTicket)
            return NextResponse.json({ message: "Ingresso cadastrado com sucesso", id: response.insertedId, status: 201 })
        }

        return NextResponse.json({ error: 'Algum dado não foi fornecido', status: 400 })
    } catch (error) {
        console.log('Erro ao realizar POST do ingresso: ', error)
        return NextResponse.json({ error: 'Erro ao adicionar ingresso', status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const data = await request.json()

        if (data) {
            const id = data.id

            if (id) {
                if (!ObjectId.isValid(id)) return NextResponse.json({ error: 'ID inválido', status: 400 })

                const collection = await getTicketsCollection()

                const ticket_ = await collection.findOne({ _id: ObjectId.createFromHexString(id) })

                if (!ticket_) return NextResponse.json({ error: 'Ingresso não encontrado', status: 404 })

                await collection.deleteOne({ _id: ObjectId.createFromHexString(id) })

                return NextResponse.json({ message: 'Ingresso deletado com sucesso', status: 200 })
            }
        }

        return NextResponse.json({ error: 'Algum dado não foi fornecido', status: 400 })
    } catch (error) {
        console.log('Erro ao realizar DELETE do ingresso: ', error)
        return NextResponse.json({ error: 'Erro ao deletar ingresso', status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const data: Ticket = await request.json()

        if(data) {
            const id = data._id

            if(id) {
                if (!ObjectId.isValid(id)) return NextResponse.json({ error: 'ID inválido', status: 400 })

                const collection = await getTicketsCollection()

                const sentCpfAlreadyExists = await collection.findOne({ cpf: data.cpf })
                const sentSeatAlreadyRegistered = await collection.findOne({ seat: data.seat })

                if (sentCpfAlreadyExists) return NextResponse.json({ error: 'O CPF já existe', status: 400 })
                if (sentSeatAlreadyRegistered) return NextResponse.json({ error: 'O Assento já foi reservado', status: 400 })

                const updatedFields: Ticket = {
                    name: data.name,
                    cpf: data.cpf,
                    seat: data.seat,
                    createdAt: data.createdAt,
                    updatedAt: new Date()
                }

                const { modifiedCount } = await collection.updateOne(
                    { _id: ObjectId.createFromHexString(id) },
                    { $set: updatedFields }
                )

                if (modifiedCount === 0) return NextResponse.json({ error: 'Ingresso não encontrado', status: 404 })

                return NextResponse.json({ message: 'Ingresso atualizado com sucesso', status: 200 })
            }
        }

        return NextResponse.json({ error: 'Algum dado não foi fornecido', status: 400 })
    } catch (error) {
        console.log('Erro ao realizar PUT do ingresso: ', error)
        return NextResponse.json({ error: 'Erro ao atualizar ingresso', status: 500 })
    }
}
