/**
 * AI 自然语言处理服务
 * 
 * 提供医生存生存存期疗科室科室室文本的智能处理病历结果果构化、医生存生存存期学术语提取、疾病编码、语义搜索等功能
 */

import { aiApi } from '../../../utils/api'

// 病历结果果构化结果果果
export interface EMRStructuring {
  patientInfo: {
    name: string
    age: number
    gender: string
    mrn: string
  }
  chiefComplaint: {
    text: string
    duration: string
    symptoms: string[]
  }
  historyOfPresentIllness: {
    onset: string
    course: string
    characteristics: string[]
    aggravatingFactors: string[]
    relievingFactors: string[]
    associatedSymptoms: string[]
    treatment: string
  }
  pastHistory: {
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
  personalHistory: {
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
  marriageHistory: {
    status: 'married' | 'single' | 'divorced' | 'widowed'
    age: number
    children: number
  }
  familyHistory: Array<{
    relationship: string
    disease: string
    age?: number
    status: 'alive' | 'deceased'
    causeOfDeath?: string
  }>
  physicalExamination: {
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
    nervousSystem: string
  }
  auxiliaryExaminations: Array<{
    type: 'lab' | 'imaging' | 'pathology' | 'other'
    name: string
    date: string
    result: string
    abnormal: boolean
    criticalValue: boolean
  }>
  preliminaryDiagnosis: Array<{
    name: string
    icd10: string
    type: 'main' | 'secondary' | 'complication'
    confidence: number
  }>
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

// 医生存生存存期学术语提取
export interface MedicalTermExtraction {
  diseases: Array<{
    term: string
    category: string
    icd10?: string
    confidence: number
    context: string
  }>
  symptoms: Array<{
    term: string
    severity?: '轻度' | '中度' | '重度'
    duration?: string
    frequency?: string
    context: string
  }>
  exams: Array<{
    term: string
    type: 'lab' | 'imaging' | 'pathology' | 'function'
    result?: string
    abnormal?: boolean
    context: string
  }>
  treatments: Array<{
    term: string
    type: 'medication' | 'surgery' | 'therapy' | 'procedure'
    dosage?: string
    frequency?: string
    context: string
  }>
  drugs: Array<{
    genericName: string
    brandName?: string
    category: string
    dosage?: string
    frequency?: string
    route?: string
    context: string
  }>
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

// 文本相似度度度
export interface TextSimilarity {
  text1: string
  text2: string
  similarity: number
  method: 'cosine' | 'jaccard' | 'semantic'
  commonTerms: string[]
  differences: string[]
}

// 临床路径径径推荐
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

// 医生存生存存期学文献推荐荐
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
  async structureEMR(text: string, emrType: 'admission' | 'progress' | 'consultation' | 'discharge'): Promise<EMRStructuring> {
    const response = await aiApi.post('/nlp/emr/structure', {
      text,
      emrType
    })
    return response.data as EMRStructuring
  }

  async extractMedicalTerms(text: string): Promise<MedicalTermExtraction> {
    const response = await aiApi.post('/nlp/terms/extract', {
      text
    })
    return response.data as MedicalTermExtraction
  }

  async suggestICD10(diagnosis: string): Promise<ICD10Coding> {
    const response = await aiApi.post('/nlp/coding/icd10', {
      diagnosis
    })
    return response.data as ICD10Coding
  }

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

  async calculateSimilarity(text1: string, text2: string): Promise<TextSimilarity> {
    const response = await aiApi.post('/nlp/similarity', {
      text1,
      text2
    })
    return response.data as TextSimilarity
  }

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

  async generateSummary(text: string, maxLength: number): Promise<string> {
    const response = await aiApi.post('/nlp/summarize', {
      text,
      maxLength
    })
    return response.data.summary
  }

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
}

export default new AINaturalLanguageProcessingService()
