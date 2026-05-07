/**
 * AI 医学影像分析服务
 * 
 * 提供基于深度学习的医学影像分析功能：肺结节检测、乳腺钼靶分析、病理切片分析、三维重建等
 */

import { aiApi } from '../../../utils/api'

// DICOM 影像元数�?export interface DICOMMetadata {
  patientId: string
  patientName: string
  studyDate: string
  modality: 'CT' | 'MR' | 'X-Ray' | 'PET' | 'US' | 'MG' | 'PT'
  bodyPart: string
  studyDescription: string
  seriesNumber: number
  imageCount: number
  sliceThickness: number
  contrast?: boolean
}

// 肺结节检测结�?export interface LungNoduleDetection {
  // 结节列表
  nodules: Array<{
    id: string
    // 位置（肺�?肺段�?    location: string
    // 三维坐标
    coordinates: {
      x: number
      y: number
      z: number
    }
    // 大小
    size: {
      length: number
      width: number
      height: number
      volume: number
      unit: 'mm' | 'cm'
    }
    // 密度类型
    density: '实�? | '亚实�? | '磨玻�? | '混合�?
    // 恶性概�?    malignancy: number
    // 特征
    characteristics: {
      shape: '圆形' | '类圆�? | '不规�?
      margin: '光滑' | '分叶' | '毛刺' | '胸膜牵拉'
      calcification: '�? | '点状' | '层状' | '爆米花样'
      cavitation: boolean
      spiculation: boolean
      pleuralTag: boolean
    }
    // 随访建议
    followUpSuggestion: string
    // 对比历史
    comparison?: {
      previousSize: number
      growthRate: number
      doublingTime: number
    }
  }>
  // 总体评估
  overallAssessment: {
    totalNodules: number
    suspiciousNodules: number
    recommendation: string
    riskLevel: '低危' | '中危' | '高危'
  }
  // 质控
  qualityControl: {
    imageQuality: '优秀' | '良好' | '一�? | '�?
    coverage: number
    artifacts: string[]
  }
}

// 乳腺钼靶分析
export interface MammographyAnalysis {
  // 乳腺密度
  breastDensity: 'a-几乎全脂�? | 'b-散在纤维腺体' | 'c-不均匀致密' | 'd-极度致密'
  // 发现列表
  findings: Array<{
    id: string
    // 位置（象限）
    location: string
    // 类型
    type: '肿块' | '钙化' | '结构扭曲' | '不对�?
    // 特征
    characteristics: {
      shape?: '圆形' | '卵圆�? | '不规�?
      margin?: '清晰' | '模糊' | '毛刺'
      density?: '低密�? | '等密�? | '高密�?
      calcificationType?: '粗大' | '细小' | '多形�? | '线样'
      distribution?: '散在' | '簇状' | '段样' | '线样'
    }
    // 大小
    size?: {
      length: number
      width: number
      unit: 'mm'
    }
    // BI-RADS 分类
    birads: 0 | 1 | 2 | 3 | 4 | 5
    // 恶性概�?    malignancy: number
    // 建议
    recommendation: string
  }>
  // 总体 BI-RADS 分类
  overallBirads: 0 | 1 | 2 | 3 | 4 | 5
  // 总体建议
  overallRecommendation: string
}

// 病理切片分析
export interface PathologyAnalysis {
  // 组织类型
  tissueType: string
  // 组织学类�?  histology: {
    type: string
    subtype?: string
    confidence: number
  }
  // 分化程度
  differentiation: '高分�? | '中分�? | '低分�? | '未分�?
  // 分级
  grade: 'G1' | 'G2' | 'G3' | 'G4'
  // 分期（如果适用�?  staging?: {
    t: string
    n: string
    m: string
    stage: string
  }
  // 生物标志�?  biomarkers: Array<{
    name: string
    value: string | number
    unit?: string
    positive: boolean
    method: 'IHC' | 'FISH' | 'PCR' | 'NGS'
    clinicalSignificance: string
  }>
  // 分子特征
  molecularProfile: {
    mutations: Array<{
      gene: string
      mutation: string
      variant: string
      clinicalSignificance: '致病' | '可能致病' | '意义不明' | '可能良�? | '良�?
      therapeuticImplications: string[]
    }>
    microsatelliteStatus: 'MSS' | 'MSI-L' | 'MSI-H'
    tumorMutationalBurden?: number
    pdl1Expression?: number
  }
  // 预后评估
  prognosis: {
    riskLevel: '低危' | '中危' | '高危'
    recurrenceRisk: number
    survivalEstimate: {
      oneYear: number
      threeYear: number
      fiveYear: number
    }
  }
  // 治疗建议
  treatmentSuggestions: string[]
}

// 三维重建结果
export interface ThreeDReconstruction {
  // 重建类型
  reconstructionType: 'MPR' | 'MIP' | 'MinIP' | 'VR' | 'SSD'
  // 重建图像
  images: Array<{
    type: string
    url: string
    thumbnail: string
    plane?: 'axial' | 'coronal' | 'sagittal'
    angle?: number
  }>
  // 测量数据
  measurements: Array<{
    name: string
    value: number
    unit: string
    description: string
  }>
  // 分割结果
  segmentation?: {
    structures: Array<{
      name: string
      volume: number
      unit: string
      surfaceArea?: number
      meshUrl?: string
    }>
  }
  // 可视化参�?  visualization: {
    windowWidth: number
    windowLevel: number
    opacity: number
    colorMap?: string
  }
}

