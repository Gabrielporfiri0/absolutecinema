import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getAdminsCollection } from "../mongodb";
import { validateAuth } from "@/lib/auth-utils";
import { AdminDataToBeSentInRegister } from "@/types/admin";

export async function POST(request: NextRequest){
    try{
        let data: AdminDataToBeSentInRegister = {
            name: "",
            password: ""
        }

        try {
            data = await request.json()
            if (!data.name || !data.password) return NextResponse.json({ error: 'Por favor, forneça todos os dados', status: 400 })
        } catch (error) {
            return NextResponse.json({ error: 'Por favor, forneça todos os dados', status: 400 })
        }
        
        // const aValidTokenWasSent = validateAuth(request)

        // if(aValidTokenWasSent.status === 401) return NextResponse.json({ error: 'Token inválido', status: 401 })  

        const adminCollection = await getAdminsCollection()

        const userNameAlreadyExists = await adminCollection.findOne({ name: data.name})

        if(userNameAlreadyExists) return NextResponse.json({ error: 'O nome de usuário já existe', status: 400 })
        
        const hashedPassword = await bcrypt.hash(data.password, 10)

        const response = await adminCollection.insertOne({ 
            name: data.name, 
            password: hashedPassword,
            createdAt: Date(),
            updatedAt: Date()
        })

        return NextResponse.json({ message: 'Novo admin cadastrado com sucesso', id: response.insertedId, status: 201 })
    }catch(error){
        console.log('Erro ao registrar novo admin !!!')
        return NextResponse.json({ error: 'Erro ao tentar registrar novo admin', status: 500 })
    }
}