import { validateAuth } from "@/lib/auth-utils";
import { NextRequest, NextResponse } from "next/server";
import { getAdminsCollection } from "../mongodb";

export async function GET(request: NextRequest) {
    try {
        const aValidTokenWasSent = await validateAuth(request)

        if(aValidTokenWasSent.status === 401) return NextResponse.json({ error: 'Token inválido', status: 401 })  
        
        const adminsCollection = await getAdminsCollection()

        const admins_ = await adminsCollection.find().toArray()

        return NextResponse.json({
            message: 'Admins encontrados com sucesso',
            admin__: admins_,
            status: 200
        })
    } catch (error) {
        console.log('Erro ao buscar todos os admins: ', error)
        return NextResponse.json({ error: 'Erro ao buscar admins', status: 500 })
    }
}
