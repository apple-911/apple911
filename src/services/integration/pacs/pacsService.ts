/**
 * PACS 影像集成服务
 * 
 * 负责与 PACS 系统对接，实现 DICOM 影像的获取和浏览
 */

import type { SyncResult } from '../types'
import { pacsApi } from '../../utils/api'

// DICOM 研究
export interface DicomStudy {
  studyInstanceUid: string
  patientId: string
  patientName: string
  patientSex: string
  patientBirthDate: string
  studyDate: string
  studyTime: string
  modality: string
  studyDescription: string
  accessionNumber: string
  numberOfSeries: number
  numberOfInstances: number
  referringPhysician: string
  studyId: string
}

// DICOM 序列
export interface DicomSeries {
  seriesInstanceUid: string
  studyInstanceUid: string
  modality: string
  seriesDescription: string
  seriesNumber: number
  seriesDate: string
  seriesTime: string
  bodyPartExamined: string
  numberOfInstances: number
  manufacturer: string
  protocolName: string
}

// DICOM 实例
export interface DicomInstance {
  sopInstanceUid: string
  seriesInstanceUid: string
  instanceNumber: number
  contentDate: string
  contentTime: string
  imagePositionPatient: number[]
  imageOrientationPatient: number[]
  pixelSpacing: number[]
  sliceThickness: number
  rows: number
  columns: number
  bitsAllocated: number
  bitsStored: number
  samplesPerPixel: number
  photometricInterpretation: string
}

export class PACSService {
  /**
   * 获取患者影像研究列表
   * @param patientId 患者 ID
   */
  async getPatientStudies(patientId: string): Promise<DicomStudy[]> {
    try {
      const response = await pacsApi.get(`/studies`, {
        params: { patientId }
      })
      return response.data as DicomStudy[]
    } catch (error) {
      console.error('获取患者影像研究失败:', error)
      throw new Error('无法获取患者影像资料')
    }
  }

  /**
   * 获取研究详情
   * @param studyId 研究 ID
   */
  async getStudyDetail(studyId: string): Promise<DicomStudy> {
    const response = await pacsApi.get(`/studies/${studyId}`)
    return response.data as DicomStudy
  }

  /**
   * 获取研究序列列表
   * @param studyId 研究 ID
   */
  async getStudySeries(studyId: string): Promise<DicomSeries[]> {
    const response = await pacsApi.get(`/studies/${studyId}/series`)
    return response.data as DicomSeries[]
  }

  /**
   * 获取序列详情
   * @param seriesId 序列 ID
   */
  async getSeriesDetail(seriesId: string): Promise<DicomSeries> {
    const response = await pacsApi.get(`/series/${seriesId}`)
    return response.data as DicomSeries
  }

  /**
   * 获取 DICOM 影像实例
   * @param seriesId 序列 ID
   * @param instanceId 实例 ID
   */
  async getDicomInstance(
    seriesId: string,
    instanceId: string
  ): Promise<Blob> {
    const response = await pacsApi.get(
      `/series/${seriesId}/instances/${instanceId}/frames/1`,
      {
        responseType: 'blob'
      }
    )
    return response.data as Blob
  }

  /**
   * 生成 WADO-RS URL
   * @param studyId 研究 ID
   * @param options 可选参数
   */
  getWadoRsUrl(studyId: string, options: WadoRsOptions = {}): string {
    const params = new URLSearchParams({
      studyUID: studyId,
      ...options
    })
    return `${import.meta.env.VITE_PACS_WADO_URL || 'http://localhost:8080/wado'}?${params.toString()}`
  }

  /**
   * 获取影像报告
   * @param studyId 研究 ID
   */
  async getReport(studyId: string): Promise<PACSReport> {
    const response = await pacsApi.get(`/reports/${studyId}`)
    return response.data as PACSReport
  }

  /**
   * 将 PACS 影像链接到 MDT 会诊
   * @param consultationId 会诊 ID
   * @param studyId 研究 ID
   */
  async linkToConsultation(
    consultationId: string,
    studyId: string
  ): Promise<void> {
    await pacsApi.post(`/consultations/${consultationId}/link`, {
      studyId,
      linkTime: new Date().toISOString()
    })
  }

  /**
   * 获取会诊相关的影像资料
   * @param consultationId 会诊 ID
   */
  async getConsultationImages(
    consultationId: string
  ): Promise<DicomStudy[]> {
    const response = await pacsApi.get(
      `/consultations/${consultationId}/images`
    )
    return response.data as DicomStudy[]
  }

  /**
   * 批量导入影像资料
   * @param patientId 患者 ID
   * @param studyIds 研究 ID 列表
   */
  async batchImportStudies(
    patientId: string,
    studyIds: string[]
  ): Promise<SyncResult> {
    const results: DicomStudy[] = []
    const errors: string[] = []

    for (const studyId of studyIds) {
      try {
        const study = await this.getStudyDetail(studyId)
        if (study.patientId === patientId) {
          results.push(study)
        } else {
          errors.push(`患者 ID 不匹配：${studyId}`)
        }
      } catch (error) {
        errors.push(`获取研究 ${studyId} 失败：${(error as Error).message}`)
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
   * 搜索影像研究
   * @param options 搜索条件
   */
  async searchStudies(options: {
    patientId?: string
    patientName?: string
    modality?: string
    startDate?: string
    endDate?: string
  }): Promise<DicomStudy[]> {
    const params = new URLSearchParams()
    
    if (options.patientId) params.append('patientId', options.patientId)
    if (options.patientName) params.append('patientName', options.patientName)
    if (options.modality) params.append('modality', options.modality)
    if (options.startDate) params.append('startDate', options.startDate)
    if (options.endDate) params.append('endDate', options.endDate)

    const response = await pacsApi.get(`/studies/search?${params.toString()}`)
    return response.data as DicomStudy[]
  }

  /**
   * 下载 DICOM 文件
   * @param seriesId 序列 ID
   * @param instanceId 实例 ID
   */
  async downloadDicom(
    seriesId: string,
    instanceId: string
  ): Promise<void> {
    const blob = await this.getDicomInstance(seriesId, instanceId)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${seriesId}_${instanceId}.dcm`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}

// PACS 报告
export interface PACSReport {
  reportId: string
  studyId: string
  patientId: string
  examType: 'CT' | 'MR' | 'X-Ray' | 'PET-CT' | 'US'
  examPart: string
  examMethod: string
  findings: string
  impression: string
  reportTime: string
  radiologist: string
  reviewer?: string
  status: '草稿' | '已审核' | '已归档'
  images: DicomImageReference[]
}

// DICOM 影像引用
export interface DicomImageReference {
  seriesUid: string
  instanceUid: string
  imageUrl: string
  thumbnailUrl: string
}

// WADO-RS 选项
export interface WadoRsOptions {
  seriesUID?: string
  contentType?: string
  accept?: string
}

// 导出单例
export const pacsService = new PACSService()
