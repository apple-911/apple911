/**
 * AI 临床决策支持服务
 * 
 * 提供 AI 辅助诊断、治疗方案推荐、药物相互作用检查等功能
 */

import { aiApi } from '../../utils/api'

// AI 诊断建议
export interface AIDiagnosis {
  diagnosis: string
  probability: number
  icd10: string
  reasoning: string
  supportingEvidence: string[]
  differentialDiagnosis: Array<{
    diagnosis: string
    probability: number
  }>
  recommendedTests: string[]
  severity: '轻度' | '中度' | '重度' | '危重'
}

// 治疗方案推荐
export interface TreatmentRecommendation {
  treatmentType: '手术' | '化疗' | '放疗' | '靶向治疗' | '免疫治疗' | '支持治疗'
  regimen: string
  drugs?: Array<{
    name: string
    dosage: string
    frequency: string
    route: string
    duration: string
  }>
  evidence: {
    level: 'I' | 'II' | 'III' | 'IV'
    source: string
    guideline: string
  }
  expectedOutcome: string
  sideEffects: string[]
  contraindications: string[]
  cost: number
}

// 药物相互作用
export interface DrugInteraction {
  drug1: string
  drug2: string
  severity: '轻微' | '中等' | '严重' | '禁忌'
  mechanism: string
  effect: string
  management: string
  references: string[]
}

// 基因检测结果解读
export interface GeneticTestInterpretation {
  gene: string
  mutation: string
  clinicalSignificance: '致病' | '可能致病' | '意义不明' | '可能良性' | '良性'
  associatedDiseases: string[]
  targetedTherapies: Array<{
    drug: string
    response: '敏感' | '耐药' | '可能敏感'
    evidence: string
  }>
  prognosis: string
  recommendations: string[]
}

export class AIClinicalDecisionSupport {
  /**
   * AI 辅助诊断
   * @param symptoms 症状列表
   * @param labResults 检验结果
   * @param imagingResults 影像结果
   * @param patientHistory 病史
   */
  async suggestDiagnosis(options: {
    symptoms: string[]
    labResults?: Record<string, any>
    imagingResults?: string
    patientHistory?: string
  }): Promise<AIDiagnosis[]> {
    const response = await aiApi.post('/diagnosis/suggest', options)
    return response.data as AIDiagnosis[]
  }

  /**
   * 推荐治疗方案
   * @param diagnosis 诊断
   * @param stage 分期
   * @param patientCondition 患者状况
   */
  async recommendTreatment(options: {
    diagnosis: string
    stage?: string
    patientCondition: {
      age: number
      ecogScore?: number
      comorbidities?: string[]
      organFunction?: Record<string, string>
    }
  }): Promise<TreatmentRecommendation[]> {
    const response = await aiApi.post('/treatment/recommend', options)
    return response.data as TreatmentRecommendation[]
  }

  /**
   * 检查药物相互作用
   * @param drugs 药物列表
   */
  async checkDrugInteractions(drugs: string[]): Promise<DrugInteraction[]> {
    const response = await aiApi.post('/drug/interactions', { drugs })
    return response.data as DrugInteraction[]
  }

  /**
   * 解读基因检测报告
   * @param genePanel 基因 panel 名称
   * @param mutations 突变列表
   */
  async interpretGeneticTest(options: {
    genePanel: string
    mutations: Array<{
      gene: string
      mutation: string
      zygosity: '杂合' | '纯合'
    }>
  }): Promise<GeneticTestInterpretation[]> {
    const response = await aiApi.post('/genetics/interpret', options)
    return response.data as GeneticTestInterpretation[]
  }

  /**
   * 影像 AI 分析（肺结节）
   * @param dicomImages DICOM 影像数据
   */
  async analyzeLungNodule(dicomImages: Blob[]): Promise<{
    nodules: Array<{
      location: string
      size: number
      volume: number
      density: '实性' | '亚实性' | '磨玻璃'
      malignancy: number
      characteristics: string[]
    }>
    recommendation: string
    followUpSuggestion: string
  }> {
    const formData = new FormData()
    dicomImages.forEach((image, i) => {
      formData.append(`image_${i}`, image)
    })

    const response = await aiApi.post('/imaging/lung-nodule', formData)
    return response.data
  }

