/**
 * LIS 检验系统集成服务
 * 
 * 负责与 LIS 系统对接，获取检验申请、检验结果等数据
 */

import { api } from '../../utils/api'

// 检验申请
export interface LabOrder {
  orderId: string
  patientId: string
  patientName: string
  patientMrn: string
  orderType: '常规检验' | '急诊检验' | '生化检验' | '免疫检验' | '微生物检验' | '分子诊断'
  priority: '普通' | '急' | '床旁' | '加急'
  items: LabOrderItem[]
  orderDate: string
  orderDoctor: string
  sampleType: '血液' | '尿液' | '粪便' | '脑脊液' | '胸腹水' | '分泌物' | '其他'
  sampleVolume?: string
  collectionTime?: string
  collectionLocation?: string
  clinicalDiagnosis?: string
  clinicalNotes?: string
  status: '已开立' | '已采样' | '已送检' | '已接收' | '检验中' | '已审核' | '已发布'
  reportTime?: string
}

// 检验项目
export interface LabOrderItem {
  itemId: string
  itemName: string
  itemCode: string
  category: string
  price: number
  unit: string
}

// 检验结果
export interface LabResult {
  resultId: string
  orderId: string
  patientId: string
  patientName: string
  patientMrn: string
  sampleId: string
  reportDate: string
  reportTime: string
  items: LabTestItem[]
  reviewer: string
  examiner: string
  status: '草稿' | '已审核' | '已发布'
  criticalValues?: CriticalValue[]
  comments?: string
}

// 检验项目结果
export interface LabTestItem {
  itemId: string
  itemName: string
  itemCode: string
  category: string
  result: string | number
  resultFlag: 'H' | 'L' | 'HH' | 'LL' | 'N'  // High, Low, High High, Low Low, Normal
  unit: string
  referenceRange: {
    min: number
    max: number
  }
  deltaCheck?: {
    previousValue: number
    previousDate: string
    changePercent: number
  }
  method?: string
  instrument?: string
}

// 危急值
export interface CriticalValue {
  itemId: string
  itemName: string
  result: string | number
  unit: string
  criticalLevel: '危急' | '紧急'
  notifyTime: string
  notifiedDoctor: string
  notifiedTime?: string
  handled: boolean
}

// 检验报告
export interface LabReport {
  reportId: string
  resultId: string
  patientId: string
  patientName: string
  patientMrn: string
  department: string
  bedNumber: string
  diagnosis: string
  sampleType: string
  items: LabTestItem[]
  abnormalItems: LabTestItem[]
  criticalValues?: CriticalValue[]
  reportDate: string
  reportTime: string
  examiner: string
  reviewer: string
  status: '已发布'
  pdfUrl?: string
}

export class LISService {
  /**
   * 获取患者检验申请列表
   * @param patientId 患者 ID
   * @param status 可选，申请状态筛选
   */
  async getPatientOrders(patientId: string, status?: string): Promise<LabOrder[]> {
    const params = new URLSearchParams({ patientId })
    if (status) {
      params.append('status', status)
    }

    const response = await api.get(`/lis/orders?${params.toString()}`)
    return response.data as LabOrder[]
  }

  /**
   * 获取检验申请详情
   * @param orderId 申请 ID
   */
  async getOrderDetail(orderId: string): Promise<LabOrder> {
    const response = await api.get(`/lis/orders/${orderId}`)
    return response.data as LabOrder
  }

  /**
   * 创建检验申请
   * @param order 检验申请信息
   */
  async createOrder(order: Partial<LabOrder>): Promise<LabOrder> {
    const response = await api.post('/lis/orders', order)
    return response.data as LabOrder
  }

  /**
   * 取消检验申请
   * @param orderId 申请 ID
   * @param reason 取消原因
   */
  async cancelOrder(orderId: string, reason: string): Promise<void> {
    await api.post(`/lis/orders/${orderId}/cancel`, { reason })
  }

  /**
   * 获取患者检验报告列表
   * @param patientId 患者 ID
   * @param options 查询选项
   */
  async getPatientReports(
    patientId: string,
    options?: {
      startDate?: string
      endDate?: string
      category?: string
      status?: string
    }
  ): Promise<LabReport[]> {
    const params = new URLSearchParams({ patientId })
    
    if (options?.startDate) params.append('startDate', options.startDate)
    if (options?.endDate) params.append('endDate', options.endDate)
    if (options?.category) params.append('category', options.category)
    if (options?.status) params.append('status', options.status)

    const response = await api.get(`/lis/reports?${params.toString()}`)
    return response.data as LabReport[]
  }

