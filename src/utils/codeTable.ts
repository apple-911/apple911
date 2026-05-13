/**
 * 码表管理工具函数
 * 从数据库读取码表数据，避免硬编码
 */

import { supabase } from '../lib/supabase'

// 码表类型定义
export interface CodeType {
  id: string
  name: string
  description: string
  sort_order: number
  status: string
}

// 码值定义
export interface CodeItem {
  id: number
  type_id: string
  code: string
  name: string
  description: string
  color: string | null
  icon: string | null
  sort_order: number
  status: string
}

// 缓存码表数据
let codeTypesCache: CodeType[] = []
let codesCache: Map<string, CodeItem[]> = new Map()
let isLoaded = false

/**
 * 加载所有码表数据
 */
export async function loadCodeTables(): Promise<void> {
  try {
    // 加载码表类型
    const { data: types, error: typesError } = await supabase
      .from('sys_code_types')
      .select('*')
      .eq('status', 'active')
      .order('sort_order')
    
    if (typesError) {
      console.error('加载码表类型失败:', typesError)
    } else {
      codeTypesCache = types || []
    }

    // 加载所有码值
    const { data: codes, error: codesError } = await supabase
      .from('sys_codes')
      .select('*')
      .eq('status', 'active')
      .order('sort_order')
    
    if (codesError) {
      console.error('加载码值失败:', codesError)
    } else {
      codesCache.clear()
      codes?.forEach(code => {
        if (!codesCache.has(code.type_id)) {
          codesCache.set(code.type_id, [])
        }
        codesCache.get(code.type_id)!.push(code)
      })
    }

    isLoaded = true
  } catch (err) {
    console.error('加载码表失败:', err)
  }
}

/**
 * 获取所有码表类型
 */
export function getCodeTypes(): CodeType[] {
  return codeTypesCache
}

/**
 * 根据类型ID获取码值列表
 */
export function getCodesByType(typeId: string): CodeItem[] {
  return codesCache.get(typeId) || []
}

/**
 * 根据类型ID和码值获取码值名称
 */
export function getCodeName(typeId: string, code: string): string {
  const codes = codesCache.get(typeId)
  if (!codes) return code
  
  const found = codes.find(c => c.code === code)
  return found ? found.name : code
}

/**
 * 根据类型ID和码值获取完整码值对象
 */
export function getCodeItem(typeId: string, code: string): CodeItem | undefined {
  const codes = codesCache.get(typeId)
  return codes?.find(c => c.code === code)
}

/**
 * 获取码值颜色
 */
export function getCodeColor(typeId: string, code: string): string {
  const item = getCodeItem(typeId, code)
  return item?.color || 'default'
}

/**
 * 获取紧急程度名称
 */
export function getUrgencyName(code: string): string {
  // 先尝试从码表获取
  const name = getCodeName('urgency_level', code)
  
  // 如果返回的还是原始代码（说明码表未加载或不存在），使用默认映射
  if (name === code) {
    const defaultNames: Record<string, string> = {
      'critical': '危急',
      'urgent': '紧急',
      'normal': '普通',
    }
    return defaultNames[code] || code
  }
  
  return name
}

/**
 * 获取紧急程度颜色
 */
export function getUrgencyColor(code: string): string {
  // 先尝试从码表获取
  const color = getCodeColor('urgency_level', code)
  
  // 如果码表有定义颜色，则使用码表颜色
  if (color && color !== 'default') {
    return color
  }
  
  // 否则使用默认映射（确保危急=红，紧急=橙，普通=绿）
  const defaultColors: Record<string, string> = {
    'critical': 'red',
    'urgent': 'orange',
    'normal': 'green',
  }
  
  return defaultColors[code] || 'default'
}

/**
 * 获取会诊状态名称
 */
export function getConsultationStatusName(code: string): string {
  // 先尝试从码表获取
  const name = getCodeName('consultation_status', code)
  
  // 如果返回的还是原始代码（说明码表未加载或不存在），使用默认映射
  if (name === code) {
    const defaultStatus: Record<string, string> = {
      'doctor_submit': '医生提交',
      'director_pending': '待主任审核',
      'director_approved': '主任通过',
      'director_rejected': '主任驳回',
      'secretary_pending': '待秘书审核',
      'secretary_approved': '秘书通过',
      'pending_supplement': '待补正',
      'material_rejected': '退回修改',
      'expert_invited': '专家邀请',
      'expert_pending': '待专家确认',
      'expert_confirmed': '专家确认',
      'scheduled': '已排期，待专家确认',
      'in_progress': '会诊中',
      'completed': '已完成',
      'archived': '已归档',
      'cancelled': '已取消',
      'rejected': '秘书驳回',
      'pending_meeting': '待会诊',
    }
    return defaultStatus[code] || code
  }
  
  return name
}

