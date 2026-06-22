'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Account, AccountInsert, AccountUpdate } from '@/lib/types/db'

// ============================================
// 모든 계정 조회 (display_order 순)
// ============================================
export async function getAccounts(): Promise<Account[]> {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true })

    if (error) {
        console.error('getAccounts error:', error)
        throw new Error('계정 목록을 불러오지 못했습니다')
    }
    return data ?? []
}

// ============================================
// 계정 추가
// ============================================
export async function createAccount(input: AccountInsert): Promise<Account> {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('accounts')
        .insert(input)
        .select()
        .single()

    if (error) {
        console.error('createAccount error:', error)
        // unique constraint 위반 시 (같은 이름)
        if (error.code === '23505') {
            throw new Error('이미 같은 이름의 계정이 있습니다')
        }
        throw new Error('계정 추가에 실패했습니다')
    }

    revalidatePath('/')
    return data
}

// ============================================
// 계정 수정
// ============================================
export async function updateAccount(
    id: string,
    input: AccountUpdate
): Promise<Account> {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('accounts')
        .update(input)
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error('updateAccount error:', error)
        if (error.code === '23505') {
            throw new Error('이미 같은 이름의 계정이 있습니다')
        }
        throw new Error('계정 수정에 실패했습니다')
    }

    revalidatePath('/')
    return data
}

// ============================================
// 계정 삭제
// ============================================
// tasks의 account_id는 ON DELETE SET NULL이라 task는 안 사라지고 미배정 상태로 됨
export async function deleteAccount(id: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase.from('accounts').delete().eq('id', id)

    if (error) {
        console.error('deleteAccount error:', error)
        throw new Error('계정 삭제에 실패했습니다')
    }

    revalidatePath('/')
}