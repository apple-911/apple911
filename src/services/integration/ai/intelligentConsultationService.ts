/**
 * 智能会诊辅助服务
 * 
 * 提供会诊全流程 AI 辅助：智能申请填写、专家推荐、会诊准备、实时辅助等功能
 */

import { aiApi } from '../../../utils/api'

// 智能申请信息
export interface IntelligentApplication {
  // 自动提取的患者信息
  patientInfo: {
    name: string
    age: number
    gender: string
    mrn: string
    department: string
    diagnosis: string
    stage?: string
  }
  // 推荐的会诊类型
  recommendedType: '院内' | '远程' | '床旁'
  // 推荐的会诊科室
  recommendedDepartments: Array<{
    department: string
    reason: string
    priority: number
  }>
  // 推荐的会诊专家
  recommendedExperts: Array<{
    id: string
    name: string
    department: string
    title: string
    specialty: string
    matchScore: number
    reason: string
    available: boolean
  }>
  // 建议完善的检查
  suggestedExams: Array<{
    examType: string
    examName: string
    reason: string
    urgency: '紧急' | '常规' | '可选'
  }>
  // 病情摘要自动生成
  summary: string
  // 会诊目的建议
  purposes: string[]
}

// 专家匹配度
export interface ExpertMatch {
  expertId: string
  name: string
  department: string
  title: string
  specialty: string
  matchScore: number
  matchDimensions: {
    specialtyMatch: number
    availabilityMatch: number
    workloadMatch: number
    patientConditionMatch: number
  }
  matchReasons?: string[]
  availability?: string
  recentCases: number
  averageRating: number
  responseTime: number
  successRate?: number
  recommended?: boolean
}

// 会诊准备清单
export interface ConsultationPreparation {
  // 必需资料
  requiredDocuments: Array<{
    name: string
    status: '已完成' | '未完成' | '不适用'
    url?: string
  }>
  // 建议完善的资料
  suggestedDocuments: Array<{
    name: string
    reason: string
    priority: '高' | '中' | '低'
  }>
  // 资料完整性评分
  completenessScore: number
  // 缺失资料预警
  missingWarnings: string[]
  // 历史类似病例
  similarCases: Array<{
    patientId: string
    diagnosis: string
    treatment: string
    outcome: string
    similarity: number
  }>
}

// 实时会诊辅助
export interface RealtimeAssistance {
  // 语音转写实时摘要
  transcriptionSummary: string
  // 关键信息提取
  extractedInfo: {
    diagnoses: string[]
    treatments: string[]
    exams: string[]
    drugs: string[]
    followups: string[]
  }
  // 相关指南推荐
  guidelines: Array<{
    title: string
    source: string
    year: number
    relevance: number
    content: string
    url?: string
  }>
  // 类似病例推荐
  similarCases: Array<{
    id: string
    diagnosis: string
    treatment: string
    outcome: string
    similarity: number
  }>
  // 药物相互作用预警
  drugInteractions: Array<{
    drug1: string
    drug2: string
    severity: '轻微' | '中等' | '严重' | '禁忌'
    management: string
  }>
  // 检查检验建议
  testSuggestions: string[]
}

// 会诊质量评估
export interface ConsultationQuality {
  // 会诊时长评估
  durationAssessment: {
    actual: number
    expected: number
    rating: '优秀' | '良好' | '一般' | '不足'
  }
  // 讨论充分度
  discussionQuality: {
    score: number
    expertParticipation: number
    opinionDiversity: number
    evidenceBased: number
  }
  // 报告质量
  reportQuality: {
    completeness: number
    standardization: number
    clarity: number
    actionability: number
  }
  // 改进建议
  suggestions: string[]
}

export class IntelligentConsultationService {
  /**
   * 智能会诊申请辅助
   * @param patientId 患者 ID
   * @param basicInfo 基本信息
   */
  async generateApplication(
    patientId: string,
    basicInfo: {
      chiefComplaint: string
      diagnosis: string
      department: string
    }
  ): Promise<IntelligentApplication> {
    const response = await aiApi.post('/consultation/application/generate', {
      patientId,
      ...basicInfo,
      timestamp: new Date().toISOString()
    })
    return response.data as IntelligentApplication
  }

