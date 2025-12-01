import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/jwt_";

export async function middleware(request: NextRequest) {
    const tokenExists = request.cookies.get('accessToken')?.value

    if (!tokenExists) return NextResponse.redirect(new URL('/admin/login', request.url))

    const tokenIsValid = await verifyToken(tokenExists)

    if (!tokenIsValid.valid) return NextResponse.redirect(new URL('/', request.url))

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/dashboard']
}
