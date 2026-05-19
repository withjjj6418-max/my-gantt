'use client'

import { useState, useTransition } from 'react'
import type { Task } from '@/lib/types/db'
import { updateTask, deleteTask } from '@/lib/db/tasks'

type Props = {
    task: Task
    onClose: () => void
}

export default function TaskEditModal({ task, onClose }: Props) {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    // 폼 상태 (controlled component)
    const [name, setName] = useState(task.name)
    const [type, setType] = useState<'task' | 'milestone'>(task.type)
    const [startDate, setStartDate] = useState(task.start_date)
    const [endDate, setEndDate] = useState(task.end_date)
    const [progress, setProgress] = useState(task.progress)

    function handleSave() {
        setError(null)
        startTransition(async () => {
            try {
                await updateTask(task.id, {
                    name,
                    type,
                    start_date: startDate,
                    end_date: type === 'milestone' ? startDate : endDate,
                    progress,
                })
                onClose()
            } catch (err) {
                setError(err instanceof Error ? err.message : '수정 실패')
            }
        })
    }

    function handleDelete() {
        if (!confirm(`"${task.name}"을(를) 삭제하시겠습니까?`)) return

        startTransition(async () => {
            try {
                await deleteTask(task.id)
                onClose()
            } catch (err) {
                setError(err instanceof Error ? err.message : '삭제 실패')
            }
        })
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                    Task 수정
                </h2>

                <div className="space-y-4">
                    {/* 이름 */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            이름
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />
                    </div>

                    {/* 타입 */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            타입
                        </label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as 'task' | 'milestone')}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        >
                            <option value="task">Task</option>
                            <option value="milestone">Milestone</option>
                        </select>
                    </div>

                    {/* 시작일 */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            시작일
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />
                    </div>

                    {/* 종료일 (milestone이면 숨김) */}
                    {type === 'task' && (
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                종료일
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            />
                        </div>
                    )}

                    {/* 진행률 (task만) */}
                    {type === 'task' && (
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                진행률: {progress}%
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={progress}
                                onChange={(e) => setProgress(Number(e.target.value))}
                                className="w-full"
                            />
                        </div>
                    )}

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    {/* 버튼들 */}
                    <div className="flex justify-between gap-2 pt-2">
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isPending}
                            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                        >
                            삭제
                        </button>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isPending}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={isPending}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isPending ? '저장 중...' : '저장'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}