  /**
   * 智能推荐专家
   * @param diagnosis 诊断
   * @param condition 病情
   * @param availableTime 可用时间
   */
  async recommendExperts(options: {
    diagnosis: string
    condition: string
    availableTime?: string
    preferredDepartments?: string[]
    urgency?: string
  }): Promise<ExpertMatch[]> {
    // 模拟 API 延迟
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 模拟专家匹配结果
    const mockExperts: ExpertMatch[] = [
      {
        expertId: 'E001',
        name: '张明华',
        department: '肿瘤科',
        title: '主任医师',
        specialty: '肺癌、食管癌综合治疗',
        matchScore: 95,
        matchDimensions: {
          specialtyMatch: 0.95,
          availabilityMatch: 1.0,
          workloadMatch: 0.9,
          patientConditionMatch: 0.95
        },
        matchReasons: [
          '擅长肺癌综合治疗，与患者诊断高度匹配',
          '近期有类似成功案例',
          '当前状态空闲，可立即安排会诊'
        ],
        availability: '空闲',
        recentCases: 156,
        averageRating: 4.8,
        responseTime: 2,
        successRate: 92.5,
        recommended: true
      },
      {
        expertId: 'E002',
        name: '李芳',
        department: '胸外科',
        title: '副主任医师',
        specialty: '胸部肿瘤外科治疗',
        matchScore: 88,
        matchDimensions: {
          specialtyMatch: 0.88,
          availabilityMatch: 1.0,
          workloadMatch: 0.85,
          patientConditionMatch: 0.9
        },
        matchReasons: [
          '擅长胸部肿瘤外科手术',
          '具有丰富的MDT会诊经验',
          '患者病情适合外科干预'
        ],
        availability: '空闲',
        recentCases: 98,
        averageRating: 4.6,
        responseTime: 3,
        successRate: 89.3,
        recommended: true
      },
      {
        expertId: 'E003',
        name: '王建国',
        department: '放射科',
        title: '主任医师',
        specialty: '肿瘤影像诊断、放疗',
        matchScore: 85,
        matchDimensions: {
          specialtyMatch: 0.85,
          availabilityMatch: 0.6,
          workloadMatch: 0.9,
          patientConditionMatch: 0.85
        },
        matchReasons: [
          '擅长肿瘤影像诊断',
          '可为手术方案提供影像支持',
          '具有放疗经验，可提供综合治疗建议'
        ],
        availability: '忙碌',
        recentCases: 203,
        averageRating: 4.9,
        responseTime: 4,
        successRate: 94.1,
        recommended: false
      },
      {
        expertId: 'E004',
        name: '陈伟',
        department: '病理科',
        title: '副主任医师',
        specialty: '肿瘤病理诊断',
        matchScore: 82,
        matchDimensions: {
          specialtyMatch: 0.82,
          availabilityMatch: 1.0,
          workloadMatch: 0.88,
          patientConditionMatch: 0.8
        },
        matchReasons: [
          '擅长肿瘤病理诊断',
          '可为治疗方案提供病理依据',
          '具有分子病理检测经验'
        ],
        availability: '空闲',
        recentCases: 178,
        averageRating: 4.7,
        responseTime: 2,
        successRate: 96.2,
        recommended: true
      },
      {
        expertId: 'E005',
        name: '刘洋',
        department: '呼吸科',
        title: '主任医师',
        specialty: '呼吸系统疾病、肺癌',
        matchScore: 80,
        matchDimensions: {
          specialtyMatch: 0.8,
          availabilityMatch: 1.0,
          workloadMatch: 0.85,
          patientConditionMatch: 0.75
        },
        matchReasons: [
          '擅长呼吸系统疾病诊治',
          '可为患者提供呼吸支持建议',
          '具有肺癌综合治疗经验'
        ],
        availability: '空闲',
        recentCases: 145,
        averageRating: 4.5,
        responseTime: 3,
        successRate: 88.7,
        recommended: false
      }
    ]
    
    // 根据诊断和病情进行筛选和排序
    let filteredExperts = mockExperts
    
    // 如果有偏好科室，优先显示
    if (options.preferredDepartments && options.preferredDepartments.length > 0) {
      filteredExperts = mockExperts.sort((a, b) => {
        const aPreferred = options.preferredDepartments!.includes(a.department) ? 1 : 0
        const bPreferred = options.preferredDepartments!.includes(b.department) ? 1 : 0
        return bPreferred - aPreferred || b.matchScore - a.matchScore
      })
    }
    
    return filteredExperts
  }

  /**
   * 会诊准备度检查
   * @param consultationId 会诊 ID
   */
  async checkPreparation(consultationId: string): Promise<ConsultationPreparation> {
    const response = await aiApi.post('/consultation/preparation/check', {
      consultationId
    })
    return response.data as ConsultationPreparation
  }

  /**
   * 实时会诊辅助
   * @param consultationId 会诊 ID
   * @param audioStream 音频流
   */
  async getRealtimeAssistance(options: {
    consultationId: string
    transcription?: string
    currentDiscussion: string
  }): Promise<RealtimeAssistance> {
    const response = await aiApi.post('/consultation/realtime/assist', options)
    return response.data as RealtimeAssistance
  }

