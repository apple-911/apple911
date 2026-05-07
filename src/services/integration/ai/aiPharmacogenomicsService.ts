/**
 * AI 药物基因组学服务
 * 
 * 提供基于基因检查查测的个体化用药指导药物代谢分析、剂量优化化化、不良反应预测等功能
 */

import { aiApi } from '../../../utils/api'

export interface GeneVariant {
  gene: string
  variant: string
  zygosity: 'homozygous' | 'heterozygous' | 'hemizygous'
  clinicalSignificance: 'pathogenic' | 'likely_pathogenic' | 'uncertain' | 'likely_benign' | 'benign'
  alleleFrequency: number
  phenotype: string
}

export interface MetabolizerPhenotype {
  enzyme: string
  phenotype: 'poor' | 'intermediate' | 'normal' | 'rapid' | 'ultrarapid'
  activityScore: number
  variants: GeneVariant[]
  clinicalImplications: string[]
}

export interface PharmacogenomicsResult {
  patientInfo: {
    patientId: string
    testDate: string
    testType: string
  }
  metabolizerPhenotypes: MetabolizerPhenotype[]
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
  personalizedRecommendations: Array<{
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

export interface DrugSensitivity {
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
  async analyzePharmacogenomics(options: {
    patientId: string
    geneVariants: GeneVariant[]
    currentMedications: string[]
  }): Promise<PharmacogenomicsResult> {
    const response = await aiApi.post('/pharmacogenomics/analyze', options)
    return response.data as PharmacogenomicsResult
  }

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

  async generatePharmacogenomicsReport(options: {
    patientId: string
    results: PharmacogenomicsResult
  }): Promise<string> {
    const response = await aiApi.post('/pharmacogenomics/report/generate', options)
    return response.data.report
  }
}

export default new AIPharmacogenomicsService()
