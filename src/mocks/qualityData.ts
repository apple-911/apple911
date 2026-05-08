export interface QualityStats {
  pendingTasks: number
  reviewedToday: number
  pendingRectification: number
  monthlyCoverage: number
}

export interface QualityTask {
  id: string
  consultationId: string
  patientName: string
  department: string
  meetingDate: string
  materialScore: number
  status: '待审核' | '审核中' | '已退回'
}

export interface QualityMetric {
  date: string
  score: number
}

export interface QualityIndicator {
  name: string
  value: number
  unit: string
  trend: 'up' | 'down'
  change: number
}

export interface ReturnedTask {
  id: string
  consultationId: string
  patientName: string
  department: string
  returnDate: string
  deadline: string
  reason: string
  status: '整改中' | '已超期'
}

export interface ProblemType {
  type: string
  count: number
  percentage: number
}

export interface DepartmentRanking {
  department: string
  score: number
  rank: number
}

export interface AuditEfficiency {
  date: string
  count: number
  avgTime: number
}

export const mockQualityStats: QualityStats = {
  pendingTasks: 12,
  reviewedToday: 8,
  pendingRectification: 5,
  monthlyCoverage: 87.5,
}

export const mockPendingTasks: QualityTask[] = [
  {
    id: 'Q001',
    consultationId: 'C001',
    patientName: '王建国',
    department: '肿瘤科',
    meetingDate: '2024-03-15',
    materialScore: 92,
    status: '待审核',
  },
  {
    id: 'Q002',
    consultationId: 'C002',
    patientName: '李秀英',
    department: '乳腺外科',
    meetingDate: '2024-03-15',
    materialScore: 88,
    status: '待审核',
  },
  {
    id: 'Q003',
    consultationId: 'C003',
    patientName: '张伟',
    department: '肛肠外科',
    meetingDate: '2024-03-14',
    materialScore: 76,
    status: '已退回',
  },
  {
    id: 'Q004',
    consultationId: 'C004',
    patientName: '刘芳',
    department: '消化内科',
    meetingDate: '2024-03-14',
    materialScore: 95,
    status: '审核中',
  },
  {
    id: 'Q005',
    consultationId: 'C005',
    patientName: '陈刚',
    department: '泌尿外科',
    meetingDate: '2024-03-13',
    materialScore: 82,
    status: '待审核',
  },
]

export const mockQualityMetrics: QualityMetric[] = [
  { date: '03-09', score: 91.2 },
  { date: '03-10', score: 92.5 },
  { date: '03-11', score: 90.8 },
  { date: '03-12', score: 93.1 },
  { date: '03-13', score: 94.2 },
  { date: '03-14', score: 93.8 },
  { date: '03-15', score: 94.5 },
]

export const mockQualityIndicators: QualityIndicator[] = [
  { name: '报告完整率', value: 98.5, unit: '%', trend: 'up', change: 2.3 },
  { name: '会诊及时率', value: 96.2, unit: '%', trend: 'up', change: 1.8 },
  { name: '整改完成率', value: 89.7, unit: '%', trend: 'down', change: -3.2 },
  { name: '平均审核时长', value: 2.4, unit: '小时', trend: 'down', change: -0.5 },
]

export const mockReturnedTasks: ReturnedTask[] = [
  {
    id: 'R001',
    consultationId: 'C003',
    patientName: '张伟',
    department: '肛肠外科',
    returnDate: '2024-03-14',
    deadline: '2024-03-17',
    reason: '会诊记录不完整，缺少专家讨论细节',
    status: '整改中',
  },
  {
    id: 'R002',
    consultationId: 'C006',
    patientName: '赵红梅',
    department: '呼吸科',
    returnDate: '2024-03-12',
    deadline: '2024-03-15',
    reason: '辅助检查资料缺失',
    status: '已超期',
  },
  {
    id: 'R003',
    consultationId: 'C008',
    patientName: '孙志强',
    department: '放疗科',
    returnDate: '2024-03-13',
    deadline: '2024-03-16',
    reason: '治疗方案描述不规范',
    status: '整改中',
  },
]

export const mockProblemTypes: ProblemType[] = [
  { type: '材料不完整', count: 45, percentage: 35.2 },
  { type: '记录不规范', count: 32, percentage: 25.0 },
  { type: '诊断不明确', count: 22, percentage: 17.2 },
  { type: '方案不详细', count: 18, percentage: 14.1 },
  { type: '其他问题', count: 11, percentage: 8.5 },
]

export const mockDepartmentRankings: DepartmentRanking[] = [
  { department: '肿瘤科', score: 96.8, rank: 1 },
  { department: '乳腺外科', score: 95.2, rank: 2 },
  { department: '胸外科', score: 93.5, rank: 3 },
  { department: '消化内科', score: 91.8, rank: 4 },
  { department: '肛肠外科', score: 89.2, rank: 5 },
  { department: '呼吸科', score: 87.6, rank: 6 },
  { department: '泌尿外科', score: 85.3, rank: 7 },
  { department: '放疗科', score: 83.9, rank: 8 },
]

export const mockAuditEfficiency: AuditEfficiency[] = [
  { date: '03-09', count: 15, avgTime: 2.8 },
  { date: '03-10', count: 18, avgTime: 2.6 },
  { date: '03-11', count: 12, avgTime: 2.9 },
  { date: '03-12', count: 20, avgTime: 2.3 },
  { date: '03-13', count: 22, avgTime: 2.2 },
  { date: '03-14', count: 19, avgTime: 2.5 },
  { date: '03-15', count: 25, avgTime: 2.1 },
]
