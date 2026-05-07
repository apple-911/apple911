/**
 * HIS 患者同步服务
 * 
 * 负责与 HIS 系统对接，同步患者基本信息、入院信息等
 */

import type { HISPatient, Patient, SyncResult } from '../types'
import { DataMapping } from '../../common/dataMapping'
import { hisApi } from '../../../utils/api'

export class HISPatientService {
  private cache = new Map<string, { data: HISPatient; timestamp: number }>()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 分钟缓存

  /**
   * 从 HIS 同步患者信息
   * @param mrn 病历号
   */
  async syncPatient(mrn: string): Promise<HISPatient> {
    try {
      const response = await hisApi.get(`/patient/${mrn}`)
      const hisPatient = response.data as HISPatient
      
      // 更新缓存
      this.cache.set(mrn, {
        data: hisPatient,
        timestamp: Date.now()
      })

      return hisPatient
    } catch (error) {
      console.error('HIS 患者信息同步失败:', error)
      throw new Error(`无法从 HIS 获取患者信息：${mrn}`)
    }
  }

  /**
   * 查询患者信息（优先缓存）
   * @param mrn 病历号
   */
  async queryPatient(mrn: string): Promise<HISPatient> {
    // 检查缓存
    const cached = this.cache.get(mrn)
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data
    }

    // 从 HIS 获取
    return this.syncPatient(mrn)
  }

  /**
   * 转换 HIS 患者数据到 MDT 格式
   * @param hisPatient HIS 患者数据
   */
  transformToMDTPatient(hisPatient: HISPatient): Patient {
    return {
      id: hisPatient.patientId,
      mrn: hisPatient.mrn,
      name: hisPatient.name,
      gender: DataMapping.gender[hisPatient.gender],
      age: this.calculateAge(hisPatient.dateOfBirth),
      diagnosis: DataMapping.transformDiagnosis(hisPatient.diagnosis),
      department: DataMapping.department[hisPatient.department] || hisPatient.department,
      bedNumber: hisPatient.bedNumber,
      allergyHistory: hisPatient.allergyHistory,
      admissionDate: hisPatient.admissionDate,
      phone: hisPatient.phone
    }
  }

  /**
   * 批量同步患者信息
   * @param mrns 病历号列表
   */
  async batchSyncPatients(mrns: string[]): Promise<SyncResult> {
    const results: Patient[] = []
    const errors: string[] = []
    const warnings: string[] = []

    for (const mrn of mrns) {
      try {
        const hisPatient = await this.syncPatient(mrn)
        const mdtPatient = this.transformToMDTPatient(hisPatient)
        results.push(mdtPatient)
      } catch (error) {
        errors.push(`患者 ${mrn} 同步失败：${(error as Error).message}`)
      }
    }

    return {
      success: errors.length === 0,
      timestamp: new Date().toISOString(),
      count: results.length,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined
    }
  }

  /**
   * 订阅患者信息变更
   * @param mrn 病历号
   * @param callback 变更回调
   */
  subscribePatientChange(
    mrn: string,
    callback: (patient: HISPatient) => void
  ): () => void {
    const channel = new BroadcastChannel(`his:patient:${mrn}`)
    
    channel.onmessage = (event) => {
      callback(event.data as HISPatient)
    }

    return () => {
      channel.close()
    }
  }

  /**
   * 通知患者信息变更
   * @param mrn 病历号
   * @param patient 患者信息
   */
  notifyPatientChange(mrn: string, patient: HISPatient): void {
    const channel = new BroadcastChannel(`his:patient:${mrn}`)
    channel.postMessage(patient)
    channel.close()

    // 更新缓存
    this.cache.set(mrn, {
      data: patient,
      timestamp: Date.now()
    })
  }

  /**
   * 计算年龄
   * @param birthDate 出生日期
   */
  private calculateAge(birthDate: string): number {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }

  /**
   * 清除缓存
   * @param mrn 可选，指定清除的病历号
   */
  clearCache(mrn?: string): void {
    if (mrn) {
      this.cache.delete(mrn)
    } else {
      this.cache.clear()
    }
  }
}

// 导出单例
export const hisPatientService = new HISPatientService()
