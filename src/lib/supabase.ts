import { createClient } from '@supabase/supabase-js'

// Supabase 配置 - 从环境变量读取
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xtdngyyqtjnetwyfhfqk.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_O_UMtO38XA0Q0cqPPS8mpg_Hf5l3-po'

// 创建 Supabase 客户端
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// 导出类型
export type { User, Session, AuthResponse } from '@supabase/supabase-js'

// 辅助函数：检查是否已登录
export const isAuthenticated = async (): Promise<boolean> => {
  const { data: { session } } = await supabase.auth.getSession()
  return !!session
}

// 辅助函数：获取当前用户
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export default supabase
