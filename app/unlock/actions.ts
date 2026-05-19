'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import {
    AUTH_COOKIE_NAME,
    AUTH_COOKIE_MAX_AGE,
    signCookie,
} from '@/lib/auth/cookie'

export async function unlock(formData: FormData) {
    const password = formData.get('password') as string
    const expected = process.env.SITE_PASSWORD

    if (!expected) {
        throw new Error('SITE_PASSWORD 환경변수가 설정되지 않았습니다')
    }

    if (password !== expected) {
        redirect('/unlock?error=wrong')
    }

    // await 추가!
    const signedValue = await signCookie('unlocked')
    const cookieStore = await cookies()
    cookieStore.set(AUTH_COOKIE_NAME, signedValue, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: AUTH_COOKIE_MAX_AGE,
        path: '/',
    })

    redirect('/')
}

export async function lock() {
    const cookieStore = await cookies()
    cookieStore.delete(AUTH_COOKIE_NAME)
    redirect('/unlock')
}