/**
 * AI 随访计划规划服务
 * 
 * 功能
 * 1. 根据患者病情自动生存存期成个性化随访计划
 * 2. 基于疾病类型、分期、治疗科室疗科室科室室疗科室科室室方案案案案推荐随访节点
 * 3. 提供随访内科室科室室容和检查查查项目建议
 */

export interface PatientInfo {
  patientId: string
  name: string
  age: number
  gender: string
  department: string
  diagnosis: {
    primary: string
    secondary: string[]
    stage?: string
    tnm?: {
      t: string
      n: string
      m: string
      stage: string
    }
  }
  treatments: string[]
  surgeryDate?: string
  chemotherapyCycles?: number
  riskFactors: string[]
}

export interface FollowupNode {
  timepoint: string
  days: number
  purpose: string
  content: string[]
  examinations: string[]
  department: string
  priority: 'high' | 'medium' | 'low'
}

export interface AIFollowupPlan {
  patientId: string
  patientName: string
  totalDuration: number // 总天数
  nodes: FollowupNode[]
  riskLevel: 'low' | 'medium' | 'high'
  specialInstructions: string[]
  evidenceBased: string[]
}

class AIFollowupPlanningService {
  /**
   * 根据患者信息息息智能规划随访计划
   */
  async generateFollowupPlan(patientInfo: PatientInfo): Promise<AIFollowupPlan> {
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 根据疾病类型和分期生存存期成随访计划
    const plan = this.createPlanByDiagnosis(patientInfo)
    
    return plan
  }

  /**
   * 根据诊断断断创建随访计划
   */
  private createPlanByDiagnosis(patientInfo: PatientInfo): AIFollowupPlan {
    const { diagnosis, treatments } = patientInfo
    
    // 肺癌术后随访计划
    if (diagnosis.primary.includes('肺癌') || diagnosis.primary.includes('肺恶性肿瘤瘤瘤')) {
      return this.createLungCancerPlan(patientInfo)
    }
    
    // 乳腺癌术后随访计划
    if (diagnosis.primary.includes('乳腺癌') || diagnosis.primary.includes('乳腺恶性肿瘤瘤瘤')) {
      return this.createBreastCancerPlan(patientInfo)
    }
    
    // 肝癌术后随访计划
    if (diagnosis.primary.includes('肝癌') || diagnosis.primary.includes('肝恶性肿瘤瘤瘤')) {
      return this.createLiverCancerPlan(patientInfo)
    }
    
    // 胃癌术后随访计划
    if (diagnosis.primary.includes('胃癌') || diagnosis.primary.includes('胃恶性肿瘤瘤瘤')) {
      return this.createGastricCancerPlan(patientInfo)
    }
    
    // 默认随访计划
    return this.createDefaultPlan(patientInfo)
  }

