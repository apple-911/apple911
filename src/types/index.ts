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