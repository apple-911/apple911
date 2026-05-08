export interface QualityMetrics {
  todayCount: number
  weekCount: number
  monthCount: number
  timelinessRate: number
  passRate: number
  followupRate: number
  timeoutCount: number
}

export interface QualityAlert {
  id: string
  caseId: string
  patientName: string
  department: string
  alertType: 'timeout' | 'missing_followup' | 'low_score' | 'deviation'
  severity: 'high' | 'medium' | 'low'
  description: string
  detectedAt: string
  status: 'pending' | 'processing' | 'resolved'
}

export interface DepartmentQuality {
  department: string
  totalCases: number
  passCount: number
  passRate: number
  avgScore: number
  timeoutCount: number
}

export interface QualityTrend {
  date: string
  score: number
  passRate: number
  count: number
}

export const mockQualityMetrics: QualityMetrics = {
  todayCount: 12,
  weekCount: 68,
  monthCount: 245,
  timelinessRate: 92.5,
  passRate: 88.3,
  followupRate: 76.8,
  timeoutCount: 5,
}

export const mockQualityAlerts: QualityAlert[] = [
  {
    id: 'QA001',
    caseId: 'CASE003',
    patientName: '张**',
    department: '肛肠外科',
    alertType: 'timeout',
    severity: 'high',
    description: '会诊申请已超过 48 小时未完成，专家未确认',
    detectedAt: '2024-03-09 09:00',
    status: 'pending',
  },
  {
    id: 'QA002',
    caseId: 'CASE001',
    patientName: '王**',
    department: '肿瘤科',
    alertType: 'missing_followup',
    severity: 'medium',
    description: '术后 3 个月随访未完成，已逾期 7 天',
    detectedAt: '2024-03-08 00:00',
    status: 'pending',
  },
  {
    id: 'QA003',
    caseId: 'CASE004',
    patientName: '刘**',
    department: '消化内科',
    alertType: 'low_score',
    severity: 'medium',
    description: '质控评分 89.2 分，低于 90 分合格线',
    detectedAt: '2024-03-07 16:00',
    status: 'processing',
  },
  {
    id: 'QA004',
    caseId: 'CASE002',
    patientName: '李**',
    department: '乳腺外科',
    alertType: 'deviation',
    severity: 'low',
    description: '治疗方案与指南推荐存在偏差，建议补充说明',
    detectedAt: '2024-03-06 14:00',
    status: 'resolved',
  },
  {
    id: 'QA005',
    caseId: 'CASE005',
    patientName: '赵**',
    department: '胸外科',
    alertType: 'timeout',
    severity: 'high',
    description: '会诊报告生成超时，已超过 3 个工作日',
    detectedAt: '2024-03-10 09:00',
    status: 'pending',
  },
  {
    id: 'QA006',
    caseId: 'CASE006',
    patientName: '孙**',
    department: '泌尿外科',
    alertType: 'missing_followup',
    severity: 'medium',
    description: '首次随访未安排，术后已超过 2 周',
    detectedAt: '2024-03-09 00:00',
    status: 'pending',
  },
]

export const mockDepartmentQuality: DepartmentQuality[] = [
  { department: '肿瘤科', totalCases: 85, passCount: 78, passRate: 91.8, avgScore: 93.5, timeoutCount: 2 },
  { department: '乳腺外科', totalCases: 62, passCount: 58, passRate: 93.5, avgScore: 94.2, timeoutCount: 1 },
  { department: '胸外科', totalCases: 48, passCount: 42, passRate: 87.5, avgScore: 91.8, timeoutCount: 3 },
  { department: '消化内科', totalCases: 35, passCount: 30, passRate: 85.7, avgScore: 90.5, timeoutCount: 2 },
  { department: '肛肠外科', totalCases: 28, passCount: 24, passRate: 85.7, avgScore: 89.2, timeoutCount: 1 },
  { department: '泌尿外科', totalCases: 22, passCount: 20, passRate: 90.9, avgScore: 92.1, timeoutCount: 0 },
]

export const mockQualityTrend: QualityTrend[] = [
  { date: '2024-02-15', score: 91.2, passRate: 86.5, count: 18 },
  { date: '2024-02-22', score: 92.5, passRate: 88.2, count: 22 },
  { date: '2024-02-29', score: 90.8, passRate: 85.7, count: 20 },
  { date: '2024-03-07', score: 93.1, passRate: 89.5, count: 25 },
  { date: '2024-03-14', score: 92.8, passRate: 88.3, count: 23 },
]
