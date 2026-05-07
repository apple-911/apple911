/**
 * AI 自然语言处理服务
 * 
 * 提供医疗文本的智能处理：病历结构化、医学术语提取、疾病编码、语义搜索等功能
 */

import { aiApi } from '../../../utils/api'

// 病历结构化结�?export interface EMRStructuring {
  // 基本信息
  patientInfo: {
    name: string
    age: number
    gender: string
    mrn: string
  }
  // 主诉
  chiefComplaint: {
    text: string
    duration: string
    symptoms: string[]
  }
  // 现病�?  historyOfPresentIllness: {
    onset: string
    course: string
    characteristics: string[]
    aggravatingFactors: string[]
    relievingFactors: string[]
    associatedSymptoms: string[]
    treatment: string
  }
  // 既往�?  pastHistory: {
    diseases: string[]
    surgeries: Array<{
      name: string
      date: string
      hospital: string
    }>
    injuries: string[]
    transfusions: Array<{
      type: string
      volume: number
      date: string
      reason: string
    }>
    allergies: Array<{
      type: 'drug' | 'food' | 'other'
      allergen: string
      reaction: string
      severity: 'mild' | 'moderate' | 'severe'
    }>
    chronicDiseases: string[]
    medications: Array<{
      name: string
      dosage: string
      frequency: string
      duration: string
      indication: string
    }>
  }
  // 个人�?  personalHistory: {
    birthplace: string
    residence: string
    smoking: {
      status: 'never' | 'current' | 'former'
      packYears?: number
      quitDate?: string
    }
    drinking: {
      status: 'never' | 'current' | 'former'
      amount?: string
      frequency?: string
    }
    occupation: string
    exposure: string[]
  }
  // 婚育�?  marriageHistory: {
    status: 'married' | 'single' | 'divorced' | 'widowed'
    age: number
    children: number
  }
  // 家族�?  familyHistory: Array<{
    relationship: string
    disease: string
    age?: number
    status: 'alive' | 'deceased'
    causeOfDeath?: string
  }>
  // 体格检�?  physicalExamination: {
    vitalSigns: {
      temperature?: number
      bloodPressure?: string
      heartRate?: number
      respiratoryRate?: number
      oxygenSaturation?: number
    }
    generalCondition: string
    skin: string
    lymphNodes: string
    head: string
    neck: string
    chest: string
    heart: string
    abdomen: string
    spine: string
    limbs: string
   神经系统: string
  }
  // 辅助检�?  auxiliaryExaminations: Array<{
    type: 'lab' | 'imaging' | 'pathology' | 'other'
    name: string
    date: string
    result: string
    abnormal: boolean
    criticalValue: boolean
  }>
  // 初步诊断
  preliminaryDiagnosis: Array<{
    name: string
    icd10: string
    type: 'main' | 'secondary' | 'complication'
    confidence: number
  }>
  // 诊疗计划
  treatmentPlan: {
    furtherExams: string[]
    treatments: string[]
    medications: Array<{
      name: string
      dosage: string
      frequency: string
      route: string
      duration: string
    }>
    surgeries?: string[]
    followup: string
  }
}

// 医学术语提取
export interface MedicalTermExtraction {
  // 疾病术语
  diseases: Array<{
    term: string
    category: string
    icd10?: string
    confidence: number
    context: string
  }>
  // 症状术语
  symptoms: Array<{
    term: string
    severity?: '轻度' | '中度' | '重度'
    duration?: string
    frequency?: string
    context: string
  }>
  // 检查检�?  exams: Array<{
    term: string
    type: 'lab' | 'imaging' | 'pathology' | 'function'
    result?: string
    abnormal?: boolean
    context: string
  }>
  // 治疗操作
  treatments: Array<{
    term: string
    type: 'medication' | 'surgery' | 'therapy' | 'procedure'
    dosage?: string
    frequency?: string
    context: string
  }>
  // 药物
  drugs: Array<{
    genericName: string
    brandName?: string
    category: string
    dosage?: string
    frequency?: string
    route?: string
    context: string
  }>
  // 解剖部位
  anatomy: Array<{
    term: string
    system: string
    laterality?: 'left' | 'right' | 'bilateral'
    context: string
  }>
}

// 疾病编码建议
export interface ICD10Coding {
  diagnosis: string
  suggestions: Array<{
    icd10: string
    description: string
    category: string
    confidence: number
    matchType: 'exact' | 'semantic' | 'related'
    inclusionTerms: string[]
    exclusionNotes: string[]
  }>
}

// 语义搜索
export interface SemanticSearch {
  query: string
  results: Array<{
    type: 'patient' | 'consultation' | 'report' | 'literature'
    id: string
    title: string
    snippet: string
    relevance: number
    highlights: string[]
    metadata: any
  }>
  facets: {
    departments: Array<{ name: string; count: number }>
    diagnoses: Array<{ name: string; count: number }>
    experts: Array<{ name: string; count: number }>
    dates: Array<{ date: string; count: number }>
  }
  relatedQueries: string[]
}

// 文本相似�?export interface TextSimilarity {
  text1: string
  text2: string
  similarity: number
  method: 'cosine' | 'jaccard' | 'semantic'
  commonTerms: string[]
  differences: string[]
}

// 临床路径推荐
export interface ClinicalPathway {
  diagnosis: string
  pathway: {
    name: string
    version: string
    source: string
    stages: Array<{
      name: string
      day: number
      activities: Array<{
        type: 'exam' | 'treatment' | 'medication' | 'education' | 'assessment'
        name: string
        description: string
        required: boolean
        order: number
      }>
    }>
    expectedOutcome: string
    averageLengthOfStay: number
    estimatedCost: number
  }
  patientSpecific: {
    adaptations: string[]
    contraindications: string[]
    additionalConsiderations: string[]
  }
}

