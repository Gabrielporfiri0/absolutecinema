import { validateAuth } from "@/lib/auth-utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const aValidTokenWasSent = await validateAuth(request)

        if (aValidTokenWasSent.status === 401) return NextResponse.json({ error: 'Token inválido', status: 401 })

        const response = NextResponse.json({ success: true, status: 200 });

        response.cookies.set({
            name: 'accessToken',
            value: '',
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 3600,
            path: '/',
        });

        return response;
    } catch (error) {
        console.log('Erro ao deslogar admin: ', error);
        return NextResponse.json({ error: 'Erro ao deslogar admin', status: 500 });
    }
}