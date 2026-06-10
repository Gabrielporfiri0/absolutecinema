import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/jwt_";
import { movieService } from "./services/movie";

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

    // proteger página de seleção de assentos caso não exista filme em cartaz
    if (path.startsWith('/filme')) {
        try {
            const response = await movieService.get()

            if (response.status === 200 && response.data.movies__.length > 0) {
                return NextResponse.next()
            } else {
                return NextResponse.redirect(
                    new URL('/', request.url)
                )
            }
        } catch (error) {
            return NextResponse.redirect(
                new URL('/', request.url)
            )
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/admin/login',
        '/admin/dashboard/:path*',
        '/filme/:path*'
    ]
}