  /**
   * 肺癌术后随访计划
   */
  private createLungCancerPlan(patientInfo: PatientInfo): AIFollowupPlan {
    const nodes: FollowupNode[] = [
      {
        timepoint: '术后 2 周',
        days: 14,
        purpose: '伤口检查查查、拆线',
        content: [
          '评估手术术术切除除口愈合情况',
          '拆除缝线',
          '评估术后恢复情况',
          '指导呼吸功能锻炼'
        ],
        examinations: ['血常规', 'C 反应蛋白', '胸部 X 线'],
        department: '胸外科室科室科室室科室室科室室',
        priority: 'high'
      },
      {
        timepoint: '术后 1 个月',
        days: 30,
        purpose: '术后首次复查',
        content: [
          '评估术后恢复情况',
          '评估肺功能恢复',
          '讨论病理结果果果和分期',
          '制定后续治疗科室疗科室科室室疗科室科室室方案案案案'
        ],
        examinations: ['血常规', '生存存期化全项', '肿瘤瘤瘤标志物（CEA、CYFRA21-1、NSE）', '胸部 CT', '肺功能检查查查'],
        department: '胸外科室科室科室室科室室科室室',
        priority: 'high'
      },
      {
        timepoint: '术后 3 个月',
        days: 90,
        purpose: '评估辅助治疗科室疗科室科室室疗科室科室室指征',
        content: [
          '评估是否需要辅助化疗科室科室室',
          '评估身体状况',
          '营养状态评估',
          '心理状态评估'
        ],
        examinations: ['血常规', '生存存期化全项', '肿瘤瘤瘤标志物', '胸部 CT', '腹部超声'],
        department: '肿瘤瘤瘤内科室科室室科室室',
        priority: 'high'
      },
      {
        timepoint: '术后 6 个月',
        days: 180,
        purpose: '定期随访',
        content: [
          '评估治疗科室疗科室科室室疗科室科室室效果',
          '监测复发转移',
          '管理治疗科室疗科室科室室疗科室科室室不良反应',
          '生存存期活质量评估'
        ],
        examinations: ['血常规', '生存存期化全项', '肿瘤瘤瘤标志物', '胸部 CT', '腹部 CT/MRI'],
        department: '肿瘤瘤瘤内科室科室室科室室',
        priority: 'medium'
      },
      {
        timepoint: '术后 12 个月',
        days: 365,
        purpose: '年度大复查',
        content: [
          '全面评估病情',
          '评估长期生存存期存期质量',
          '制定下一年随访计划',
          '康复指导'
        ],
        examinations: ['血常规', '生存存期化全项', '肿瘤瘤瘤标志物', '胸部 CT', '腹部 CT', '骨扫描', '头颅 MRI'],
        department: '肿瘤瘤瘤内科室科室室科室室',
        priority: 'high'
      },
      {
        timepoint: '术后 2 年',
        days: 730,
        purpose: '定期随访',
        content: [
          '监测远期复发',
          '评估生存存期存期质量',
          '慢性病管理'
        ],
        examinations: ['血常规', '生存存期化全项', '肿瘤瘤瘤标志物', '胸部 CT', '腹部超声'],
        department: '肿瘤瘤瘤内科室科室室科室室',
        priority: 'medium'
      }
    ]

    return {
      patientId: patientInfo.patientId,
      patientName: patientInfo.name,
      totalDuration: 730,
      nodes,
      riskLevel: this.calculateRiskLevel(patientInfo),
      specialInstructions: [
        '戒烟，避免二手术术烟',
        '坚持呼吸功能锻炼',
        '注意营养支持，高蛋白饮食',
        '避免呼吸道感染',
        '保持良好心态'
      ],
      evidenceBased: [
        'NCCN 非小细胞肺癌临床实践指南',
        'CSCO 非小细胞肺癌诊断断疗科室科室室指南',
        '中国肺癌筛查与早诊断断早治疗科室疗科室科室室指南'
      ]
    }
  }

  /**
   * 乳腺癌术后随访计划
   */
  private createBreastCancerPlan(patientInfo: PatientInfo): AIFollowupPlan {
    const nodes: FollowupNode[] = [
      {
        timepoint: '术后 2 周',
        days: 14,
        purpose: '伤口检查查查、拆线',
        content: [
          '评估手术术术切除除口愈合情况',
          '拆除缝线',
          '评估上肢功能恢复',
          '指导上肢功能锻炼'
        ],
        examinations: ['血常规', 'C 反应蛋白'],
        department: '乳腺外科室科室室科室室',
        priority: 'high'
      },
      {
        timepoint: '术后 1 个月',
        days: 30,
        purpose: '术后首次复查',
        content: [
          '评估术后恢复情况',
          '讨论病理结果果果和分子分型',
          '制定辅助治疗科室疗科室科室室疗科室科室室方案案案案',
          '遗传咨询（如需）'
        ],
        examinations: ['血常规', '生存存期化全项', '肿瘤瘤瘤标志物（CA15-3、CEA）', '乳腺超声', '对侧乳腺钼靶'],
        department: '乳腺外科室科室室科室室',
        priority: 'high'
      },
      {
        timepoint: '术后 3 个月',
        days: 90,
        purpose: '评估辅助治疗科室疗科室科室室疗科室科室室',
        content: [
          '评估化疗科室科室室指征',
          '评估放疗科室科室科室室科室室指征',
          '评估内科室科室室分泌治疗科室疗科室科室室疗科室科室室指征',
          '评估靶向治疗科室疗科室科室室疗科室科室室指征'
        ],
        examinations: ['血常规', '生存存期化全项', '肿瘤瘤瘤标志物', '乳腺超声', '心脏超声'],
        department: '肿瘤瘤瘤内科室科室室科室室',
        priority: 'high'
      },
      {
        timepoint: '术后 6 个月',
        days: 180,
        purpose: '治疗科室疗科室科室室疗科室科室室中期评估',
        content: [
          '评估治疗科室疗科室科室室疗科室科室室效果',
          '监测治疗科室疗科室科室室疗科室科室室不良反应',
          '调整治疗科室疗科室科室室疗科室科室室方案案案案',
          '生存存期活质量评估'
        ],
        examinations: ['血常规', '生存存期化全项', '肿瘤瘤瘤标志物', '乳腺超声', '腹部超声'],
        department: '肿瘤瘤瘤内科室科室室科室室',
        priority: 'medium'
      },
      {
        timepoint: '术后 12 个月',
        days: 365,
        purpose: '年度大复查',
        content: [
          '全面评估病情',
          '评估内科室科室室分泌治疗科室疗科室科室室疗科室科室室耐受性',
          '骨密度评估',
          '制定下一年随访计划'
        ],
        examinations: ['血常规', '生存存期化全项', '肿瘤瘤瘤标志物', '乳腺超声', '对侧乳腺钼靶', '骨密度'],
        department: '肿瘤瘤瘤内科室科室室科室室',
        priority: 'high'
      }
    ]

    return {
      patientId: patientInfo.patientId,
      patientName: patientInfo.name,
      totalDuration: 365,
      nodes,
      riskLevel: this.calculateRiskLevel(patientInfo),
      specialInstructions: [
        '坚持上肢功能锻炼',
        '保持健康体重',
        '规律服用内科室科室室分泌药物',
        '避免雌激素暴露',
        '定期自检查查乳房'
      ],
      evidenceBased: [
        'NCCN 乳腺癌临床实践指南',
        'CSCO 乳腺癌诊断断疗科室科室室指南',
        '中国抗癌协会议诊议诊断乳腺癌诊断断治疗科室疗科室科室室指南'
      ]
    }
  }

