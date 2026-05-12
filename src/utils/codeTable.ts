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
    
    if (!typesError && types) {
      codeTypesCache = types
    }

    // 加载所有码值
    const { data: codes, error: codesError } = await supabase
      .from('sys_codes')
      .select('*')
      .eq('status', 'active')
      .order('sort_order')
    
    if (!codesError && codes) {
      codesCache.clear()
      codes.forEach(code => {
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
  return getCodeName('urgency_level', code)
}

/**
 * 获取紧急程度颜色
 */
export function getUrgencyColor(code: string): string {
  return getCodeColor('urgency_level', code)
}

/**
 * 获取会诊状态名称
 */
export function getConsultationStatusName(code: string): string {
  return getCodeName('consultation_status', code)
}

/**
 * 获取会诊状态颜色
 */
export function getConsultationStatusColor(code: string): string {
  return getCodeColor('consultation_status', code)
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