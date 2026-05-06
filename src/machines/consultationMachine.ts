import { createMachine, assign } from 'xstate'

/**
 * 会诊状态枚举
 */
export enum ConsultationStatus {
  DRAFT = 'draft', // 草稿
  PENDING_REVIEW = 'pending_review', // 待审核
  REJECTED = 'rejected', // 已拒绝
  SCHEDULED = 'scheduled', // 已排期
  IN_PROGRESS = 'in_progress', // 进行中
  COMPLETED = 'completed', // 已完成
  CANCELLED = 'cancelled', // 已取消
}

/**
 * 会诊状态机事件
 */
export type ConsultationEvent =
  | { type: 'SUBMIT' } // 提交审核
  | { type: 'APPROVE' } // 审核通过
  | { type: 'REJECT'; reason?: string } // 审核拒绝
  | { type: 'SCHEDULE'; time?: string } // 排期
  | { type: 'START' } // 开始会诊
  | { type: 'COMPLETE' } // 完成会诊
  | { type: 'CANCEL'; reason?: string } // 取消会诊

/**
 * 会诊上下文
 */
export interface ConsultationContext {
  id: string
  patientName: string
  status: ConsultationStatus
  rejectReason?: string
  cancelReason?: string
  scheduleTime?: string
  submitTime?: number
  approveTime?: number
  startTime?: number
  completeTime?: number
  retryCount: number
}

/**
 * 会诊状态机配置
 */
export const consultationMachine = createMachine({
  id: 'consultation',
  initial: ConsultationStatus.DRAFT,
  context: {
    id: '',
    patientName: '',
    status: ConsultationStatus.DRAFT,
    retryCount: 0,
  },
  states: {
    [ConsultationStatus.DRAFT]: {
      on: {
        SUBMIT: {
          target: ConsultationStatus.PENDING_REVIEW,
          actions: assign({
            status: () => ConsultationStatus.PENDING_REVIEW,
            submitTime: () => Date.now(),
          }),
        },
      },
    },
    [ConsultationStatus.PENDING_REVIEW]: {
      on: {
        APPROVE: {
          target: ConsultationStatus.SCHEDULED,
          actions: assign({
            status: () => ConsultationStatus.SCHEDULED,
            approveTime: () => Date.now(),
          }),
        },
        REJECT: {
          target: ConsultationStatus.REJECTED,
          actions: assign({
            status: () => ConsultationStatus.REJECTED,
            rejectReason: (_, event) => event.reason || '未通过审核',
          }),
        },
      },
    },
    [ConsultationStatus.REJECTED]: {
      type: 'final',
      entry: assign({
        retryCount: (context) => context.retryCount + 1,
      }),
    },
    [ConsultationStatus.SCHEDULED]: {
      on: {
        SCHEDULE: {
          actions: assign({
            scheduleTime: (_, event) => event.time,
          }),
        },
        START: {
          target: ConsultationStatus.IN_PROGRESS,
          actions: assign({
            status: () => ConsultationStatus.IN_PROGRESS,
            startTime: () => Date.now(),
          }),
        },
        CANCEL: {
          target: ConsultationStatus.CANCELLED,
          actions: assign({
            status: () => ConsultationStatus.CANCELLED,
            cancelReason: (_, event) => event.reason || '已取消',
          }),
        },
      },
    },
    [ConsultationStatus.IN_PROGRESS]: {
      on: {
        COMPLETE: {
          target: ConsultationStatus.COMPLETED,
          actions: assign({
            status: () => ConsultationStatus.COMPLETED,
            completeTime: () => Date.now(),
          }),
        },
        CANCEL: {
          target: ConsultationStatus.CANCELLED,
          actions: assign({
            status: () => ConsultationStatus.CANCELLED,
            cancelReason: (_, event) => event.reason || '已取消',
          }),
        },
      },
    },
    [ConsultationStatus.COMPLETED]: {
      type: 'final',
    },
    [ConsultationStatus.CANCELLED]: {
      type: 'final',
    },
  },
})

/**
 * 状态流转配置
 */
export const statusTransitions: Record<ConsultationStatus, ConsultationEvent['type'][]> = {
  [ConsultationStatus.DRAFT]: ['SUBMIT'],
  [ConsultationStatus.PENDING_REVIEW]: ['APPROVE', 'REJECT'],
  [ConsultationStatus.REJECTED]: [],
  [ConsultationStatus.SCHEDULED]: ['SCHEDULE', 'START', 'CANCEL'],
  [ConsultationStatus.IN_PROGRESS]: ['COMPLETE', 'CANCEL'],
  [ConsultationStatus.COMPLETED]: [],
  [ConsultationStatus.CANCELLED]: [],
}

/**
 * 状态显示配置
 */
export const statusConfig: Record<ConsultationStatus, { label: string; color: string; icon: string }> = {
  [ConsultationStatus.DRAFT]: { label: '草稿', color: 'default', icon: '📝' },
  [ConsultationStatus.PENDING_REVIEW]: { label: '待审核', color: 'orange', icon: '⏳' },
  [ConsultationStatus.REJECTED]: { label: '已拒绝', color: 'red', icon: '❌' },
  [ConsultationStatus.SCHEDULED]: { label: '已排期', color: 'blue', icon: '📅' },
  [ConsultationStatus.IN_PROGRESS]: { label: '进行中', color: 'processing', icon: '🔴' },
  [ConsultationStatus.COMPLETED]: { label: '已完成', color: 'green', icon: '✅' },
  [ConsultationStatus.CANCELLED]: { label: '已取消', color: 'gray', icon: '🚫' },
}

/**
 * 获取状态标签
 */
export function getStatusLabel(status: ConsultationStatus): string {
  return statusConfig[status]?.label || status
}

/**
 * 获取状态颜色
 */
export function getStatusColor(status: ConsultationStatus): string {
  return statusConfig[status]?.color || 'default'
}

/**
 * 检查是否可以进行某个操作
 */
export function canTransition(from: ConsultationStatus, event: ConsultationEvent['type']): boolean {
  return statusTransitions[from]?.includes(event) || false
}

/**
 * 计算会诊耗时
 */
export function calculateDuration(context: ConsultationContext): {
  totalHours?: number
  reviewHours?: number
  waitHours?: number
} {
  const result: any = {}

  if (context.submitTime && context.approveTime) {
    result.reviewHours = ((context.approveTime - context.submitTime) / 3600000).toFixed(1)
  }

  if (context.approveTime && context.startTime) {
    result.waitHours = ((context.startTime - context.approveTime) / 3600000).toFixed(1)
  }

  if (context.startTime && context.completeTime) {
    result.totalHours = ((context.completeTime - context.startTime) / 3600000).toFixed(1)
  }

  return result
}