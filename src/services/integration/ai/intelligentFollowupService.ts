import { FollowupPlan } from '../../stores/consultationStore'

export interface FollowupAnalysisResult {
  followupId: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  riskScore: number
  warnings: WarningItem[]
  recommendations: string[]
  needSecondaryMDT: boolean
  mdtReason?: string
  urgency?: 'routine' | 'urgent' | 'emergency'
  analysisTime: string
  nextActions: NextAction[]
}

export interface WarningItem {
  id: string
  type: 'symptom' | 'medication' | 'examination' | 'lifestyle' | 'psychological'
  severity: 'info' | 'warning' | 'error' | 'critical'
  title: string
  description: string
  suggestion: string
  relatedData?: any
}

export interface NextAction {
  action: string
  priority: 'high' | 'medium' | 'low'
  deadline?: string
  responsible?: string
}

class IntelligentFollowupService {
  async analyzeFollowup(followupId: string, followupData: any): Promise<FollowupAnalysisResult> {
    await new Promise(resolve => setTimeout(resolve, 1500))

    const warnings: WarningItem[] = []
    let riskScore = 0
    let needSecondaryMDT = false
    let mdtReason = ''
    let urgency: 'routine' | 'urgent' | 'emergency' = 'routine'

    if (followupData.symptoms && followupData.symptoms.length > 0) {
      const severeSymptoms = followupData.symptoms.filter((s: string) => 
        s.includes('严重') || s.includes('加重') || s.includes('紧急')
      )
      
      if (severeSymptoms.length > 0) {
        warnings.push({
          id: 'W001',
          type: 'symptom',
          severity: 'critical',
          title: '症状严重恶化',
          description: `患者出现严重症状：${severeSymptoms.join('、')}`,
          suggestion: '建议立即就医，进行详细检查',
          relatedData: severeSymptoms
        })
        riskScore += 40
        needSecondaryMDT = true
        mdtReason = '患者症状严重恶化，需要MDT团队重新评估治疗方案'
        urgency = 'emergency'
      }
    }

    if (followupData.medications && followupData.medications.length > 0) {
      const adverseReactions = followupData.medications.filter((m: string) => 
        m.includes('不良反应') || m.includes('副作用')
      )
      
      if (adverseReactions.length > 0) {
        warnings.push({
          id: 'W002',
          type: 'medication',
          severity: 'warning',
          title: '药物不良反应',
          description: `患者出现药物不良反应：${adverseReactions.join('、')}`,
          suggestion: '建议调整用药方案，必要时进行MDT讨论',
          relatedData: adverseReactions
        })
        riskScore += 20
        if (adverseReactions.length > 1) {
          needSecondaryMDT = true
          mdtReason = '患者出现多种药物不良反应，需要MDT团队调整治疗方案'
          urgency = 'urgent'
        }
      }
    }

    if (followupData.qualityOfLife && followupData.qualityOfLife.status === '需要关注') {
      warnings.push({
        id: 'W003',
        type: 'lifestyle',
        severity: 'warning',
        title: '生活质量下降',
        description: '患者生活质量评分较低，需要关注',
        suggestion: '建议加强支持治疗，必要时进行心理干预',
        relatedData: followupData.qualityOfLife
      })
      riskScore += 15
    }

    if (followupData.symptoms && followupData.symptoms.includes('症状严重，需紧急处理')) {
      warnings.push({
        id: 'W004',
        type: 'symptom',
        severity: 'critical',
        title: '紧急情况',
        description: '患者出现需要紧急处理的症状',
        suggestion: '立即启动应急预案，通知主治医生',
        relatedData: followupData.symptoms
      })
      riskScore += 50
      needSecondaryMDT = true
      mdtReason = '患者出现紧急情况，需要MDT团队紧急会诊'
      urgency = 'emergency'
    }

    if (!needSecondaryMDT && riskScore > 30) {
      needSecondaryMDT = true
      mdtReason = '患者病情变化较大，建议进行MDT评估'
      urgency = 'urgent'
    }

    const recommendations: string[] = []
    if (riskScore > 50) {
      recommendations.push('立即安排专家会诊')
      recommendations.push('密切监测生命体征')
    } else if (riskScore > 30) {
      recommendations.push('安排近期复查')
      recommendations.push('加强随访频率')
    } else {
      recommendations.push('继续当前治疗方案')
      recommendations.push('定期随访')
    }

    const nextActions: NextAction[] = []
    if (needSecondaryMDT) {
      nextActions.push({
        action: '发起二次MDT会诊',
        priority: urgency === 'emergency' ? 'high' : 'medium',
        deadline: urgency === 'emergency' ? '立即' : '3天内',
        responsible: '主治医生'
      })
    }

    if (warnings.length > 0) {
      nextActions.push({
        action: '处理预警问题',
        priority: 'high',
        deadline: '24小时内',
        responsible: '责任医生'
      })
    }

    nextActions.push({
      action: '更新随访计划',
      priority: 'medium',
      deadline: '3天内',
      responsible: '随访护士'
    })

    const riskLevel: 'low' | 'medium' | 'high' | 'critical' = 
      riskScore >= 50 ? 'critical' :
      riskScore >= 30 ? 'high' :
      riskScore >= 15 ? 'medium' : 'low'

    return {
      followupId,
      riskLevel,
      riskScore,
      warnings,
      recommendations,
      needSecondaryMDT,
      mdtReason,
      urgency,
      analysisTime: new Date().toISOString(),
      nextActions
    }
  }

  async batchAnalyzeFollowups(followupIds: string[]): Promise<FollowupAnalysisResult[]> {
    const results: FollowupAnalysisResult[] = []
    
    for (const id of followupIds) {
      const mockData = {
        symptoms: ['症状严重，需紧急处理'],
        medications: ['有不良反应：皮疹'],
        qualityOfLife: { status: '需要关注', details: '睡眠质量差' }
      }
      const result = await this.analyzeFollowup(id, mockData)
      results.push(result)
    }
    
    return results
  }

  getRiskColor(level: 'low' | 'medium' | 'high' | 'critical'): string {
    const colors = {
      low: '#52c41a',
      medium: '#faad14',
      high: '#ff7a45',
      critical: '#ff4d4f'
    }
    return colors[level]
  }

  getRiskText(level: 'low' | 'medium' | 'high' | 'critical'): string {
    const texts = {
      low: '低风险',
      medium: '中风险',
      high: '高风险',
      critical: '极高风险'
    }
    return texts[level]
  }
}

export default new IntelligentFollowupService()
