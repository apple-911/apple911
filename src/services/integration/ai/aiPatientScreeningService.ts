/**
 * AI 患者 MDT 需求筛查服务
 * 
 * 基于患者病情自动评估是否需要 MDT 会诊，提供智能分级和预警
 * 避免医疗资源浪费，确保真正需要的患者得到 MDT 服务
 */

import { aiApi } from '../../../utils/api'

// MDT 适应症评估结果
export interface MDTNecessityAssessment {
  // 患者基本信息
  patientInfo: {
    patientId: string
    name: string
    age: number
    gender: string
    department: string
    admissionDate: string
  }
  // MDT 必要性评分
  necessityScore: number
  // 推荐等级
  recommendationLevel: '强烈推荐' | '推荐' | '可考虑' | '不推荐'
  // 适应证匹配
  indications: {
    matched: MDTIndication[]
    notMatched: MDTIndication[]
  }
  // 评估维度
  assessmentDimensions: {
    diseaseComplexity: DiseaseComplexityAssessment
    treatmentDifficulty: TreatmentDifficultyAssessment
    prognosis: PrognosisAssessment
    socialFactors: SocialFactorsAssessment
  }
  // 推荐会诊类型
  recommendedType: '院内 MDT' | '远程 MDT' | '床旁 MDT' | '无需 MDT'
  // 推荐科室
  recommendedDepartments: string[]
  // 紧急程度
  urgency: '紧急' | '常规' | '择期'
  // 预期获益
  expectedBenefits: string[]
  // 不推荐理由（如适用）
  notRecommendedReasons?: string[]
  // 置信度
  confidence: number
}

// MDT 适应证
export interface MDTIndication {
  code: string
  name: string
  category: '疾病复杂' | '治疗困难' | '预后不良' | '社会因素'
  description: string
  weight: number
  matched: boolean
  evidence?: string
}

// 疾病复杂度评估
export interface DiseaseComplexityAssessment {
  score: number
  factors: Array<{
    factor: string
    present: boolean
    weight: number
    description: string
  }>
  diagnosis: {
    primary: string
    secondary: string[]
    icd10: string[]
    rarity: 'common' | 'uncommon' | 'rare' | 'very_rare'
    complexity: 'simple' | 'moderate' | 'complex' | 'very_complex'
  }
  stage: {
    tnm?: {
      t: string
      n: string
      m: string
      stage: string
    }
    stage: 'I' | 'II' | 'III' | 'IV'
    metastasis: boolean
  }
  comorbidities: {
    count: number
    list: Array<{
      name: string
      severity: 'mild' | 'moderate' | 'severe'
      impact: number
    }>
    cci: number // Charlson 合并症指数
  }
}

// 治疗难度评估
export interface TreatmentDifficultyAssessment {
  score: number
  factors: Array<{
    factor: string
    present: boolean
    weight: number
    description: string
  }>
  treatmentOptions: {
    available: string[]
    contraindications: string[]
    challenges: string[]
  }
}

// 预后评估
export interface PrognosisAssessment {
  score: number
  survivalEstimate: {
    median: string
    range: string
    confidence: number
  }
  qualityOfLife: {
    current: number
    predicted: number
  }
}

// 社会因素评估
export interface SocialFactorsAssessment {
  score: number
  factors: Array<{
    factor: string
    present: boolean
    weight: number
    description: string
  }>
  support: {
    family: 'strong' | 'moderate' | 'weak' | 'none'
    economic: 'good' | 'moderate' | 'poor'
    insurance: 'adequate' | 'partial' | 'none'
  }
}

// 筛查规则
export interface ScreeningRule {
  id: string
  code: string
  name: string
  category: 'absolute' | 'relative' | 'exclusion'
  description: string
  weight: number
  enabled: boolean
  department?: string
}

// 筛查警报
export interface ScreeningAlert {
  id: string
  patientId: string
  patientName: string
  department: string
  type: 'indication' | 'warning' | 'reminder'
  level: 'high' | 'medium' | 'low'
  message: string
  indications: string[]
  recommendations: string[]
  createdAt: string
  reviewed: boolean
  reviewedBy?: string
  reviewedAt?: string
  reviewComment?: string
}

class AIPatientScreeningService {
  private mockAssessments: Map<string, MDTNecessityAssessment> = new Map()

  constructor() {
    this.initializeMockData()
  }

