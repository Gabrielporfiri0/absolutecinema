import { NextResponse, NextRequest } from 'next/server'
import { getTicketsCollection } from '../mongodb'
import { ObjectId } from 'mongodb'

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
){
    try{
        const { id } = await context.params

        if(!ObjectId.isValid(id)) return NextResponse.json({ error: 'ID inválido', status: 400 })

        const collection = await getTicketsCollection()
        const tickeT = await collection.findOne({ _id: ObjectId.createFromHexString(id) })
        
        if(!tickeT) return NextResponse.json({ error: 'Ingresso não encontrado', status: 404 })

        return NextResponse.json({
            message: 'Ingresso encontrado com sucesso',
            ticket_data: tickeT,
            status: 200
        })
    }catch(error){
        console.log('Erro no GET detalhado de um ingresso: ', error)
        return NextResponse.json({ error: 'Erro ao buscar dados de um ingresso específico', status: 500 })
    }
}
