/**
 * AI 患者 MDT 需求筛查服务
 * 
 * 基于患者病情自动评估是否需要 MDT 会议诊议诊断诊断断，提供智能分级和预警
 * 避免医生存生存存期疗科室科室室资源浪费，确保真正需要的患者得到 MDT 服务
 */

import { aiApi } from '../../../utils/api'

// MDT 适应症评估结果果果
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
  // 推荐会议诊类型
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

// 治疗科室疗科室科室室疗科室科室室难度评估
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
  recurrenceRisk?: {
    level: 'low' | 'medium' | 'high'
    probability: number
    timeFrame: string
  }
}

// 社会议诊议诊断因素评估
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
  type: 'mdt_needed' | 'needs_review' | 'mdt_not_needed'
  level: 'urgent' | 'warning' | 'info'
  message: string
  indications: string[]
  recommendations: string[]
  reasons?: string[]
  suggestedActions?: string[]
  createdAt: string
  timestamp?: string
  reviewed: boolean
  reviewedBy?: string
  reviewedAt?: string
  reviewComment?: string
  score?: number
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
        department: '普外科室科室室科室室',
        admissionDate: '2024-01-10'
      },
      necessityScore: 92,
      recommendationLevel: '强烈推荐',
      indications: {
        matched: [
          { code: 'A01', name: '恶性肿瘤瘤瘤晚期', category: '疾病复杂', description: '胰腺癌 IV 期，伴多发转移', weight: 0.35, matched: true },
          { code: 'A02', name: '疑难重症', category: '疾病复杂', description: '病情复杂，诊断断断困难', weight: 0.25, matched: true },
          { code: 'B01', name: '治疗方案选择困难', category: '治疗困难', description: '多种治疗方式需要权衡', weight: 0.2, matched: true },
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
            available: ['新辅助化疗科室科室室', '姑息性手术术术', '支持治疗科室疗科室科室室疗科室科室室'],
            contraindications: ['根治疗科室疗科室科室室性手术术术'],
            challenges: [
              '晚期胰腺癌无法手术术术根治疗科室疗科室科室室',
              '合并梗阻性黄疸需要处理',
              '多学科室室治疗科室疗科室科室室疗科室科室室方案案案案需要协调'
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
      recommendedDepartments: ['普外科室科室室科室室', '肿瘤瘤瘤内科室科室室科室室', '放疗科室科室科室室科室室科室室', '影像科室科室科室室科室室科室室', '介入科室室', '消化内科室科室室科室室', '内科室科室室分泌科室室'],
      urgency: '紧急',
      expectedBenefits: [
        '明确诊断断断和分期',
        '制定综合治疗科室疗科室科室室疗科室科室室方案案案案（手术术术/化疗科室科室室/放疗科室科室科室室科室室/靶向）',
        '制定姑息治疗科室疗科室科室室疗科室科室室和对症支持方案案案',
        '评估介入治疗科室疗科室科室室疗科室科室室指征（如胆道引流）'
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
        department: '胸外科室科室科室室科室室科室室',
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
            primary: '右肺上叶占位性病变变变',
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
            available: ['手术术术切除除除', '新辅助化疗科室科室室', '放疗科室科室科室室科室室'],
            contraindications: [],
            challenges: [
              '患者年龄较大，合并症多',
              '手术术术风险险险较高',
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
      recommendedDepartments: ['胸外科室科室科室室科室室科室室', '肿瘤瘤瘤内科室科室室科室室', '放疗科室科室科室室科室室科室室', '心内科室科室科室室科室室科室室', '内科室科室室分泌科室室'],
      urgency: '常规',
      expectedBenefits: [
        '制定个体化综合治疗科室疗科室科室室疗科室科室室方案案案案',
        '评估手术术术风险险险和获益',
        '优化围手术术术期管理',
        '提高治疗科室疗科室科室室疗科室科室室效果，改善预后'
      ],
      confidence: 0.88
    }

    this.mockAssessments.set('P001', patient1)
    this.mockAssessments.set('P002', patient2)

    // 直肠癌患者 - 可考虑 MDT
    const patient3: MDTNecessityAssessment = {
      patientInfo: {
        patientId: 'P003',
        name: '张伟',
        age: 45,
        gender: '男',
        department: '肛肠外科',
        admissionDate: '2024-02-01'
      },
      necessityScore: 65,
      recommendationLevel: '可考虑',
      indications: {
        matched: [
          { code: 'A01', name: '恶性肿瘤', category: '疾病复杂', description: '直肠癌 II 期', weight: 0.3, matched: true },
          { code: 'B01', name: '需要保肛', category: '治疗困难', description: '患者有保肛需求', weight: 0.2, matched: true }
        ],
        notMatched: [
          { code: 'C01', name: '预后不良', category: '预后不良', description: '早期预后较好', weight: 0.25, matched: false }
        ]
      },
      assessmentDimensions: {
        diseaseComplexity: {
          score: 6,
          factors: [],
          diagnosis: {
            primary: '直肠腺癌',
            secondary: [],
            icd10: ['C20'],
            rarity: 'common',
            complexity: 'moderate'
          },
          stage: {
            stage: 'II',
            metastasis: false,
            comorbidities: {
              count: 0,
              list: [],
              cci: 0
            }
          }
        } as any,
        treatmentDifficulty: {
          score: 6,
          factors: [],
          treatmentOptions: {
            available: ['手术切除', '新辅助放化疗', '辅助化疗'],
            contraindications: [],
            challenges: ['保肛需求', '肿瘤位置较低']
          }
        },
        prognosis: {
          score: 7,
          survivalEstimate: {
            median: '5 年生存率 70-80%',
            range: '5-10 年',
            confidence: 0.75
          },
          qualityOfLife: {
            current: 80,
            predicted: 75
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
      recommendedDepartments: ['肛肠外科', '肿瘤内科', '放疗科', '影像科'],
      urgency: '常规',
      expectedBenefits: [
        '评估保肛可能性',
        '制定新辅助治疗方案',
        '优化手术时机'
      ],
      confidence: 0.75
    }

    // 胃癌患者 - 推荐 MDT
    const patient4: MDTNecessityAssessment = {
      patientInfo: {
        patientId: 'P004',
        name: '李秀英',
        age: 68,
        gender: '女',
        department: '普外科',
        admissionDate: '2024-02-10'
      },
      necessityScore: 82,
      recommendationLevel: '推荐',
      indications: {
        matched: [
          { code: 'A01', name: '恶性肿瘤晚期', category: '疾病复杂', description: '胃癌 III 期', weight: 0.35, matched: true },
          { code: 'A02', name: '高龄患者', category: '疾病复杂', description: '年龄 68 岁', weight: 0.2, matched: true },
          { code: 'B01', name: '治疗方案选择困难', category: '治疗困难', description: '需要权衡手术风险', weight: 0.2, matched: true }
        ],
        notMatched: []
      },
      assessmentDimensions: {
        diseaseComplexity: {
          score: 8,
          factors: [],
          diagnosis: {
            primary: '胃腺癌',
            secondary: ['贫血', '营养不良'],
            icd10: ['C16', 'D64', 'E46'],
            rarity: 'common',
            complexity: 'complex'
          },
          stage: {
            stage: 'III',
            metastasis: false,
            comorbidities: {
              count: 2,
              list: [
                { name: '贫血', severity: 'moderate', impact: 0.6 },
                { name: '营养不良', severity: 'moderate', impact: 0.5 }
              ],
              cci: 4
            }
          }
        } as any,
        treatmentDifficulty: {
          score: 8,
          factors: [],
          treatmentOptions: {
            available: ['手术切除', '新辅助化疗', '支持治疗'],
            contraindications: [],
            challenges: ['高龄', '营养状况差', '贫血']
          }
        },
        prognosis: {
          score: 7,
          survivalEstimate: {
            median: '2-4 年',
            range: '1-5 年',
            confidence: 0.7
          },
          qualityOfLife: {
            current: 60,
            predicted: 65
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
      recommendedDepartments: ['普外科', '肿瘤内科', '营养科', '麻醉科'],
      urgency: '常规',
      expectedBenefits: [
        '评估手术耐受性',
        '制定围手术期营养支持方案',
        '优化治疗方案'
      ],
      confidence: 0.82
    }

    // 肝癌患者 - 强烈推荐 MDT
    const patient5: MDTNecessityAssessment = {
      patientInfo: {
        patientId: 'P005',
        name: '王建国',
        age: 62,
        gender: '男',
        department: '肝胆外科',
        admissionDate: '2024-02-15'
      },
      necessityScore: 90,
      recommendationLevel: '强烈推荐',
      indications: {
        matched: [
          { code: 'A01', name: '恶性肿瘤晚期', category: '疾病复杂', description: '肝癌 IV 期', weight: 0.35, matched: true },
          { code: 'A02', name: '肝硬化', category: '疾病复杂', description: '合并肝硬化', weight: 0.25, matched: true },
          { code: 'B01', name: '治疗方案选择困难', category: '治疗困难', description: '多种治疗方式需要权衡', weight: 0.2, matched: true },
          { code: 'C01', name: '预后不良', category: '预后不良', description: '晚期肝癌预后差', weight: 0.25, matched: true }
        ],
        notMatched: []
      },
      assessmentDimensions: {
        diseaseComplexity: {
          score: 9,
          factors: [],
          diagnosis: {
            primary: '肝细胞癌',
            secondary: ['乙肝肝硬化', '门静脉高压', '腹水'],
            icd10: ['C22', 'K74', 'K76'],
            rarity: 'common',
            complexity: 'very_complex'
          },
          stage: {
            stage: 'IV',
            metastasis: true,
            comorbidities: {
              count: 3,
              list: [
                { name: '乙肝肝硬化', severity: 'severe', impact: 0.9 },
                { name: '门静脉高压', severity: 'severe', impact: 0.8 },
                { name: '腹水', severity: 'moderate', impact: 0.6 }
              ],
              cci: 7
            }
          }
        } as any,
        treatmentDifficulty: {
          score: 9,
          factors: [],
          treatmentOptions: {
            available: ['介入治疗', '靶向治疗', '免疫治疗', '支持治疗'],
            contraindications: ['手术切除'],
            challenges: ['肝功能差', '门静脉癌栓', '多发转移']
          }
        },
        prognosis: {
          score: 8,
          survivalEstimate: {
            median: '6-12 个月',
            range: '3-18 个月',
            confidence: 0.75
          },
          qualityOfLife: {
            current: 50,
            predicted: 45
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
      recommendedDepartments: ['肝胆外科', '肿瘤内科', '介入科', '放疗科', '肝病科'],
      urgency: '紧急',
      expectedBenefits: [
        '制定综合治疗方案',
        '评估介入治疗指征',
        '改善生活质量',
        '延长生存期'
      ],
      confidence: 0.90
    }

    this.mockAssessments.set('P003', patient3)
    this.mockAssessments.set('P004', patient4)
    this.mockAssessments.set('P005', patient5)
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
   * @param patientInfo 患者信息息息
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

    if (patientInfo.diagnosis.includes('癌') || patientInfo.diagnosis.includes('肿瘤瘤瘤')) {
      score += 40
      indications.push({
        code: 'A01',
        name: '恶性肿瘤瘤瘤',
        category: '疾病复杂',
        description: '诊断断断为恶性肿瘤瘤瘤',
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
      expectedBenefits: ['明确诊断断断', '制定治疗科室疗科室科室室疗科室科室室方案案案案'],
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
        name: '恶性肿瘤瘤瘤晚期',
        category: 'absolute',
        description: '恶性肿瘤瘤瘤 III-IV 期',
        weight: 0.35,
        enabled: true
      },
      {
        id: 'R002',
        code: 'A02',
        name: '疑难重症',
        category: 'absolute',
        description: '病情复杂，诊断断断困难',
        weight: 0.25,
        enabled: true
      },
      {
        id: 'R003',
        code: 'B01',
        name: '治疗科室疗科室科室室疗科室科室室方案案案案选择困难',
        category: 'relative',
        description: '存在多种治疗科室疗科室科室室疗科室科室室方案案案案，需要权衡',
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
    scoreRange?: {
      min: number
      max: number
    }
  }): Promise<ScreeningAlert[]> {
    await new Promise(resolve => setTimeout(resolve, 500))

    const alerts: ScreeningAlert[] = [
      {
        id: 'A001',
        patientId: 'P001',
        patientName: '陈国强',
        department: '普外科室科室室科室室',
        type: 'mdt_needed',
        level: 'urgent',
        message: '胰腺癌晚期 IV 期，病情极其复杂，强烈建议 MDT 会议诊议诊断诊断断',
        indications: [
          '恶性肿瘤瘤瘤晚期（胰腺癌 IV 期）',
          '伴多发转移（肝转移、腹膜转移）',
          '合并梗阻性黄疸和 2 型糖尿病',
          '肿瘤瘤瘤标志物显著升高（CA19-9: 1250 U/mL）',
          '治疗科室疗科室科室室疗科室科室室方案案案案选择困难，需要综合评估'
        ],
        recommendations: [
          '立即组织 MDT 会议诊议诊断诊断断（紧急）',
          '讨论新辅助化疗科室科室室方案案案',
          '制定姑息治疗科室疗科室科室室疗科室科室室和对症支持治疗科室疗科室科室室疗科室科室室方案案案案',
          '评估介入治疗科室疗科室科室室疗科室科室室（如胆道引流）指征',
          '评估靶向治疗科室疗科室科室室疗科室科室室和免疫治疗科室疗科室科室室疗科室科室室可能性'
        ],
        createdAt: '2024-01-10T08:30:00Z',
        reviewed: false,
        score: 92
      },
      {
        id: 'A002',
        patientId: 'P002',
        patientName: '张建国',
        department: '胸外科室科室科室室科室室科室室',
        type: 'mdt_needed',
        level: 'warning',
        message: '肺癌 III 期，病情复杂，建议 MDT 会议诊议诊断诊断断',
        indications: [
          '恶性肿瘤瘤瘤（右肺上叶癌 III 期）',
          '合并 2 型糖尿病和高血压 3 级',
          '患者年龄较大（65 岁）',
          '手术术术风险险险评估需要多学科室室协作'
        ],
        recommendations: [
          '组织 MDT 会议诊议诊断诊断断',
          '评估手术术术风险险险和获益',
          '制定个体化综合治疗科室疗科室科室室疗科室科室室方案案案案',
          '优化围手术术术期管理',
          '心肺功能评估'
        ],
        createdAt: '2024-01-15T10:00:00Z',
        reviewed: false,
        score: 78
      },
      {
        id: 'A003',
        patientId: 'P003',
        patientName: '李秀英',
        department: '肿瘤瘤瘤内科室科室室科室室',
        type: 'mdt_needed',
        level: 'warning',
        message: '乳腺癌术后复发，治疗科室疗科室科室室疗科室科室室方案案案案选择困难',
        indications: [
          '乳腺癌术后复发',
          '既往史史多线治疗科室疗科室科室室疗科室科室室失败',
          '需要制定后续治疗科室疗科室科室室疗科室科室室方案案案案',
          '存在基因检查查测指征'
        ],
        recommendations: [
          '组织 MDT 讨论论论',
          '制定个体化治疗科室疗科室科室室疗科室科室室方案案案案',
          '建议基因检查查测指导靶向治疗科室疗科室科室室疗科室科室室',
          '评估免疫治疗科室疗科室科室室疗科室科室室可能性'
        ],
        createdAt: '2024-01-16T14:30:00Z',
        reviewed: true,
        reviewedBy: '王医生存生存存期生存存期',
        reviewedAt: '2024-01-16T15:00:00Z',
        reviewComment: '已安排 MDT 会议诊议诊断诊断断',
        score: 72
      },
      {
        id: 'A004',
        patientId: 'P004',
        patientName: '王志华',
        department: '呼吸内科室科室室科室室',
        type: 'needs_review',
        level: 'info',
        message: '肺部占位性病变变变，诊断断断不明确',
        indications: [
          '肺部占位性病变变变性质待查',
          '需要鉴别诊断断断',
          '可能需要多学科室室协作'
        ],
        recommendations: [
          '建议 MDT 会议诊议诊断诊断断明确诊断断断',
          '完善相关检查查查',
          '必要时行穿刺活检查查'
        ],
        createdAt: '2024-01-17T09:15:00Z',
        reviewed: false,
        score: 55
      },
      {
        id: 'A005',
        patientId: 'P005',
        patientName: '刘志刚',
        department: '肝胆外科室科室室科室室',
        type: 'mdt_needed',
        level: 'urgent',
        message: '肝癌晚期伴门静脉癌栓，病情危重',
        indications: [
          '原发性肝癌晚期（CNLC IIIb 期）',
          '门静脉癌栓形成',
          '肝功能 Child-Pugh B 级',
          'AFP 显著升高（>1000 ng/mL）'
        ],
        recommendations: [
          '紧急 MDT 会议诊议诊断诊断断',
          '评估靶向 + 免疫联合治疗科室疗科室科室室疗科室科室室',
          '评估介入治疗科室疗科室科室室疗科室科室室（TACE）指征',
          '评估放疗科室科室科室室科室室可能性',
          '保肝治疗科室疗科室科室室疗科室科室室和支持治疗科室疗科室科室室疗科室科室室'
        ],
        createdAt: '2024-01-18T11:20:00Z',
        reviewed: false,
        score: 88
      },
      {
        id: 'A006',
        patientId: 'P006',
        patientName: '赵敏',
        department: '妇科室室',
        type: 'mdt_needed',
        level: 'warning',
        message: '卵巢癌晚期，需要综合治疗科室疗科室科室室疗科室科室室',
        indications: [
          '卵巢癌 IIIC 期',
          '腹腔多发转移',
          '需要新辅助化疗科室科室室后手术术术',
          'BRCA 基因检查查测阳性'
        ],
        recommendations: [
          '组织 MDT 会议诊议诊断诊断断',
          '制定新辅助化疗科室科室室方案案案',
          '评估手术术术时机和范围',
          'PARP 抑制剂维持治疗科室疗科室科室室疗科室科室室'
        ],
        createdAt: '2024-01-19T13:45:00Z',
        reviewed: false,
        score: 75
      },
      {
        id: 'A007',
        patientId: 'P007',
        patientName: '孙伟',
        department: '神经内科室科室室科室室',
        type: 'mdt_not_needed',
        level: 'info',
        message: '脑梗死急性期，病情相对稳定',
        indications: [
          '急性脑梗死',
          'NIHSS 评分 5 分',
          '无严重并发症'
        ],
        recommendations: [
          '常规治疗科室疗科室科室室疗科室科室室',
          '定期随访',
          '康复治疗科室疗科室科室室疗科室科室室'
        ],
        createdAt: '2024-01-20T08:00:00Z',
        reviewed: false,
        score: 35
      },
      {
        id: 'A008',
        patientId: 'P008',
        patientName: '周建华',
        department: '骨科室室',
        type: 'needs_review',
        level: 'warning',
        message: '骨肉瘤术后复发，治疗科室疗科室科室室疗科室科室室困难',
        indications: [
          '骨肉瘤术后复发',
          '肺转移',
          '既往史史化疗科室科室室耐药'
        ],
        recommendations: [
          '建议 MDT 会议诊议诊断诊断断',
          '评估二线化疗科室科室室方案案案',
          '评估靶向治疗科室疗科室科室室疗科室科室室',
          '姑息治疗科室疗科室科室室疗科室科室室'
        ],
        createdAt: '2024-01-21T10:30:00Z',
        reviewed: false,
        score: 68
      },
      {
        id: 'A009',
        patientId: 'P009',
        patientName: '吴芳',
        department: '血液科室室',
        type: 'mdt_needed',
        level: 'urgent',
        message: '急性髓系白血病复发，预后极差',
        indications: [
          '急性髓系白血病（AML）复发',
          '高危染色体核型',
          '既往史史造血干细胞移植后复发',
          '年龄 58 岁'
        ],
        recommendations: [
          '紧急 MDT 会议诊议诊断诊断断',
          '评估挽救性化疗科室科室室',
          '评估 CAR-T 治疗科室疗科室科室室疗科室科室室',
          '评估二次移植可能性',
          '支持治疗科室疗科室科室室疗科室科室室'
        ],
        createdAt: '2024-01-22T09:00:00Z',
        reviewed: false,
        score: 90
      },
      {
        id: 'A010',
        patientId: 'P010',
        patientName: '郑强',
        department: '泌尿外科室科室室科室室',
        type: 'mdt_not_needed',
        level: 'info',
        message: '前列腺癌根治疗科室疗科室科室室术后，恢复良好',
        indications: [
          '前列腺癌根治疗科室疗科室科室室术后',
          'PSA 控制良好',
          '无复发征象'
        ],
        recommendations: [
          '定期随访',
          '内科室科室室分泌治疗科室疗科室科室室疗科室科室室',
          '生存存期活方案案式指导'
        ],
        createdAt: '2024-01-23T14:15:00Z',
        reviewed: true,
        reviewedBy: '李医生存生存存期生存存期',
        reviewedAt: '2024-01-23T15:00:00Z',
        reviewComment: '无需 MDT，常规随访即可',
        score: 25
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
      if (filters.scoreRange) {
        filteredAlerts = filteredAlerts.filter(a => 
          (a.score || 0) >= filters.scoreRange!.min && 
          (a.score || 0) <= filters.scoreRange!.max
        )
      }
    }

    return filteredAlerts
  }

  /**
   * 标记录录警报为已审核
   */
  async reviewAlert(alertId: string, comment?: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300))
    console.log(`警报 ${alertId} 已审核，评论${comment}`)
  }

  /**
   * 批量审核警报
   */
  async batchReviewAlerts(alertIds: string[], comment?: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log(`批量审核 ${alertIds.length} 个警报，评论${comment}`)
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

  exportPreDiagnosisReport(alertId: string): string {
    return `筛查报告 - ${alertId}`
  }

  async exportReport(options: {
    format: 'excel' | 'pdf'
    dateRange?: {
      start: string
      end: string
    }
    includeDetails?: boolean
  }): Promise<Blob> {
    return new Blob(['报告内容'], { type: 'application/vnd.ms-excel' })
  }
}

export default new AIPatientScreeningService()