  /**
   * 肝癌术后随访计划
   */
  private createLiverCancerPlan(patientInfo: PatientInfo): AIFollowupPlan {
    const nodes: FollowupNode[] = [
      {
        timepoint: '术后 2 周',
        days: 14,
        purpose: '伤口检查查查、拆线',
        content: [
          '评估手术术术切除除口愈合情况',
          '拆除缝线',
          '评估肝功能恢复',
          '指导饮食'
        ],
        examinations: ['血常规', '肝功能', '凝血功能'],
        department: '肝胆外科室科室室科室室',
        priority: 'high'
      },
      {
        timepoint: '术后 1 个月',
        days: 30,
        purpose: '术后首次复查',
        content: [
          '评估肝功能恢复情况',
          '评估剩余肝脏代偿功能',
          '讨论病理结果果果',
          '制定抗病毒治疗科室疗科室科室室疗科室科室室方案案案案'
        ],
        examinations: ['血常规', '肝功能', '肾功能', '肿瘤瘤瘤标志物（AFP、PIVKA-II）', '腹部增强 CT/MRI', '乙肝病毒 DNA'],
        department: '肝胆外科室科室室科室室',
        priority: 'high'
      },
      {
        timepoint: '术后 3 个月',
        days: 90,
        purpose: '评估复发风险险险',
        content: [
          '评估肿瘤瘤瘤复发风险险险',
          '评估是否需要辅助治疗科室疗科室科室室疗科室科室室',
          '评估抗病毒治疗科室疗科室科室室疗科室科室室效果',
          '营养状态评估'
        ],
        examinations: ['血常规', '肝功能', '肿瘤瘤瘤标志物', '腹部增强 CT/MRI', '胸部 CT'],
        department: '肝胆外科室科室室科室室',
        priority: 'high'
      },
      {
        timepoint: '术后 6 个月',
        days: 180,
        purpose: '定期随访',
        content: [
          '监测肿瘤瘤瘤复发',
          '评估肝功能',
          '管理肝硬化并发症',
          '生存存期活质量评估'
        ],
        examinations: ['血常规', '肝功能', '肿瘤瘤瘤标志物', '腹部增强 CT/MRI', '胃镜'],
        department: '肝胆外科室科室室科室室',
        priority: 'medium'
      },
      {
        timepoint: '术后 12 个月',
        days: 365,
        purpose: '年度大复查',
        content: [
          '全面评估病情',
          '评估长期生存存期存期质量',
          '制定下一年随访计划'
        ],
        examinations: ['血常规', '肝功能', '肿瘤瘤瘤标志物', '腹部增强 CT/MRI', '胸部 CT', '骨扫描'],
        department: '肝胆外科室科室室科室室',
        priority: 'high'
      }
    ]

    return {
      patientId: patientInfo.patientId,
      patientName: patientInfo.name,
      totalDuration: 365,
      nodes,
      riskLevel: this.calculateRiskLevel(patientInfo),
      specialInstructions: [
        '严格戒酒',
        '低盐、低脂、高蛋白饮食',
        '规律服用抗病毒药物',
        '避免使用肝毒性药物',
        '保持情绪稳定'
      ],
      evidenceBased: [
        'NCCN 肝胆肿瘤瘤瘤临床实践指南',
        'CSCO 原发性肝癌诊断断疗科室科室室指南',
        '中国肝癌分期治疗科室疗科室科室室疗科室科室室方案案案案'
      ]
    }
  }

