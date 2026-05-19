import { unlock } from './actions'

// Next.js App Router 컨벤션: searchParams는 자동으로 props로 전달됨
type PageProps = {
    searchParams: Promise<{ error?: string }>
}

export default async function UnlockPage({ searchParams }: PageProps) {
    // Next.js 15부터 searchParams는 Promise (await 필요)
    const params = await searchParams
    const hasError = params.error === 'wrong'

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-sm">
                {/* 아이콘 + 제목 */}
                <div className="mb-8 text-center">
                    <div className="mb-4 text-5xl">🔒</div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Gantt 잠금 해제
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                        비밀번호를 입력해주세요
                    </p>
                </div>

                {/* 폼 */}
                <form action={unlock} className="space-y-4">
                    <input
                        type="password"
                        name="password"
                        placeholder="비밀번호"
                        required
                        autoFocus
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />

                    {/* 에러 메시지 (틀렸을 때만) */}
                    {hasError && (
                        <p className="text-sm text-red-600">
                            비밀번호가 올바르지 않습니다
                        </p>
                    )}

                    <button
                        type="submit"
                        className="w-full rounded-lg bg-blue-600 px-4 py-3 text-base font-medium text-white transition hover:bg-blue-700 active:bg-blue-800"
                    >
                        잠금 해제
                    </button>
                </form>
            </div>
        </main>
    )
}