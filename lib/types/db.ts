// DB 테이블 구조를 TypeScript 타입으로 표현
// SQL 스키마와 일치해야 함

// ============================================
// projects 테이블
// ============================================
export type Project = {
    id: string                    // uuid
    user_id: string | null         // 인증 안 쓰므로 null 가능
    name: string
    color: string                  // HEX 색상 (예: '#3b82f6')
    created_at: string             // ISO 8601 형식 (예: '2026-05-19T...')
    updated_at: string
}

// 새 project 추가 시 입력값 타입 (서버가 채우는 필드 제외)
export type ProjectInsert = {
    name: string
    color?: string                 // 안 넣으면 DB default 적용
}

// project 수정 시 입력값 타입
export type ProjectUpdate = {
    name?: string
    color?: string
}

// ============================================
// tasks 테이블
// ============================================
export type TaskType = 'task' | 'milestone'

export type Task = {
    id: string
    user_id: string | null
    project_id: string | null
    name: string
    type: TaskType
    start_date: string             // 'YYYY-MM-DD' 형식
    end_date: string
    progress: number               // 0~100
    display_order: number
    created_at: string
    updated_at: string
}

export type TaskInsert = {
    project_id?: string | null
    name: string
    type?: TaskType
    start_date: string
    end_date: string
    progress?: number
    display_order?: number
}

export type TaskUpdate = {
    project_id?: string | null
    name?: string
    type?: TaskType
    start_date?: string
    end_date?: string
    progress?: number
    display_order?: number
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