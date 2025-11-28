import { NextRequest, NextResponse } from "next/server";
import { getAdminsCollection } from "../mongodb";
import { ObjectId } from "mongodb";
import { validateAuth } from "@/lib/auth-utils";
import { Admin } from "@/types/admin";
import bcrypt from "bcryptjs";

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params

        if (!id) return NextResponse.json({ error: 'ID não fornecido', status: 400 })

        if (!/^[0-9a-fA-F]{24}$/.test(id)) return NextResponse.json({ error: 'ID inválido', status: 400 })

        const aValidTokenWasSent = validateAuth(request)

        if (aValidTokenWasSent.status === 401) return NextResponse.json({ error: 'Token inválido', status: 401 })

        const adminsCollection = await getAdminsCollection()

        const admin_ = await adminsCollection.findOne({ _id: ObjectId.createFromHexString(id) })

        if (!admin_) return NextResponse.json({ error: 'Admin não encontrado', status: 404 })

        await adminsCollection.deleteOne({ _id: ObjectId.createFromHexString(id) })

        return NextResponse.json({ message: 'Admin deletado com sucesso', status: 200 })
    } catch (error) {
        console.log('Erro ao deletar admin: ', error)
        return NextResponse.json({ error: 'Erro ao deletar admin', status: 500 })
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

        if (aValidTokenWasSent.status === 401) return NextResponse.json({ error: 'Token inválido', status: 401 })

        let data: Admin = {
            name: "",
            password: "",
            createdAt: "",
            updatedAt: ""
        }

        try {
            data = await request.json()
            if (!data.name || !data.password || !data.createdAt || !data.updatedAt) return NextResponse.json({ error: 'Por favor, forneça todos os dados', status: 400 })
        } catch (error) {
            return NextResponse.json({ error: 'Por favor, forneça todos os dados', status: 400 })
        }

        const adminsCollection = await getAdminsCollection()

        const adminExists = await adminsCollection.findOne({ _id: ObjectId.createFromHexString(id) })

        if (!adminExists) return NextResponse.json({ error: 'Admin não encontrado', status: 404 })

        const sentUserNameAlreadyExists = await adminsCollection.findOne({ name: data.name })

        if (sentUserNameAlreadyExists) {
            if (sentUserNameAlreadyExists._id.toString() !== adminExists._id.toString()) 
                return NextResponse.json({ error: 'Esse nome de usuário já existe', status: 400 })
        }

        const hashedPassword = await bcrypt.hash(data.password, 10)

        const updatedFields: Admin = {
            name: data.name,
            password: hashedPassword,
            createdAt: data.createdAt,
            updatedAt: Date()
        }

        await adminsCollection.updateOne(
            { _id: ObjectId.createFromHexString(id) },
            { $set: updatedFields }
        )

        return NextResponse.json({ message: 'Admin atualizado com sucesso', status: 200 })
    } catch (error) {
        console.log('Erro ao atualizar admin: ', error)
        return NextResponse.json({ error: 'Erro ao atualizar admin', status: 500 })
    }
}

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params

        if (!id) return NextResponse.json({ error: 'ID não fornecido', status: 400 })

        if (!/^[0-9a-fA-F]{24}$/.test(id)) return NextResponse.json({ error: 'ID inválido', status: 400 })

        const aValidTokenWasSent = validateAuth(request)

        if (aValidTokenWasSent.status === 401) return NextResponse.json({ error: 'Token inválido', status: 401 })

        const adminsCollection = await getAdminsCollection()

        const adminExists = await adminsCollection.findOne({ _id: ObjectId.createFromHexString(id) })

        if (!adminExists) return NextResponse.json({ error: 'Admin não encontrado', status: 404 })

        return NextResponse.json({
            message: 'Admin encontrado com sucesso',
            data_: adminExists,
            status: 200
        })
    } catch (error) {
        console.log('Erro ao buscar dados de admin !!!')
        return NextResponse.json({ error: 'Erro ao tentar buscar dados de admin', status: 500 })
    }
}
