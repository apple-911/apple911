import { create } from 'zustand'

export type ConsultationStatus = '待审核' | '已通过' | '已拒绝' | '已完成' | '进行中'

export interface Consultation {
  id: string
  patientId: string
  patientName: string
  patientInpatientNo: string
  type: '院内' | '远程'
  applyTime: string
  expectTime: string
  status: ConsultationStatus
  urgency: '普通' | '紧急' | '特急'
  department: string
  applyDoctor: string
  experts: Expert[]
  mainDiagnosis: string
  location?: string
  conclusion?: {
    summary: string
    recommendations: string[]
  }
}

export interface Expert {
  id: string
  name: string
  department: string
  dept?: string
  title: string
  specialty: string
  status: '空闲' | '忙碌' | '离线'
  avatar?: string
}

export interface Patient {
  id: string
  name: string
  gender: '男' | '女'
  age: number
  inpatientNo: string
  phone: string
  mainDiagnosis: string
  diagnosis?: string
  lastConsultationTime?: string
  admissionTime: string
  department: string
  doctor: string
  allergies?: string[]
  history?: string[]
}

export interface Report {
  id: string
  consultationId: string
  patientName: string
  consultationTime: string
  responsibleExpert: string
  status: '草稿' | '待签名' | '已签名' | '已归档'
  content?: string
  chiefComplaint?: string
  historyOfPresentIllness?: string
  pastHistory?: string
  physicalExamination?: string
  auxiliaryExamination?: string
  consultationOpinion?: string
  treatmentSuggestion?: string
  followupPlan?: string
  title?: string
  createdAt?: string
  createdBy?: string
}

export interface FollowupPlan {
  id: string
  patientId: string
  patientName: string
  startDate: string
  endDate: string
  nextFollowup: string
  purpose: string
  status: '进行中' | '已完成' | '已终止'
  doctor: string
}

interface ConsultationState {
  consultations: Consultation[]
  addConsultation: (c: Consultation) => void
  updateConsultation: (id: string, updates: Partial<Consultation>) => void
  getConsultationById: (id: string) => Consultation | undefined
}

export const useConsultationStore = create<ConsultationState>((set, get) => ({
  consultations: [],
  addConsultation: (c) => set((state) => ({ consultations: [...state.consultations, c] })),
  updateConsultation: (id, updates) => set((state) => ({
    consultations: state.consultations.map((c) => c.id === id ? { ...c, ...updates } : c)
  })),
  getConsultationById: (id) => get().consultations.find((c) => c.id === id)
}))