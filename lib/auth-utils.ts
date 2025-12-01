import { NextRequest } from "next/server";
import { verifyToken } from "./jwt_";

export async function validateAuth(request: NextRequest) {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.split(' ')[1]

    if (!token) return { error: 'Token necessário', status: 401 }

    const decoded_ = await verifyToken(token)

    if (decoded_.valid) return { ...decoded_, error: null, status: 200 }
    
    return { ...decoded_, error: 'Token inválido', status: 401 }

}
