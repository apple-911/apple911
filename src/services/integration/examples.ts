/**
 * 集成服务使用示例
 * 
 * 演示如何在实际场景中使用 Phase 4 的集成服务
 */

import { hisPatientService, hisOrderService } from '../services/integration'
import { emrService } from '../services/integration'
import { pacsService } from '../services/integration'
import { iotDeviceService } from '../services/integration'
import { aiClinicalService } from '../services/integration'

/**
 * 场景 1: 会诊前准备 - 同步患者信息
 */
export async function prepareConsultation(mrn: string) {
  try {
    // 1. 从 HIS 同步患者基本信息
    const hisPatient = await hisPatientService.syncPatient(mrn)
    const mdtPatient = hisPatientService.transformToMDTPatient(hisPatient)
    
    // 2. 获取患者医嘱
    const orders = await hisOrderService.getPatientOrders(hisPatient.patientId)
    
    // 3. 从 EMR 获取病历
    const records = await emrService.getPatientRecords(hisPatient.patientId)
    
    // 4. 从 PACS 获取影像资料
    const studies = await pacsService.getPatientStudies(hisPatient.patientId)
    
    // 5. 如果有 IoT 设备，获取实时生命体征
    const vitals = await iotDeviceService.getRealTimeVitals(hisPatient.patientId)
    
    return {
      patient: mdtPatient,
      orders,
      records,
      studies,
      vitals
    }
  } catch (error) {
    console.error('会诊准备失败:', error)
    throw error
  }
}

/**
 * 场景 2: AI 辅助诊断
 */
export async function aiAssistedDiagnosis(patientInfo: any) {
  try {
    // 1. 获取 AI 诊断建议
    const diagnosisSuggestions = await aiClinicalService.getDiagnosisSuggestions(
      patientInfo.symptoms,
      {
        age: patientInfo.age,
        gender: patientInfo.gender,
        history: patientInfo.history,
        labResults: patientInfo.labResults
      }
    )
    
    // 2. 如果有影像资料，进行 AI 影像分析
    let imagingAnalysis = null
    if (patientInfo.imageId) {
      imagingAnalysis = await aiClinicalService.analyzeImaging(
        patientInfo.imageId,
        patientInfo.modality
      )
    }
    
    // 3. 如果有病理资料，进行 AI 病理分析
    let pathologyAnalysis = null
    if (patientInfo.pathologyImages) {
      pathologyAnalysis = await aiClinicalService.analyzePathology(
        patientInfo.pathologyImages
      )
    }
    
    // 4. 如果有基因检测，进行结果解读
    let geneticInterpretation = null
    if (patientInfo.geneticVariants) {
      geneticInterpretation = await aiClinicalService.interpretGeneticTest(
        patientInfo.genePanel,
        patientInfo.geneticVariants
      )
    }
    
    return {
      diagnosisSuggestions,
      imagingAnalysis,
      pathologyAnalysis,
      geneticInterpretation
    }
  } catch (error) {
    console.error('AI 辅助诊断失败:', error)
    throw error
  }
}

/**
 * 场景 3: 制定治疗方案
 */
export async function createTreatmentPlan(
  diagnosis: string,
  stage: string,
  patientInfo: any
) {
  try {
    // 1. 获取 AI 治疗方案推荐
    const treatments = await aiClinicalService.getTreatmentRecommendations(
      diagnosis,
      stage,
      patientInfo
    )
    
    // 2. 检查药物相互作用
    const allDrugs: string[] = []
    treatments.forEach(t => {
      if (t.drugs) {
        t.drugs.forEach(d => allDrugs.push(d.name))
      }
    })
    
    const interactions = await aiClinicalService.checkDrugInteractions(allDrugs)
    
    // 3. 获取指南推荐
    const guidelines = await aiClinicalService.getGuidelineRecommendations(
      diagnosis,
      stage
    )
    
    // 4. 匹配临床试验
    const trials = await aiClinicalService.matchClinicalTrials(
      diagnosis,
      stage,
      patientInfo
    )
    
    // 5. 预后评估
    const prognosis = await aiClinicalService.assessPrognosis(
      diagnosis,
      stage,
      patientInfo
    )
    
    return {
      treatments,
      interactions,
      guidelines,
      trials,
      prognosis
    }
  } catch (error) {
    console.error('治疗方案制定失败:', error)
    throw error
  }
}

/**
 * 场景 4: 会诊记录写入 EMR
 */
