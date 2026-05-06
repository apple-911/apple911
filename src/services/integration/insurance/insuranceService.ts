/**
 * 医保对接服务
 * 
 * 负责与医保系统对接，实现医保结算、费用查询等功能
 */

import { api } from '../../utils/api'

// 医保患者信息
export interface InsurancePatient {
  patientId: string
  patientName: string
  idCard: string
  insuranceType: '城镇职工' | '城镇居民' | '新农合' | '公费医疗' | '自费'
  insuranceNumber: string
  insuranceOrganization: string
  insuranceLocation: string
  validFrom: string
  validTo: string
  status: '正常' | '暂停' | '终止'
  balance?: number
  deductible?: number
  reimbursementRate?: number
}

// 医保结算信息
export interface InsuranceSettlement {
  settlementId: string
  patientId: string
  patientName: string
  insuranceNumber: string
  visitId: string
  visitType: '门诊' | '住院'
  department: string
  diagnosis: string
  diagnosisCode: string
  totalAmount: number
  selfPayAmount: number
  insurancePayAmount: number
  deductibleAmount: number
  reimbursementRate: number
  settlementDate: string
  settlementTime: string
  operator: string
  status: '已结算' | '已撤销' | '已退款'
  items: SettlementItem[]
}

// 结算明细
export interface SettlementItem {
  itemId: string
  itemName: string
  itemCode: string
  itemType: '药品' | '诊疗' | '材料' | '服务'
  specification: string
  unit: string
  quantity: number
  unitPrice: number
  amount: number
  selfPayRatio: number
  selfPayAmount: number
  insurancePayAmount: number
  category: '甲类' | '乙类' | '丙类'
}

// 医保目录
export interface InsuranceCatalog {
  itemCode: string
  itemName: string
  itemType: '药品' | '诊疗' | '材料'
  specification: string
  unit: string
  unitPrice: number
  category: '甲类' | '乙类' | '丙类'
  selfPayRatio: number
  limitation?: string
  validFrom: string
  validTo: string
}

// 预结算信息
export interface PreSettlement {
  totalAmount: number
  selfPayAmount: number
  insurancePayAmount: number
  deductibleAmount: number
  reimbursementRate: number
  breakdown: {
    drugCost: number
    treatmentCost: number
    materialCost: number
    serviceCost: number
  }
  items: Array<{
    itemName: string
    amount: number
    selfPayAmount: number
    insurancePayAmount: number
  }>
}

export class InsuranceService {
  /**
   * 读取医保卡信息
   * @param cardNumber 医保卡号
   */
  async readInsuranceCard(cardNumber: string): Promise<InsurancePatient> {
    const response = await api.get('/insurance/patient', {
      params: { cardNumber }
    })
    return response.data as InsurancePatient
  }

  /**
   * 验证医保资格
   * @param insuranceNumber 医保编号
   * @param idCard 身份证号
   */
  async verifyInsuranceEligibility(
    insuranceNumber: string,
    idCard: string
  ): Promise<{
    eligible: boolean
    patient: InsurancePatient
    message: string
  }> {
    const response = await api.post('/insurance/verify', {
      insuranceNumber,
      idCard
    })
    return response.data
  }

  /**
   * 医保登记
   * @param patient 患者信息
   * @param visitInfo 就诊信息
   */
  async registerInsurance(
    patient: InsurancePatient,
    visitInfo: {
      visitId: string
      visitType: '门诊' | '住院'
      department: string
      diagnosis: string
      admissionDate?: string
    }
  ): Promise<{
    registrationId: string
    message: string
  }> {
    const response = await api.post('/insurance/register', {
      patient,
      ...visitInfo
    })
    return response.data
  }

  /**
   * 预结算
   * @param visitId 就诊 ID
   * @param items 费用明细
   */
  async preSettlement(
    visitId: string,
    items: Array<{
      itemCode: string
      itemName: string
      quantity: number
      unitPrice: number
      amount: number
    }>
  ): Promise<PreSettlement> {
    const response = await api.post('/insurance/pre-settlement', {
      visitId,
      items
    })
    return response.data as PreSettlement
  }

  /**
   * 正式结算
   * @param visitId 就诊 ID
   * @param preSettlement 预结算信息
   */
  async settle(
    visitId: string,
    preSettlement: PreSettlement
  ): Promise<InsuranceSettlement> {
    const response = await api.post('/insurance/settle', {
      visitId,
      ...preSettlement
    })
    return response.data as InsuranceSettlement
  }

  /**
   * 撤销结算
   * @param settlementId 结算 ID
   * @param reason 撤销原因
   */
  async cancelSettlement(settlementId: string, reason: string): Promise<void> {
    await api.post(`/insurance/settlements/${settlementId}/cancel`, {
      reason
    })
  }

  /**
   * 获取结算详情
   * @param settlementId 结算 ID
   */
  async getSettlementDetail(settlementId: string): Promise<InsuranceSettlement> {
    const response = await api.get(`/insurance/settlements/${settlementId}`)
    return response.data as InsuranceSettlement
  }

