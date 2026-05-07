/**
 * AI 临床决策支持服务
 * 
 * 提供智能诊断建议、治疗方案推荐、药物相互作用检查等功能
 */

import { aiApi } from '../../../utils/api'

// AI 诊断建议
export interface AIDiagnosis {
  diagnosis: string
  icd10Code: string
  probability: number
  evidence: string[]
  severity: 'low' | 'medium' | 'high' | 'critical'
  recommendedTests: string[]
  differentialDiagnosis: string[]
}

// AI 治疗方案
export interface AITreatment {
  treatmentType: '手术' | '化疗' | '放疗' | '靶向' | '免疫' | '内分泌' | '支持治疗'
  regimen: string
  drugs?: DrugInfo[]
  dosage: string
  frequency: string
  duration: string
  evidence: string
  guideline: string
  level: '1A' | '1B' | '2A' | '2B' | '3'
  responseRate?: number
  sideEffects: string[]
  contraindications: string[]
  cost: '低' | '中' | '高' | '极高'
}

// 药物信息
export interface DrugInfo {
  name: string
  genericName: string
  category: string
  mechanism: string
  indication: string
  dosage: string
  administration: string
  sideEffects: string[]
  interactions: string[]
  warnings: string[]
  pregnancy: 'A' | 'B' | 'C' | 'D' | 'X'
}

// 药物相互作用
export interface DrugInteraction {
  drug1: string
  drug2: string
  severity: 'minor' | 'moderate' | 'major' | 'contraindicated'
  mechanism: string
  effect: string
  management: string
  evidence: string
}

// 影像分析结果
export interface ImagingAnalysis {
  modality: 'CT' | 'MR' | 'X-Ray' | 'PET-CT' | 'US'
  findings: ImagingFinding[]
  measurements: Measurement[]
  characterization: string
  staging?: TNMStaging
  differentialDiagnosis: string[]
  recommendedFollowup: string
  confidence: number
}

// 影像发现
export interface ImagingFinding {
  type: string
  location: string
  size?: {
    length: number
    width: number
    height?: number
    unit: 'mm' | 'cm'
  }
  characteristics: string[]
  enhancement?: string
  suspicion: 'benign' | 'likely_benign' | 'indeterminate' | 'likely_malignant' | 'malignant'
}

// 测量数据
export interface Measurement {
  name: string
  value: number
  unit: string
  normalRange?: {
    min: number
    max: number
  }
  abnormal: boolean
}

// TNM 分期
export interface TNMStaging {
  t: string
  n: string
  m: string
  stage: string
  description: string
}

// 病理分析
export interface PathologyAnalysis {
  specimenType: string
  histology: string
  grade: string
  stage?: TNMStaging
  markers: Biomarker[]
  molecularProfile: MolecularProfile
  prognosis: PrognosisInfo
  recommendedTests: string[]
}

// 生物标志物
export interface Biomarker {
  name: string
  value: string | number
  unit?: string
  positive: boolean
  clinicalSignificance: string
  therapeuticImplication: string
}

// 分子谱
export interface MolecularProfile {
  mutations: GeneMutation[]
  amplifications: string[]
  deletions: string[]
  rearrangements: string[]
  microsatelliteStatus: 'MSS' | 'MSI-L' | 'MSI-H'
  tumorMutationalBurden?: number
}

// 基因突变
export interface GeneMutation {
  gene: string
  mutation: string
  variant: string
  clinicalSignificance: 'benign' | 'likely_benign' | 'uncertain' | 'likely_pathogenic' | 'pathogenic'
  therapeuticImplications: string[]
  prognosticImplications: string
  frequency: number
}

// 预后信息
export interface PrognosisInfo {
  riskLevel: 'low' | 'intermediate' | 'high'
  survivalRate?: {
    oneYear: number
    threeYear: number
    fiveYear: number
  }
  recurrenceRisk: number
  factors: string[]
}

export class AIClinicalService {
  /**
   * 智能诊断建议
   * @param symptoms 症状列表
   * @param patientInfo 患者信息
   */
  async getDiagnosisSuggestions(
    symptoms: string[],
    patientInfo: {
      age: number
      gender: string
      history: string[]
      labResults?: any
    }
  ): Promise<AIDiagnosis[]> {
    const response = await aiApi.post('/diagnosis/suggest', {
      symptoms,
      patientInfo,
      timestamp: new Date().toISOString()
    })
    return response.data as AIDiagnosis[]
  }

  /**
   * 治疗方案推荐
   * @param diagnosis 诊断
   * @param stage 分期
   * @param patientInfo 患者信息
   */
  async getTreatmentRecommendations(
    diagnosis: string,
    stage: string,
    patientInfo: {
      age: number
      performance: number
      comorbidities: string[]
      allergies: string[]
      geneticProfile?: any
    }
  ): Promise<AITreatment[]> {
    const response = await aiApi.post('/treatment/recommend', {
      diagnosis,
      stage,
      patientInfo,
      includeGuidelines: true,
      includeEvidence: true
    })
    return response.data as AITreatment[]
  }

  /**
   * 药物相互作用检查
   * @param drugs 药物列表
   */
  async checkDrugInteractions(drugs: string[]): Promise<DrugInteraction[]> {
    const response = await aiApi.post('/drugs/interactions', {
      drugs
    })
    return response.data as DrugInteraction[]
  }