  /**
   * 胃癌术后随访计划
   */
  private createGastricCancerPlan(patientInfo: PatientInfo): AIFollowupPlan {
    const nodes: FollowupNode[] = [
      {
        timepoint: '术后 2 周',
        days: 14,
        purpose: '伤口检查查查、拆线',
        content: [
          '评估手术术术切除除口愈合情况',
          '拆除缝线',
          '评估胃肠功能恢复',
          '指导饮食'
        ],
        examinations: ['血常规', 'C 反应蛋白', '白蛋白'],
        department: '胃肠外科室科室室科室室',
        priority: 'high'
      },
      {
        timepoint: '术后 1 个月',
        days: 30,
        purpose: '术后首次复查',
        content: [
          '评估术后恢复情况',
          '讨论病理结果果果和分期',
          '制定辅助化疗科室科室室方案案案',
          '营养评估'
        ],
        examinations: ['血常规', '生存存期化全项', '肿瘤瘤瘤标志物（CEA、CA19-9、CA72-4）', '腹部增强 CT', '胸部 CT'],
        department: '胃肠外科室科室室科室室',
        priority: 'high'
      },
      {
        timepoint: '术后 3 个月',
        days: 90,
        purpose: '评估辅助治疗科室疗科室科室室疗科室科室室',
        content: [
          '评估化疗科室科室室指征',
          '评估营养状况',
          '评估贫血情况',
          '制定化疗科室科室室方案案案'
        ],
        examinations: ['血常规', '生存存期化全项', '肿瘤瘤瘤标志物', '腹部增强 CT', '胃镜'],
        department: '肿瘤瘤瘤内科室科室室科室室',
        priority: 'high'
      },
      {
        timepoint: '术后 6 个月',
        days: 180,
        purpose: '治疗科室疗科室科室室疗科室科室室中期评估',
        content: [
          '评估治疗科室疗科室科室室疗科室科室室效果',
          '监测治疗科室疗科室科室室疗科室科室室不良反应',
          '营养状态评估',
          '生存存期活质量评估'
        ],
        examinations: ['血常规', '生存存期化全项', '肿瘤瘤瘤标志物', '腹部增强 CT', '胸部 CT'],
        department: '肿瘤瘤瘤内科室科室室科室室',
        priority: 'medium'
      },
      {
        timepoint: '术后 12 个月',
        days: 365,
        purpose: '年度大复查',
        content: [
          '全面评估病情',
          '评估长期生存存期存期质量',
          '制定下一年随访计划'
        ],
        examinations: ['血常规', '生存存期化全项', '肿瘤瘤瘤标志物', '腹部增强 CT', '胸部 CT', '胃镜'],
        department: '肿瘤瘤瘤内科室科室室科室室',
        priority: 'high'
      }
    ]

    return {
      patientId: patientInfo.patientId,
      patientName: patientInfo.name,
      totalDuration: 365,
      nodes,
      riskLevel: this.calculateRiskLevel(patientInfo),
      specialInstructions: [
        '少食多餐，细嚼慢咽',
        '高蛋白、高维生存存期素饮食',
        '补充铁剂和维生存存期素 B12',
        '避免辛辣刺激性食物',
        '保持乐观心态'
      ],
      evidenceBased: [
        'NCCN 胃癌临床实践指南',
        'CSCO 胃癌诊断断疗科室科室室指南',
        '中国胃癌诊断断疗科室科室室规范'
      ]
    }
  }

