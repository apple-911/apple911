import { create } from 'zustand'

export interface CaseFavorite {
  id: string
  caseId: string
  caseTitle: string
  diagnosis: string
  department: string
  meetingDate: string
  notes: string
  createdAt: string
}

export interface LearningProgress {
  caseId: string
  viewedAt: string
  viewDuration: number
  completed: boolean
  notes: string
}

interface CaseLibraryState {
  favorites: CaseFavorite[]
  learningProgress: LearningProgress[]
  recentViews: string[]
  
  addFavorite: (caseId: string, caseTitle: string, diagnosis: string, department: string, meetingDate: string) => void
  removeFavorite: (caseId: string) => void
  isFavorite: (caseId: string) => boolean
  updateFavoriteNotes: (caseId: string, notes: string) => void
  
  addLearningProgress: (caseId: string, viewDuration: number, notes: string) => void
  getLearningProgress: (caseId: string) => LearningProgress | undefined
  
  addRecentView: (caseId: string) => void
  clearRecentViews: () => void
}

export const useCaseLibraryStore = create<CaseLibraryState>((set, get) => ({
  favorites: [],
  learningProgress: [],
  recentViews: [],
  
  addFavorite: (caseId, caseTitle, diagnosis, department, meetingDate) => {
    const { favorites } = get()
    if (favorites.some(f => f.caseId === caseId)) return
    
    set({
      favorites: [...favorites, {
        id: `fav_${Date.now()}`,
        caseId,
        caseTitle,
        diagnosis,
        department,
        meetingDate,
        notes: '',
        createdAt: new Date().toISOString().split('T')[0],
      }],
    })
  },
  
  removeFavorite: (caseId) => {
    const { favorites } = get()
    set({ favorites: favorites.filter(f => f.caseId !== caseId) })
  },
  
  isFavorite: (caseId) => {
    const { favorites } = get()
    return favorites.some(f => f.caseId === caseId)
  },
  
  updateFavoriteNotes: (caseId, notes) => {
    const { favorites } = get()
    set({
      favorites: favorites.map(f => 
        f.caseId === caseId ? { ...f, notes } : f
      ),
    })
  },
  
  addLearningProgress: (caseId, viewDuration, notes) => {
    const { learningProgress } = get()
    const existing = learningProgress.find(p => p.caseId === caseId)
    
    if (existing) {
      set({
        learningProgress: learningProgress.map(p =>
          p.caseId === caseId
            ? { ...p, viewDuration: p.viewDuration + viewDuration, notes, completed: true }
            : p
        ),
      })
    } else {
      set({
        learningProgress: [...learningProgress, {
          caseId,
          viewedAt: new Date().toISOString().split('T')[0],
          viewDuration,
          completed: false,
          notes,
        }],
      })
    }
  },
  
  getLearningProgress: (caseId) => {
    const { learningProgress } = get()
    return learningProgress.find(p => p.caseId === caseId)
  },
  
  addRecentView: (caseId) => {
    const { recentViews } = get()
    const updated = [caseId, ...recentViews.filter(id => id !== caseId)].slice(0, 10)
    set({ recentViews: updated })
  },
  
  clearRecentViews: () => {
    set({ recentViews: [] })
  },
}))
