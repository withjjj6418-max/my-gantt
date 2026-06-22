// DB 테이블 구조를 TypeScript 타입으로 표현

// ============================================
// projects 테이블
// ============================================
export type Project = {
  id: string
  user_id: string | null
  name: string
  color: string
  created_at: string
  updated_at: string
}

export type ProjectInsert = {
  name: string
  color?: string
}

export type ProjectUpdate = {
  name?: string
  color?: string
}

// ============================================
// accounts 테이블 (계정 A/B/C 등)
// ============================================
export type Account = {
  id: string
  name: string
  color: string
  display_order: number
  created_at: string
}

export type AccountInsert = {
  name: string
  color?: string
  display_order?: number
}

export type AccountUpdate = {
  name?: string
  color?: string
  display_order?: number
}

// ============================================
// tasks 테이블
// ============================================
export type TaskType = 'task' | 'milestone'
export type TaskStatus = 'ready' | 'waiting' | 'progress' | 'feedback' | 'done'

export type Task = {
  id: string
  user_id: string | null
  project_id: string | null
  account_id: string | null
  parent_id: string | null
  name: string
  type: TaskType
  status: TaskStatus
  start_date: string
  end_date: string
  progress: number
  display_order: number
  description: string
  is_collapsed: boolean
  created_at: string
  updated_at: string
}

export type TaskInsert = {
  project_id?: string | null
  account_id?: string | null
  parent_id?: string | null
  name: string
  type?: TaskType
  status?: TaskStatus
  start_date: string
  end_date: string
  progress?: number
  display_order?: number
  description?: string
}

export type TaskUpdate = {
  project_id?: string | null
  account_id?: string | null
  parent_id?: string | null
  name?: string
  type?: TaskType
  status?: TaskStatus
  start_date?: string
  end_date?: string
  progress?: number
  display_order?: number
  description?: string
  is_collapsed?: boolean
}

// ============================================
// task_dependencies 테이블
// ============================================
export type DependencyType = 'FS' | 'SS' | 'FF' | 'SF'

export type TaskDependency = {
  id: string
  user_id: string | null
  predecessor_id: string
  successor_id: string
  dep_type: DependencyType
  created_at: string
}

export type TaskDependencyInsert = {
  predecessor_id: string
  successor_id: string
  dep_type?: DependencyType
}
// ============================================
// 상수: 상태별 설정 (회사 도구의 STATUS_CONFIG 참고)
// ============================================
export type StatusConfig = {
  label: string
  color: string
  colorLight: string
}

export const STATUS_CONFIG: Record<TaskStatus, StatusConfig> = {
  ready: { label: '준비', color: '#a855f7', colorLight: '#d8b4fe' },
  waiting: { label: '대기', color: '#64748b', colorLight: '#cbd5e1' },
  progress: { label: '진행중', color: '#0ea5e9', colorLight: '#7dd3fc' },
  feedback: { label: '피드백', color: '#f97316', colorLight: '#fdba74' },
  done: { label: '완료', color: '#22c55e', colorLight: '#86efac' },
}