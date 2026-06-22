'use client'

import { useEffect, useState, useTransition } from 'react'
import type { Account } from '@/lib/types/db'
import {
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
} from '@/lib/db/accounts'

// 색상 팔레트 (회사 도구 STATUS_CONFIG 참고)
const COLOR_PALETTE = [
  '#3b82f6', // blue
  '#22c55e', // green
  '#a855f7', // purple
  '#f97316', // orange
  '#ec4899', // pink
  '#0ea5e9', // sky
  '#eab308', // yellow
  '#ef4444', // red
  '#64748b', // slate
  '#14b8a6', // teal
]

export default function AccountManagerModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // 새 계정 추가용 입력 상태
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(COLOR_PALETTE[0])

  // 모달 열릴 때 계정 목록 로드
  useEffect(() => {
    if (isOpen) {
      loadAccounts()
    }
  }, [isOpen])

  async function loadAccounts() {
    try {
      const data = await getAccounts()
      setAccounts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '계정 목록 로드 실패')
    }
  }

  function handleAdd() {
    if (!newName.trim()) {
      setError('계정 이름을 입력해주세요')
      return
    }
    setError(null)

    startTransition(async () => {
      try {
        await createAccount({
          name: newName.trim(),
          color: newColor,
          display_order: accounts.length,
        })
        setNewName('')
        setNewColor(COLOR_PALETTE[0])
        await loadAccounts()
      } catch (err) {
        setError(err instanceof Error ? err.message : '추가 실패')
      }
    })
  }

  function handleUpdateColor(id: string, color: string) {
    startTransition(async () => {
      try {
        await updateAccount(id, { color })
        await loadAccounts()
      } catch (err) {
        setError(err instanceof Error ? err.message : '수정 실패')
      }
    })
  }

  function handleDelete(account: Account) {
    if (
      !confirm(
        `"${account.name}" 계정을 삭제하시겠습니까?\n\n이 계정에 배정된 task들은 "미배정" 상태가 됩니다.`
      )
    ) {
      return
    }

    startTransition(async () => {
      try {
        await deleteAccount(account.id)
        await loadAccounts()
      } catch (err) {
        setError(err instanceof Error ? err.message : '삭제 실패')
      }
    })
  }

  return (
    <>
      {/* 트리거 버튼 */}
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
      >
        👥 계정 관리
      </button>

      {/* 모달 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                계정 관리
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* 새 계정 추가 폼 */}
            <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div className="mb-2 text-xs font-medium text-gray-600">
                새 계정 추가
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="예: A, B, 메인"
                  className="flex-1 rounded border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAdd()
                  }}
                />
                <button
                  onClick={handleAdd}
                  disabled={isPending}
                  className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  추가
                </button>
              </div>
              {/* 색상 선택 */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewColor(c)}
                    className={`h-6 w-6 rounded-full transition ${
                      newColor === c
                        ? 'ring-2 ring-gray-900 ring-offset-1'
                        : ''
                    }`}
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* 계정 목록 */}
            <div className="space-y-2">
              {accounts.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-500">
                  아직 등록된 계정이 없습니다
                </div>
              ) : (
                accounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2"
                  >
                    {/* 색상 배지 */}
                    <div
                      className="h-8 w-8 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: account.color }}
                    />

                    {/* 이름 */}
                    <div className="flex-1 text-sm font-medium text-gray-900">
                      {account.name}
                    </div>

                    {/* 색상 변경 */}
                    <div className="flex gap-1">
                      {COLOR_PALETTE.slice(0, 5).map((c) => (
                        <button
                          key={c}
                          onClick={() => handleUpdateColor(account.id, c)}
                          className={`h-4 w-4 rounded-full transition ${
                            account.color === c
                              ? 'ring-1 ring-gray-900 ring-offset-1'
                              : ''
                          }`}
                          style={{ backgroundColor: c }}
                          title={c}
                        />
                      ))}
                    </div>

                    {/* 삭제 버튼 */}
                    <button
                      onClick={() => handleDelete(account)}
                      disabled={isPending}
                      className="rounded p-1 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      title="삭제"
                    >
                      🗑️
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* 닫기 버튼 */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}