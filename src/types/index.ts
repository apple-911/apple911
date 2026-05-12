/**
 * 通用类型定义
 */

/**
 * API 响应基础类型
 */
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
}

/**
 * 分页参数
 */
export interface PaginationParams {
  page: number
  pageSize: number
  total?: number
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
  }
}

/**
 * 排序方向
 */
export type SortOrder = 'ascend' | 'descend' | null

/**
 * 通用查询参数
 */
export interface QueryParams {
  keyword?: string
  status?: string
  startDate?: string
  endDate?: string
  department?: string
  [key: string]: any
}

/**
 * 上传文件类型
 */
export interface UploadFile {
  uid: string
  name: string
  size: number
  type: string
  url?: string
  status?: 'uploading' | 'done' | 'error'
  percent?: number
}

/**
 * 选项类型
 */
export interface Option {
  label: string
  value: string | number
  disabled?: boolean
  children?: Option[]
}

/**
 * 树形结构节点
 */
export interface TreeNode {
  key: string
  title: string
  children?: TreeNode[]
  isLeaf?: boolean
  disabled?: boolean
}

/**
 * 消息通知类型
 */
export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: number
  read: boolean
  action?: {
    label: string
    url: string
  }
}

/**
 * 操作日志
 */
export interface AuditLog {
  id: string
  userId: string
  userName: string
  action: string
  targetId?: string
  targetType?: string
  ip: string
  timestamp: number
  result: 'success' | 'failure'
  details?: any
}

/**
 * 导出类型
 */
export type ExportFormat = 'excel' | 'csv' | 'pdf' | 'json'

/**
 * 通用枚举
 */
export enum Gender {
  Male = '男',
  Female = '女',
}

export enum UrgencyLevel {
  Normal = '普通',
  Urgent = '紧急',
  Emergency = '特急',
}

export enum YesNo {
  Yes = '是',
  No = '否',
}

// ==============================================
// 系统权限相关类型定义
// ==============================================

/**
 * 组织类型
 */
export type OrganizationType = 'organization' | 'department' | 'team'

/**
 * 组织状态
 */
export type OrganizationStatus = 'active' | 'inactive'

/**
 * 组织接口
 */
export interface Organization {
  id: string
  name: string
  code: string
  parent_id?: string
  type: OrganizationType
  description?: string
  status: OrganizationStatus
  created_at: string
  updated_at: string
  children?: Organization[]
}

/**
 * 权限接口
 */
export interface Permission {
  id: string
  code: string
  name: string
  description?: string
  module: string
  parent_id?: string
  sort_order: number
  created_at: string
  updated_at: string
}

/**
 * 角色状态
 */
export type RoleStatus = 'active' | 'inactive'

/**
 * 角色接口
 */
export interface Role {
  id: string
  name: string
  code: string
  description?: string
  org_required: boolean
  restricted_org_id?: string
  status: RoleStatus
  sort_order: number
  created_at: string
  updated_at: string
}

/**
 * 用户状态
 */
export type UserStatus = 'active' | 'inactive'

/**
 * 用户接口
 */
export interface User {
  id: string
  username: string
  password?: string
  name: string
  email?: string
  phone?: string
  org_id?: string
  position?: string
  avatar?: string
  status: UserStatus
  manager_id?: string  // 直属上级 ID（用于维护医生与主任的上下级关系）
  last_login?: string
  created_at: string
  updated_at: string
}

/**
 * 用户角色关联接口
 */
export interface UserRole {
  user_id: string
  role_id: string
  org_id?: string
  created_at: string
}

/**
 * 角色权限关联接口
 */
export interface RolePermission {
  role_id: string
  permission_id: string
  created_at: string
}

/**
 * 权限模块枚举
 */
export enum PermissionModule {
  CONSULTATION = 'consultation',
  PATIENT = 'patient',
  REPORT = 'report',
  FOLLOWUP = 'followup',
  QUALITY = 'quality',
  CASE_LIBRARY = 'case-library',
  AI = 'ai',
  ADMIN = 'admin',
}