  private initializeMockData() {
    // 胰腺癌患者 - 强烈推荐 MDT
    const patient1: MDTNecessityAssessment = {
      patientInfo: {
        patientId: 'P001',
        name: '陈国强',
        age: 58,
        gender: '男',
        department: '普外科',
        admissionDate: '2024-01-10'
      },
      necessityScore: 92,
      recommendationLevel: '强烈推荐',
      indications: {
        matched: [
          { code: 'A01', name: '恶性肿瘤晚期', category: '疾病复杂', description: '胰腺癌 IV 期，伴多发转移', weight: 0.35, matched: true },
          { code: 'A02', name: '疑难重症', category: '疾病复杂', description: '病情复杂，诊断困难', weight: 0.25, matched: true },
          { code: 'B01', name: '治疗方案选择困难', category: '治疗困难', description: '多种治疗方案需要权衡', weight: 0.2, matched: true },
          { code: 'C01', name: '预后不良', category: '预后不良', description: '晚期胰腺癌预后差', weight: 0.25, matched: true }
        ],
        notMatched: [
          { code: 'D01', name: '罕见病', category: '疾病复杂', description: '罕见疾病', weight: 0.15, matched: false }
        ]
      },
      assessmentDimensions: {
        diseaseComplexity: {
          score: 10,
          factors: [],
          diagnosis: {
            primary: '胰腺癌（胰头癌）IV 期',
            secondary: ['梗阻性黄疸', '2 型糖尿病', '肝功能异常'],
            icd10: ['C25.1', 'E83.1', 'E11.9', 'K72.9'],
            rarity: 'uncommon',
            complexity: 'very_complex'
          },
          stage: {
            stage: 'IV',
            metastasis: true,
            comorbidities: {
              count: 3,
              list: [
                { name: '梗阻性黄疸', severity: 'severe', impact: 0.9 },
                { name: '2 型糖尿病', severity: 'moderate', impact: 0.6 },
                { name: '肝功能异常', severity: 'moderate', impact: 0.7 }
              ],
              cci: 6
            }
          }
        } as any,
        treatmentDifficulty: {
          score: 9,
          factors: [],
          treatmentOptions: {
            available: ['新辅助化疗', '姑息性手术', '支持治疗'],
            contraindications: ['根治性手术'],
            challenges: [
              '晚期胰腺癌无法手术根治',
              '合并梗阻性黄疸需要处理',
              '多学科治疗方案需要协调'
            ]
          }
        },
        prognosis: {
          score: 8,
          survivalEstimate: {
            median: '6-12 个月',
            range: '3-18 个月',
            confidence: 0.7
          },
          qualityOfLife: {
            current: 60,
            predicted: 50
          }
        },
        socialFactors: {
          score: 6,
          factors: [],
          support: {
            family: 'strong',
            economic: 'moderate',
            insurance: 'adequate'
          }
        }
      },
      recommendedType: '院内 MDT',
      recommendedDepartments: ['普外科', '肿瘤内科', '放疗科', '影像科', '介入科', '消化内科', '内分泌科'],
      urgency: '紧急',
      expectedBenefits: [
        '明确诊断和分期',
        '制定综合治疗方案（手术/化疗/放疗/靶向）',
        '制定姑息治疗和对症支持方案',
        '评估介入治疗指征（如胆道引流）'
      ],
      confidence: 0.95
    }

    // 肺癌患者 - 推荐 MDT
    const patient2: MDTNecessityAssessment = {
      patientInfo: {
        patientId: 'P002',
        name: '张建国',
        age: 65,
        gender: '男',
        department: '胸外科',
        admissionDate: '2024-01-15'
      },
      necessityScore: 78,
      recommendationLevel: '推荐',
      indications: {
        matched: [
          { code: 'A01', name: '多系统疾病', category: '疾病复杂', description: '患者同时患有多个系统疾病', weight: 0.3, matched: true },
          { code: 'A02', name: '疑难重症', category: '疾病复杂', description: '病情复杂，诊断困难', weight: 0.25, matched: true },
          { code: 'B01', name: '治疗方案选择困难', category: '治疗困难', description: '存在多种治疗方案，需要权衡', weight: 0.2, matched: true },
          { code: 'C01', name: '预后不良', category: '预后不良', description: '肺癌 III 期，预后较差', weight: 0.25, matched: true }
        ],
        notMatched: [
          { code: 'D01', name: '罕见病', category: '疾病复杂', description: '罕见疾病', weight: 0.15, matched: false }
        ]
      },
      assessmentDimensions: {
        diseaseComplexity: {
          score: 8,
          factors: [],
          diagnosis: {
            primary: '右肺上叶占位性病变',
            secondary: ['2 型糖尿病', '高血压病 3 级'],
            icd10: ['C34.1', 'E11.9', 'I10'],
            rarity: 'common',
            complexity: 'complex'
          },
          stage: {
            stage: 'III',
            metastasis: false,
            comorbidities: {
              count: 2,
              list: [
                { name: '2 型糖尿病', severity: 'moderate', impact: 0.6 },
                { name: '高血压病 3 级', severity: 'severe', impact: 0.8 }
              ],
              cci: 4
            }
          }
        } as any,
        treatmentDifficulty: {
          score: 7,
          factors: [],
          treatmentOptions: {
            available: ['手术切除', '新辅助化疗', '放疗'],
            contraindications: [],
            challenges: [
              '患者年龄较大，合并症多',
              '手术风险较高',
              '需要评估心肺功能'
            ]
          }
        },
        prognosis: {
          score: 6,
          survivalEstimate: {
            median: '18-36 个月',
            range: '12-48 个月',
            confidence: 0.65
          },
          qualityOfLife: {
            current: 70,
            predicted: 65
          }
        },
        socialFactors: {
          score: 5,
          factors: [],
          support: {
            family: 'strong',
            economic: 'good',
            insurance: 'adequate'
          }
        }
      },
      recommendedType: '院内 MDT',
      recommendedDepartments: ['胸外科', '肿瘤内科', '放疗科', '心内科', '内分泌科'],
      urgency: '常规',
      expectedBenefits: [
        '制定个体化综合治疗方案',
        '评估手术风险和获益',
        '优化围手术期管理',
        '提高治疗效果，改善预后'
      ],
      confidence: 0.88
    }

    this.mockAssessments.set('P001', patient1)
    this.mockAssessments.set('P002', patient2)
  }

