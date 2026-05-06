import { create } from 'zustand'

export type Role = '申请医生' | 'MDT秘书' | '会诊专家' | '质控员' | '系统管理员' | '超级管理员'

export interface User {
  id: string
  name: string
  role: Role
  avatar?: string
  department?: string
}

interface AppState {
  role: Role
  user: User | null
  setRole: (role: Role) => void
  setUser: (user: User) => void
  logout: () => void
}

export const useAppStore = create<AppState>((set) => ({
  role: '申请医生',
  user: null,
  setRole: (role) => set({ role }),
  setUser: (user) => set({ user }),
  logout: () => set({ user: null, role: '申请医生' }),
}))