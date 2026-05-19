import { getTasks } from '@/lib/db/tasks'
import GanttView from './_components/GanttView'

export default async function HomePage() {
  // 서버에서 task 목록 가져오기
  const tasks = await getTasks()

  return (
    <main className="min-h-screen bg-white p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          📅 My Gantt
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          개인 스케줄 관리
        </p>
      </header>

      <GanttView tasks={tasks} />
    </main>
  )
}