// 医学文献推荐
export interface LiteratureRecommendation {
  query: string
  recommendations: Array<{
    title: string
    authors: string[]
    journal: string
    year: number
    volume: string
    pages: string
    doi: string
    abstract: string
    keywords: string[]
    relevance: number
    evidenceLevel: 'I' | 'II' | 'III' | 'IV' | 'V'
    citationCount: number
    url?: string
    pdf?: string
  }>
  guidelines: Array<{
    title: string
    organization: string
    year: number
    version: string
    url?: string
    relevance: number
  }>
}

export class AINaturalLanguageProcessingService {
  /**
   * 病历结构�?   * @param text 病历文本
   * @param emrType 病历类型
   */
  async structureEMR(text: string, emrType: 'admission' | 'progress' | 'consultation' | 'discharge'): Promise<EMRStructuring> {
    const response = await aiApi.post('/nlp/emr/structure', {
      text,
      emrType
    })
    return response.data as EMRStructuring
  }

  /**
   * 医学术语提取
   * @param text 医疗文本
   */
  async extractMedicalTerms(text: string): Promise<MedicalTermExtraction> {
    const response = await aiApi.post('/nlp/terms/extract', {
      text
    })
    return response.data as MedicalTermExtraction
  }

  /**
   * 疾病 ICD-10 编码
   * @param diagnosis 诊断描述
   */
  async suggestICD10(diagnosis: string): Promise<ICD10Coding> {
    const response = await aiApi.post('/nlp/coding/icd10', {
      diagnosis
    })
    return response.data as ICD10Coding
  }

  /**
   * 语义搜索
   * @param query 搜索查询
   * @param filters 过滤条件
   */
  async semanticSearch(query: string, filters?: {
    type?: 'patient' | 'consultation' | 'report' | 'literature'
    department?: string
    dateRange?: {
      start: string
      end: string
    }
  }): Promise<SemanticSearch> {
    const response = await aiApi.post('/nlp/search/semantic', {
      query,
      filters
    })
    return response.data as SemanticSearch
  }

  /**
   * 文本相似度计�?   * @param text1 文本 1
   * @param text2 文本 2
   */
  async calculateSimilarity(text1: string, text2: string): Promise<TextSimilarity> {
    const response = await aiApi.post('/nlp/similarity', {
      text1,
      text2
    })
    return response.data as TextSimilarity
  }

  /**
   * 临床路径推荐
   * @param diagnosis 诊断
   * @param patientInfo 患者信�?   */
  async recommendClinicalPathway(options: {
    diagnosis: string
    stage?: string
    patientInfo: {
      age: number
      comorbidities: string[]
      performance: number
    }
  }): Promise<ClinicalPathway> {
    const response = await aiApi.post('/nlp/pathway/recommend', options)
    return response.data as ClinicalPathway
  }

  /**
   * 医学文献推荐
   * @param query 查询
   * @param options 选项
   */
  async recommendLiterature(options: {
    query: string
    diagnosis?: string
    treatment?: string
    yearRange?: {
      min: number
      max: number
    }
    evidenceLevel?: ('I' | 'II' | 'III' | 'IV' | 'V')[]
  }): Promise<LiteratureRecommendation> {
    const response = await aiApi.post('/nlp/literature/recommend', options)
    return response.data as LiteratureRecommendation
  }

  /**
   * 文本摘要生成
   * @param text 原文�?   * @param maxLength 最大长�?   */
  async generateSummary(text: string, maxLength: number): Promise<string> {
    const response = await aiApi.post('/nlp/summarize', {
      text,
      maxLength
    })
    return response.data.summary
  }

  /**
   * 文本纠错
   * @param text 输入文本
   */
  async correctText(text: string): Promise<{
    original: string
    corrected: string
    corrections: Array<{
      original: string
      corrected: string
      position: number
      type: 'spelling' | 'grammar' | 'terminology'
      confidence: number
    }>
  }> {
    const response = await aiApi.post('/nlp/correct', {
      text
    })
    return response.data
  }

  /**
   * 实体链接
   * @param text 文本
   * @param entityType 实体类型
   */
  async linkEntities(text: string, entityType?: 'disease' | 'drug' | 'symptom' | 'anatomy'): Promise<{
    entities: Array<{
      text: string
      type: string
      startOffset: number
      endOffset: number
      linkedId: string
      linkedName: string
      source: 'ICD-10' | 'ATC' | 'MeSH' | 'SNOMED'
      confidence: number
    }>
  }> {
    const response = await aiApi.post('/nlp/entity/link', {
      text,
      entityType
    })
    return response.data
  }

  /**
   * 关系抽取
   * @param text 文本
   */
  async extractRelations(text: string): Promise<{
    relations: Array<{
      entity1: {
        text: string
        type: string
      }
      entity2: {
        text: string
        type: string
      }
      relation: string
      confidence: number
    }>
  }> {
    const response = await aiApi.post('/nlp/relation/extract', {
      text
    })
    return response.data
  }

  /**
   * 文本分类
   * @param text 文本
   * @param taxonomy 分类体系
   */
  async classifyText(text: string, taxonomy: 'department' | 'urgency' | 'disease_category'): Promise<{
    categories: Array<{
      name: string
      confidence: number
      level: number
    }>
  }> {
    const response = await aiApi.post('/nlp/classify', {
      text,
      taxonomy
    })
    return response.data
  }
}

export default new AINaturalLanguageProcessingService()
