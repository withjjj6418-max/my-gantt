'use client'

import { useEffect, useState, useTransition } from 'react'
import { Gantt, Task as GanttTask, ViewMode } from 'gantt-task-react'
import 'gantt-task-react/dist/index.css'
import type { Task, Account, TaskStatus } from '@/lib/types/db'
import { STATUS_CONFIG } from '@/lib/types/db'
import { updateTask } from '@/lib/db/tasks'
import { getAccounts } from '@/lib/db/accounts'
import TaskEditModal from './TaskEditModal'

type Props = {
  tasks: Task[]
}

// ============================================
// 색상 유틸 함수들
// ============================================

// Date → 'YYYY-MM-DD' (로컬 기준)
function toDateString(date: Date): string {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

// HEX 색상을 약간 어둡게 (선택 시 색용)
function darken(hex: string, amount = 0.2): string {
  const num = parseInt(hex.replace('#', ''), 16)
  let r = (num >> 16) & 0xff
  let g = (num >> 8) & 0xff
  let b = num & 0xff
  r = Math.max(0, Math.floor(r * (1 - amount)))
  g = Math.max(0, Math.floor(g * (1 - amount)))
  b = Math.max(0, Math.floor(b * (1 - amount)))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

// HEX 색상을 약간 밝게 (배경용)
function lighten(hex: string, amount = 0.4): string {
  const num = parseInt(hex.replace('#', ''), 16)
  let r = (num >> 16) & 0xff
  let g = (num >> 8) & 0xff
  let b = num & 0xff
  r = Math.min(255, Math.floor(r + (255 - r) * amount))
  g = Math.min(255, Math.floor(g + (255 - g) * amount))
  b = Math.min(255, Math.floor(b + (255 - b) * amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

// ============================================
// task의 색상 결정 — 상태 기반
// ============================================
function resolveColor(
  task: Task,
  _accountMap: Map<string, Account>
): { base: string; progress: string } {
  const statusColor = STATUS_CONFIG[task.status].color
  return {
    base: lighten(statusColor, 0.4),
    progress: statusColor,
  }
}

// DB Task → Gantt 라이브러리 Task (색상 적용)
function toGanttTask(
  t: Task,
  accountMap: Map<string, Account>
): GanttTask {
  const colors = resolveColor(t, accountMap)
  const selectedColors = {
    base: darken(colors.base, 0.1),
    progress: darken(colors.progress, 0.1),
  }

  return {
    id: t.id,
    name: t.name,
    start: new Date(t.start_date),
    end: new Date(t.end_date),
    progress: t.progress,
    type: t.type === 'milestone' ? 'milestone' : 'task',
    project: t.project_id ?? undefined,
    isDisabled: false,
    styles: {
      backgroundColor: colors.base,
      backgroundSelectedColor: selectedColors.base,
      progressColor: colors.progress,
      progressSelectedColor: selectedColors.progress,
    },
  }
}

// ============================================
// 메인 컴포넌트
// ============================================
export default function GanttView({ tasks }: Props) {
  const [, startTransition] = useTransition()
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])

  // 계정 목록 로드
  useEffect(() => {
    getAccounts()
      .then(setAccounts)
      .catch((err) => console.error('계정 로드 실패:', err))
  }, [])

  // 빠른 조회용 Map
  const taskMap = new Map(tasks.map((t) => [t.id, t]))
  const accountMap = new Map(accounts.map((a) => [a.id, a]))

  function handleDateChange(ganttTask: GanttTask) {
    const dbTask = taskMap.get(ganttTask.id)
    if (!dbTask) return

    startTransition(async () => {
      try {
        await updateTask(dbTask.id, {
          start_date: toDateString(ganttTask.start),
          end_date: toDateString(ganttTask.end),
        })
      } catch (err) {
        console.error('날짜 변경 실패:', err)
        alert('날짜 변경에 실패했습니다')
      }
    })
  }

  function handleProgressChange(ganttTask: GanttTask) {
    const dbTask = taskMap.get(ganttTask.id)
    if (!dbTask) return

    startTransition(async () => {
      try {
        await updateTask(dbTask.id, {
          progress: Math.round(ganttTask.progress),
        })
      } catch (err) {
        console.error('진행률 변경 실패:', err)
        alert('진행률 변경에 실패했습니다')
      }
    })
  }

  function handleDoubleClick(ganttTask: GanttTask) {
    const dbTask = taskMap.get(ganttTask.id)
    if (dbTask) {
      setEditingTask(dbTask)
    }
  }

  if (tasks.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center text-gray-500">
        아직 등록된 task가 없습니다
      </div>
    )
  }

  const ganttTasks = tasks.map((t) => toGanttTask(t, accountMap))

  return (
    <>
      {/* 범례 (legend) */}
      <Legend accounts={accounts} />

      <div className="w-full overflow-x-auto">
        <Gantt
          tasks={ganttTasks}
          viewMode={ViewMode.Week}
          locale="ko"
          columnWidth={60}
          listCellWidth="155px"
          onDateChange={handleDateChange}
          onProgressChange={handleProgressChange}
          onDoubleClick={handleDoubleClick}
        />
      </div>

      {editingTask && (
        <TaskEditModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
        />
      )}
    </>
  )
}

// ============================================
// 범례 컴포넌트 (상태 색상 가이드)
// ============================================
function Legend({ accounts: _accounts }: { accounts: Account[] }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-xs">
      <div className="font-medium text-gray-600">상태:</div>

      {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((key) => {
        const config = STATUS_CONFIG[key]
        return (
          <div key={key} className="flex items-center gap-1.5">
            <div
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: config.color }}
            />
            <span className="text-gray-700">{config.label}</span>
          </div>
        )
      })}
    </div>
  )
}