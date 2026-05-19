'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Project, ProjectInsert, ProjectUpdate } from '@/lib/types/db'

// 모든 project 조회
export async function getProjects(): Promise<Project[]> {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: true })

    if (error) {
        console.error('getProjects error:', error)
        throw new Error('project 목록을 불러오지 못했습니다')
    }
    return data ?? []
}

// project 추가
export async function createProject(input: ProjectInsert): Promise<Project> {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('projects')
        .insert(input)
        .select()
        .single()

    if (error) {
        console.error('createProject error:', error)
        throw new Error('project 추가에 실패했습니다')
    }

    revalidatePath('/')
    return data
}

// project 수정
export async function updateProject(
    id: string,
    input: ProjectUpdate
): Promise<Project> {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('projects')
        .update(input)
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error('updateProject error:', error)
        throw new Error('project 수정에 실패했습니다')
    }

    revalidatePath('/')
    return data
}

// project 삭제 (ON DELETE CASCADE로 소속 task들도 자동 삭제됨)
export async function deleteProject(id: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase.from('projects').delete().eq('id', id)

    if (error) {
        console.error('deleteProject error:', error)
        throw new Error('project 삭제에 실패했습니다')
    }

    revalidatePath('/')
}