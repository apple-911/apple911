/**
 * AI 药物基因组学服务
 * 
 * 提供基于基因检测的个体化用药指导：药物代谢分析、剂量优化、不良反应预测等功能
 */

import { aiApi } from '../../../utils/api'

// 基因变异
export interface GeneVariant {
  gene: string
  variant: string
  zygosity: 'homozygous' | 'heterozygous' | 'hemizygous'
  clinicalSignificance: 'pathogenic' | 'likely_pathogenic' | 'uncertain' | 'likely_benign' | 'benign'
  alleleFrequency: number
  phenotype: string
}

// 药物代谢酶表�?export interface MetabolizerPhenotype {
  enzyme: string
  phenotype: 'poor' | 'intermediate' | 'normal' | 'rapid' | 'ultrarapid'
  activityScore: number
  variants: GeneVariant[]
  clinicalImplications: string[]
}

// 药物基因组学结果
export interface PharmacogenomicsResult {
  // 患者信�?  patientInfo: {
    patientId: string
    testDate: string
    testType: string
  }
  // 代谢酶表�?  metabolizerPhenotypes: MetabolizerPhenotype[]
  // 药物 - 基因相互作用
  drugGeneInteractions: Array<{
    drug: {
      name: string
      class: string
      indication: string[]
    }
    gene: string
    interaction: {
      type: 'metabolism' | 'transport' | 'target' | 'immune'
      effect: 'increased' | 'decreased' | 'altered'
      mechanism: string
    }
    clinicalRecommendation: {
      action: 'use_as_directed' | 'dose_adjustment' | 'alternative_drug' | 'contraindicated' | 'monitor_closely'
      description: string
      evidence: {
        level: 'high' | 'moderate' | 'low'
        source: string
        guideline?: string
      }
    }
    riskLevel: 'high' | 'moderate' | 'low' | 'negligible'
  }>
  // 个体化用药建�?  personalizedRecommendations: Array<{
    drug: string
    recommendation: {
      standardDose?: string
      adjustedDose?: string
      maxDose?: string
      frequency?: string
      monitoring?: string[]
      contraindications?: string[]
      alternatives?: string[]
    }
    rationale: string
    evidence: string
  }>
}

// 药物相互作用
export interface DrugInteraction {
  drug1: string
  drug2: string
  severity: 'contraindicated' | 'major' | 'moderate' | 'minor'
  mechanism: string
  effect: string
  management: string
  pharmacogenomicsFactor?: {
    gene: string
    impact: string
  }
}

// 剂量优化
export interface DoseOptimization {
  drug: string
  standardDose: {
    dose: string
    frequency: string
    route: string
  }
  optimizedDose: {
    dose: string
    frequency: string
    route: string
    adjustment: string
  }
  factors: Array<{
    factor: string
    type: 'genetic' | 'clinical' | 'demographic' | 'drug_interaction'
    impact: number
    description: string
  }>
  rationale: string
  monitoring: {
    efficacy: string[]
    toxicity: string[]
    therapeutic: {
      parameter: string
      targetRange: string
      frequency: string
    }
  }
  confidence: number
}

// 不良反应风险
export interface AdverseDrugReaction {
  drug: string
  reaction: {
    name: string
    category: string
    onset: string
    severity: 'mild' | 'moderate' | 'severe' | 'life_threatening' | 'fatal'
    frequency: 'rare' | 'uncommon' | 'common' | 'very_common'
  }
  risk: {
    baseline: number
    patientSpecific: number
    relativeRisk: number
    absoluteRiskReduction?: number
    numberNeededToHarm?: number
  }
  riskFactors: Array<{
    factor: string
    type: 'genetic' | 'clinical' | 'demographic' | 'environmental'
    oddsRatio?: number
    description: string
  }>
  prevention: {
    screening: string[]
    monitoring: string[]
    prophylaxis?: string
    patientEducation: string[]
  }
  management: {
    earlySigns: string[]
    actions: string[]
    antidote?: string
    supportiveCare: string[]
  }
}

// 治疗方案优化
export interface TreatmentOptimization {
  diagnosis: string
  currentRegimen: {
    drugs: Array<{
      name: string
      dose: string
      frequency: string
      duration: string
    }>
    duration: string
  }
  optimizedRegimen: {
    drugs: Array<{
      name: string
      dose: string
      frequency: string
      duration: string
      rationale: string
      pharmacogenomicsConsideration?: string
    }>
    duration: string
    changes: Array<{
      type: 'add' | 'remove' | 'adjust_dose' | 'change_frequency' | 'switch'
      drug: string
      from?: string
      to: string
      reason: string
    }>
  }
  expectedBenefits: {
    efficacyImprovement: number
    toxicityReduction: number
    adherenceImprovement: number
    costImpact: number
  }
  monitoring: {
    efficacy: string[]
    toxicity: string[]
    schedule: string
  }
}

// 药物敏感�?export interface DrugSensitivity {
  drug: string
  target: string
  sensitivity: 'sensitive' | 'intermediate' | 'resistant'
  evidence: {
    level: 'strong' | 'moderate' | 'weak'
    studies: number
    responseRate: number
    medianPFS?: number
    medianOS?: number
  }
  biomarkers: Array<{
    name: string
    status: 'positive' | 'negative' | 'mutated' | 'wild_type'
    predictiveValue: 'positive' | 'negative'
  }>
  alternatives: Array<{
    drug: string
    sensitivity: 'sensitive' | 'intermediate' | 'resistant'
    rationale: string
  }>
}

