// 사이트 접근 인증용 쿠키 서명/검증 유틸 (Edge Runtime 호환)
// Web Crypto API 사용 (Node.js의 crypto 모듈 대신)

// 쿠키 이름 (브라우저에 저장될 키)
export const AUTH_COOKIE_NAME = 'gantt_auth'

// 쿠키 유효기간 (30일)
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30

// 문자열을 Uint8Array로 변환
function toBytes(str: string): Uint8Array<ArrayBuffer> {
    const encoded = new TextEncoder().encode(str)
    // ArrayBuffer를 명시적으로 복사 (SharedArrayBuffer 가능성 제거)
    return new Uint8Array(encoded.buffer.slice(0))
}

// ArrayBuffer를 hex 문자열로 변환
function bufferToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
}

// HMAC-SHA256 해시 생성 (Web Crypto API)
async function createSignature(value: string, secret: string): Promise<string> {
    // 비밀키를 CryptoKey 객체로 import
    const key = await crypto.subtle.importKey(
        'raw',
        toBytes(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    )

    // value에 서명
    const signature = await crypto.subtle.sign('HMAC', key, toBytes(value))

    return bufferToHex(signature)
}

// 서명된 쿠키 값 생성: "value.signature" 형태
export async function signCookie(value: string): Promise<string> {
    const secret = process.env.AUTH_COOKIE_SECRET
    if (!secret) {
        throw new Error('AUTH_COOKIE_SECRET 환경변수가 설정되지 않았습니다')
    }
    const signature = await createSignature(value, secret)
    return `${value}.${signature}`
}

// 쿠키 값 검증: 서명이 일치하면 true
export async function verifyCookie(
    cookieValue: string | undefined
): Promise<boolean> {
    if (!cookieValue) return false

    const secret = process.env.AUTH_COOKIE_SECRET
    if (!secret) return false

    // "value.signature" 형태 파싱
    const lastDotIdx = cookieValue.lastIndexOf('.')
    if (lastDotIdx === -1) return false

    const value = cookieValue.slice(0, lastDotIdx)
    const signature = cookieValue.slice(lastDotIdx + 1)

    // 다시 서명 만들어서 비교
    const expectedSignature = await createSignature(value, secret)

    // 타이밍 공격 방지: 길이가 다르면 즉시 false
    if (signature.length !== expectedSignature.length) return false

    // 한 글자씩 XOR로 비교 (일정 시간 비교)
    let diff = 0
    for (let i = 0; i < signature.length; i++) {
        diff |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i)
    }
    return diff === 0
}