  /**
   * 药物剂量计算
   * @param drug 药物名称
   * @param patientInfo 患者信息
   */
  async calculateDrugDosage(
    drug: string,
    patientInfo: {
      weight: number
      height: number
      age: number
      renalFunction?: number
      hepaticFunction?: string
    }
  ): Promise<{
    recommended: string
    adjusted: string
    rationale: string
    warnings: string[]
  }> {
    const response = await aiApi.post('/drugs/dosage', {
      drug,
      patientInfo
    })
    return response.data
  }

  /**
   * 影像 AI 分析
   * @param imageId 影像 ID
   * @param modality 影像类型
   */
  async analyzeImaging(
    imageId: string,
    modality: 'CT' | 'MR' | 'X-Ray' | 'PET-CT' | 'US'
  ): Promise<ImagingAnalysis> {
    const response = await aiApi.post('/imaging/analyze', {
      imageId,
      modality
    })
    return response.data as ImagingAnalysis
  }

  /**
   * 肺结节分析
   * @param dicomImages DICOM 影像数据
   */
  async analyzeLungNodule(dicomImages: Blob[]): Promise<{
    nodules: LungNodule[]
    malignancyRisk: number
    recommendation: string
    followupInterval: string
  }> {
    const formData = new FormData()
    dicomImages.forEach((img, i) => {
      formData.append('images', img, `image_${i}.dcm`)
    })

    const response = await aiApi.post('/imaging/lung-nodule', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }

  /**
   * 病理 AI 分析
   * @param pathologyImages 病理图像
   */
  async analyzePathology(pathologyImages: Blob[]): Promise<PathologyAnalysis> {
    const formData = new FormData()
    pathologyImages.forEach((img, i) => {
      formData.append('images', img, `pathology_${i}.jpg`)
    })

    const response = await aiApi.post('/pathology/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data as PathologyAnalysis
  }

  /**
   * 基因检测结果解读
   * @param genePanel 基因 panel 名称
   * @param variants 变异位点
   */
  async interpretGeneticTest(
    genePanel: string,
    variants: Array<{
      gene: string
      variant: string
      zygosity: string
    }>
  ): Promise<{
    pathogenicVariants: GeneMutation[]
    vus: GeneMutation[]
    therapeuticTargets: string[]
    clinicalTrials: string[]
  }> {
    const response = await aiApi.post('/genetics/interpret', {
      genePanel,
      variants
    })
    return response.data
  }

  /**
   * 预后评估
   * @param diagnosis 诊断
   * @param stage 分期
   * @param patientInfo 患者信息
   * @param treatmentResponse 治疗反应
   */
  async assessPrognosis(
    diagnosis: string,
    stage: string,
    patientInfo: any,
    treatmentResponse?: any
  ): Promise<{
    riskLevel: string
    survivalCurve: Array<{ time: number; probability: number }>
    factors: Array<{ name: string; impact: number }>
    recommendations: string[]
  }> {
    const response = await aiApi.post('/prognosis/assess', {
      diagnosis,
      stage,
      patientInfo,
      treatmentResponse
    })
    return response.data
  }

  /**
   * 临床试验匹配
   * @param diagnosis 诊断
   * @param stage 分期
   * @param patientInfo 患者信息
   */
  async matchClinicalTrials(
    diagnosis: string,
    stage: string,
    patientInfo: any
  ): Promise<Array<{
    trialId: string
    title: string
    phase: string
    location: string
    status: string
    eligibility: number
    interventions: string[]
    outcomes: string[]
  }>> {
    const response = await aiApi.post('/trials/match', {
      diagnosis,
      stage,
      patientInfo
    })
    return response.data
  }

  /**
   * 指南推荐查询
   * @param diagnosis 诊断
   * @param stage 分期
   */
  async getGuidelineRecommendations(
    diagnosis: string,
    stage: string
  ): Promise<Array<{
    guideline: string
    version: string
    publishDate: string
    recommendations: Array<{
      content: string
      level: string
      evidence: string
    }>
  }>> {
    const response = await aiApi.get('/guidelines', {
      params: { diagnosis, stage }
    })
    return response.data
  }

  /**
   * 文献检索
   * @param query 检索词
   * @param options 检索选项
   */
  async searchLiterature(
    query: string,
    options?: {
      yearFrom?: number
      yearTo?: number
      articleType?: string
      sortBy?: 'relevance' | 'date' | 'citations'
    }
  ): Promise<Array<{
    title: string
    authors: string[]
    journal: string
    year: number
    doi: string
    abstract: string
    url: string
    citations: number
  }>> {
    const response = await aiApi.post('/literature/search', {
      query,
      options
    })
    return response.data
  }

  /**
   * 相似病例推荐
   * @param patientInfo 患者信息
   */
  async findSimilarCases(patientInfo: any): Promise<Array<{
    caseId: string
    similarity: number
    diagnosis: string
    treatment: string[]
    outcome: string
    lessons: string
  }>> {
    const response = await aiApi.post('/cases/similar', {
      patientInfo
    })
    return response.data
  }
}

// 肺结节数据
export interface LungNodule {
  location: string
  size: number
  density: 'solid' | 'part-solid' | 'ground-glass'
  characteristics: string[]
  malignancyRisk: number
  recommendation: string
}

// 导出单例
export const aiClinicalService = new AIClinicalService()