export async function writeMDTToEMR(consultationData: any) {
  try {
    // 1. 生成 MDT 会诊记录
    const emrRecord = await emrService.writeMDTRecord(consultationData)
    
    // 2. 将会诊建议同步到 HIS 医嘱
    if (consultationData.recommendations) {
      const orders = consultationData.recommendations.map((rec: any) => ({
        patientId: consultationData.patientId,
        type: rec.type,
        name: rec.name,
        code: rec.code,
        doctor: consultationData.mainExpert,
        content: rec.content
      }))
      
      await hisOrderService.batchSyncMDTOrders(
        orders,
        consultationData.consultationId
      )
    }
    
    // 3. 关联 PACS 影像
    if (consultationData.studyIds) {
      for (const studyId of consultationData.studyIds) {
        await pacsService.linkToConsultation(
          consultationData.consultationId,
          studyId
        )
      }
    }
    
    return emrRecord
  } catch (error) {
    console.error('写入 EMR 失败:', error)
    throw error
  }
}

/**
 * 场景 5: 实时生命体征监测
 */
export function monitorPatientVitals(patientId: string) {
  // 1. 订阅实时生命体征
  const unsubscribe = iotDeviceService.subscribeVitals(
    patientId,
    (vitals) => {
      console.log('实时生命体征:', vitals)
      
      // 更新 UI
      updateVitalsDisplay(vitals)
      
      // 检查异常
      checkVitalsAlerts(vitals)
    }
  )
  
  // 2. 获取历史数据（最近 24 小时）
  const endTime = new Date().toISOString()
  const startTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  
  iotDeviceService.getPatientVitalsHistory(patientId, startTime, endTime)
    .then(history => {
      console.log('历史生命体征:', history)
      plotVitalsChart(history)
    })
  
  // 返回取消订阅函数
  return unsubscribe
}

/**
 * 场景 6: 肺结节 AI 分析
 */
export async function analyzeLungNodule(dicomImages: Blob[]) {
  try {
    // 1. AI 肺结节分析
    const analysis = await aiClinicalService.analyzeLungNodule(dicomImages)
    
    // 2. 获取详细影像数据
    const imagingAnalysis = await aiClinicalService.analyzeImaging(
      analysis.nodules[0]?.location || '',
      'CT'
    )
    
    // 3. 预后评估
    const prognosis = await aiClinicalService.assessPrognosis(
      '肺结节',
      analysis.malignancyRisk > 0.7 ? '早期' : '良性',
      {}
    )
    
    return {
      nodules: analysis.nodules,
      malignancyRisk: analysis.malignancyRisk,
      recommendation: analysis.recommendation,
      followupInterval: analysis.followupInterval,
      imagingAnalysis,
      prognosis
    }
  } catch (error) {
    console.error('肺结节分析失败:', error)
    throw error
  }
}

/**
 * 场景 7: 离线模式数据同步
 */
export async function syncOfflineData() {
  // 1. 获取待同步数据
  const pendingSync = localStorage.getItem('pendingSync')
  if (!pendingSync) return
  
  const items = JSON.parse(pendingSync)
  
  // 2. 检查网络状态
  if (!navigator.onLine) {
    console.log('当前离线，等待网络恢复')
    return
  }
  
  // 3. 逐个同步
  for (const item of items) {
    try {
      await fetch(item.url, {
        method: item.method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(item.data)
      })
      
      console.log('同步成功:', item.id)
    } catch (error) {
      console.error('同步失败:', item.id, error)
    }
  }
  
  // 4. 清除已同步数据
  localStorage.removeItem('pendingSync')
}

/**
 * 辅助函数：更新生命体征显示
 */
function updateVitalsDisplay(vitals: any) {
  // 在实际应用中更新 UI 组件
  console.log('更新 UI:', vitals)
}

/**
 * 辅助函数：检查生命体征告警
 */
function checkVitalsAlerts(vitals: any) {
  // 检查异常并显示告警
  if (vitals.heartRate > 100 || vitals.heartRate < 60) {
    alert(`心率异常：${vitals.heartRate} bpm`)
  }
  if (vitals.oxygenSaturation < 90) {
    alert(`血氧饱和度低：${vitals.oxygenSaturation}%`)
  }
}

/**
 * 辅助函数：绘制生命体征图表
 */
function plotVitalsChart(history: any[]) {
  // 使用图表库绘制历史趋势
  console.log('绘制图表:', history)
}

// 导出所有示例函数
export default {
  prepareConsultation,
  aiAssistedDiagnosis,
  createTreatmentPlan,
  writeMDTToEMR,
  monitorPatientVitals,
  analyzeLungNodule,
  syncOfflineData
}
