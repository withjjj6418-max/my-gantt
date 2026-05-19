'use client'

import { useState, useTransition } from 'react'
import { createTaskFromForm } from '@/lib/db/tasks'

export default function TaskCreateModal() {
    const [isOpen, setIsOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    // 오늘 날짜를 'YYYY-MM-DD' 형식으로
    const today = new Date().toISOString().split('T')[0]

    function handleSubmit(formData: FormData) {
        setError(null)
        startTransition(async () => {
            try {
                await createTaskFromForm(formData)
                setIsOpen(false)
            } catch (err) {
                setError(err instanceof Error ? err.message : '추가 실패')
            }
        })
    }

    return (
        <>
            {/* 트리거 버튼 */}
            <button
                onClick={() => setIsOpen(true)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
                + Task 추가
            </button>

            {/* 모달 */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={() => setIsOpen(false)}
                >
                    {/* 모달 내용 (클릭 이벤트 전파 막기) */}
                    <div
                        className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="mb-4 text-lg font-semibold text-gray-900">
                            새 Task 추가
                        </h2>

                        <form action={handleSubmit} className="space-y-4">
                            {/* 이름 */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    이름
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    autoFocus
                                    placeholder="예: 디자인 작업"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                />
                            </div>

                            {/* 타입 */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    타입
                                </label>
                                <select
                                    name="type"
                                    defaultValue="task"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                >
                                    <option value="task">Task</option>
                                    <option value="milestone">Milestone (이정표)</option>
                                </select>
                            </div>

                            {/* 시작일 */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    시작일
                                </label>
                                <input
                                    type="date"
                                    name="start_date"
                                    required
                                    defaultValue={today}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                />
                            </div>

                            {/* 종료일 */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    종료일
                                </label>
                                <input
                                    type="date"
                                    name="end_date"
                                    required
                                    defaultValue={today}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                />
                            </div>

                            {/* 에러 메시지 */}
                            {error && (
                                <p className="text-sm text-red-600">{error}</p>
                            )}

                            {/* 버튼들 */}
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    disabled={isPending}
                                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {isPending ? '추가 중...' : '추가'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}