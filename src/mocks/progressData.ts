export interface ConsultationProgress {
  id: string
  patientId: string
  patientName: string
  gender: '男' | '女'
  age: number
  department: string
  applicant: string
  applyDate: string
  consultationType: string
  currentStage: string
  estimatedCompletion: string
  stages: Array<{
    stage: string
    status: 'pending' | 'completed' | 'processing' | 'timeout'
    completedAt?: string
    operator?: string
    notes?: string
  }>
  isTimeout: boolean
  timeoutReason?: string
  priority: '常规' | '较急' | '紧急'
}

export const mockConsultationProgress: ConsultationProgress[] = [
  {
    id: 'CONS001',
    patientId: 'P001',
    patientName: '王**',
    gender: '男',
    age: 62,
    department: '肿瘤科',
    applicant: '张明华',
    applyDate: '2024-03-10',
    consultationType: '首次 MDT',
    currentStage: '专家邀请',
    estimatedCompletion: '2024-03-17',
    stages: [
      { stage: '申请提交', status: 'completed', completedAt: '2024-03-10 09:30', operator: '张明华', notes: '申请已提交' },
      { stage: '审核通过', status: 'completed', completedAt: '2024-03-10 14:20', operator: '李主任', notes: '符合 MDT 指征' },
      { stage: '专家邀请', status: 'processing', notes: '已邀请 4 位专家，2 位已确认' },
      { stage: '专家确认', status: 'pending' },
      { stage: '会诊进行中', status: 'pending' },
      { stage: '会诊完成', status: 'pending' },
      { stage: '报告生成', status: 'pending' },
      { stage: '报告审核', status: 'pending' },
      { stage: '报告发布', status: 'pending' },
    ],
    isTimeout: false,
    priority: '较急',
  },
  {
    id: 'CONS002',
    patientId: 'P002',
    patientName: '李**',
    gender: '女',
    age: 55,
    department: '乳腺外科',
    applicant: '陈伟',
    applyDate: '2024-03-08',
    consultationType: '首次 MDT',
    currentStage: '会诊完成',
    estimatedCompletion: '2024-03-15',
    stages: [
      { stage: '申请提交', status: 'completed', completedAt: '2024-03-08 10:00', operator: '陈伟' },
      { stage: '审核通过', status: 'completed', completedAt: '2024-03-08 15:30', operator: '王主任' },
      { stage: '专家邀请', status: 'completed', completedAt: '2024-03-09 09:00', operator: '系统' },
      { stage: '专家确认', status: 'completed', completedAt: '2024-03-09 16:00', operator: '系统', notes: '5 位专家全部确认' },
      { stage: '会诊进行中', status: 'completed', completedAt: '2024-03-12 14:00-15:30', operator: 'MDT 团队' },
      { stage: '会诊完成', status: 'completed', completedAt: '2024-03-12 15:30', operator: '系统' },
      { stage: '报告生成', status: 'processing', notes: '报告撰写中' },
      { stage: '报告审核', status: 'pending' },
      { stage: '报告发布', status: 'pending' },
    ],
    isTimeout: false,
    priority: '常规',
  },
  {
    id: 'CONS003',
    patientId: 'P003',
    patientName: '张**',
    gender: '男',
    age: 58,
    department: '肛肠外科',
    applicant: '王建国',
    applyDate: '2024-03-05',
    consultationType: '二次 MDT',
    currentStage: '专家确认',
    estimatedCompletion: '2024-03-12',
    stages: [
      { stage: '申请提交', status: 'completed', completedAt: '2024-03-05 11:00', operator: '王建国' },
      { stage: '审核通过', status: 'completed', completedAt: '2024-03-05 16:00', operator: '李主任' },
      { stage: '专家邀请', status: 'completed', completedAt: '2024-03-06 09:00', operator: '系统' },
      { stage: '专家确认', status: 'timeout', notes: '超时未确认，已发送催办通知' },
      { stage: '会诊进行中', status: 'pending' },
      { stage: '会诊完成', status: 'pending' },
      { stage: '报告生成', status: 'pending' },
      { stage: '报告审核', status: 'pending' },
      { stage: '报告发布', status: 'pending' },
    ],
    isTimeout: true,
    timeoutReason: '专家未确认，已超过 48 小时',
    priority: '紧急',
  },
  {
    id: 'CONS004',
    patientId: 'P004',
    patientName: '刘**',
    gender: '女',
    age: 68,
    department: '消化内科',
    applicant: '赵医生',
    applyDate: '2024-03-11',
    consultationType: '首次 MDT',
    currentStage: '申请提交',
    estimatedCompletion: '2024-03-18',
    stages: [
      { stage: '申请提交', status: 'completed', completedAt: '2024-03-11 09:00', operator: '赵医生' },
      { stage: '审核通过', status: 'pending' },
      { stage: '专家邀请', status: 'pending' },
      { stage: '专家确认', status: 'pending' },
      { stage: '会诊进行中', status: 'pending' },
      { stage: '会诊完成', status: 'pending' },
      { stage: '报告生成', status: 'pending' },
      { stage: '报告审核', status: 'pending' },
      { stage: '报告发布', status: 'pending' },
    ],
    isTimeout: false,
    priority: '常规',
  },
  {
    id: 'CONS005',
    patientId: 'P005',
    patientName: '陈**',
    gender: '男',
    age: 72,
    department: '泌尿外科',
    applicant: '孙医生',
    applyDate: '2024-03-07',
    consultationType: '首次 MDT',
    currentStage: '报告审核',
    estimatedCompletion: '2024-03-14',
    stages: [
      { stage: '申请提交', status: 'completed', completedAt: '2024-03-07 10:30', operator: '孙医生' },
      { stage: '审核通过', status: 'completed', completedAt: '2024-03-07 14:00', operator: '周主任' },
      { stage: '专家邀请', status: 'completed', completedAt: '2024-03-08 09:00', operator: '系统' },
      { stage: '专家确认', status: 'completed', completedAt: '2024-03-08 17:00', operator: '系统' },
      { stage: '会诊进行中', status: 'completed', completedAt: '2024-03-11 14:00-15:00', operator: 'MDT 团队' },
      { stage: '会诊完成', status: 'completed', completedAt: '2024-03-11 15:00', operator: '系统' },
      { stage: '报告生成', status: 'completed', completedAt: '2024-03-12 10:00', operator: '张医生' },
      { stage: '报告审核', status: 'processing', notes: '等待主任审核' },
      { stage: '报告发布', status: 'pending' },
    ],
    isTimeout: false,
    priority: '常规',
  },
  {
    id: 'CONS006',
    patientId: 'P006',
    patientName: '杨**',
    gender: '女',
    age: 45,
    department: '胸外科',
    applicant: '钱医生',
    applyDate: '2024-03-06',
    consultationType: '二次 MDT',
    currentStage: '会诊进行中',
    estimatedCompletion: '2024-03-13',
    stages: [
      { stage: '申请提交', status: 'completed', completedAt: '2024-03-06 09:00', operator: '钱医生' },
      { stage: '审核通过', status: 'completed', completedAt: '2024-03-06 11:00', operator: '李主任' },
      { stage: '专家邀请', status: 'completed', completedAt: '2024-03-06 14:00', operator: '系统' },
      { stage: '专家确认', status: 'completed', completedAt: '2024-03-07 09:00', operator: '系统' },
      { stage: '会诊进行中', status: 'processing', notes: '会诊定于 2024-03-13 14:00' },
      { stage: '会诊完成', status: 'pending' },
      { stage: '报告生成', status: 'pending' },
      { stage: '报告审核', status: 'pending' },
      { stage: '报告发布', status: 'pending' },
    ],
    isTimeout: false,
    priority: '较急',
  },
]

export const mockProgressStats = {
  total: 156,
  processing: 23,
  completed: 128,
  timeout: 5,
  avgDuration: 5.2,
  completionRate: 94.5,
}
