'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type {
    TaskDependency,
    TaskDependencyInsert,
} from '@/lib/types/db'

// 모든 의존성 조회
export async function getDependencies(): Promise<TaskDependency[]> {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('task_dependencies')
        .select('*')

    if (error) {
        console.error('getDependencies error:', error)
        throw new Error('의존성 목록을 불러오지 못했습니다')
    }
    return data ?? []
}

// 의존성 추가
export async function createDependency(
    input: TaskDependencyInsert
): Promise<TaskDependency> {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('task_dependencies')
        .insert(input)
        .select()
        .single()

    if (error) {
        console.error('createDependency error:', error)
        // 중복 의존성 등 unique constraint 위반은 무시 가능
        throw new Error('의존성 추가에 실패했습니다')
    }

    revalidatePath('/')
    return data
}

// 의존성 삭제
export async function deleteDependency(id: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase
        .from('task_dependencies')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('deleteDependency error:', error)
        throw new Error('의존성 삭제에 실패했습니다')
    }

    revalidatePath('/')
}