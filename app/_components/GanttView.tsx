'use client'

import { useEffect, useState, useTransition } from 'react'
import { Gantt, Task as GanttTask, ViewMode } from 'gantt-task-react'
import 'gantt-task-react/dist/index.css'
import type { Task, Account, Project, TaskStatus } from '@/lib/types/db'
import { STATUS_CONFIG } from '@/lib/types/db'
import { updateTask } from '@/lib/db/tasks'
import { getAccounts } from '@/lib/db/accounts'
import TaskEditModal from './TaskEditModal'

type Props = {
  tasks: Task[]
  projects: Project[]
}

// ============================================
// 색상 유틸
// ============================================

function toDateString(date: Date): string {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

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

function toGanttTask(
  t: Task,
  accountMap: Map<string, Account>,
  projectKey: string
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
    project: projectKey,
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
export default function GanttView({ tasks, projects }: Props) {
  const [, startTransition] = useTransition()
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])

  // 접힌 그룹의 ID 집합 (true = 접힘)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set()
  )

  useEffect(() => {
    getAccounts()
      .then(setAccounts)
      .catch((err) => console.error('계정 로드 실패:', err))
  }, [])

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

  // 그룹 헤더의 ▼ 화살표 클릭 시 호출됨
  function handleExpanderClick(ganttTask: GanttTask) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(ganttTask.id)) {
        next.delete(ganttTask.id) // 펼침
      } else {
        next.add(ganttTask.id) // 접힘
      }
      return next
    })
  }

  if (tasks.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center text-gray-500">
        아직 등록된 task가 없습니다
      </div>
    )
  }

  // ============================================
  // Gantt 데이터 조립
  // ============================================
  const ganttItems: GanttTask[] = []

  // 1. 프로젝트 헤더들 + 자식 task들
  for (const project of projects) {
    const projectTasks = tasks.filter((t) => t.project_id === project.id)
    if (projectTasks.length === 0) continue

    const isCollapsed = collapsedGroups.has(project.id)

    // 자식들의 시간 범위와 평균 진행률
    const starts = projectTasks.map((t) =>
      new Date(t.start_date).getTime()
    )
    const ends = projectTasks.map((t) => new Date(t.end_date).getTime())
    const avgProgress = Math.round(
      projectTasks.reduce((sum, t) => sum + t.progress, 0) /
        projectTasks.length
    )

    // 그룹 헤더
    ganttItems.push({
      id: project.id,
      name: project.name,
      start: new Date(Math.min(...starts)),
      end: new Date(Math.max(...ends)),
      progress: avgProgress,
      type: 'project',
      hideChildren: isCollapsed, // ← 우리 상태 반영
      isDisabled: true,
      styles: {
        backgroundColor: lighten(project.color, 0.3),
        backgroundSelectedColor: lighten(project.color, 0.2),
        progressColor: project.color,
        progressSelectedColor: darken(project.color, 0.1),
      },
    })

    // 자식 task들 (그룹 ID 연결)
    for (const t of projectTasks) {
      ganttItems.push(toGanttTask(t, accountMap, project.id))
    }
  }

  // 2. 프로젝트 미배정 task들
  const orphanTasks = tasks.filter((t) => !t.project_id)
  if (orphanTasks.length > 0) {
    const UNASSIGNED_ID = '__unassigned__'
    const isCollapsed = collapsedGroups.has(UNASSIGNED_ID)
    const starts = orphanTasks.map((t) =>
      new Date(t.start_date).getTime()
    )
    const ends = orphanTasks.map((t) => new Date(t.end_date).getTime())

    ganttItems.push({
      id: UNASSIGNED_ID,
      name: '(프로젝트 미배정)',
      start: new Date(Math.min(...starts)),
      end: new Date(Math.max(...ends)),
      progress: 0,
      type: 'project',
      hideChildren: isCollapsed,
      isDisabled: true,
      styles: {
        backgroundColor: '#e5e7eb',
        backgroundSelectedColor: '#d1d5db',
        progressColor: '#9ca3af',
        progressSelectedColor: '#6b7280',
      },
    })

    for (const t of orphanTasks) {
      ganttItems.push(toGanttTask(t, accountMap, UNASSIGNED_ID))
    }
  }

  return (
    <>
      <Legend />

      <div className="w-full overflow-x-auto">
        <Gantt
          tasks={ganttItems}
          viewMode={ViewMode.Week}
          locale="ko"
          columnWidth={60}
          listCellWidth="200px"
          onDateChange={handleDateChange}
          onProgressChange={handleProgressChange}
          onDoubleClick={handleDoubleClick}
          onExpanderClick={handleExpanderClick}
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

function Legend() {
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