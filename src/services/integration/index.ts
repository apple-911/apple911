/**
 * HIS/EMR 集成服务
 * 
 * 负责与医院 HIS/EMR 系统对接，实现患者信息、医嘱、病历等数据的双向同步
 * 
 * @module services/integration
 */

// HIS 患者服务
export { HISPatientService } from './his/patientService'
export type { HISPatient } from './his/patientService'

// HIS 医嘱服务
export { HISOrderService } from './his/orderService'
export type { HISOrder } from './his/orderService'

// EMR 电子病历服务
export { EMRService } from './emr/emrService'
export type { EMRRecord } from './emr/emrService'

// 数据映射
export { DataMapping } from './common/dataMapping'

// 安全认证
export { HISAuth } from './common/auth'

// 类型定义
export type { IntegrationConfig, SyncResult } from './types'
