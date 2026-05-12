/**
 * 通用工具函数
 */

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * 格式化相对时间
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  let target: Date
  
  if (typeof date === 'string') {
    // 处理时区问题：数据库返回的时间字符串没有时区标记，需要手动添加UTC标记
    const dateStr = date
    if (dateStr && !dateStr.includes('Z') && !dateStr.includes('+') && !dateStr.includes('-0')) {
      // 如果没有时区标记，假设是UTC时间，添加Z后缀
      target = new Date(dateStr + 'Z')
    } else {
      target = new Date(dateStr)
    }
  } else {
    target = date
  }
  
  const diff = now.getTime() - target.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return target.toLocaleDateString('zh-CN')
}

/**
 * 数据脱敏
 */
export function maskName(name: string, level: 'full' | 'masked' = 'masked'): string {
  if (level === 'full') return name
  if (name.length <= 2) return name.charAt(0) + '*'
  return name.charAt(0) + '*'.repeat(name.length - 2) + name.charAt(name.length - 1)
}

/**
 * 脱敏手机号
 */
export function maskPhone(phone: string): string {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

/**
 * 脱敏身份证号
 */
export function maskIdCard(idCard: string): string {
  if (idCard.length === 18) {
    return idCard.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2')
  }
  if (idCard.length === 15) {
    return idCard.replace(/(\d{6})\d{5}(\d{2})/, '$1*****$2')
  }
  return idCard
}

/**
 * 深拷贝
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map(item => deepClone(item)) as any
  const cloned = {} as T
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key])
    }
  }
  return cloned
}

/**
 * 本地存储封装
 */
export const storage = {
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  },
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Storage set error:', error)
    }
  },
  remove: (key: string): void => {
    localStorage.removeItem(key)
  },
  clear: (): void => {
    localStorage.clear()
  },
}

/**
 * 生成唯一ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 下载文件
 */
export function downloadFile(content: Blob, filename: string): void {
  const url = URL.createObjectURL(content)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * 复制到剪贴板
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

/**
 * 计算年龄
 */
export function calculateAge(birthday: string): number {
  const birth = new Date(birthday)
  const now = new Date()
  const age = now.getFullYear() - birth.getFullYear()
  const monthDiff = now.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    return age - 1
  }
  return age
}

/**
 * 验证身份证号
 */
export function validateIdCard(id: string): boolean {
  const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
  return reg.test(id)
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]
}

/**
 * 睡眠函数（用于模拟延迟）
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 权限验证工具函数
 */

// 当前用户的权限数据（实际应用中应从store或API获取）
export interface CurrentUser {
  id: string
  name: string
  org_id: string | null
  roles: string[]
  permissions: string[]
}

let currentUser: CurrentUser | null = null

/**
 * 设置当前用户权限数据
 */
export function setCurrentUser(user: CurrentUser | null): void {
  currentUser = user
}

/**
 * 获取当前用户
 */
export function getCurrentUser(): CurrentUser | null {
  return currentUser
}

/**
 * 检查用户是否有指定权限
 * @param permission 权限标识
 */
export function hasPermission(permission: string): boolean {
  if (!currentUser) return false
  return currentUser.permissions.includes(permission)
}

/**
 * 检查用户是否有任意一个指定权限
 * @param permissions 权限标识列表
 */
export function hasAnyPermission(permissions: string[]): boolean {
  if (!currentUser) return false
  return permissions.some(p => currentUser!.permissions.includes(p))
}

/**
 * 检查用户是否有所有指定权限
 * @param permissions 权限标识列表
 */
export function hasAllPermissions(permissions: string[]): boolean {
  if (!currentUser) return false
  return permissions.every(p => currentUser!.permissions.includes(p))
}

/**
 * 检查用户是否有指定角色
 * @param role 角色标识
 */
export function hasRole(role: string): boolean {
  if (!currentUser) return false
  return currentUser.roles.includes(role)
}

/**
 * 检查用户是否有任意一个指定角色
 * @param roles 角色标识列表
 */
export function hasAnyRole(roles: string[]): boolean {
  if (!currentUser) return false
  return roles.some(r => currentUser!.roles.includes(r))
}

/**
 * 检查用户是否有所有指定角色
 * @param roles 角色标识列表
 */
export function hasAllRoles(roles: string[]): boolean {
  if (!currentUser) return false
  return roles.every(r => currentUser!.roles.includes(r))
}

/**
 * 检查用户是否属于指定组织
 * @param orgId 组织ID
 */
export function belongsToOrg(orgId: string): boolean {
  if (!currentUser) return false
  return currentUser.org_id === orgId
}

/**
 * 检查用户是否属于指定组织列表中的任一组织
 * @param orgIds 组织ID列表
 */
export function belongsToAnyOrg(orgIds: string[]): boolean {
  if (!currentUser) return false
  return orgIds.includes(currentUser.org_id || '')
}

/**
 * 检查用户是否为系统管理员或超级管理员
 */
export function isAdmin(): boolean {
  if (!currentUser) return false
  const adminRoles = ['ADMIN', 'SUPER_ADMIN']
  return currentUser.roles.some(r => adminRoles.includes(r))
}

/**
 * 检查用户是否为超级管理员
 */
export function isSuperAdmin(): boolean {
  if (!currentUser) return false
  return currentUser.roles.includes('SUPER_ADMIN')
}

/**
 * 获取用户权限列表
 */
export function getUserPermissions(): string[] {
  return currentUser?.permissions || []
}

/**
 * 获取用户角色列表
 */
export function getUserRoles(): string[] {
  return currentUser?.roles || []
}

/**
 * 获取用户所属组织ID
 */
export function getUserOrgId(): string | null {
  return currentUser?.org_id || null
}