import { MedicalCase } from '../mocks/caseData'

export interface SimilarCase {
  caseId: string
  caseTitle: string
  diagnosis: string
  department: string
  similarity: number
  matchReasons: string[]
  meetingDate: string
}

export interface RecommendationResult {
  caseId: string
  caseTitle: string
  diagnosis: string
  department: string
  score: number
  reasons: string[]
}

export function findSimilarCases(
  currentCase: MedicalCase,
  allCases: MedicalCase[],
  limit: number = 5
): SimilarCase[] {
  const similarities: SimilarCase[] = []
  
  for (const c of allCases) {
    if (c.id === currentCase.id) continue
    
    let score = 0
    const reasons: string[] = []
    
    if (c.diagnosis.primary === currentCase.diagnosis.primary) {
      score += 30
      reasons.push('相同主要诊断')
    }
    
    if (c.diagnosis.department === currentCase.diagnosis.department) {
      score += 20
      reasons.push('相同科室')
    }
    
    const commonTags = c.tags.filter(tag => currentCase.tags.includes(tag))
    if (commonTags.length > 0) {
      score += commonTags.length * 10
      reasons.push(`相同标签: ${commonTags.join(', ')}`)
    }
    
    if (c.diagnosis.icd10?.startsWith(currentCase.diagnosis.icd10?.substring(0, 3) || '')) {
      score += 15
      reasons.push('相似ICD编码')
    }
    
    if (c.treatmentPlan?.primary === currentCase.treatmentPlan?.primary) {
      score += 10
      reasons.push('相同治疗方案')
    }
    
    if (score > 0) {
      similarities.push({
        caseId: c.id,
        caseTitle: c.caseTitle,
        diagnosis: c.diagnosis.primary,
        department: c.diagnosis.department,
        similarity: Math.min(score, 100),
        matchReasons: reasons,
        meetingDate: c.mdtInfo.meetingDate,
      })
    }
  }
  
  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
}

export function getRecommendations(
  userPreferences: { departments?: string[]; tags?: string[] },
  allCases: MedicalCase[],
  limit: number = 10
): RecommendationResult[] {
  const recommendations: RecommendationResult[] = []
  
  for (const c of allCases) {
    let score = 0
    const reasons: string[] = []
    
    if (userPreferences.departments?.includes(c.diagnosis.department)) {
      score += 40
      reasons.push('符合您的科室偏好')
    }
    
    const matchingTags = c.tags.filter(tag => 
      userPreferences.tags?.includes(tag)
    )
    if (matchingTags.length > 0) {
      score += matchingTags.length * 15
      reasons.push(`匹配标签: ${matchingTags.join(', ')}`)
    }
    
    if (c.tags.includes('典型病例')) {
      score += 20
      reasons.push('典型病例推荐')
    }
    
    if (c.qualityControl?.score >= 90) {
      score += 10
      reasons.push('高质量病例')
    }
    
    if (score > 0) {
      recommendations.push({
        caseId: c.id,
        caseTitle: c.caseTitle,
        diagnosis: c.diagnosis.primary,
        department: c.diagnosis.department,
        score: Math.min(score, 100),
        reasons,
      })
    }
  }
  
  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}
