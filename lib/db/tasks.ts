'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Task, TaskInsert, TaskUpdate } from '@/lib/types/db'

// ============================================
// 모든 task 조회 (display_order 순)
// ============================================
export async function getTasks(): Promise<Task[]> {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('display_order', { ascending: true })
        .order('start_date', { ascending: true })

    if (error) {
        console.error('getTasks error:', error)
        throw new Error('task 목록을 불러오지 못했습니다')
    }
    return data ?? []
}

// ============================================
// 특정 project의 task만 조회
// ============================================
export async function getTasksByProject(
    projectId: string | null
): Promise<Task[]> {
    const supabase = createClient()
    let query = supabase
        .from('tasks')
        .select('*')
        .order('display_order', { ascending: true })

    if (projectId === null) {
        query = query.is('project_id', null)
    } else {
        query = query.eq('project_id', projectId)
    }

    const { data, error } = await query

    if (error) {
        console.error('getTasksByProject error:', error)
        throw new Error('task 목록을 불러오지 못했습니다')
    }
    return data ?? []
}

// ============================================
// task 추가
// ============================================
export async function createTask(input: TaskInsert): Promise<Task> {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('tasks')
        .insert(input)
        .select()
        .single()

    if (error) {
        console.error('createTask error:', error)
        throw new Error('task 추가에 실패했습니다')
    }

    revalidatePath('/')
    return data
}

// ============================================
// task 수정
// ============================================
export async function updateTask(
    id: string,
    input: TaskUpdate
): Promise<Task> {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('tasks')
        .update(input)
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error('updateTask error:', error)
        throw new Error('task 수정에 실패했습니다')
    }

    revalidatePath('/')
    return data
}

// ============================================
// task 삭제
// ============================================
export async function deleteTask(id: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase.from('tasks').delete().eq('id', id)

    if (error) {
        console.error('deleteTask error:', error)
        throw new Error('task 삭제에 실패했습니다')
    }

    revalidatePath('/')
}

// ============================================
// 폼 데이터로부터 task 추가 (form action에서 사용)
// ============================================
export async function createTaskFromForm(formData: FormData): Promise<void> {
  const accountIdRaw = formData.get('account_id') as string

  const input: TaskInsert = {
    name: formData.get('name') as string,
    start_date: formData.get('start_date') as string,
    end_date: formData.get('end_date') as string,
    type: (formData.get('type') as 'task' | 'milestone') ?? 'task',
    status: (formData.get('status') as
      | 'ready'
      | 'waiting'
      | 'progress'
      | 'feedback'
      | 'done') ?? 'ready',
    progress: 0,
    // 빈 문자열이면 null (미배정)
    account_id: accountIdRaw ? accountIdRaw : null,
  }

  // milestone이면 start_date = end_date
  if (input.type === 'milestone') {
    input.end_date = input.start_date
  }

  await createTask(input)
}