import { getTasks } from '@/lib/db/tasks'
import GanttView from './_components/GanttView'
import TaskCreateModal from './_components/TaskCreateModal'

export default async function HomePage() {
  const tasks = await getTasks()

  return (
    <main className="min-h-screen bg-white p-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            📅 My Gantt
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            개인 스케줄 관리
          </p>
        </div>

        {/* 우측 상단에 추가 버튼 */}
        <TaskCreateModal />
      </header>

      <GanttView tasks={tasks} />
    </main>
  )
}