export class AIPharmacogenomicsService {
  /**
   * 药物基因组学分析
   * @param patientId 患�?ID
   * @param geneVariants 基因变异列表
   */
  async analyzePharmacogenomics(options: {
    patientId: string
    geneVariants: GeneVariant[]
    currentMedications: string[]
  }): Promise<PharmacogenomicsResult> {
    const response = await aiApi.post('/pharmacogenomics/analyze', options)
    return response.data as PharmacogenomicsResult
  }

  /**
   * 药物相互作用检�?   * @param drugs 药物列表
   * @param geneVariants 基因变异
   */
  async checkDrugInteractions(options: {
    drugs: string[]
    geneVariants?: GeneVariant[]
    patientInfo?: {
      age: number
      renalFunction: number
      liverFunction: string
    }
  }): Promise<DrugInteraction[]> {
    const response = await aiApi.post('/pharmacogenomics/interactions/check', options)
    return response.data as DrugInteraction[]
  }

  /**
   * 个体化剂量优�?   * @param drug 药物名称
   * @param patientInfo 患者信�?   */
  async optimizeDose(options: {
    drug: string
    patientInfo: {
      weight: number
      height: number
      age: number
      gender: string
      renalFunction: number
      liverFunction: string
      geneVariants?: GeneVariant[]
      concomitantMedications: string[]
    }
    indication: string
    targetResponse: string
  }): Promise<DoseOptimization> {
    const response = await aiApi.post('/pharmacogenomics/dose/optimize', options)
    return response.data as DoseOptimization
  }

  /**
   * 不良反应风险预测
   * @param drug 药物
   * @param patientInfo 患者信�?   */
  async predictAdverseReaction(options: {
    drug: string
    patientInfo: {
      geneVariants: GeneVariant[]
      age: number
      gender: string
      comorbidities: string[]
      concomitantMedications: string[]
      allergies: string[]
    }
  }): Promise<AdverseDrugReaction[]> {
    const response = await aiApi.post('/pharmacogenomics/adverse/predict', options)
    return response.data as AdverseDrugReaction[]
  }

  /**
   * 治疗方案优化
   * @param diagnosis 诊断
   * @param currentRegimen 当前方案
   */
  async optimizeTreatment(options: {
    diagnosis: string
    stage: string
    currentRegimen: {
      drugs: Array<{
        name: string
        dose: string
        frequency: string
      }>
    }
    patientInfo: {
      geneVariants: GeneVariant[]
      performance: number
      organFunction: {
        renal: number
        hepatic: string
        cardiac: string
      }
      comorbidities: string[]
    }
    treatmentGoal: 'curative' | 'palliative' | 'adjuvant' | 'neoadjuvant'
  }): Promise<TreatmentOptimization> {
    const response = await aiApi.post('/pharmacogenomics/treatment/optimize', options)
    return response.data as TreatmentOptimization
  }

  /**
   * 药物敏感性预�?   * @param tumorProfile 肿瘤�?   * @param geneVariants 基因变异
   */
  async predictDrugSensitivity(options: {
    tumorType: string
    molecularProfile: {
      mutations: GeneVariant[]
      amplifications: string[]
      deletions: string[]
      biomarkers: Array<{
        name: string
        value: string | number
        positive: boolean
      }>
    }
  }): Promise<DrugSensitivity[]> {
    const response = await aiApi.post('/pharmacogenomics/sensitivity/predict', options)
    return response.data as DrugSensitivity[]
  }

  /**
   * 生成用药报告
   * @param pharmacogenomicsResult 药物基因组学结果
   */
  async generateReport(pharmacogenomicsResult: PharmacogenomicsResult): Promise<{
    reportId: string
    summary: string
    criticalFindings: string[]
    recommendations: string[]
    patientFriendlySummary: string
    references: string[]
    disclaimer: string
  }> {
    const response = await aiApi.post('/pharmacogenomics/report/generate', {
      pharmacogenomicsResult
    })
    return response.data
  }

  /**
   * 药物 - 基因知识查询
   * @param drug 药物名称
   * @param gene 基因名称
   */
  async queryDrugGeneKnowledge(drug: string, gene: string): Promise<{
    drug: {
      name: string
      class: string
      metabolism: string[]
      targets: string[]
      transporters: string[]
    }
    gene: {
      name: string
      fullName: string
      function: string
      polymorphisms: string[]
    }
    interaction: {
      type: string
      mechanism: string
      clinicalImpact: string
      frequency: number
      populations: string[]
    }
    guidelines: Array<{
      organization: string
      year: number
      recommendation: string
      evidenceLevel: string
      url?: string
    }>
    references: string[]
  }> {
    const response = await aiApi.post('/pharmacogenomics/knowledge/query', {
      drug,
      gene
    })
    return response.data
  }

  /**
   * 药物基因组学检测面板推�?   * @param patientInfo 患者信�?   * @param clinicalContext 临床背景
   */
  async recommendTestPanel(options: {
    patientInfo: {
      age: number
      diagnosis: string
      currentMedications: string[]
      plannedMedications: string[]
    }
    clinicalContext: {
      purpose: 'preemptive' | 'reactive'
      urgency: 'routine' | 'urgent'
      budget?: number
    }
  }): Promise<{
    recommendedPanel: {
      name: string
      genes: string[]
      variants: number
      cost: number
      turnaroundTime: string
    }
    rationale: string
    expectedBenefits: string[]
    limitations: string[]
  }> {
    const response = await aiApi.post('/pharmacogenomics/panel/recommend', options)
    return response.data
  }
}

export default new AIPharmacogenomicsService()
