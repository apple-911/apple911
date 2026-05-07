/**
 * 智能导诊服务
 * 
 * 基于 AI 的智能分诊、科室推荐、症状分析等功能
 */

import { aiApi } from '../../../utils/api'

// 症状信息
export interface Symptom {
  id: string
  name: string
  category: '全身症状' | '呼吸系统' | '循环系统' | '消化系统' | '神经系统' | '泌尿系统' | '运动系统' | '皮肤' | '其他'
  severity: '轻度' | '中度' | '重度' | '危重'
  duration?: string
  frequency?: string
  triggers?: string[]
  relievingFactors?: string[]
  associatedSymptoms?: string[]
}

// 分诊结果
export interface TriageResult {
  level: '1-危急' | '2-危重' | '3-紧急' | '4-次紧急' | '5-非紧急'
  score: number
  recommendedDepartment: string
  alternativeDepartments: string[]
  urgency: '立即' | '10 分钟内' | '30 分钟内' | '1 小时内' | '24 小时内'
  recommendedTests: string[]
  warnings: string[]
  selfCareAdvice?: string
}

// 科室推荐
export interface DepartmentRecommendation {
  department: string
  confidence: number
  reasons: string[]
  doctors: Array<{
    id: string
    name: string
    title: string
    specialty: string
    available: boolean
  }>
  location: string
  floor: string
  contact: string
}

// 预问诊结果
export interface PreConsultation {
  chiefComplaint: string
  historyOfPresentIllness: string
  pastHistory: string[]
  allergies: string[]
  familyHistory: string[]
  lifestyle: {
    smoking: boolean
    drinking: boolean
    exercise: string
  }
  vitalSigns?: {
    temperature?: number
    bloodPressure?: string
    heartRate?: number
  }
  suggestedDiagnoses: string[]
  recommendedTests: string[]
}

export class IntelligentTriageService {
  /**
   * 症状分析
   * @param symptoms 症状列表
   * @param patientInfo 患者信息
   */
  async analyzeSymptoms(
    symptoms: string[],
    patientInfo: {
      age: number
      gender: string
      pastHistory?: string[]
      allergies?: string[]
    }
  ): Promise<{
    analyzedSymptoms: Symptom[]
    severity: string
    urgency: string
  }> {
    const response = await aiApi.post('/triage/analyze', {
      symptoms,
      patientInfo
    })
    return response.data
  }

  /**
   * 智能分诊
   * @param symptoms 症状
   * @param patientInfo 患者信息
   */
  async triage(
    symptoms: string[],
    patientInfo: {
      age: number
      gender: string
      pastHistory?: string[]
      vitalSigns?: any
    }
  ): Promise<TriageResult> {
    const response = await aiApi.post('/triage/classify', {
      symptoms,
      patientInfo
    })
    return response.data as TriageResult
  }

  /**
   * 科室推荐
   * @param symptoms 症状
   * @param diagnosis 初步诊断（可选）
   */
  async recommendDepartments(
    symptoms: string[],
    diagnosis?: string
  ): Promise<DepartmentRecommendation[]> {
    const response = await aiApi.post('/triage/departments', {
      symptoms,
      diagnosis
    })
    return response.data as DepartmentRecommendation[]
  }

  /**
   * 智能预问诊
   * @param chiefComplaint 主诉
   * @param symptoms 症状
   */
  async preConsultation(
    chiefComplaint: string,
    symptoms: string[]
  ): Promise<PreConsultation> {
    // 通过多轮对话收集信息
    const questions = await this.generateQuestions(chiefComplaint, symptoms)
    
    // 实际项目中应该通过对话收集答案
    const answers: any = {}
    
    const response = await aiApi.post('/triage/pre-consultation', {
      chiefComplaint,
      symptoms,
      questions,
      answers
    })
    
    return response.data as PreConsultation
  }

  /**
   * 生成问诊问题
   * @param chiefComplaint 主诉
   * @param symptoms 症状
   */
  async generateQuestions(
    chiefComplaint: string,
    symptoms: string[]
  ): Promise<Array<{
    question: string
    type: 'text' | 'choice' | 'number' | 'date'
    options?: string[]
    required: boolean
  }>> {
    const response = await aiApi.post('/triage/questions', {
      chiefComplaint,
      symptoms
    })
    return response.data
  }

  /**
   * 评估危急程度
   * @param symptoms 症状
   * @param vitalSigns 生命体征
   */
  async assessCriticality(
    symptoms: string[],
    vitalSigns: {
      temperature?: number
      bloodPressure?: string
      heartRate?: number
      oxygenSaturation?: number
      consciousness?: string
    }
  ): Promise<{
    isCritical: boolean
    level: string
    immediateActions: string[]
    warnings: string[]
  }> {
    const response = await aiApi.post('/triage/criticality', {
      symptoms,
      vitalSigns
    })
    return response.data
  }

  /**
   * 症状自查
   * @param bodyPart 身体部位
   * @param discomfort 不适描述
   */
  async selfCheck(
    bodyPart: string,
    discomfort: string
  ): Promise<{
    possibleSymptoms: Symptom[]
    possibleDiseases: string[]
    recommendedAction: string
    urgency: string
  }> {
    const response = await aiApi.post('/triage/self-check', {
      bodyPart,
      discomfort
    })
    return response.data
  }

  /**
   * 获取分诊统计
   * @param department 科室
   * @param startDate 开始日期
   * @param endDate 结束日期
   */
  async getStatistics(
    department?: string,
    startDate?: string,
    endDate?: string
  ): Promise<{
    totalTriages: number
    criticalCases: number
    averageWaitTime: number
    topSymptoms: Array<{ symptom: string; count: number }>
    topDepartments: Array<{ department: string; count: number }>
  }> {
    const response = await api.get('/triage/statistics', {
      params: { department, startDate, endDate }
    })
    return response.data
  }

  /**
   * 症状知识图谱查询
   * @param symptom 症状名称
   */
  async querySymptomKnowledge(symptom: string): Promise<{
    symptom: string
    category: string
    relatedSymptoms: string[]
    possibleDiseases: Array<{
      disease: string
      probability: number
      icd10: string
    }>
    relatedTests: string[]
    relatedDepartments: string[]
  }> {
    const response = await aiApi.get('/triage/knowledge', {
      params: { symptom }
    })
    return response.data
  }

  /**
   * 流行病预警
   * @param location 地区
   * @param symptoms 症状
   */
  async getEpidemicWarning(
    location: string,
    symptoms: string[]
  ): Promise<{
    hasWarning: boolean
    level: 'low' | 'medium' | 'high' | 'critical'
    disease: string
    description: string
    precautions: string[]
  }> {
    const response = await aiApi.post('/triage/epidemic', {
      location,
      symptoms
    })
    return response.data
  }

  /**
   * 智能导诊机器人对话
   * @param message 用户消息
   * @param context 对话上下文
   */
  async chat(
    message: string,
    context: {
      symptoms: string[]
      patientInfo: any
      history: Array<{ role: 'user' | 'assistant'; content: string }>
    }
  ): Promise<{
    response: string
    suggestedQuestions: string[]
    action?: 'triage' | 'register' | 'payment' | 'report'
    actionData?: any
  }> {
    const response = await aiApi.post('/triage/chat', {
      message,
      context
    })
    return response.data
  }
}

// 导出单例
export const intelligentTriageService = new IntelligentTriageService()
