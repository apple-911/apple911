/**
 * AI 会诊预诊断服�? * 
 * 在会诊前基于患者病情和会诊科室，自动生�?AI 预诊断意�? * 帮助医师更好地准备会诊，提高会诊效率和质�? */

import { aiApi } from '../../../utils/api'

// AI 预诊断意�?export interface AIPreDiagnosisOpinion {
  // 基本信息
  consultationId: string
  patientId: string
  generatedAt: string
  
  // 申请科室信息
  requestingDepartment: {
    name: string
    chiefComplaint: string
    preliminaryDiagnosis: string
    consultationPurpose: string
  }
  
  // 会诊科室意见
  consultingDepartments: Array<{
    department: string
    opinion: {
      // 诊断分析
      diagnosisAnalysis: {
        assessment: string
        differentialDiagnosis: Array<{
          diagnosis: string
          probability: number
          icd10: string
          reasoning: string
          supportingEvidence: string[]
          contradictingEvidence: string[]
        }>
        keyFindings: string[]
        missingInformation: string[]
      }
      
      // 治疗建议
      treatmentRecommendations: {
        primaryRecommendation: string
        alternatives: string[]
        contraindications: string[]
        evidenceLevel: 'I' | 'II' | 'III' | 'IV' | 'V'
        guideline: string
      }
      
      // 检查建�?      examRecommendations: Array<{
        examType: 'lab' | 'imaging' | 'pathology' | 'function' | 'genetic'
        examName: string
        purpose: string
        priority: 'urgent' | 'important' | 'optional'
        expectedFindings: string
      }>
      
      // 预后评估
      prognosis: {
        overall: 'excellent' | 'good' | 'fair' | 'poor'
        survivalEstimate?: {
          oneYear: number
          threeYear: number
          fiveYear: number
        }
        recurrenceRisk: 'low' | 'intermediate' | 'high'
        qualityOfLife: number
        keyFactors: string[]
      }
      
      // 专科评估
      specialtyAssessment: {
        keyPoints: string[]
        concerns: string[]
        opportunities: string[]
        departmentSpecificAdvice: string[]
      }
    }
  }>
  
  // 综合建议
  integratedRecommendations: {
    // 最可能的诊�?    mostLikelyDiagnosis: {
      diagnosis: string
      confidence: number
      icd10: string
      staging?: string
      basis: string[]
    }
    
    // 推荐的治疗策�?    treatmentStrategy: {
      approach: 'curative' | 'palliative' | 'neoadjuvant' | 'adjuvant'
      sequence: string[]
      timeline: string
      goals: string[]
    }
    
    // 需要优先解决的问题
    priorityIssues: Array<{
      issue: string
      urgency: 'immediate' | 'urgent' | 'important' | 'routine'
      rationale: string
      suggestedAction: string
    }>
    
    // 多学科协作建�?    mdctCollaboration: {
      leadDepartment: string
      supportingDepartments: string[]
      coordinationPoints: string[]
      potentialConflicts: string[]
      resolutionSuggestions: string[]
    }
  }
  
  // 会诊讨论要点
  discussionPoints: {
    // 关键问题
    keyQuestions: Array<{
      question: string
      category: 'diagnosis' | 'treatment' | 'prognosis' | 'supportive'
      importance: 'critical' | 'important' | 'optional'
      background: string
    }>
    
    // 争议点预�?    potentialControversies: Array<{
      topic: string
      differentViewpoints: Array<{
        perspective: string
        rationale: string
        evidence: string
      }>
      suggestedResolution: string
    }>
    
    // 决策难点
    decisionChallenges: Array<{
      challenge: string
      factors: string[]
      tradeOffs: string[]
      recommendedApproach: string
    }>
  }
  
  // 相关文献和指�?  evidence: {
    guidelines: Array<{
      title: string
      organization: string
      year: number
      relevance: number
      keyRecommendations: string[]
      url?: string
    }>
    keyStudies: Array<{
      title: string
      journal: string
      year: number
      findings: string
      relevance: string
      doi?: string
    }>
  }
  
  // 置信度评�?  confidence: {
    overall: number
    diagnosis: number
    treatment: number
    prognosis: number
  }
  
  // 免责声明
  disclaimer: string
}