/**
 * 获取会诊状态颜色
 */
export function getConsultationStatusColor(code: string): string {
  // 先尝试从码表获取
  const color = getCodeColor('consultation_status', code)
  
  // 如果返回的还是默认值（说明码表未加载或不存在），使用默认映射
  if (color === 'default') {
    const defaultColors: Record<string, string> = {
      'doctor_submit': 'blue',
      'director_pending': 'orange',
      'director_approved': 'green',
      'director_rejected': 'red',
      'secretary_pending': 'orange',
      'secretary_approved': 'green',
      'pending_supplement': 'orange',
      'material_rejected': 'red',
      'expert_invited': 'blue',
      'expert_confirmed': 'green',
      'scheduled': 'blue',
      'in_progress': 'processing',
      'completed': 'green',
      'archived': 'gray',
      'cancelled': 'red',
      'rejected': 'red',
      'pending_meeting': 'orange',
    }
    return defaultColors[code] || 'default'
  }
  
  return color
}

/**
 * 获取角色名称
 */
export function getRoleName(code: string): string {
  const defaultRoles: Record<string, string> = {
    'apply_doctor': '申请医生',
    'director': '主任医生',
    'secretary': '秘书',
    'expert': '专家',
    'quality_controller': '质控员',
    'admin': '管理员',
    'super_admin': '超级管理员',
  }
  
  // 先尝试从码表获取
  const name = getCodeName('role_type', code)
  
  // 如果返回的还是原始代码（说明码表未加载或不存在），使用默认映射
  if (name === code && defaultRoles[code]) {
    return defaultRoles[code]
  }
  
  return name
}

/**
 * 获取报告状态名称
 */
export function getReportStatusName(code: string): string {
  return getCodeName('report_status', code)
}

/**
 * 获取用户状态名称
 */
export function getUserStatusName(code: string): string {
  return getCodeName('user_status', code)
}

/**
 * 获取流程节点名称
 */
export function getProcessNodeName(code: string): string {
  return getCodeName('process_node', code)
}

/**
 * 获取审核节点名称（用于审核流程显示）
 */
export function getAuditNodeName(code: string): string {
  // 先尝试从码表获取
  const name = getCodeName('audit_node', code)
  
  // 如果返回的还是原始代码（说明码表未加载或不存在），使用默认映射
  if (name === code) {
    const defaultNames: Record<string, string> = {
      'apply_submit': '申请提交',
      'department_audit': '科室审核',
      'secretary_audit': '秘书审核',
      'expert_confirm': '专家确认',
      'meeting_schedule': '会议安排',
      'meeting_record': '会议记录',
      'report_submit': '报告提交',
      'revoke': '撤回',
      'rescheduled': '重新排期',
      'scheduled': '已排期，待专家确认',
    }
    return defaultNames[code] || code
  }
  
  return name
}

/**
 * 获取会诊类型名称
 */
export function getConsultationTypeName(code: string): string {
  // 先尝试从码表获取
  const name = getCodeName('consultation_type', code)
  
  // 如果返回的还是原始代码（说明码表未加载或不存在），使用默认映射
  if (name === code) {
    const defaultNames: Record<string, string> = {
      'inhospital': '院内会诊',
      'remote': '远程会诊',
    }
    return defaultNames[code] || code
  }
  
  return name
}

/**
 * 获取会诊类型颜色
 */
export function getConsultationTypeColor(code: string): string {
  // 先尝试从码表获取
  const color = getCodeColor('consultation_type', code)
  
  // 如果码表有定义颜色，则使用码表颜色
  if (color && color !== 'default') {
    return color
  }
  
  // 否则使用默认映射
  const defaultColors: Record<string, string> = {
    'inhospital': 'blue',
    'remote': 'green',
  }
  
  return defaultColors[code] || 'default'
}

/**
 * 获取审核结果名称
 */
export function getAuditResultName(code: string): string {
  // 先尝试从码表获取
  const name = getCodeName('audit_result', code)
  
  // 如果返回的还是原始代码（说明码表未加载或不存在），使用默认映射
  if (name === code) {
    const defaultNames: Record<string, string> = {
      'approved': '通过',
      'rejected': '驳回',
      'scheduled': '已排期，待专家确认',
      'rescheduled': '已重排，待专家确认',
      'confirmed': '已确认',
      'cancelled': '已取消',
    }
    return defaultNames[code] || code
  }
  
  return name
}

/**
 * 检查码表是否已加载
 */
export function isCodeTablesLoaded(): boolean {
  return isLoaded
}

/**
 * 刷新码表缓存
 */
export async function refreshCodeTables(): Promise<void> {
  isLoaded = false
  await loadCodeTables()
}