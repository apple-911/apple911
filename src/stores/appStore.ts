import { create } from 'zustand'

export type Role = 'apply_doctor' | 'director' | 'secretary' | 'expert' | 'quality_controller' | 'admin' | 'super_admin'

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
  role: 'apply_doctor',
  user: null,
  setRole: (role) => set({ role }),
  setUser: (user) => set({ user }),
  logout: () => {
    localStorage.removeItem('mdt_user')
    set({ user: null, role: 'apply_doctor' })
  },
}))