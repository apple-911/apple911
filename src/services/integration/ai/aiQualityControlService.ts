/**
 * AI 质控与运营优化服�? * 
 * 提供医疗质量智能监控、运营数据分析、资源优化配置、风险预警等功能
 */

import { aiApi } from '../../../utils/api'

// 质控指标
export interface QualityIndicator {
  // 指标名称
  name: string
  // 指标代码
  code: string
  // 当前�?  currentValue: number
  // 目标�?  targetValue: number
  // 单位
  unit: string
  // 趋势
  trend: 'improving' | 'stable' | 'declining'
  // 环比
  mom: number
  // 同比
  yoy: number
  // 评分
  score: number
  // 等级
  grade: '优秀' | '良好' | '合格' | '不合�?
  // 预警状�?  alertStatus: 'normal' | 'warning' | 'critical'
  // 影响因素
  influentialFactors: string[]
  // 改进建议
  recommendations: string[]
}

// 质控报告
export interface QualityReport {
  // 报告期间
  period: {
    start: string
    end: string
  }
  // 综合评分
  overallScore: number
  // 综合等级
  overallGrade: 'A' | 'B' | 'C' | 'D'
  // 核心指标
  coreIndicators: QualityIndicator[]
  // 过程指标
  processIndicators: QualityIndicator[]
  // 结果指标
  outcomeIndicators: QualityIndicator[]
  // 问题发现
  issues: Array<{
    category: string
    description: string
    severity: 'minor' | 'moderate' | 'major' | 'critical'
    frequency: number
    impact: string
    rootCause: string
    correctiveActions: string[]
    responsible: string
    deadline: string
  }>
  // 改进建议
  improvementSuggestions: Array<{
    priority: 'high' | 'medium' | 'low'
    category: string
    description: string
    expectedImpact: string
    implementationDifficulty: 'easy' | 'medium' | 'hard'
    estimatedCost: number
    timeline: string
  }>
  // 标杆对比
  benchmarking: {
    national: number
    provincial: number
    hospitalAverage: number
    topQuartile: number
  }
}

// 运营分析
export interface OperationAnalysis {
  // 工作量统�?  workload: {
    totalConsultations: number
    completedConsultations: number
    pendingConsultations: number
    cancelledConsultations: number
    averagePerDay: number
    trend: number[]
    departmentBreakdown: Array<{
      department: string
      count: number
      percentage: number
      growth: number
    }>
    expertBreakdown: Array<{
      expertId: string
      name: string
      count: number
      averageRating: number
    }>
  }
  // 效率分析
  efficiency: {
    averageWaitTime: number
    averageConsultationTime: number
    averageReportTime: number
    schedulingEfficiency: number
    resourceUtilization: number
    bottlenecks: string[]
    optimizationSuggestions: string[]
  }
  // 资源分析
  resources: {
    expertUtilization: {
      total: number
      active: number
      utilizationRate: number
      overallocated: string[]
      underutilized: string[]
    }
    roomUtilization: {
      total: number
      available: number
      utilizationRate: number
      peakHours: string[]
      idleHours: string[]
    }
    equipmentUtilization: {
      total: number
      available: number
      utilizationRate: number
      maintenanceNeeded: string[]
    }
  }
  // 成本效益
  costEffectiveness: {
    totalRevenue: number
    totalCost: number
    profit: number
    margin: number
    averageCostPerConsultation: number
    averageRevenuePerConsultation: number
    roi: number
    breakdown: {
      labor: number
      equipment: number
      facilities: number
      administration: number
    }
  }
}

