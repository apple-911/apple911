/**
 * 会诊状态编码映射工具
 * 统一使用英文编码，避免中文直接出现在代码中
 */

// 会诊状态编码定义（与 init_codes.sql 保持一致）
export const CONSULTATION_STATUS = {
  // 申请阶段
  DOCTOR_SUBMIT: 'doctor_submit',           // 医生提交
  DIRECTOR_PENDING: 'director_pending',     // 待主任审核
  DIRECTOR_APPROVED: 'director_approved',   // 主任通过
  DIRECTOR_REJECTED: 'director_rejected',   // 主任驳回
  SECRETARY_PENDING: 'secretary_pending',   // 待秘书审核
  SECRETARY_APPROVED: 'secretary_approved', // 秘书通过
  PENDING_SUPPLEMENT: 'pending_supplement', // 待补正
  MATERIAL_REJECTED: 'material_rejected',   // 退回修改
  
  // 专家确认阶段
  EXPERT_INVITED: 'expert_invited',         // 专家邀请
  EXPERT_PENDING: 'expert_pending',         // 待专家确认
  EXPERT_CONFIRMED: 'expert_confirmed',     // 专家确认
  EXPERT_REJECTED: 'expert_rejected',       // 专家拒绝
  
  // 会诊阶段
  SCHEDULED: 'scheduled',                   // 已排期
  PENDING_MEETING: 'pending_meeting',       // 待会诊
  IN_PROGRESS: 'in_progress',               // 会诊中
  COMPLETED: 'completed',                   // 已完成
  ARCHIVED: 'archived',                     // 已归档
  
  // 其他状态
  REJECTED: 'rejected',                     // 秘书驳回
  CANCELLED: 'cancelled',                   // 已取消
} as const

// 角色编码定义
export const ROLE = {
  APPLY_DOCTOR: 'apply_doctor',       // 申请医生
  DIRECTOR: 'director',               // 主任医生
  SECRETARY: 'secretary',             // 秘书
  EXPERT: 'expert',                   // 专家
  QUALITY_CONTROLLER: 'quality_controller', // 质控员
  ADMIN: 'admin',                     // 管理员
  SUPER_ADMIN: 'super_admin',         // 超级管理员
} as const

// 紧急程度编码定义
export const URGENCY_LEVEL = {
  CRITICAL: 'critical',  // 危急
  URGENT: 'urgent',      // 紧急
  NORMAL: 'normal',      // 普通
} as const

// 会诊类型编码定义
export const CONSULTATION_TYPE = {
  INHOSPITAL: 'inhospital',  // 院内会诊
  REMOTE: 'remote',          // 远程会诊
} as const

// 类型导出用户职位编码
export const POSITION = {
  MDT_SECRETARY: 'mdt_secretary',  // MDT 秘书
  CHIEF_PHYSICIAN: 'chief_physician', // 主任医师
  ATTENDING_PHYSICIAN: 'attending_physician', // 主治医师
  RESIDENT: 'resident',            // 住院医师
} as const

// 类型导出
export type ConsultationStatus = typeof CONSULTATION_STATUS[keyof typeof CONSULTATION_STATUS]
export type Role = typeof ROLE[keyof typeof ROLE]
export type UrgencyLevel = typeof URGENCY_LEVEL[keyof typeof URGENCY_LEVEL]
export type ConsultationType = typeof CONSULTATION_TYPE[keyof typeof CONSULTATION_TYPE]
export type Position = typeof POSITION[keyof typeof POSITION]

/**
 * 根据中文名称获取状态编码（用于兼容旧数据）
 * @deprecated 建议直接使用 CONSULTATION_STATUS 常量
 */
export function getStatusCodeByChineseName(chineseName: string): ConsultationStatus | null {
  const mapping: Record<string, ConsultationStatus> = {
    '医生提交': CONSULTATION_STATUS.DOCTOR_SUBMIT,
    '待秘书审核': CONSULTATION_STATUS.SECRETARY_PENDING,
    '秘书通过': CONSULTATION_STATUS.SECRETARY_APPROVED,
    '待主任审核': CONSULTATION_STATUS.DIRECTOR_PENDING,
    '主任通过': CONSULTATION_STATUS.DIRECTOR_APPROVED,
    '主任驳回': CONSULTATION_STATUS.DIRECTOR_REJECTED,
    '待专家确认': CONSULTATION_STATUS.EXPERT_PENDING,
    '专家确认': CONSULTATION_STATUS.EXPERT_CONFIRMED,
    '专家拒绝': CONSULTATION_STATUS.EXPERT_REJECTED,
    '已排期': CONSULTATION_STATUS.SCHEDULED,
    '待会诊': CONSULTATION_STATUS.PENDING_MEETING,
    '会诊中': CONSULTATION_STATUS.IN_PROGRESS,
    '已完成': CONSULTATION_STATUS.COMPLETED,
    '已归档': CONSULTATION_STATUS.ARCHIVED,
    '秘书驳回': CONSULTATION_STATUS.REJECTED,
    '已取消': CONSULTATION_STATUS.CANCELLED,
    '待补正': CONSULTATION_STATUS.PENDING_SUPPLEMENT,
    '材料退回': CONSULTATION_STATUS.MATERIAL_REJECTED,
  }
  
  return mapping[chineseName] || null
}

/**
 * 根据编码获取中文名称（用于显示）
 * @deprecated 建议使用码表工具 getConsultationStatusName
 */
export function getStatusNameByCode(code: ConsultationStatus): string {
  const reverseMapping: Record<ConsultationStatus, string> = {
    [CONSULTATION_STATUS.DOCTOR_SUBMIT]: '医生提交',
    [CONSULTATION_STATUS.SECRETARY_PENDING]: '待秘书审核',
    [CONSULTATION_STATUS.SECRETARY_APPROVED]: '秘书通过',
    [CONSULTATION_STATUS.DIRECTOR_PENDING]: '待主任审核',
    [CONSULTATION_STATUS.DIRECTOR_APPROVED]: '主任通过',
    [CONSULTATION_STATUS.DIRECTOR_REJECTED]: '主任驳回',
    [CONSULTATION_STATUS.EXPERT_INVITED]: '专家邀请',
    [CONSULTATION_STATUS.EXPERT_PENDING]: '待专家确认',
    [CONSULTATION_STATUS.EXPERT_CONFIRMED]: '专家确认',
    [CONSULTATION_STATUS.EXPERT_REJECTED]: '专家拒绝',
    [CONSULTATION_STATUS.SCHEDULED]: '已排期',
    [CONSULTATION_STATUS.PENDING_MEETING]: '待会诊',
    [CONSULTATION_STATUS.IN_PROGRESS]: '会诊中',
    [CONSULTATION_STATUS.COMPLETED]: '已完成',
    [CONSULTATION_STATUS.ARCHIVED]: '已归档',
    [CONSULTATION_STATUS.REJECTED]: '秘书驳回',
    [CONSULTATION_STATUS.CANCELLED]: '已取消',
    [CONSULTATION_STATUS.PENDING_SUPPLEMENT]: '待补正',
    [CONSULTATION_STATUS.MATERIAL_REJECTED]: '材料退回',
  }
  
  return reverseMapping[code] || code
}