  /**
   * 获取患者结算历史
   * @param patientId 患者 ID
   * @param options 查询选项
   */
  async getPatientSettlements(
    patientId: string,
    options?: {
      startDate?: string
      endDate?: string
      visitType?: '门诊' | '住院'
    }
  ): Promise<InsuranceSettlement[]> {
    const params = new URLSearchParams()
    
    if (options?.startDate) params.append('startDate', options.startDate)
    if (options?.endDate) params.append('endDate', options.endDate)
    if (options?.visitType) params.append('visitType', options.visitType)

    const response = await api.get(
      `/insurance/settlements/patient/${patientId}?${params.toString()}`
    )
    return response.data as InsuranceSettlement[]
  }

  /**
   * 查询医保目录
   * @param keyword 关键词
   * @param category 类别
   */
  async searchCatalog(
    keyword: string,
    category?: '药品' | '诊疗' | '材料'
  ): Promise<InsuranceCatalog[]> {
    const params = new URLSearchParams({ keyword })
    if (category) params.append('category', category)

    const response = await api.get(`/insurance/catalog/search?${params.toString()}`)
    return response.data as InsuranceCatalog[]
  }

  /**
   * 获取药品目录
   * @param options 查询选项
   */
  async getDrugCatalog(options?: {
    category?: '甲类' | '乙类' | '丙类'
    type?: '西药' | '中成药' | '中药饮片'
  }): Promise<InsuranceCatalog[]> {
    const params = new URLSearchParams()
    if (options?.category) params.append('category', options.category)
    if (options?.type) params.append('type', options.type)

    const response = await api.get(`/insurance/catalog/drugs?${params.toString()}`)
    return response.data as InsuranceCatalog[]
  }

  /**
   * 检查药品报销限制
   * @param itemCode 项目代码
   * @param diagnosis 诊断
   */
  async checkDrugLimitation(
    itemCode: string,
    diagnosis: string
  ): Promise<{
    allowed: boolean
    limitation: string
    selfPayRatio: number
    message: string
  }> {
    const response = await api.get('/insurance/drug-limitation', {
      params: { itemCode, diagnosis }
    })
    return response.data
  }

  /**
   * 获取医保政策
   * @param location 地区
   * @param type 政策类型
   */
  async getPolicy(
    location: string,
    type: '报销比例' | '起付线' | '封顶线' | '药品目录'
  ): Promise<{
    policyId: string
    title: string
    content: string
    effectiveDate: string
    expiryDate?: string
  }> {
    const response = await api.get('/insurance/policy', {
      params: { location, type }
    })
    return response.data
  }

  /**
   * 计算报销金额
   * @param totalAmount 总金额
   * @param selfPayAmount 自付金额
   * @param insuranceType 医保类型
   * @param location 地区
   */
  async calculateReimbursement(
    totalAmount: number,
    selfPayAmount: number,
    insuranceType: string,
    location: string
  ): Promise<{
    deductibleAmount: number
    reimbursementRate: number
    insurancePayAmount: number
    personalPayAmount: number
    accountPayAmount: number
  }> {
    const response = await api.post('/insurance/calculate', {
      totalAmount,
      selfPayAmount,
      insuranceType,
      location
    })
    return response.data
  }

  /**
   * 上传费用明细
   * @param visitId 就诊 ID
   * @param items 费用明细
   */
  async uploadCostDetails(
    visitId: string,
    items: Array<{
      itemCode: string
      itemName: string
      specification: string
      unit: string
      quantity: number
      unitPrice: number
      amount: number
      category: '甲类' | '乙类' | '丙类'
    }>
  ): Promise<void> {
    await api.post('/insurance/cost-details', {
      visitId,
      items
    })
  }

  /**
   * 获取医保对账单
   * @param department 科室
   * @param month 月份
   */
  async getStatement(
    department: string,
    month: string
  ): Promise<{
    totalPatients: number
    totalAmount: number
    insurancePayAmount: number
    selfPayAmount: number
    averageReimbursementRate: number
    details: InsuranceSettlement[]
  }> {
    const response = await api.get('/insurance/statement', {
      params: { department, month }
    })
    return response.data
  }

  /**
   * 异地就医备案
   * @param patient 患者信息
   * @param targetLocation 就医地
   * @param reason 备案原因
   */
  async fileAwayTreatment(
    patient: InsurancePatient,
    targetLocation: string,
    reason: '异地安置' | '异地工作' | '异地转诊' | '其他'
  ): Promise<{
    fileId: string
    status: '已提交' | '已审核' | '已驳回'
    message: string
  }> {
    const response = await api.post('/insurance/away-treatment', {
      patient,
      targetLocation,
      reason
    })
    return response.data
  }

  /**
   * 大病保险结算
   * @param settlementId 基本医保结算 ID
   */
  async seriousIllnessSettlement(settlementId: string): Promise<{
    settlementId: string
    totalAmount: number
    reimbursementAmount: number
    reimbursementRate: number
  }> {
    const response = await api.post('/insurance/serious-illness', {
      settlementId
    })
    return response.data
  }
}

// 导出单例
export const insuranceService = new InsuranceService()
