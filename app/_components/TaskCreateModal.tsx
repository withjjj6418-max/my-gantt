'use client'

import { useEffect, useState, useTransition } from 'react'
import { createTaskFromForm } from '@/lib/db/tasks'
import { getAccounts } from '@/lib/db/accounts'
import { getProjects } from '@/lib/db/projects'
import type { Account, Project, TaskStatus } from '@/lib/types/db'
import { STATUS_CONFIG } from '@/lib/types/db'

type Props = {
  defaultProjectId?: string | null
}

export default function TaskCreateModal({
  defaultProjectId,
}: Props = {}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [projects, setProjects] = useState<Project[]>([])

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    if (isOpen) {
      getAccounts()
        .then(setAccounts)
        .catch((err) => console.error('계정 로드 실패:', err))
      getProjects()
        .then(setProjects)
        .catch((err) => console.error('프로젝트 로드 실패:', err))
    }
  }, [isOpen])

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
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
      >
        + Task 추가
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              새 Task 추가
            </h2>

            <form action={handleSubmit} className="space-y-3">
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

              {/* 프로젝트 — 사용자가 직접 선택 가능 */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  프로젝트
                </label>
                <select
                  name="project_id"
                  defaultValue={defaultProjectId ?? ''}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">미배정</option>
                  {projects.map((proj) => (
                    <option key={proj.id} value={proj.id}>
                      {proj.name}
                    </option>
                  ))}
                </select>
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
                  <option value="milestone">Milestone</option>
                </select>
              </div>

              {/* 상태 */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  상태
                </label>
                <select
                  name="status"
                  defaultValue="ready"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map(
                    (key) => (
                      <option key={key} value={key}>
                        {STATUS_CONFIG[key].label}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* 계정 */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  계정
                </label>
                <select
                  name="account_id"
                  defaultValue=""
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">미배정</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
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

              {error && <p className="text-sm text-red-600">{error}</p>}

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