// 风险预警
export interface RiskWarning {
  // 预警 ID
  id: string
  // 预警类型
  type: 'medical_quality' | 'patient_safety' | 'operational' | 'compliance' | 'resource'
  // 预警级别
  level: 'info' | 'low' | 'medium' | 'high' | 'critical'
  // 预警标题
  title: string
  // 预警描述
  description: string
  // 影响范围
  impact: string
  // 发生概率
  probability: number
  // 影响程度
  severity: number
  // 风险评分
  riskScore: number
  // 触发原因
  triggers: string[]
  // 相关数据
  relatedData: any
  // 建议措施
  recommendedActions: string[]
  // 责任�?  responsible: string
  // 截止时间
  deadline?: string
  // 状�?  status: 'active' | 'acknowledged' | 'mitigating' | 'resolved' | 'false_positive'
}

// 资源配置优化
export interface ResourceOptimization {
  // 当前配置
  currentAllocation: {
    experts: Array<{
      id: string
      name: string
      department: string
      allocatedHours: number
      utilizationRate: number
      workload: 'light' | 'moderate' | 'heavy' | 'excessive'
    }>
    rooms: Array<{
      id: string
      name: string
      type: string
      allocatedHours: number
      utilizationRate: number
    }>
    equipment: Array<{
      id: string
      name: string
      allocatedHours: number
      utilizationRate: number
    }>
  }
  // 优化建议
  optimizedAllocation: {
    experts: Array<{
      id: string
      recommendedHours: number
      reason: string
      expectedImprovement: number
    }>
    rooms: Array<{
      id: string
      recommendedHours: number
      reason: string
      expectedImprovement: number
    }>
    equipment: Array<{
      id: string
      recommendedHours: number
      reason: string
      expectedImprovement: number
    }>
  }
  // 预期效果
  expectedBenefits: {
    efficiencyGain: number
    costReduction: number
    qualityImprovement: number
    satisfactionImprovement: number
  }
  // 实施计划
  implementationPlan: Array<{
    step: number
    action: string
    timeline: string
    responsible: string
    resources: string[]
  }>
}

// 绩效评估
export interface PerformanceEvaluation {
  // 评估对象
  target: {
    type: 'expert' | 'department' | 'team'
    id: string
    name: string
  }
  // 评估期间
  period: {
    start: string
    end: string
  }
  // 评估维度
  dimensions: Array<{
    name: string
    weight: number
    score: number
    indicators: Array<{
      name: string
      value: number
      target: number
      score: number
    }>
  }>
  // 综合评分
  overallScore: number
  // 等级
  grade: 'A' | 'B' | 'C' | 'D' | 'E'
  // 排名
  ranking: {
    current: number
    total: number
    percentile: number
    trend: 'up' | 'stable' | 'down'
  }
  // 优势
  strengths: string[]
  // 不足
  weaknesses: string[]
  // 改进建议
  developmentPlan: string[]
}

export class AIQualityControlService {
  /**
   * 生成质控报告
   * @param period 报告期间
   * @param department 科室（可选）
   */
  async generateQualityReport(options: {
    period: {
      start: string
      end: string
    }
    department?: string
    includeBenchmarking?: boolean
  }): Promise<QualityReport> {
    const response = await aiApi.post('/quality/report/generate', options)
    return response.data as QualityReport
  }

  /**
   * 实时质控监控
   * @param indicators 监控指标
   */
  async monitorQuality(options: {
    indicators: string[]
    threshold?: {
      warning: number
      critical: number
    }
  }): Promise<{
    currentStatus: Array<{
      indicator: string
      value: number
      status: 'normal' | 'warning' | 'critical'
      trend: string
    }>
    alerts: RiskWarning[]
  }> {
    const response = await aiApi.post('/quality/monitor/realtime', options)
    return response.data
  }

  /**
   * 运营分析
   * @param period 分析期间
   */
  async analyzeOperations(options: {
    period: {
      start: string
      end: string
    }
    includeCostAnalysis?: boolean
    includeForecast?: boolean
  }): Promise<OperationAnalysis> {
    const response = await aiApi.post('/quality/operations/analyze', options)
    return response.data as OperationAnalysis
  }

