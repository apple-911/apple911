export interface FollowupRule {
  id: string
  name: string
  disease: string
  stage?: string
  treatmentType: string
  source: string
  schedule: Array<{
    sequence: number
    timing: string
    timingDays: number
    content: string[]
    examinations: string[]
    method: 'phone' | 'clinic' | 'online'
  }>
}

export interface FollowupPlan {
  id: string
  caseId: string
  patientName: string
  ruleId: string
  createdAt: string
  createdBy: string
  status: 'draft' | 'active' | 'completed' | 'cancelled'
  tasks: Array<{
    id: string
    sequence: number
    scheduledDate: string
    content: string[]
    examinations: string[]
    method: string
    status: 'pending' | 'completed' | 'overdue' | 'skipped'
    actualDate?: string
    result?: string
    notes?: string
  }>
}

export const mockFollowupRules: FollowupRule[] = [
  {
    id: 'RULE001',
    name: '肺癌术后随访 (NCCN 2024)',
    disease: '肺癌',
    stage: 'I-III期',
    treatmentType: '手术',
    source: 'NCCN 2024',
    schedule: [
      {
        sequence: 1,
        timing: '术后 1 个月',
        timingDays: 30,
        content: ['症状评估', '体格检查', '生活质量评估'],
        examinations: ['胸部 CT', '肿瘤标志物', '血常规'],
        method: 'clinic',
      },
      {
        sequence: 2,
        timing: '术后 3 个月',
        timingDays: 90,
        content: ['症状评估', '体格检查'],
        examinations: ['胸部 CT'],
        method: 'phone',
      },
      {
        sequence: 3,
        timing: '术后 6 个月',
        timingDays: 180,
        content: ['症状评估', '体格检查', '生活质量评估'],
        examinations: ['胸部 CT', '肿瘤标志物'],
        method: 'clinic',
      },
      {
        sequence: 4,
        timing: '术后 12 个月',
        timingDays: 365,
        content: ['症状评估', '体格检查', '生活质量评估'],
        examinations: ['胸部 CT', '肿瘤标志物', '腹部超声'],
        method: 'clinic',
      },
    ],
  },
  {
    id: 'RULE002',
    name: '乳腺癌辅助治疗随访 (CSCO 2024)',
    disease: '乳腺癌',
    stage: 'I-III期',
    treatmentType: '手术+化疗',
    source: 'CSCO 2024',
    schedule: [
      {
        sequence: 1,
        timing: '治疗后 1 个月',
        timingDays: 30,
        content: ['症状评估', '不良反应评估', '生活质量评估'],
        examinations: ['乳腺超声', '血常规', '肝肾功能'],
        method: 'clinic',
      },
      {
        sequence: 2,
        timing: '治疗后 3 个月',
        timingDays: 90,
        content: ['症状评估', '体格检查'],
        examinations: ['乳腺超声', '肿瘤标志物'],
        method: 'phone',
      },
      {
        sequence: 3,
        timing: '治疗后 6 个月',
        timingDays: 180,
        content: ['症状评估', '体格检查', '生活质量评估'],
        examinations: ['乳腺钼靶', '肿瘤标志物'],
        method: 'clinic',
      },
    ],
  },
  {
    id: 'RULE003',
    name: '直肠癌术后随访 (NCCN 2024)',
    disease: '直肠癌',
    stage: 'II-III期',
    treatmentType: '手术',
    source: 'NCCN 2024',
    schedule: [
      {
        sequence: 1,
        timing: '术后 1 个月',
        timingDays: 30,
        content: ['症状评估', '体格检查', '排便功能评估'],
        examinations: ['腹部 CT', '肿瘤标志物 CEA', '血常规'],
        method: 'clinic',
      },
      {
        sequence: 2,
        timing: '术后 3 个月',
        timingDays: 90,
        content: ['症状评估', '体格检查'],
        examinations: ['腹部 CT', '肿瘤标志物 CEA'],
        method: 'clinic',
      },
      {
        sequence: 3,
        timing: '术后 6 个月',
        timingDays: 180,
        content: ['症状评估', '体格检查', '生活质量评估'],
        examinations: ['肠镜', '腹部 CT', '肿瘤标志物 CEA'],
        method: 'clinic',
      },
    ],
  },
  {
    id: 'RULE004',
    name: '胃癌晚期随访 (CSCO 2024)',
    disease: '胃癌',
    stage: 'IV期',
    treatmentType: '化疗',
    source: 'CSCO 2024',
    schedule: [
      {
        sequence: 1,
        timing: '治疗后 2 周',
        timingDays: 14,
        content: ['症状评估', '不良反应评估', '营养评估'],
        examinations: ['血常规', '肝肾功能', '肿瘤标志物'],
        method: 'phone',
      },
      {
        sequence: 2,
        timing: '治疗后 1 个月',
        timingDays: 30,
        content: ['症状评估', '体格检查', '生活质量评估'],
        examinations: ['腹部 CT', '肿瘤标志物'],
        method: 'clinic',
      },
      {
        sequence: 3,
        timing: '治疗后 3 个月',
        timingDays: 90,
        content: ['症状评估', '体格检查', '疗效评估'],
        examinations: ['腹部 CT', '肿瘤标志物', '胃镜'],
        method: 'clinic',
      },
    ],
  },
]

export const mockFollowupPlans: FollowupPlan[] = [
  {
    id: 'PLAN001',
    caseId: 'CASE001',
    patientName: '王**',
    ruleId: 'RULE001',
    createdAt: '2024-03-16',
    createdBy: '张明华',
    status: 'active',
    tasks: [
      {
        id: 'TASK001',
        sequence: 1,
        scheduledDate: '2024-04-15',
        content: ['症状评估', '体格检查', '生活质量评估'],
        examinations: ['胸部 CT', '肿瘤标志物', '血常规'],
        method: 'clinic',
        status: 'completed',
        actualDate: '2024-04-15',
        result: '恢复良好，无复发迹象',
      },
      {
        id: 'TASK002',
        sequence: 2,
        scheduledDate: '2024-06-15',
        content: ['症状评估', '体格检查'],
        examinations: ['胸部 CT'],
        method: 'phone',
        status: 'pending',
      },
      {
        id: 'TASK003',
        sequence: 3,
        scheduledDate: '2024-09-15',
        content: ['症状评估', '体格检查', '生活质量评估'],
        examinations: ['胸部 CT', '肿瘤标志物'],
        method: 'clinic',
        status: 'pending',
      },
    ],
  },
  {
    id: 'PLAN002',
    caseId: 'CASE002',
    patientName: '李**',
    ruleId: 'RULE002',
    createdAt: '2024-03-15',
    createdBy: '陈伟',
    status: 'active',
    tasks: [
      {
        id: 'TASK004',
        sequence: 1,
        scheduledDate: '2024-04-14',
        content: ['症状评估', '不良反应评估', '生活质量评估'],
        examinations: ['乳腺超声', '血常规', '肝肾功能'],
        method: 'clinic',
        status: 'completed',
        actualDate: '2024-04-14',
        result: '术后恢复良好',
      },
      {
        id: 'TASK005',
        sequence: 2,
        scheduledDate: '2024-06-14',
        content: ['症状评估', '体格检查'],
        examinations: ['乳腺超声', '肿瘤标志物'],
        method: 'phone',
        status: 'pending',
      },
    ],
  },
]