// 科室特异性评�?export interface DepartmentSpecificAssessment {
  department: string
  assessmentType: string
  findings: Array<{
    category: string
    finding: string
    significance: string
    actionRequired: boolean
  }>
  recommendations: string[]
  redFlags: string[]
}

// 诊断一致性分�?export interface DiagnosticConsensusAnalysis {
  agreements: Array<{
    diagnosis: string
    departments: string[]
    confidence: number
  }>
  disagreements: Array<{
    aspect: string
    viewpoints: Array<{
      department: string
      viewpoint: string
      rationale: string
    }>
  }>
  consensusLevel: 'high' | 'moderate' | 'low'
  resolutionSuggestions: string[]
}

export class AIPreDiagnosisService {
  /**
   * 生成会诊预诊断意�?   * @param consultationId 会诊 ID
   * @param patientInfo 患者信�?   * @param consultingDepartments 会诊科室列表
   */
  async generatePreDiagnosis(options: {
    consultationId: string
    patientId: string
    requestingDepartment: string
    consultingDepartments: string[]
    patientInfo: {
      age: number
      gender: string
      chiefComplaint: string
      historyOfPresentIllness: string
      pastHistory: string[]
      currentMedications: string[]
      allergies: string[]
    }
    clinicalData: {
      vitalSigns?: Record<string, any>
      labResults?: Record<string, any>
      imagingResults?: Array<{
        type: string
        findings: string
        conclusion: string
      }>
      pathologyResults?: Array<{
        type: string
        findings: string
        diagnosis: string
      }>
    }
  }): Promise<AIPreDiagnosisOpinion> {
    // TODO: 调用实际 API
    // const response = await aiApi.post('/consultation/pre-diagnosis/generate', options)
    // return response.data as AIPreDiagnosisOpinion

    // Mock 数据
    return {
      consultationId: options.consultationId,
      patientId: options.patientId,
      generatedAt: new Date().toISOString(),
      requestingDepartment: {
        name: options.requestingDepartment,
        chiefComplaint: options.patientInfo.chiefComplaint,
        preliminaryDiagnosis: '右肺上叶占位性病�?,
        consultationPurpose: '明确诊断，制定治疗方�?
      },
      consultingDepartments: options.consultingDepartments.map(dept => {
        const opinion = this.getDepartmentOpinion(dept, options)
        return {
          department: dept,
          opinion: opinion
        }
      }),
      integratedRecommendations: {
        mostLikelyDiagnosis: {
          diagnosis: '右肺上叶癌（T2N1M0，IIB 期）',
          confidence: 85,
          icd10: 'C34.1',
          staging: 'T2N1M0 IIB',
          basis: [
            '胸部 CT 示右肺上叶占位性病变，大小�?3.5cm×3.0cm',
            '纵隔淋巴结肿�?,
            '患者年龄、吸烟史等高危因�?,
            '肿瘤标志�?CEA、CYFRA21-1 升高'
          ]
        },
        treatmentStrategy: {
          approach: 'curative',
          sequence: ['完善检�?, 'MDT 讨论', '手术治疗', '术后辅助治疗'],
          timeline: '2-4 周内完成术前评估和手�?,
          goals: [
            '根治性切除肿�?,
            '延长生存�?,
            '提高生活质量'
          ]
        },
        priorityIssues: [
          {
            issue: '完善病理学诊�?,
            urgency: 'urgent',
            rationale: '目前仅有影像学诊断，需要组织学确诊',
            suggestedAction: '支气管镜活检�?CT 引导下穿�?
          },
          {
            issue: '排除远处转移',
            urgency: 'urgent',
            rationale: '准确分期对治疗方案选择至关重要',
            suggestedAction: 'PET-CT 检�?
          },
          {
            issue: '优化基础疾病管理',
            urgency: 'important',
            rationale: '高血压和糖尿病增加手术风�?,
            suggestedAction: '心内科、内分泌科会�?
          }
        ],
        mdctCollaboration: {
          leadDepartment: '胸外�?,
          supportingDepartments: ['肿瘤内科', '放疗�?, '影像�?, '心内�?, '内分泌科'],
          coordinationPoints: [
            '术前评估和准�?,
            '手术时机选择',
            '围手术期管理',
            '术后辅助治疗'
          ],
          potentialConflicts: [
            '手术与放疗的时机选择',
            '化疗与靶向治疗的顺序'
          ],
          resolutionSuggestions: [
            'MDT 讨论制定个体化方�?,
            '按指南和循证医学证据决策'
          ]
        }
      },
      discussionPoints: {
        keyQuestions: [
          {
            question: '如何明确病理诊断�?,
            category: 'diagnosis',
            importance: 'critical',
            background: '目前仅有影像学证据，需要组织学确诊'
          },
          {
            question: '手术指征和时机？',
            category: 'treatment',
            importance: 'critical',
            background: '患者高龄，合并多种基础疾病'
          }
        ],
        potentialControversies: [
          {
            topic: '手术 vs 非手术治�?,
            differentViewpoints: [
              {
                perspective: '胸外科：主张手术治疗',
                rationale: '肿瘤可切除，手术可获得长期生�?,
                evidence: 'NCCN 指南推荐可切�?NSCLC 首选手�?
              },
              {
                perspective: '肿瘤内科：考虑新辅助治�?,
                rationale: '降低分期，提高手术成功率',
                evidence: '多项研究显示新辅助治疗获�?
              }
            ],
            suggestedResolution: 'MDT 讨论，综合评估手术风险和获益'
          }
        ],
        decisionChallenges: [
          {
            challenge: '围手术期风险管理',
            factors: ['高血�?3 �?, '糖尿�?, '高龄'],
            tradeOffs: ['手术根治机会 vs 手术风险'],
            recommendedApproach: '多学科协作，优化围手术期管理'
          }
        ]
      },
      evidence: {
        guidelines: [
          {
            title: '原发性肺癌诊疗指南（2022 年版�?,
            organization: '国家卫生健康�?,
            year: 2022,
            relevance: 95,
            keyRecommendations: [
              '可切�?NSCLC 首选手术治�?,
              '术前完善分期检�?,
              '高危患�?MDT 讨论'
            ]
          }
        ],
        keyStudies: [
          {
            title: 'Lung ART: Postoperative radiotherapy for NSCLC',
            journal: 'Lancet Oncology',
            year: 2021,
            findings: '术后放疗�?N2 �?NSCLC 的生存获�?,
            relevance: '指导术后辅助治疗决策'
          }
        ]
      },
      confidence: {
        overall: 85,
        diagnosis: 80,
        treatment: 85,
        prognosis: 75
      },
      disclaimer: '�?AI 辅助诊断意见仅供参考，不能替代临床医生的专业判断。最终诊疗方案请�?MDT 会诊结论为准�?
    }
  }

  /**
   * 获取科室意见（辅助方法）
   */
  private getDepartmentOpinion(department: string, options: any): any {
    // 根据不同科室返回不同的意�?    switch (department) {
      case '胸外�?:
        return {
          diagnosisAnalysis: {
            assessment: '患者右肺上叶占位，临床考虑肺癌可能性大，建议进一步完善检查评估手术指征�?,
            differentialDiagnosis: [
              {
                diagnosis: '右肺上叶�?,
                probability: 85,
                icd10: 'C34.1',
                reasoning: '占位性病变，形态不规则，有分叶和毛刺征',
                supportingEvidence: ['CT 示右肺上叶占�?, '肿瘤标志物升�?, '吸烟�?],
                contradictingEvidence: ['尚无病理学证�?]
              },
              {
                diagnosis: '肺结核球',
                probability: 10,
                icd10: 'A15.0',
                reasoning: '上叶尖后段好发，可有类似影像学表�?,
                supportingEvidence: ['上叶病变'],
                contradictingEvidence: ['无结核中毒症�?, 'PPD 阴�?]
              }
            ],
            keyFindings: [
              '右肺上叶占位性病变，大小�?3.5cm×3.0cm',
              '纵隔淋巴结肿�?,
              '肿瘤标志�?CEA、CYFRA21-1 升高'
            ],
            missingInformation: [
              '病理学诊�?,
              'PET-CT 分期',
              '心肺功能评估'
            ]
          },
          treatmentRecommendations: {
            primaryRecommendation: '根治性右肺上叶切除术 + 纵隔淋巴结清扫术',
            alternatives: ['胸腔镜微创手�?, '机器人辅助手�?],
            contraindications: ['严重心肺功能不全', '远处转移'],
            evidenceLevel: 'I',
            guideline: '原发性肺癌诊疗指南（2022 年版�?
          },
          examRecommendations: [
            {
              examType: 'imaging',
              examName: 'PET-CT',
              purpose: '排除远处转移，准确分�?,
              priority: 'urgent',
              expectedFindings: '明确有无纵隔淋巴结转移和远处转移'
            },
            {
              examType: 'function',
              examName: '肺功能检�?,
              purpose: '评估手术耐受�?,
              priority: 'urgent',
              expectedFindings: '评估肺通气功能'
            }
          ],
          prognosis: {
            overall: 'good',
            survivalEstimate: {
              oneYear: 0.85,
              threeYear: 0.65,
              fiveYear: 0.55
            },
            recurrenceRisk: 'intermediate',
            qualityOfLife: 75,
            keyFactors: ['肿瘤分期', '手术根治�?, '术后辅助治疗']
          },
          specialtyAssessment: {
            keyPoints: [
              '评估手术指征和禁忌证',
              '选择合适的手术方式',
              '评估心肺功能储备'
            ],
            concerns: [
              '患者高龄，合并多种基础疾病',
              '高血�?3 级，围手术期风险�?,
              '糖尿病增加术后感染风�?
            ],
            opportunities: [
              '早期手术可获得良好预�?,
              '微创手术可减少创�?
            ],
            departmentSpecificAdvice: [
              '建议尽快完善术前检�?,
              '请心内科、内分泌科协助优化基础疾病管理'
            ]
          }
        }
      case '肿瘤内科':
        return {
          diagnosisAnalysis: {
            assessment: '临床考虑肺癌可能性大，需完善病理学诊断和基因检测，为后续治疗提供依据�?,
            differentialDiagnosis: [
              {
                diagnosis: '右肺上叶�?,
                probability: 85,
                icd10: 'C34.1',
                reasoning: '影像学典型表现，肿瘤标志物升�?,
                supportingEvidence: ['CT 示右肺上叶占�?, 'CEA、CYFRA21-1 升高'],
                contradictingEvidence: ['无病理学证据']
              }
            ],
            keyFindings: [
              '右肺上叶占位性病�?,
              '肿瘤标志物升�?
            ],
            missingInformation: [
              '病理学诊�?,
              '基因检测结�?
            ]
          },
          treatmentRecommendations: {
            primaryRecommendation: '术后辅助化疗（根据病理和基因检测结果制定方案）',
            alternatives: ['靶向治疗（EGFR 突变阳性）', '免疫治疗（PD-L1 高表达）'],
            contraindications: ['严重骨髓抑制', '肝肾功能不全'],
            evidenceLevel: 'I',
            guideline: 'CSCO 非小细胞肺癌诊疗指南�?023�?
          },
          examRecommendations: [
            {
              examType: 'pathology',
              examName: '支气管镜活检',
              purpose: '明确病理诊断',
              priority: 'urgent',
              expectedFindings: '获得组织学诊�?
            },
            {
              examType: 'genetic',
              examName: '肺癌驱动基因检�?,
              purpose: '指导靶向治疗',
              priority: 'important',
              expectedFindings: 'EGFR、ALK、ROS1 等基因突变状�?
            }
          ],
          prognosis: {
            overall: 'good',
            survivalEstimate: {
              oneYear: 0.85,
              threeYear: 0.65,
              fiveYear: 0.55
            },
            recurrenceRisk: 'intermediate',
            qualityOfLife: 75,
            keyFactors: ['病理类型', '基因突变状�?, '治疗反应']
          },
          specialtyAssessment: {
            keyPoints: [
              '明确病理诊断',
              '完善基因检�?,
              '制定个体化药物治疗方�?
            ],
            concerns: [
              '患者年龄大，对化疗耐受性可能较�?,
              '合并症多，需注意药物相互作用'
            ],
            opportunities: [
              '靶向治疗可能带来长期生存获益',
              '免疫治疗为部分患者提供新选择'
            ],
            departmentSpecificAdvice: [
              '建议完善基因检�?,
              '根据体能状态选择合适的治疗方案'
            ]
          }
        }
      case '放疗�?:
        return {
          diagnosisAnalysis: {
            assessment: '如确诊为肺癌，需评估放疗指征，包括术前新辅助放疗、术后辅助放疗或姑息放疗�?,
            differentialDiagnosis: [],
            keyFindings: [
              '右肺上叶占位性病�?
            ],
            missingInformation: [
              '病理诊断',
              '详细分期'
            ]
          },
          treatmentRecommendations: {
            primaryRecommendation: '如无法手术或拒绝手术，可考虑根治性同步放化疗',
            alternatives: ['术前新辅助放�?, '术后辅助放疗', '姑息放疗'],
            contraindications: ['严重肺纤维化', '既往胸部放疗�?],
            evidenceLevel: 'II',
            guideline: '肺癌放疗临床实践指南'
          },
          examRecommendations: [
            {
              examType: 'imaging',
              examName: '增强 CT 定位',
              purpose: '放疗靶区勾画',
              priority: 'optional',
              expectedFindings: '明确肿瘤范围和邻近器�?
            }
          ],
          prognosis: {
            overall: 'fair',
            survivalEstimate: {
              oneYear: 0.75,
              threeYear: 0.50,
              fiveYear: 0.40
            },
            recurrenceRisk: 'high',
            qualityOfLife: 65,
            keyFactors: ['放疗剂量', '肿瘤控制', '放射性肺炎风�?]
          },
          specialtyAssessment: {
            keyPoints: [
              '评估放疗适应�?,
              '制定放疗计划',
              '预防放射性肺�?
            ],
            concerns: [
              '患者肺功能储备',
              '心脏受照剂量'
            ],
            opportunities: [
              '调强放疗可提高靶区剂量，减少正常组织损伤',
              '图像引导放疗可提高精�?
            ],
            departmentSpecificAdvice: [
              '如考虑放疗，建议行 PET-CT 明确分期',
              '评估肺功能和心脏功能'
            ]
          }
        }
      case '影像�?:
        return {
          diagnosisAnalysis: {
            assessment: '右肺上叶占位性病变，影像学考虑恶性可能性大，建议进一步检查�?,
            differentialDiagnosis: [
              {
                diagnosis: '右肺上叶�?,
                probability: 85,
                icd10: 'C34.1',
                reasoning: '占位形态不规则，有分叶和毛刺征，增强扫描不均匀强化',
                supportingEvidence: ['CT 表现典型', '肿瘤标志物升�?],
                contradictingEvidence: []
              },
              {
                diagnosis: '肺结核球',
                probability: 10,
                icd10: 'A15.0',
                reasoning: '上叶尖后段好�?,
                supportingEvidence: [],
                contradictingEvidence: ['无结核中毒症�?]
              }
            ],
            keyFindings: [
              '右肺上叶占位性病变，大小�?3.5cm×3.0cm',
              '边缘不规则，可见分叶和毛�?,
              '纵隔淋巴结肿�?
            ],
            missingInformation: [
              'PET-CT 排除远处转移',
              '增强 MRI 评估纵隔侵犯'
            ]
          },
          treatmentRecommendations: {
            primaryRecommendation: '建议完善 PET-CT 检�?,
            alternatives: ['增强 MRI', '超声内镜'],
            contraindications: [],
            evidenceLevel: 'III',
            guideline: '肺癌影像学检查专家共�?
          },
          examRecommendations: [
            {
              examType: 'imaging',
              examName: 'PET-CT',
              purpose: '排除远处转移，准确分�?,
              priority: 'urgent',
              expectedFindings: '明确有无全身转移'
            }
          ],
          prognosis: {
            overall: 'good',
            survivalEstimate: {
              oneYear: 0.85,
              threeYear: 0.65,
              fiveYear: 0.55
            },
            recurrenceRisk: 'intermediate',
            qualityOfLife: 75,
            keyFactors: ['分期', '治疗方式']
          },
          specialtyAssessment: {
            keyPoints: [
              '准确评估肿瘤范围',
              '排除远处转移',
              '为分期和治疗提供依据'
            ],
            concerns: [
              '影像学诊断不能替代病�?,
              '需要结合临�?
            ],
            opportunities: [
              '多模态影像可提高诊断准确�?,
              '功能成像可评估治疗反�?
            ],
            departmentSpecificAdvice: [
              '建议尽快完善 PET-CT',
              '必要时行增强 MRI 评估纵隔'
            ]
          }
        }
      default:
        return {
          diagnosisAnalysis: {
            assessment: '建议进一步完善检查，明确诊断�?,
            differentialDiagnosis: [],
            keyFindings: [],
            missingInformation: []
          },
          treatmentRecommendations: {
            primaryRecommendation: '对症支持治疗',
            alternatives: [],
            contraindications: [],
            evidenceLevel: 'IV',
            guideline: ''
          },
          examRecommendations: [],
          prognosis: {
            overall: 'fair',
            survivalEstimate: {
              oneYear: 0.75,
              threeYear: 0.55,
              fiveYear: 0.45
            },
            recurrenceRisk: 'intermediate',
            qualityOfLife: 70,
            keyFactors: []
          },
          specialtyAssessment: {
            keyPoints: [],
            concerns: [],
            opportunities: [],
            departmentSpecificAdvice: []
          }
        }
    }
  }

  /**
   * 获取科室特异性评�?   * @param department 科室名称
   * @param patientInfo 患者信�?   */
  async getDepartmentAssessment(options: {
    department: string
    patientInfo: any
    clinicalData: any
  }): Promise<DepartmentSpecificAssessment> {
    const response = await aiApi.post('/consultation/department-assessment', options)
    return response.data as DepartmentSpecificAssessment
  }

  /**
   * 诊断一致性分�?   * @param opinions 各科室意�?   */
  async analyzeConsensus(opinions: Array<{
    department: string
    diagnosis: string
    confidence: number
  }>): Promise<DiagnosticConsensusAnalysis> {
    const response = await aiApi.post('/consultation/consensus-analysis', {
      opinions
    })
    return response.data as DiagnosticConsensusAnalysis
  }

  /**
   * 更新预诊断意�?   * @param consultationId 会诊 ID
   * @param newInformation 新信�?   */
  async updatePreDiagnosis(options: {
    consultationId: string
    newInformation: {
      type: 'lab' | 'imaging' | 'pathology' | 'clinical'
      data: any
    }
  }): Promise<Partial<AIPreDiagnosisOpinion>> {
    const response = await aiApi.post('/consultation/pre-diagnosis/update', options)
    return response.data
  }

  /**
   * 获取预诊断意见列�?   * @param filters 过滤条件
   */
  async getPreDiagnosisList(filters?: {
    status?: 'pending' | 'completed' | 'updated'
    department?: string
    dateRange?: {
      start: string
      end: string
    }
  }): Promise<Array<{
    consultationId: string
    patientId: string
    patientName: string
    requestingDepartment: string
    consultingDepartments: string[]
    generatedAt: string
    status: string
    confidence: number
  }>> {
    const response = await aiApi.get('/consultation/pre-diagnosis/list', {
      params: filters
    })
    return response.data
  }

  /**
   * 导出预诊断报�?   * @param consultationId 会诊 ID
   * @param format 导出格式
   */
  async exportPreDiagnosisReport(options: {
    consultationId: string
    format: 'pdf' | 'word' | 'html'
    includeEvidence: boolean
    includeImages: boolean
  }): Promise<{
    reportId: string
    downloadUrl: string
    expiresAt: string
    fileSize: number
  }> {
    const response = await aiApi.post('/consultation/pre-diagnosis/export', options)
    return response.data
  }
}

export default new AIPreDiagnosisService()
