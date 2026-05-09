import { create } from 'zustand'
import type { MDTNecessityAssessment } from '../services/integration/ai/aiPatientScreeningService'

export type ConsultationStatus = '待科室审核' | '待秘书审核' | '待补充材料' | '待会诊' | '已通过' | '已拒绝' | '已完成' | '进行中'
export type MaterialStatus = '未提交' | '待提交' | '待秘书审核' | '待质控审核' | '审核通过' | '已退回'

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
  // 材料提交相关字段
  materialStatus?: MaterialStatus  // 材料状态
  meetingDate?: string  // 会诊日期
  meetingTime?: string  // 会诊时间段
  meetingRecord?: string  // 会诊记录
  consultationReport?: string  // 会诊报告
  recommendations?: string[]  // 会诊建议
  recordingUrl?: string  // 录音 URL
  videoUrl?: string  // 录像 URL
  submitTime?: string  // 提交时间
  rejectReason?: string  // 退回原因
  
  // 病历资料（从 HIS 系统读取或手动上传）
  medicalRecords?: {
    chiefComplaint?: string  // 主诉
    presentIllness?: string  // 现病史
    pastHistory?: string  // 既往史
    physicalExamination?: string  // 体格检查
    auxiliaryExamination?: string  // 辅助检查
    initialDiagnosis?: string  // 初步诊断
    treatmentPlan?: string  // 治疗方案
  }
  
  // 上传的文件列表
  uploadedFiles?: UploadedFile[]
  
  // HIS 系统对接标识
  hisDataSynced?: boolean  // 是否已从 HIS 同步
  hisSyncTime?: string  // HIS 同步时间
  
  // 审核流程记录
  auditHistory?: AuditRecord[]
}

export interface AuditRecord {
  id: string
  node: '提交申请' | '科室审核' | '秘书审核' | '补充材料' | '质控审核'
  operator: string  // 审核人
  operatorRole: '科室主任' | 'MDT 秘书' | '质控员' | '申请医生'
  time: string  // 审核时间
  result: '已提交' | '通过' | '拒绝' | '退回补充' | '待审核'
  opinion?: string  // 审核意见
  rejectReason?: string  // 拒绝/退回原因
}

export interface UploadedFile {
  id: string
  fileName: string
  fileType: '病历' | '检查报告' | '检验报告' | '病理报告' | '影像资料' | '其他'
  fileSize: number  // 字节
  uploadTime: string
  uploadUrl: string
  thumbnailUrl?: string
  fromHIS?: boolean  // 是否来自 HIS 系统
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
  imagingExams?: ImagingExam[]
  labTests?: LabTest[]
  pathologyReports?: PathologyReport[]
  otherExams?: OtherExam[]
  // AI MDT 预判结果（后台预先评估）
  aiAssessment?: MDTNecessityAssessment
}

export interface ImagingExam {
  id: string
  type: 'CT' | 'MRI' | 'X 光' | '超声' | 'PET-CT' | '骨扫描' | '其他'
  examDate: string
  examBody: string
  findings: string
  impression: string
  reportDoctor?: string
  reportUrl?: string
  imageUrl?: string
}

export interface LabTest {
  id: string
  testName: string
  testDate: string
  testItem: string
  result: string
  unit: string
  referenceRange: string
  flag?: '↑' | '↓' | 'H' | 'L' | '正常'
  reportUrl?: string
}

export interface PathologyReport {
  id: string
  reportDate: string
  sampleType: string
  sampleSite: string
  microscopicFindings: string
  pathologicalDiagnosis: string
  immunohistochemistry?: string
  molecularTest?: string
  reportDoctor?: string
  reportUrl?: string
}

export interface OtherExam {
  id: string
  examType: string
  examDate: string
  findings: string
  conclusion: string
  reportUrl?: string
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