  /**
   * 会诊质量评估
   * @param consultationId 会诊 ID
   * @param discussionRecords 讨论记录
   */
  async evaluateQuality(options: {
    consultationId: string
    duration: number
    discussionRecords: Array<{
      expertId: string
      content: string
      duration: number
    }>
    report: any
  }): Promise<ConsultationQuality> {
    const response = await aiApi.post('/consultation/quality/evaluate', options)
    return response.data as ConsultationQuality
  }

  /**
   * 智能排期优化
   * @param experts 专家列表
   * @param urgency 紧急程度
   */
  async optimizeSchedule(options: {
    experts: string[]
    urgency: '紧急' | '常规' | '择期'
    preferredDates: string[]
    duration: number
  }): Promise<{
    recommendedSlots: Array<{
      date: string
      time: string
      score: number
      availableExperts: number
    }>
    reasoning: string
  }> {
    const response = await aiApi.post('/consultation/schedule/optimize', options)
    return response.data
  }

  /**
   * 会诊预后预测
   * @param diagnosis 诊断
   * @param treatmentPlan 治疗方案
   * @param patientInfo 患者信息
   */
  async predictOutcome(options: {
    diagnosis: string
    stage: string
    treatmentPlan: string[]
    patientInfo: {
      age: number
      performance: number
      comorbidities: string[]
      organFunction: Record<string, string>
    }
  }): Promise<{
    responseRate: number
    survivalRate: {
      oneYear: number
      threeYear: number
      fiveYear: number
    }
    qualityOfLife: number
    riskFactors: string[]
    suggestions: string[]
  }> {
    const response = await aiApi.post('/consultation/outcome/predict', options)
    return response.data
  }

  /**
   * 获取智能会诊申请建议（用于前端快速调用）
   * @param patientId 患者 ID
   */
  async getIntelligentApplication(patientId: string): Promise<IntelligentApplication> {
    // 模拟 AI 分析返回
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    return {
      patientInfo: {
        name: '张三',
        age: 58,
        gender: '男',
        mrn: 'MRN20240001',
        department: '呼吸内科',
        diagnosis: '右肺上叶肺腺癌',
        stage: 'cT2aN2M0, IIIA期'
      },
      recommendedType: '院内',
      recommendedDepartments: [
        { department: '肿瘤内科', reason: '患者诊断为肺腺癌，需制定综合治疗方案', priority: 1 },
        { department: '胸外科', reason: '评估手术可行性', priority: 2 },
        { department: '放疗科', reason: '评估局部放疗指征', priority: 3 }
      ],
      recommendedExperts: [
        {
          id: '1',
          name: '张明华',
          department: '胸外科',
          title: '主任医师',
          specialty: '肺癌外科治疗',
          matchScore: 0.95,
          reason: '擅长肺癌外科治疗，经验丰富',
          available: true
        },
        {
          id: '2',
          name: '李芳',
          department: '肿瘤内科',
          title: '副主任医师',
          specialty: '肺癌靶向治疗',
          matchScore: 0.92,
          reason: '擅长肺癌靶向治疗，符合患者基因突变类型',
          available: true
        },
        {
          id: '3',
          name: '陈伟',
          department: '放疗科',
          title: '主治医师',
          specialty: '胸部肿瘤放疗',
          matchScore: 0.88,
          reason: '擅长胸部肿瘤放疗',
          available: false
        },
        {
          id: '4',
          name: '王建国',
          department: '病理科',
          title: '主任医师',
          specialty: '肺部肿瘤病理诊断',
          matchScore: 0.85,
          reason: '可提供病理诊断支持',
          available: true
        },
        {
          id: '5',
          name: '赵敏',
          department: '影像科',
          title: '副主任医师',
          specialty: '胸部影像诊断',
          matchScore: 0.82,
          reason: '可提供影像学评估',
          available: true
        }
      ],
      suggestedExams: [
        { examType: '基因检测', examName: 'EGFR/ALK/ROS1 基因检测', reason: '指导靶向治疗选择', urgency: '紧急' },
        { examType: '影像检查', examName: 'PET-CT', reason: '评估全身转移情况', urgency: '常规' },
        { examType: '血液检查', examName: '肿瘤标志物全套', reason: '基线评估', urgency: '常规' }
      ],
      summary: '患者张三，男，58岁，因"咳嗽、咳痰伴痰中带血3个月"入院。胸部CT示右肺上叶占位（约4.5cm×3.8cm），伴右侧肺门及纵隔淋巴结肿大。支气管镜活检病理示：肺腺癌。临床分期：cT2aN2M0，IIIA期。患者既往吸烟史20年，无其他基础疾病。目前诊断明确，需多学科会诊制定综合治疗方案。',
      purposes: [
        '明确患者目前分期及手术可行性',
        '制定个体化综合治疗方案（手术/放疗/靶向治疗）',
        '评估靶向治疗指征及药物选择',
        '讨论后续随访及监测方案'
      ]
    }
  }
}

export default new IntelligentConsultationService()