  /**
   * 影像 AI 分析（乳腺钼靶）
   * @param dicomImages DICOM 影像数据
   */
  async analyzeMammography(dicomImages: Blob[]): Promise<{
    findings: Array<{
      location: string
      type: '肿块' | '钙化' | '结构扭曲'
      birads: 0 | 1 | 2 | 3 | 4 | 5
      characteristics: string[]
    }>
    birads: 0 | 1 | 2 | 3 | 4 | 5
    recommendation: string
  }> {
    const formData = new FormData()
    dicomImages.forEach((image, i) => {
      formData.append(`image_${i}`, image)
    })

    const response = await aiApi.post('/imaging/mammography', formData)
    return response.data
  }

  /**
   * 病理 AI 分析
   * @param pathologyImage 病理切片图像
   */
  async analyzePathology(pathologyImage: Blob): Promise<{
    cellType: string
    differentiation: '高分化' | '中分化' | '低分化' | '未分化'
    grade: 'G1' | 'G2' | 'G3' | 'G4'
    tmb?: number
    msi?: 'MSI-H' | 'MSS'
    pdl1?: number
    characteristics: string[]
  }> {
    const formData = new FormData()
    formData.append('image', pathologyImage)

    const response = await aiApi.post('/pathology/analyze', formData)
    return response.data
  }

  /**
   * 预后评估
   * @param diagnosis 诊断
   * @param stage 分期
   * @param treatment 治疗方案
   * @param patientData 患者数据
   */
  async predictPrognosis(options: {
    diagnosis: string
    stage: string
    treatment: string
    patientData: {
      age: number
      gender: string
      performanceStatus: number
      comorbidities: string[]
      labResults: Record<string, number>
    }
  }): Promise<{
    survivalRate: {
      oneYear: number
      threeYear: number
      fiveYear: number
    }
    recurrenceRisk: number
    prognosticFactors: string[]
    recommendations: string[]
  }> {
    const response = await aiApi.post('/prognosis/predict', options)
    return response.data
  }

  /**
   * 临床试验匹配
   * @param diagnosis 诊断
   * @param stage 分期
   * @param patientCondition 患者状况
   */
  async matchClinicalTrials(options: {
    diagnosis: string
    stage: string
    patientCondition: {
      age: number
      gender: string
      priorTreatment: string[]
      geneticMarkers?: string[]
    }
  }): Promise<Array<{
    trialId: string
    title: string
    phase: 'I' | 'II' | 'III' | 'IV'
    inclusion: string[]
    exclusion: string[]
    location: string[]
    contact: string
    matchScore: number
  }>> {
    const response = await aiApi.post('/trials/match', options)
    return response.data
  }

  /**
   * 药物剂量计算
   * @param drug 药物名称
   * @param patientWeight 体重
   * @param patientHeight 身高
   * @param renalFunction 肾功能
   * @param liverFunction 肝功能
   */
  async calculateDrugDosage(options: {
    drug: string
    patientWeight: number
    patientHeight: number
    renalFunction: {
      creatinine: number
      gfr?: number
    }
    liverFunction: {
      alt: number
      ast: number
      bilirubin: number
    }
  }): Promise<{
    standardDose: string
    adjustedDose: string
    adjustmentReason: string
    monitoring: string[]
  }> {
    const response = await aiApi.post('/drug/dosage', options)
    return response.data
  }

  /**
   * 获取临床指南
   * @param disease 疾病名称
   * @param version 指南版本
   */
  async getClinicalGuideline(disease: string, version?: string): Promise<{
    title: string
    organization: string
    publishDate: string
    version: string
    recommendations: Array<{
      category: string
      content: string
      evidenceLevel: string
      recommendationGrade: string
    }>
    algorithms: string[]
    references: string[]
  }> {
    const params = new URLSearchParams({ disease })
    if (version) params.append('version', version)

    const response = await aiApi.get(`/guidelines?${params.toString()}`)
    return response.data
  }
}

// 导出单例
export const aiClinicalSupport = new AIClinicalDecisionSupport()
