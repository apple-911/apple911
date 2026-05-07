/**
 * HIS 医嘱服务
 * 
 * 负责与 HIS 系统对接，同步医嘱信息、执行结果等
 */

import type { HISOrder, SyncResult } from '../types'
import { hisApi } from '../../../utils/api'

export class HISOrderService {
  /**
   * 获取患者医嘱列表
   * @param patientId 患者 ID
   * @param status 可选，医嘱状态筛选
   */
  async getPatientOrders(patientId: string, status?: string): Promise<HISOrder[]> {
    try {
      const params = new URLSearchParams({ patientId })
      if (status) {
        params.append('status', status)
      }

      const response = await hisApi.get(`/orders?${params.toString()}`)
      return response.data as HISOrder[]
    } catch (error) {
      console.error('获取医嘱列表失败:', error)
      throw new Error('无法获取患者医嘱信息')
    }
  }

  /**
   * 获取医嘱详情
   * @param orderId 医嘱 ID
   */
  async getOrderDetail(orderId: string): Promise<HISOrder> {
    const response = await hisApi.get(`/orders/${orderId}`)
    return response.data as HISOrder
  }

  /**
   * 同步 MDT 会诊建议到 HIS 医嘱
   * @param order MDT 会诊建议
   * @param consultationId 会诊 ID
   */
  async syncMDTOrder(
    order: MDTOrder,
    consultationId: string
  ): Promise<HISOrder> {
    try {
      const hisOrder = {
        patientId: order.patientId,
        orderType: this.transformOrderType(order.type),
        orderName: order.name,
        orderCode: order.code || '',
        status: '已开立',
        orderDate: new Date().toISOString(),
        doctor: order.doctor,
        note: `MDT 会诊建议 - ${consultationId}`
      }

      const response = await hisApi.post('/orders', hisOrder)
      return response.data as HISOrder
    } catch (error) {
      console.error('同步 MDT 医嘱失败:', error)
      throw new Error('无法同步会诊建议到 HIS')
    }
  }

  /**
   * 批量同步 MDT 会诊建议
   * @param orders MDT 会诊建议列表
   * @param consultationId 会诊 ID
   */
  async batchSyncMDTOrders(
    orders: MDTOrder[],
    consultationId: string
  ): Promise<SyncResult> {
    const results: HISOrder[] = []
    const errors: string[] = []

    for (const order of orders) {
      try {
        const hisOrder = await this.syncMDTOrder(order, consultationId)
        results.push(hisOrder)
      } catch (error) {
        errors.push(`医嘱 ${order.name} 同步失败：${(error as Error).message}`)
      }
    }

    return {
      success: errors.length === 0,
      timestamp: new Date().toISOString(),
      count: results.length,
      errors: errors.length > 0 ? errors : undefined
    }
  }

  /**
   * 执行医嘱
   * @param orderId 医嘱 ID
   * @param result 执行结果
   */
  async executeOrder(orderId: string, result?: any): Promise<void> {
    await hisApi.put(`/orders/${orderId}/execute`, {
      executeDate: new Date().toISOString(),
      result
    })
  }

  /**
   * 停止医嘱
   * @param orderId 医嘱 ID
   * @param reason 停止原因
   */
  async stopOrder(orderId: string, reason: string): Promise<void> {
    await hisApi.put(`/orders/${orderId}/stop`, {
      stopDate: new Date().toISOString(),
      reason
    })
  }

  /**
   * 转换 MDT 医嘱类型到 HIS 格式
   * @param type MDT 医嘱类型
   */
  private transformOrderType(type: string): HISOrder['orderType'] {
    const typeMap: Record<string, HISOrder['orderType']> = {
      '检查': '检查',
      '检验': '检验',
      '治疗': '治疗',
      '用药': '用药',
      '手术': '手术',
      '化疗': '治疗',
      '放疗': '治疗'
    }

    return typeMap[type] || '治疗'
  }
}

// MDT 会诊建议
export interface MDTOrder {
  patientId: string
  type: string
  name: string
  code?: string
  doctor: string
  content: string
  priority?: '普通' | '紧急' | '床旁'
}

// 导出单例
export const hisOrderService = new HISOrderService()