// 影像组学特征
export interface RadiomicsFeatures {
  // 一阶特�?  firstOrder: {
    mean: number
    median: number
    std: number
    skewness: number
    kurtosis: number
    entropy: number
    energy: number
  }
  // 纹理特征
  texture: {
    glcm: {
      contrast: number
      correlation: number
      homogeneity: number
      energy: number
    }
    glrlm: {
      shortRunEmphasis: number
      longRunEmphasis: number
      grayLevelNonUniformity: number
    }
  }
  // 形状特征
  shape: {
    volume: number
    surfaceArea: number
    sphericity: number
    compactness: number
    elongation: number
  }
  // 预测模型
  predictiveModels: Array<{
    name: string
    prediction: string
    probability: number
    confidence: number
  }>
}

// 影像报告
export interface ImagingReport {
  // 检查信�?  examInfo: {
    modality: string
    bodyPart: string
    examDate: string
    indication: string
  }
  // 影像表现
  findings: string[]
  // 印象/结论
  impression: string[]
  // 建议
  recommendations: string[]
  // 结构化数�?  structuredData: any
  // AI 分析结果
  aiAnalysis: {
    confidence: number
    keyFindings: string[]
    differentialDiagnosis: string[]
    severity: '轻度' | '中度' | '重度' | '危重'
  }
}

export class AIMedicalImagingService {
  /**
   * 上传 DICOM 影像
   * @param dicomFiles DICOM 文件列表
   */
  async uploadDICOM(dicomFiles: Blob[]): Promise<{
    studyId: string
    metadata: DICOMMetadata
    status: 'processing' | 'completed' | 'failed'
  }> {
    const formData = new FormData()
    dicomFiles.forEach((file, index) => {
      formData.append(`file_${index}`, file)
    })

    const response = await aiApi.post('/imaging/upload', formData)
    return response.data
  }

  /**
   * 肺结�?AI 检�?   * @param studyId 检�?ID
   */
  async detectLungNodules(studyId: string): Promise<LungNoduleDetection> {
    const response = await aiApi.post('/imaging/lung-nodule/detect', {
      studyId,
      algorithm: '3D-CNN',
      sensitivity: 'high'
    })
    return response.data as LungNoduleDetection
  }

  /**
   * 乳腺钼靶 AI 分析
   * @param studyId 检�?ID
   */
  async analyzeMammography(studyId: string): Promise<MammographyAnalysis> {
    const response = await aiApi.post('/imaging/mammography/analyze', {
      studyId,
      views: ['CC', 'MLO']
    })
    return response.data as MammographyAnalysis
  }

  /**
   * 病理切片 AI 分析
   * @param slideId 切片 ID
   */
  async analyzePathology(slideId: string): Promise<PathologyAnalysis> {
    const response = await aiApi.post('/imaging/pathology/analyze', {
      slideId,
      magnification: 20,
      stainType: 'H&E'
    })
    return response.data as PathologyAnalysis
  }

  /**
   * 三维重建
   * @param studyId 检�?ID
   * @param options 重建选项
   */
  async reconstruct3D(studyId: string, options: {
    type: 'MPR' | 'MIP' | 'MinIP' | 'VR' | 'SSD'
    targetStructure?: string
    quality: 'standard' | 'high' | 'ultra'
  }): Promise<ThreeDReconstruction> {
    const response = await aiApi.post('/imaging/reconstruction/3d', {
      studyId,
      ...options
    })
    return response.data as ThreeDReconstruction
  }

  /**
   * 影像组学特征提取
   * @param studyId 检�?ID
   * @param roi 感兴趣区
   */
  async extractRadiomics(studyId: string, roi: {
    coordinates: {
      x: number
      y: number
      z: number
    }
    size: {
      width: number
      height: number
      depth: number
    }
  }): Promise<RadiomicsFeatures> {
    const response = await aiApi.post('/imaging/radiomics/extract', {
      studyId,
      roi
    })
    return response.data as RadiomicsFeatures
  }

  /**
   * 生成影像报告
   * @param studyId 检�?ID
   * @param analysisResults AI 分析结果
   */
  async generateReport(studyId: string, analysisResults: {
    modality: string
    findings: any[]
    diagnosis?: string
  }): Promise<ImagingReport> {
    const response = await aiApi.post('/imaging/report/generate', {
      studyId,
      ...analysisResults
    })
    return response.data as ImagingReport
  }

  /**
   * 病灶追踪（对比历史影像）
   * @param currentStudyId 当前检�?ID
   * @param previousStudyIds 历史检�?ID 列表
   */
  async trackLesion(currentStudyId: string, previousStudyIds: string[]): Promise<{
    currentSize: number
    previousSizes: Array<{
      studyId: string
      date: string
      size: number
    }>
    growthRate: number
    doublingTime: number
    response: 'CR' | 'PR' | 'SD' | 'PD'
    trend: 'shrinking' | 'stable' | 'growing'
    visualization: {
      chartData: any
      overlayImages: string[]
    }
  }> {
    const response = await aiApi.post('/imaging/tracking/lesion', {
      currentStudyId,
      previousStudyIds
    })
    return response.data
  }

  /**
   * 智能窗宽窗位调节
   * @param studyId 检�?ID
   * @param bodyPart 身体部位
   */
  async autoWindowLevel(studyId: string, bodyPart: string): Promise<{
    windowWidth: number
    windowLevel: number
    preset: string
    optimized: boolean
  }> {
    const response = await aiApi.post('/imaging/processing/window-level', {
      studyId,
      bodyPart
    })
    return response.data
  }

  /**
   * 影像质量评估
   * @param studyId 检�?ID
   */
  async assessQuality(studyId: string): Promise<{
    overallScore: number
    dimensions: {
      sharpness: number
      contrast: number
      noise: number
      artifacts: number
      coverage: number
    }
    issues: string[]
    recommendations: string[]
    acceptable: boolean
  }> {
    const response = await aiApi.post('/imaging/quality/assess', {
      studyId
    })
    return response.data
  }
}

export default new AIMedicalImagingService()
