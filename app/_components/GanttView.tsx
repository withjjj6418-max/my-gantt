'use client'

import { Gantt, Task as GanttTask, ViewMode } from 'gantt-task-react'
import 'gantt-task-react/dist/index.css'
import type { Task } from '@/lib/types/db'

type Props = {
    tasks: Task[]
}

// DB의 Task → gantt-task-react의 Task 변환
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
    // DB task가 비어있으면 안내 메시지
    if (tasks.length === 0) {
        return (
            <div className="flex h-96 items-center justify-center text-gray-500">
                아직 등록된 task가 없습니다
            </div>
        )
    }

    const ganttTasks = tasks.map(toGanttTask)

    return (
        <div className="w-full overflow-x-auto">
            <Gantt
                tasks={ganttTasks}
                viewMode={ViewMode.Week}
                locale="ko"
                columnWidth={60}
                listCellWidth="155px"
            />
        </div>
    )
}
