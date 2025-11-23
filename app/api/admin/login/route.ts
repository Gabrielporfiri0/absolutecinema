import { NextRequest, NextResponse } from "next/server";
import { getAdminsCollection } from "../mongodb";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/jwt_";
import { AdminDataToBeSentInRegister } from "@/types/admin";

export async function POST(request: NextRequest){
    try{
        let data:AdminDataToBeSentInRegister = {
            name: '',
            password: ''
        }

        try {
            data = await request.json()
            if (!data.name || !data.password) return NextResponse.json({ error: 'Por favor, forneça todos os dados', status: 400 })
        } catch (error) {
            return NextResponse.json({ error: 'Por favor, forneça todos os dados', status: 400 })
        }

        const adminsCollection = await getAdminsCollection()

        const adminExists = await adminsCollection.findOne({ name: data.name })

        if(!adminExists) return NextResponse.json({ error: 'Usuário não encontrado', status: 404 })
        
        const isValidPassword = await bcrypt.compare(data.password, adminExists.password)

        if(!isValidPassword) return NextResponse.json({ error: 'Credenciais inválidas', status: 401 })

        const token_ = generateToken({ userId: adminExists._id, userName: adminExists.name, role: 'admin' })

        return NextResponse.json({ message: 'Login realizado com sucesso', token: token_, status: 200 })
    }catch(error){
        console.log('Erro ao realizar login do admin: ', error)
        return NextResponse.json({ error: 'Erro ao realizar login do admin', status: 500 })
    }
}