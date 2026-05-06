/**
 * 集成服务类型定义
 */

// HIS 患者信息
export interface HISPatient {
  patientId: string      // HIS 患者 ID
  mrn: string           // 病历号
  name: string          // 姓名
  gender: 'M' | 'F' | 'U'  // 性别
  dateOfBirth: string   // 出生日期
  idCard: string        // 身份证号
  phone: string         // 联系电话
  address: string       // 地址
  insuranceType: string // 医保类型
  admissionDate: string // 入院日期
  department: string    // 科室
  bedNumber: string     // 床号
  diagnosis: string     // 入院诊断
  condition: string     // 病情
  allergyHistory?: string // 过敏史
}

// MDT 患者格式
export interface Patient {
  id: string
  mrn: string
  name: string
  gender: '男' | '女' | '未知'
  age: number
  diagnosis: string
  department: string
  bedNumber: string
  allergyHistory?: string
  admissionDate?: string
  phone?: string
}

// HIS 医嘱
export interface HISOrder {
  orderId: string
  patientId: string
  orderType: '检查' | '检验' | '治疗' | '用药' | '手术'
  orderName: string
  orderCode: string
  status: '已开立' | '已执行' | '已停止' | '已取消'
  orderDate: string
  executeDate?: string
  doctor: string
  result?: any
  note?: string
}

// EMR 病历记录
export interface EMRRecord {
  recordId: string
  patientId: string
  recordType: '入院记录' | '病程记录' | '会诊记录' | '出院记录' | '手术记录'
  title: string
  content: string
  createTime: string
  modifyTime?: string
  doctor: string
  department: string
  status: '草稿' | '已提交' | '已归档'
  keywords?: string[]
}

// 集成配置
export interface IntegrationConfig {
  hisBaseUrl: string
  emrBaseUrl: string
  pacsBaseUrl: string
  clientId: string
  clientSecret: string
  timeout?: number
  retryTimes?: number
}

// 同步结果
export interface SyncResult {
  success: boolean
  timestamp: string
  count: number
  errors?: string[]
  warnings?: string[]
}

// 数据缓存
export interface CacheEntry<T> {
  data: T
  timestamp: number
  expires: number
}