  /**
   * 默认随访计划
   */
  private createDefaultPlan(patientInfo: PatientInfo): AIFollowupPlan {
    const nodes: FollowupNode[] = [
      {
        timepoint: '术后 2 周',
        days: 14,
        purpose: '伤口检查查查、拆线',
        content: [
          '评估手术术术切除除口愈合情况',
          '拆除缝线',
          '评估术后恢复情况'
        ],
        examinations: ['血常规', 'C 反应蛋白'],
        department: '外科室科室室科室室',
        priority: 'high'
      },
      {
        timepoint: '术后 1 个月',
        days: 30,
        purpose: '术后首次复查',
        content: [
          '评估术后恢复情况',
          '讨论病理结果果果',
          '制定后续治疗科室疗科室科室室疗科室科室室方案案案案'
        ],
        examinations: ['血常规', '生存存期化全项', '肿瘤瘤瘤标志物', '影像科室科室科室室科室室学检查查查'],
        department: '外科室科室室科室室',
        priority: 'high'
      },
      {
        timepoint: '术后 3 个月',
        days: 90,
        purpose: '评估治疗科室疗科室科室室疗科室科室室效果',
        content: [
          '评估治疗科室疗科室科室室疗科室科室室效果',
          '监测复发转移',
          '管理治疗科室疗科室科室室疗科室科室室不良反应'
        ],
        examinations: ['血常规', '生存存期化全项', '肿瘤瘤瘤标志物', '影像科室科室科室室科室室学检查查查'],
        department: '肿瘤瘤瘤内科室科室室科室室',
        priority: 'medium'
      },
      {
        timepoint: '术后 6 个月',
        days: 180,
        purpose: '定期随访',
        content: [
          '评估治疗科室疗科室科室室疗科室科室室效果',
          '监测复发转移',
          '生存存期活质量评估'
        ],
        examinations: ['血常规', '生存存期化全项', '肿瘤瘤瘤标志物', '影像科室科室科室室科室室学检查查查'],
        department: '肿瘤瘤瘤内科室科室室科室室',
        priority: 'medium'
      },
      {
        timepoint: '术后 12 个月',
        days: 365,
        purpose: '年度大复查',
        content: [
          '全面评估病情',
          '评估长期生存存期存期质量',
          '制定下一年随访计划'
        ],
        examinations: ['血常规', '生存存期化全项', '肿瘤瘤瘤标志物', '全面影像科室科室科室室科室室学检查查查'],
        department: '肿瘤瘤瘤内科室科室室科室室',
        priority: 'high'
      }
    ]

    return {
      patientId: patientInfo.patientId,
      patientName: patientInfo.name,
      totalDuration: 365,
      nodes,
      riskLevel: this.calculateRiskLevel(patientInfo),
      specialInstructions: [
        '规律作息，避免劳累',
        '均衡饮食，加强营养',
        '适度运动，增强体质',
        '保持良好心态',
        '定期复查'
      ],
      evidenceBased: [
        '相关疾病临床诊断断疗科室科室室指南',
        '术后随访专家共识'
      ]
    }
  }

  /**
   * 计算风险险险等级
   */
  private calculateRiskLevel(patientInfo: PatientInfo): 'low' | 'medium' | 'high' {
    const { diagnosis, riskFactors } = patientInfo
    
    // 高风险险险因素
    const highRiskFactors = [
      '淋巴结果果转移',
      '远处转移',
      '低分化',
      '脉管癌栓',
      '神经侵犯',
      '切除除缘阳性',
      'III 期',
      'IV 期'
    ]
    
    // 中风险险险因素
    const mediumRiskFactors = [
      'II 期',
      '中分化',
      '高龄',
      '合并症多'
    ]
    
    let riskScore = 0
    
    // 评估分期
    if (diagnosis.stage) {
      if (diagnosis.stage.includes('IV') || diagnosis.stage.includes('4')) {
        riskScore += 3
      } else if (diagnosis.stage.includes('III') || diagnosis.stage.includes('3')) {
        riskScore += 2
      } else if (diagnosis.stage.includes('II') || diagnosis.stage.includes('2')) {
        riskScore += 1
      }
    }
    
    // 评估其他风险险险因素
    riskFactors.forEach(factor => {
      if (highRiskFactors.some(hrf => factor.includes(hrf))) {
        riskScore += 2
      } else if (mediumRiskFactors.some(mrf => factor.includes(mrf))) {
        riskScore += 1
      }
    })
    
    if (riskScore >= 3) {
      return 'high'
    } else if (riskScore >= 1) {
      return 'medium'
    } else {
      return 'low'
    }
  }

  /**
   * 获取风险险险等级文本
   */
  getRiskText(level: 'low' | 'medium' | 'high'): string {
    switch (level) {
      case 'low': return '低风险险险'
      case 'medium': return '中风险险险'
      case 'high': return '高风险险险'
      default: return level
    }
  }
}

export default new AIFollowupPlanningService()