  /**
   * 获取检验报告详情
   * @param resultId 结果 ID
   */
  async getReportDetail(resultId: string): Promise<LabReport> {
    const response = await api.get(`/lis/reports/${resultId}`)
    return response.data as LabReport
  }

  /**
   * 获取检验结果
   * @param resultId 结果 ID
   */
  async getResults(resultId: string): Promise<LabResult> {
    const response = await api.get(`/lis/results/${resultId}`)
    return response.data as LabResult
  }

  /**
   * 获取危急值列表
   * @param options 查询选项
   */
  async getCriticalValues(options?: {
    patientId?: string
    startDate?: string
    endDate?: string
    handled?: boolean
  }): Promise<CriticalValue[]> {
    const params = new URLSearchParams()
    
    if (options?.patientId) params.append('patientId', options.patientId)
    if (options?.startDate) params.append('startDate', options.startDate)
    if (options?.endDate) params.append('endDate', options.endDate)
    if (options?.handled !== undefined) params.append('handled', String(options.handled))

    const response = await api.get(`/lis/critical-values?${params.toString()}`)
    return response.data as CriticalValue[]
  }

  /**
   * 确认危急值通知
   * @param criticalValueId 危急值 ID
   * @param doctorId 医生 ID
   */
  async acknowledgeCriticalValue(criticalValueId: string, doctorId: string): Promise<void> {
    await api.post(`/lis/critical-values/${criticalValueId}/acknowledge`, {
      doctorId,
      notifiedTime: new Date().toISOString()
    })
  }

  /**
   * 获取检验项目字典
   * @param category 可选，类别筛选
   */
  async getTestItems(category?: string): Promise<LabOrderItem[]> {
    const params = category ? `?category=${category}` : ''
    const response = await api.get(`/lis/test-items${params}`)
    return response.data as LabOrderItem[]
  }

  /**
   * 搜索检验项目
   * @param keyword 关键词
   */
  async searchTestItems(keyword: string): Promise<LabOrderItem[]> {
    const response = await api.get(`/lis/test-items/search?keyword=${keyword}`)
    return response.data as LabOrderItem[]
  }

  /**
   * 获取检验样本状态
   * @param sampleId 样本 ID
   */
  async getSampleStatus(sampleId: string): Promise<{
    sampleId: string
    status: string
    location: string
    temperature?: number
    collectedTime?: string
    receivedTime?: string
    testedTime?: string
    reportedTime?: string
  }> {
    const response = await api.get(`/lis/samples/${sampleId}/status`)
    return response.data
  }

  /**
   * 获取检验历史趋势
   * @param patientId 患者 ID
   * @param itemCode 检验项目代码
   * @param days 天数
   */
  async getTestTrend(
    patientId: string,
    itemCode: string,
    days: number = 30
  ): Promise<Array<{
    date: string
    result: number | string
    unit: string
    resultFlag: string
    referenceRange: { min: number; max: number }
  }>> {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
    const response = await api.get(`/lis/trend/${patientId}/${itemCode}`, {
      params: { startDate }
    })
    return response.data
  }

  /**
   * 批量获取检验结果
   * @param orderIds 申请 ID 列表
   */
  async batchGetResults(orderIds: string[]): Promise<LabResult[]> {
    const response = await api.post('/lis/results/batch', { orderIds })
    return response.data as LabResult[]
  }

  /**
   * 下载检验报告 PDF
   * @param reportId 报告 ID
   */
  async downloadReportPDF(reportId: string): Promise<Blob> {
    const response = await api.get(`/lis/reports/${reportId}/pdf`, {
      responseType: 'blob'
    })
    return response.data as Blob
  }

  /**
   * 打印检验报告
   * @param reportId 报告 ID
   * @param printerId 打印机 ID
   */
  async printReport(reportId: string, printerId: string): Promise<void> {
    await api.post(`/lis/reports/${reportId}/print`, { printerId })
  }

  /**
   * 获取检验统计信息
   * @param department 科室
   * @param startDate 开始日期
   * @param endDate 结束日期
   */
  async getStatistics(
    department: string,
    startDate: string,
    endDate: string
  ): Promise<{
    totalOrders: number
    completedOrders: number
    criticalValues: number
    averageTurnaroundTime: number
    abnormalRate: number
  }> {
    const response = await api.get('/lis/statistics', {
      params: { department, startDate, endDate }
    })
    return response.data
  }
}

// 导出单例
export const lisService = new LISService()
