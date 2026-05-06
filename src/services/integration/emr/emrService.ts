/**
 * EMR 电子病历服务
 * 
 * 负责与 EMR 系统对接，实现病历的读取和写入
 */

import type { EMRRecord, SyncResult } from '../types'
import { emrApi } from '../../utils/api'

export class EMRService {
  /**
   * 获取患者病历列表
   * @param patientId 患者 ID
   * @param recordType 可选，病历类型筛选
   */
  async getPatientRecords(
    patientId: string,
    recordType?: string
  ): Promise<EMRRecord[]> {
    try {
      const params = new URLSearchParams({ patientId })
      if (recordType) {
        params.append('recordType', recordType)
      }

      const response = await emrApi.get(`/records?${params.toString()}`)
      return response.data as EMRRecord[]
    } catch (error) {
      console.error('获取病历列表失败:', error)
      throw new Error('无法获取患者病历信息')
    }
  }

  /**
   * 获取病历详情
   * @param recordId 病历 ID
   */
  async getRecordDetail(recordId: string): Promise<EMRRecord> {
    const response = await emrApi.get(`/records/${recordId}`)
    return response.data as EMRRecord
  }

  /**
   * 写入 MDT 会诊记录到 EMR
   * @param consultation 会诊信息
   */
  async writeMDTRecord(consultation: ConsultationData): Promise<EMRRecord> {
    try {
      const record = {
        recordType: '会诊记录' as const,
        patientId: consultation.patientId,
        title: `MDT 会诊记录 - ${consultation.mainDiagnosis}`,
        content: this.generateMDTRecord(consultation),
        doctor: consultation.mainExpert,
        department: consultation.department,
        status: '已提交' as const,
        keywords: this.extractKeywords(consultation)
      }

      const response = await emrApi.post('/records', record)
      return response.data as EMRRecord
    } catch (error) {
      console.error('写入 MDT 会诊记录失败:', error)
      throw new Error('无法写入会诊记录到 EMR')
    }
  }

  /**
   * 生成 MDT 会诊记录
   * @param consultation 会诊信息
   */
  private generateMDTRecord(consultation: ConsultationData): string {
    const sections: string[] = []

    // 基本信息
    sections.push(`
# MDT 多学科会诊记录

**会诊时间**: ${this.formatDateTime(consultation.time)}
**会诊地点**: ${consultation.location || '线上'}
**主持人**: ${consultation.mainExpert}
**记录人**: ${consultation.recorder || consultation.mainExpert}

## 参加人员
${consultation.experts.map(e => `- ${e.name} (${e.department} ${e.title})`).join('\n')}

---

## 患者信息
- **姓名**: ${consultation.patientName}
- **性别**: ${consultation.patientGender}
- **年龄**: ${consultation.patientAge}
- **住院号**: ${consultation.patientMrn}
- **科室**: ${consultation.department}
- **床号**: ${consultation.bedNumber}

## 主诉
${consultation.chiefComplaint || 'N/A'}

## 现病史
${consultation.historyOfPresentIllness || 'N/A'}

## 既往史
${consultation.pastHistory || 'N/A'}

## 入院诊断
${consultation.diagnosis}

---

## 会诊目的
${consultation.purpose}

---

## 讨论记录
${consultation.discussionRecords?.map(r => `
### ${r.doctor} (${r.time})
${r.opinion}
`).join('\n') || '无详细讨论记录'}

---

## 会诊结论
${consultation.conclusion}

---

## 诊疗建议
${consultation.recommendations?.map((r, i) => `${i + 1}. ${r}`).join('\n') || '无'}

---

## 下一步计划
${consultation.nextPlan || '遵医嘱执行'}

---

**记录时间**: ${this.formatDateTime(new Date().toISOString())}
**主持人签名**: ${consultation.mainExpert}
    `.trim())

    return sections.join('\n\n')
  }

  /**
   * 提取病历关键词
   * @param consultation 会诊信息
   */
  private extractKeywords(consultation: ConsultationData): string[] {
    const keywords: string[] = []

    // 诊断关键词
    if (consultation.mainDiagnosis) {
      keywords.push(consultation.mainDiagnosis)
    }

    // 治疗关键词
    if (consultation.recommendations) {
      consultation.recommendations.forEach(rec => {
        if (rec.includes('化疗')) keywords.push('化疗')
        if (rec.includes('放疗')) keywords.push('放疗')
        if (rec.includes('手术')) keywords.push('手术')
        if (rec.includes('靶向')) keywords.push('靶向治疗')
        if (rec.includes('免疫')) keywords.push('免疫治疗')
      })
    }

    return Array.from(new Set(keywords))
  }

  /**
   * 更新病历
   * @param recordId 病历 ID
   * @param updates 更新内容
   */
  async updateRecord(
    recordId: string,
    updates: Partial<EMRRecord>
  ): Promise<EMRRecord> {
    const response = await emrApi.put(`/records/${recordId}`, {
      ...updates,
      modifyTime: new Date().toISOString()
    })
    return response.data as EMRRecord
  }

  /**
   * 提交病历
   * @param recordId 病历 ID
   */
  async submitRecord(recordId: string): Promise<void> {
    await emrApi.post(`/records/${recordId}/submit`)
  }

  /**
   * 归档病历
   * @param recordId 病历 ID
   */
  async archiveRecord(recordId: string): Promise<void> {
    await emrApi.post(`/records/${recordId}/archive`)
  }

  /**
   * 批量导入病历
   * @param records 病历列表
   */
  async batchImportRecords(records: Partial<EMRRecord>[]): Promise<SyncResult> {
    const results: EMRRecord[] = []
    const errors: string[] = []

    for (const record of records) {
      try {
        const response = await emrApi.post('/records', record)
        results.push(response.data as EMRRecord)
      } catch (error) {
        errors.push(`病历 ${record.title} 导入失败：${(error as Error).message}`)
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
   * 搜索病历
   * @param keyword 关键词
   * @param options 搜索选项
   */
  async searchRecords(
    keyword: string,
    options?: {
      department?: string
      startDate?: string
      endDate?: string
      recordType?: string
    }
  ): Promise<EMRRecord[]> {
    const params = new URLSearchParams({ keyword })
    
    if (options?.department) params.append('department', options.department)
    if (options?.startDate) params.append('startDate', options.startDate)
    if (options?.endDate) params.append('endDate', options.endDate)
    if (options?.recordType) params.append('recordType', options.recordType)

    const response = await emrApi.get(`/records/search?${params.toString()}`)
    return response.data as EMRRecord[]
  }

  /**
   * 格式化日期时间
   * @param dateStr 日期字符串
   */
  private formatDateTime(dateStr: string): string {
    const date = new Date(dateStr)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

// 会诊数据类型
export interface ConsultationData {
  patientId: string
  patientName: string
  patientGender: string
  patientAge: number
  patientMrn: string
  department: string
  bedNumber?: string
  diagnosis: string
  mainDiagnosis: string
  chiefComplaint?: string
  historyOfPresentIllness?: string
  pastHistory?: string
  purpose: string
  time: string
  location?: string
  mainExpert: string
  recorder?: string
  experts: Array<{
    name: string
    department: string
    title: string
  }>
  discussionRecords?: Array<{
    doctor: string
    time: string
    opinion: string
  }>
  conclusion: string
  recommendations?: string[]
  nextPlan?: string
}

// 导出单例
export const emrService = new EMRService()