  /**
   * 风险预警
   * @param scope 监控范围
   */
  async assessRisks(options: {
    scope: 'all' | 'medical_quality' | 'patient_safety' | 'operational' | 'compliance'
    timeRange?: 'realtime' | 'daily' | 'weekly' | 'monthly'
  }): Promise<RiskWarning[]> {
    const response = await aiApi.post('/quality/risks/assess', options)
    return response.data as RiskWarning[]
  }

  /**
   * 资源优化配置
   * @param resources 资源列表
   * @param constraints 约束条件
   */
  async optimizeResources(options: {
    resources: {
      experts: string[]
      rooms: string[]
      equipment: string[]
    }
    constraints: {
      budget?: number
      timeRange?: {
        start: string
        end: string
      }
      priorities?: string[]
    }
    objectives: Array<'maximize_utilization' | 'minimize_cost' | 'maximize_quality' | 'balance_workload'>
  }): Promise<ResourceOptimization> {
    const response = await aiApi.post('/quality/resources/optimize', options)
    return response.data as ResourceOptimization
  }

  /**
   * 绩效评估
   * @param target 评估对象
   * @param period 评估期间
   */
  async evaluatePerformance(options: {
    target: {
      type: 'expert' | 'department' | 'team'
      id: string
    }
    period: {
      start: string
      end: string
    }
    criteria?: string[]
  }): Promise<PerformanceEvaluation> {
    const response = await aiApi.post('/quality/performance/evaluate', options)
    return response.data as PerformanceEvaluation
  }

  /**
   * 工作量预�?   * @param historicalData 历史数据
   * @param factors 影响因素
   */
  async forecastWorkload(options: {
    historicalData: Array<{
      date: string
      count: number
    }>
    factors?: {
      seasonality: boolean
      holidays: boolean
      specialEvents: Array<{
        date: string
        impact: number
      }>
    }
    forecastPeriod: number
  }): Promise<{
    forecast: Array<{
      date: string
      predicted: number
      confidenceInterval: {
        lower: number
        upper: number
      }
    }>
    accuracy: number
    insights: string[]
  }> {
    const response = await aiApi.post('/quality/forecast/workload', options)
    return response.data
  }

  /**
   * 智能排班优化
   * @param experts 专家列表
   * @param constraints 排班约束
   */
  async optimizeScheduling(options: {
    experts: Array<{
      id: string
      name: string
      department: string
      availability: Array<{
        dayOfWeek: number
        timeSlots: string[]
      }>
      preferences?: {
        preferredDays: number[]
        preferredTimes: string[]
        maxHoursPerWeek: number
      }
      qualifications: string[]
    }>
    constraints: {
      minExpertsPerSlot: number
      maxHoursPerDay: number
      requiredDepartments: string[]
      blackoutDates: string[]
    }
    demand: Array<{
      date: string
      timeSlot: string
      expectedDemand: number
    }>
  }): Promise<{
    schedule: Array<{
      date: string
      timeSlot: string
      experts: string[]
      coverage: number
    }>
    metrics: {
      coverageRate: number
      satisfactionRate: number
      utilizationRate: number
      fairnessScore: number
    }
    conflicts: string[]
  }> {
    const response = await aiApi.post('/quality/scheduling/optimize', options)
    return response.data
  }

  /**
   * 根因分析
   * @param issue 问题描述
   * @param data 相关数据
   */
  async rootCauseAnalysis(options: {
    issue: string
    data: {
      timeline: Array<{
        timestamp: string
        event: string
        metrics: Record<string, number>
      }>
      relatedFactors: string[]
    }
  }): Promise<{
    rootCauses: Array<{
      cause: string
      confidence: number
      evidence: string[]
      category: 'human' | 'process' | 'system' | 'environment'
      contribution: number
    }>
    causalChain: string[]
    recommendations: Array<{
      action: string
      priority: 'high' | 'medium' | 'low'
      expectedImpact: number
      implementationCost: 'low' | 'medium' | 'high'
      timeline: string
    }>
  }> {
    const response = await aiApi.post('/quality/rca/analyze', options)
    return response.data
  }
}

export default new AIQualityControlService()