  /**
   * 单个患者 MDT 需求评估
   * @param patientId 患者 ID
   */
  async assessMDTNecessity(patientId: string): Promise<MDTNecessityAssessment> {
    await new Promise(resolve => setTimeout(resolve, 1000))

    const assessment = this.mockAssessments.get(patientId)
    if (!assessment) {
      throw new Error(`未找到患者 ${patientId} 的信息`)
    }

    return assessment
  }

  /**
   * 批量患者筛查
   * @param patientIds 患者 ID 列表
   */
  async batchScreen(patientIds: string[]): Promise<MDTNecessityAssessment[]> {
    const results: MDTNecessityAssessment[] = []
    
    for (const patientId of patientIds) {
      try {
        const assessment = await this.assessMDTNecessity(patientId)
        results.push(assessment)
      } catch (error) {
        console.error(`筛查患者 ${patientId} 失败:`, error)
      }
    }
    
    return results
  }

  /**
   * 实时筛查（患者入院时自动触发）
   * @param patientInfo 患者信息
   */
  async realTimeScreen(patientInfo: {
    patientId: string
    name: string
    age: number
    gender: string
    department: string
    admissionDate: string
    diagnosis: string
  }): Promise<MDTNecessityAssessment> {
    await new Promise(resolve => setTimeout(resolve, 800))

    // 简单规则引擎
    let score = 0
    const indications: MDTIndication[] = []

    if (patientInfo.diagnosis.includes('癌') || patientInfo.diagnosis.includes('肿瘤')) {
      score += 40
      indications.push({
        code: 'A01',
        name: '恶性肿瘤',
        category: '疾病复杂',
        description: '诊断为恶性肿瘤',
        weight: 0.35,
        matched: true
      })
    }

    if (patientInfo.age > 65) {
      score += 15
      indications.push({
        code: 'A02',
        name: '高龄患者',
        category: '疾病复杂',
        description: '患者年龄大于 65 岁',
        weight: 0.15,
        matched: true
      })
    }

    if (patientInfo.diagnosis.includes('晚期') || patientInfo.diagnosis.includes('IV 期')) {
      score += 30
      indications.push({
        code: 'C01',
        name: '疾病晚期',
        category: '预后不良',
        description: '疾病处于晚期阶段',
        weight: 0.25,
        matched: true
      })
    }

    const recommendationLevel: MDTNecessityAssessment['recommendationLevel'] = 
      score >= 80 ? '强烈推荐' :
      score >= 60 ? '推荐' :
      score >= 40 ? '可考虑' : '不推荐'

    return {
      patientInfo: patientInfo as any,
      necessityScore: score,
      recommendationLevel,
      indications: {
        matched: indications,
        notMatched: []
      },
      assessmentDimensions: {} as any,
      recommendedType: score >= 60 ? '院内 MDT' : '无需 MDT',
      recommendedDepartments: [patientInfo.department],
      urgency: score >= 80 ? '紧急' : '常规',
      expectedBenefits: ['明确诊断', '制定治疗方案'],
      confidence: 0.75
    }
  }

  /**
   * 获取筛查规则
   */
  async getScreeningRules(category?: 'absolute' | 'relative' | 'exclusion'): Promise<ScreeningRule[]> {
    await new Promise(resolve => setTimeout(resolve, 500))

    const rules: ScreeningRule[] = [
      {
        id: 'R001',
        code: 'A01',
        name: '恶性肿瘤晚期',
        category: 'absolute',
        description: '恶性肿瘤 III-IV 期',
        weight: 0.35,
        enabled: true
      },
      {
        id: 'R002',
        code: 'A02',
        name: '疑难重症',
        category: 'absolute',
        description: '病情复杂，诊断困难',
        weight: 0.25,
        enabled: true
      },
      {
        id: 'R003',
        code: 'B01',
        name: '治疗方案选择困难',
        category: 'relative',
        description: '存在多种治疗方案，需要权衡',
        weight: 0.2,
        enabled: true
      }
    ]

    if (category) {
      return rules.filter(r => r.category === category)
    }

    return rules
  }

