import { NextResponse, type NextRequest } from 'next/server'
import { AUTH_COOKIE_NAME, verifyCookie } from '@/lib/auth/cookie'

const PUBLIC_PATHS = ['/unlock']

// async로 변경!
export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
        return NextResponse.next()
    }

    const authCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value
    // await 추가!
    const isAuthenticated = await verifyCookie(authCookie)

    if (!isAuthenticated) {
        const url = request.nextUrl.clone()
        url.pathname = '/unlock'
        return NextResponse.redirect(url)
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}