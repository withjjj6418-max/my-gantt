'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import type { Project } from '@/lib/types/db'
import { createProject, deleteProject } from '@/lib/db/projects'

type Props = {
  projects: Project[]
}

// 색상 팔레트 (계정과 동일)
const COLOR_PALETTE = [
  '#3b82f6', '#22c55e', '#a855f7', '#f97316', '#ec4899',
  '#0ea5e9', '#eab308', '#ef4444', '#64748b', '#14b8a6',
]

export default function ProjectSidebar({ projects }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(COLOR_PALETTE[0])

  // 현재 선택된 프로젝트 id
  const currentProjectId = searchParams.get('project')

  // 프로젝트 선택 (URL 갱신)
  function selectProject(projectId: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (projectId === null) {
      params.delete('project')
    } else {
      params.set('project', projectId)
    }
    const query = params.toString()
    router.push(query ? `/?${query}` : '/')
  }

  // 새 프로젝트 추가
  function handleAdd() {
    if (!newName.trim()) {
      setError('이름을 입력해주세요')
      return
    }
    setError(null)

    startTransition(async () => {
      try {
        const project = await createProject({
          name: newName.trim(),
          color: newColor,
        })
        setNewName('')
        setNewColor(COLOR_PALETTE[0])
        setIsAdding(false)
        // 새로 만든 프로젝트로 자동 이동
        selectProject(project.id)
      } catch (err) {
        setError(err instanceof Error ? err.message : '추가 실패')
      }
    })
  }

  // 프로젝트 삭제
  function handleDelete(project: Project) {
    if (
      !confirm(
        `"${project.name}" 프로젝트를 삭제하시겠습니까?\n\n⚠️ 이 프로젝트에 속한 모든 task도 함께 삭제됩니다.`
      )
    ) {
      return
    }

    startTransition(async () => {
      try {
        await deleteProject(project.id)
        // 삭제한 프로젝트가 현재 선택된 거면 전체로 이동
        if (currentProjectId === project.id) {
          selectProject(null)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '삭제 실패')
      }
    })
  }

  return (
    <aside className="w-56 flex-shrink-0 border-r border-gray-200 bg-gray-50 p-3">
      <h2 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
        프로젝트
      </h2>

      {/* 전체 */}
      <button
        onClick={() => selectProject(null)}
        className={`mb-1 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition ${
          currentProjectId === null
            ? 'bg-blue-100 font-medium text-blue-900'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <span>📁</span>
        <span className="flex-1 text-left">전체</span>
      </button>

      {/* 구분선 */}
      <div className="my-2 border-t border-gray-200" />

      {/* 프로젝트 목록 */}
      <div className="space-y-1">
        {projects.length === 0 ? (
          <div className="px-2 py-2 text-xs text-gray-400">
            아직 프로젝트가 없습니다
          </div>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className="group flex items-center gap-1"
            >
              <button
                onClick={() => selectProject(project.id)}
                className={`flex flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-sm transition ${
                  currentProjectId === project.id
                    ? 'bg-blue-100 font-medium text-blue-900'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div
                  className="h-3 w-3 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                <span className="flex-1 truncate text-left">
                  {project.name}
                </span>
              </button>

              {/* 호버 시 보이는 삭제 버튼 */}
              <button
                onClick={() => handleDelete(project)}
                disabled={isPending}
                className="rounded p-1 text-gray-400 opacity-0 transition group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                title="삭제"
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>

      {/* 구분선 */}
      <div className="my-2 border-t border-gray-200" />

      {/* 새 프로젝트 추가 */}
      {isAdding ? (
        <div className="space-y-2 rounded-md bg-white p-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="프로젝트 이름"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd()
              if (e.key === 'Escape') setIsAdding(false)
            }}
            className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
          />
          <div className="flex flex-wrap gap-1">
            {COLOR_PALETTE.map((c) => (
              <button
                key={c}
                onClick={() => setNewColor(c)}
                className={`h-5 w-5 rounded-full transition ${
                  newColor === c
                    ? 'ring-2 ring-gray-900 ring-offset-1'
                    : ''
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-1">
            <button
              onClick={handleAdd}
              disabled={isPending}
              className="flex-1 rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              추가
            </button>
            <button
              onClick={() => {
                setIsAdding(false)
                setError(null)
              }}
              disabled={isPending}
              className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-600 transition hover:bg-gray-100"
        >
          <span>➕</span>
          <span>새 프로젝트</span>
        </button>
      )}
    </aside>
  )
}