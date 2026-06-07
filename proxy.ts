import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/jwt_";

export async function proxy(request: NextRequest) {
    const token = request.cookies.get('accessToken')?.value
    const path = request.nextUrl.pathname

    // usuário está tentando acessar login
    if (path === '/admin/login') {
        if (!token) {
            return NextResponse.next()
        }

        const tokenIsValid = await verifyToken(token)

        if (tokenIsValid.valid) {
            return NextResponse.redirect(
                new URL('/admin/dashboard', request.url)
            )
        }

        return NextResponse.next()
    }

    // proteger dashboard
    if (path.startsWith('/admin/dashboard')) {
        if (!token) {
            return NextResponse.redirect(
                new URL('/admin/login', request.url)
            )
        }

        const tokenIsValid = await verifyToken(token)

        if (!tokenIsValid.valid) {
            return NextResponse.redirect(
                new URL('/admin/login', request.url)
            )
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/admin/login',
        '/admin/dashboard/:path*'
    ]
}