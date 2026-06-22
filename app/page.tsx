import { getTasks, getTasksByProject } from '@/lib/db/tasks'
import { getProjects } from '@/lib/db/projects'
import GanttView from './_components/GanttView'
import TaskCreateModal from './_components/TaskCreateModal'
import AccountManagerModal from './_components/AccountManagerModal'
import ProjectSidebar from './_components/ProjectSidebar'

type PageProps = {
  searchParams: Promise<{ project?: string }>
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams
  const selectedProjectId = params.project ?? null

  const [projects, tasks] = await Promise.all([
    getProjects(),
    selectedProjectId
      ? getTasksByProject(selectedProjectId)
      : getTasks(),
  ])

  const currentProject = selectedProjectId
    ? projects.find((p) => p.id === selectedProjectId)
    : null

  return (
    <main className="flex min-h-screen bg-white">
      <ProjectSidebar projects={projects} />

      <div className="flex-1 p-6">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold text-gray-900">
              {currentProject ? (
                <>
                  <div
                    className="h-5 w-5 rounded"
                    style={{ backgroundColor: currentProject.color }}
                  />
                  {currentProject.name}
                </>
              ) : (
                <>📅 My Gantt</>
              )}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              {currentProject
                ? `${tasks.length}개의 task`
                : '개인 스케줄 관리'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <AccountManagerModal />
            <TaskCreateModal defaultProjectId={selectedProjectId} />
          </div>
        </header>

        {/* projects도 전달 — 그룹화에 사용 */}
        <GanttView tasks={tasks} projects={projects} />
      </div>
    </main>
  )
}