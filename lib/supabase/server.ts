// 서버 컴포넌트, Server Action에서 사용하는 Supabase 클라이언트
// 인증 없이 anon key로 직접 접근
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}