  /**
   * 获取警报列表
   */
  async getAlerts(filters?: {
    type?: ScreeningAlert['type']
    level?: ScreeningAlert['level']
    department?: string
    reviewed?: boolean
    dateRange?: {
      start: string
      end: string
    }
  }): Promise<ScreeningAlert[]> {
    await new Promise(resolve => setTimeout(resolve, 500))

    const alerts: ScreeningAlert[] = [
      {
        id: 'A001',
        patientId: 'P001',
        patientName: '张建国',
        department: '胸外科',
        type: 'indication',
        level: 'high',
        message: '患者病情复杂，建议 MDT 会诊',
        indications: [
          '多系统疾病共存',
          '治疗方案选择困难',
          '存在高风险因素'
        ],
        recommendations: [
          '组织多学科会诊',
          '制定个体化治疗方案',
          '评估手术风险'
        ],
        createdAt: '2024-01-15T10:00:00Z',
        reviewed: false
      },
      {
        id: 'A002',
        patientId: 'P002',
        patientName: '李秀英',
        department: '肿瘤内科',
        type: 'warning',
        level: 'medium',
        message: '治疗方案选择困难，建议 MDT 讨论',
        indications: [
          '多种治疗方案可选',
          '需要权衡利弊'
        ],
        recommendations: [
          '组织 MDT 讨论',
          '制定个体化治疗方案'
        ],
        createdAt: '2024-01-16T14:30:00Z',
        reviewed: true,
        reviewedBy: '王医生',
        reviewedAt: '2024-01-16T15:00:00Z',
        reviewComment: '已安排 MDT 会诊'
      },
      {
        id: 'A003',
        patientId: 'P003',
        patientName: '王志华',
        department: '心内科',
        type: 'reminder',
        level: 'low',
        message: '患者病情需要 MDT 会诊',
        indications: [
          '合并多种疾病',
          '需要多学科协作'
        ],
        recommendations: [
          '建议 MDT 会诊',
          '优化治疗方案'
        ],
        createdAt: '2024-01-17T09:15:00Z',
        reviewed: false
      },
      {
        id: 'A004',
        patientId: 'P001',
        patientName: '陈国强',
        department: '普外科',
        type: 'indication',
        level: 'high',
        message: '胰腺癌晚期，病情复杂，强烈建议 MDT 会诊',
        indications: [
          '恶性肿瘤晚期',
          '肿瘤标志物显著升高',
          '合并梗阻性黄疸和糖尿病',
          '治疗方案选择困难，需要综合评估'
        ],
        recommendations: [
          '立即组织 MDT 会诊',
          '讨论新辅助治疗方案',
          '制定姑息治疗和对症支持治疗方案',
          '评估介入治疗（如胆道引流）指征'
        ],
        createdAt: '2024-01-10T08:30:00Z',
        reviewed: false
      }
    ]

    let filteredAlerts = alerts

    if (filters) {
      if (filters.type) {
        filteredAlerts = filteredAlerts.filter(a => a.type === filters.type)
      }
      if (filters.level) {
        filteredAlerts = filteredAlerts.filter(a => a.level === filters.level)
      }
      if (filters.department) {
        filteredAlerts = filteredAlerts.filter(a => a.department === filters.department)
      }
      if (filters.reviewed !== undefined) {
        filteredAlerts = filteredAlerts.filter(a => a.reviewed === filters.reviewed)
      }
    }

    return filteredAlerts
  }

  /**
   * 标记警报为已审核
   */
  async reviewAlert(alertId: string, comment?: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300))
    console.log(`警报 ${alertId} 已审核，评论：${comment}`)
  }

  /**
   * 批量审核警报
   */
  async batchReviewAlerts(alertIds: string[], comment?: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log(`批量审核 ${alertIds.length} 个警报，评论：${comment}`)
  }

  /**
   * 获取统计数据
   */
  async getStatistics(filters?: {
    patientIds?: string[]
    dateRange?: {
      start: string
      end: string
    }
  }): Promise<{
    total: number
    highRisk: number
    mediumRisk: number
    lowRisk: number
    recommendedMDT: number
    completedMDT: number
  }> {
    await new Promise(resolve => setTimeout(resolve, 300))

    return {
      total: 156,
      highRisk: 45,
      mediumRisk: 68,
      lowRisk: 43,
      recommendedMDT: 52,
      completedMDT: 38
    }
  }
}

export default new AIPatientScreeningService()
