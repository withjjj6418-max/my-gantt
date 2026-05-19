'use client'

import { useState, useTransition } from 'react'
import { Gantt, Task as GanttTask, ViewMode } from 'gantt-task-react'
import 'gantt-task-react/dist/index.css'
import type { Task } from '@/lib/types/db'
import { updateTask } from '@/lib/db/tasks'
import TaskEditModal from './TaskEditModal'

type Props = {
    tasks: Task[]
}

// DB Date 문자열을 'YYYY-MM-DD'로 변환
function toDateString(date: Date): string {
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
}

// DB Task → Gantt 라이브러리 Task
function toGanttTask(t: Task): GanttTask {
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
            progressColor: '#3b82f6',
            progressSelectedColor: '#2563eb',
            backgroundColor: '#93c5fd',
            backgroundSelectedColor: '#60a5fa',
        },
    }
}

export default function GanttView({ tasks }: Props) {
    const [, startTransition] = useTransition()
    const [editingTask, setEditingTask] = useState<Task | null>(null)

    // 빠른 task ID → DB Task 검색용 Map
    const taskMap = new Map(tasks.map((t) => [t.id, t]))

    // 막대 드래그로 날짜 변경
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

    // 진행률 드래그
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

    // 더블클릭 → 모달 열기
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

    const ganttTasks = tasks.map(toGanttTask)

    return (
        <>
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

            {/* 수정 모달 (편집할 task가 있을 때만) */}
            {editingTask && (
                <TaskEditModal
                    task={editingTask}
                    onClose={() => setEditingTask(null)}
                />
            )}
        </>
    )
}