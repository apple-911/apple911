import { createMachine, assign } from 'xstate'

export enum ConsultationStatus {
  DRAFT = 'draft',
  PENDING_DIRECTOR_CONFIRM = 'pending_director_confirm',
  PENDING_SECRETARY_REVIEW = 'pending_secretary_review',
  PENDING_MATERIAL_SUPPLEMENT = 'pending_material_supplement',  // 待补充材料
  PENDING_EXPERT_INVITE = 'pending_expert_invite',
  PENDING_EXPERT_CONFIRM = 'pending_expert_confirm',
  EXPERT_CONFIRMED = 'expert_confirmed',
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export interface ConsultationEvent {
  type: string
  reason?: string
  time?: string
}

export interface ConsultationContext {
  id: string
  patientName: string
  status: ConsultationStatus
  rejectReason?: string
  cancelReason?: string
  scheduleTime?: string
  directorConfirmTime?: number
  secretaryReviewTime?: number
  inviteTime?: number
  expertConfirmTime?: number
  startTime?: number
  completeTime?: number
  retryCount: number
}

type MachineContext = {
  id: string
  patientName: string
  status: ConsultationStatus
  rejectReason: string | undefined
  cancelReason: string | undefined
  scheduleTime: string | undefined
  directorConfirmTime: number | undefined
  secretaryReviewTime: number | undefined
  inviteTime: number | undefined
  expertConfirmTime: number | undefined
  startTime: number | undefined
  completeTime: number | undefined
  retryCount: number
}

export const consultationMachine = createMachine({
  id: 'consultation',
  initial: ConsultationStatus.DRAFT,
  context: {
    id: '',
    patientName: '',
    status: ConsultationStatus.DRAFT,
    retryCount: 0,
    rejectReason: undefined,
    cancelReason: undefined,
    scheduleTime: undefined,
    directorConfirmTime: undefined,
    secretaryReviewTime: undefined,
    inviteTime: undefined,
    expertConfirmTime: undefined,
    startTime: undefined,
    completeTime: undefined,
  } as MachineContext,
  states: {
    [ConsultationStatus.DRAFT]: {
      on: {
        SUBMIT: {
          target: ConsultationStatus.PENDING_DIRECTOR_CONFIRM,
          actions: assign({
            status: () => ConsultationStatus.PENDING_DIRECTOR_CONFIRM,
          }),
        },
      },
    },
    [ConsultationStatus.PENDING_DIRECTOR_CONFIRM]: {
      on: {
        DIRECTOR_CONFIRM: {
          target: ConsultationStatus.PENDING_SECRETARY_REVIEW,
          actions: assign({
            status: () => ConsultationStatus.PENDING_SECRETARY_REVIEW,
            directorConfirmTime: () => Date.now(),
          }),
        },
        DIRECTOR_REJECT: {
          target: ConsultationStatus.REJECTED,
          actions: assign({
            status: () => ConsultationStatus.REJECTED,
            rejectReason: ({ event }: any) => (event as ConsultationEvent).reason || '主任未通过',
          }),
        },
      },
    },
    [ConsultationStatus.PENDING_SECRETARY_REVIEW]: {
      on: {
        SECRETARY_APPROVE: {
          target: ConsultationStatus.PENDING_EXPERT_INVITE,
          actions: assign({
            status: () => ConsultationStatus.PENDING_EXPERT_INVITE,
            secretaryReviewTime: () => Date.now(),
          }),
        },
        SECRETARY_REJECT_MATERIALS: {
          target: ConsultationStatus.PENDING_MATERIAL_SUPPLEMENT,
          actions: assign({
            status: () => ConsultationStatus.PENDING_MATERIAL_SUPPLEMENT,
            rejectReason: ({ event }: any) => (event as ConsultationEvent).reason || '材料不完整，需补充',
            secretaryReviewTime: () => Date.now(),
          }),
        },
        SECRETARY_REJECT: {
          target: ConsultationStatus.REJECTED,
          actions: assign({
            status: () => ConsultationStatus.REJECTED,
            rejectReason: ({ event }: any) => (event as ConsultationEvent).reason || '秘书未通过',
          }),
        },
      },
    },
    [ConsultationStatus.PENDING_MATERIAL_SUPPLEMENT]: {
      on: {
        MATERIAL_SUBMITTED: {
          target: ConsultationStatus.PENDING_SECRETARY_REVIEW,
          actions: assign({
            status: () => ConsultationStatus.PENDING_SECRETARY_REVIEW,
          }),
        },
      },
    },
    [ConsultationStatus.PENDING_EXPERT_INVITE]: {
      on: {
        INVITE_EXPERTS: {
          target: ConsultationStatus.PENDING_EXPERT_CONFIRM,
          actions: assign({
            status: () => ConsultationStatus.PENDING_EXPERT_CONFIRM,
            inviteTime: () => Date.now(),
          }),
        },
      },
    },
    [ConsultationStatus.PENDING_EXPERT_CONFIRM]: {
      on: {
        EXPERTS_CONFIRMED: {
          target: ConsultationStatus.EXPERT_CONFIRMED,
          actions: assign({
            status: () => ConsultationStatus.EXPERT_CONFIRMED,
            expertConfirmTime: () => Date.now(),
          }),
        },
        EXPERT_REJECT: {
          target: ConsultationStatus.REJECTED,
          actions: assign({
            status: () => ConsultationStatus.REJECTED,
            rejectReason: ({ event }: any) => (event as ConsultationEvent).reason || '专家未确认',
          }),
        },
      },
    },
    [ConsultationStatus.EXPERT_CONFIRMED]: {
      on: {
        SCHEDULE: {
          target: ConsultationStatus.SCHEDULED,
          actions: assign({
            status: () => ConsultationStatus.SCHEDULED,
            scheduleTime: ({ event }: any) => (event as ConsultationEvent).time,
          }),
        },
        CANCEL: {
          target: ConsultationStatus.CANCELLED,
          actions: assign({
            status: () => ConsultationStatus.CANCELLED,
            cancelReason: ({ event }: any) => (event as ConsultationEvent).reason || '已取消',
          }),
        },
      },
    },
    [ConsultationStatus.SCHEDULED]: {
      on: {
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
            cancelReason: ({ event }: any) => (event as ConsultationEvent).reason || '已取消',
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
            cancelReason: ({ event }: any) => (event as ConsultationEvent).reason || '已取消',
          }),
        },
      },
    },
    [ConsultationStatus.COMPLETED]: {
      type: 'final',
    },
    [ConsultationStatus.REJECTED]: {
      type: 'final',
    },
    [ConsultationStatus.CANCELLED]: {
      type: 'final',
    },
  },
})

export const statusTransitions: Record<ConsultationStatus, string[]> = {
  [ConsultationStatus.DRAFT]: ['SUBMIT'],
  [ConsultationStatus.PENDING_DIRECTOR_CONFIRM]: ['DIRECTOR_CONFIRM', 'DIRECTOR_REJECT'],
  [ConsultationStatus.PENDING_SECRETARY_REVIEW]: ['SECRETARY_APPROVE', 'SECRETARY_REJECT', 'SECRETARY_REJECT_MATERIALS'],
  [ConsultationStatus.PENDING_MATERIAL_SUPPLEMENT]: ['MATERIAL_SUBMITTED'],
  [ConsultationStatus.PENDING_EXPERT_INVITE]: ['INVITE_EXPERTS'],
  [ConsultationStatus.PENDING_EXPERT_CONFIRM]: ['EXPERTS_CONFIRMED', 'EXPERT_REJECT'],
  [ConsultationStatus.EXPERT_CONFIRMED]: ['SCHEDULE', 'CANCEL'],
  [ConsultationStatus.SCHEDULED]: ['START', 'CANCEL'],
  [ConsultationStatus.IN_PROGRESS]: ['COMPLETE', 'CANCEL'],
  [ConsultationStatus.COMPLETED]: [],
  [ConsultationStatus.REJECTED]: [],
  [ConsultationStatus.CANCELLED]: [],
}

export const statusConfig: Record<ConsultationStatus, { label: string; color: string; icon: string; description: string }> = {
  [ConsultationStatus.DRAFT]: { label: '草稿', color: 'default', icon: '📝', description: '申请草稿，尚未提交' },
  [ConsultationStatus.PENDING_DIRECTOR_CONFIRM]: { label: '待主任确认', color: 'cyan', icon: '👨‍⚕️', description: '已提交，等待主任医生确认' },
  [ConsultationStatus.PENDING_SECRETARY_REVIEW]: { label: '待秘书审核', color: 'orange', icon: '📋', description: '主任已确认，等待秘书审核' },
  [ConsultationStatus.PENDING_MATERIAL_SUPPLEMENT]: { label: '待补充材料', color: 'warning', icon: '📄', description: '材料不完整，等待医生补充' },
  [ConsultationStatus.PENDING_EXPERT_INVITE]: { label: '待邀请专家', color: 'blue', icon: '📧', description: '审核通过，等待秘书邀请专家' },
  [ConsultationStatus.PENDING_EXPERT_CONFIRM]: { label: '待专家确认', color: 'purple', icon: '⏳', description: '已邀请专家，等待专家确认参加' },
  [ConsultationStatus.EXPERT_CONFIRMED]: { label: '专家已确认', color: 'geekblue', icon: '✅', description: '专家已确认，等待排期' },
  [ConsultationStatus.SCHEDULED]: { label: '已排期', color: 'blue', icon: '📅', description: '已排期，等待会诊开始' },
  [ConsultationStatus.IN_PROGRESS]: { label: '进行中', color: 'processing', icon: '🔴', description: '会诊正在进行中' },
  [ConsultationStatus.COMPLETED]: { label: '已完成', color: 'green', icon: '✅', description: '会诊已完成' },
  [ConsultationStatus.REJECTED]: { label: '秘书驳回', color: 'red', icon: '❌', description: '申请已被秘书驳回' },
  [ConsultationStatus.CANCELLED]: { label: '已取消', color: 'gray', icon: '🚫', description: '会诊已取消' },
}

export function getStatusLabel(status: ConsultationStatus): string {
  return statusConfig[status]?.label || status
}

export function getStatusColor(status: ConsultationStatus): string {
  return statusConfig[status]?.color || 'default'
}

export function getStatusDescription(status: ConsultationStatus): string {
  return statusConfig[status]?.description || ''
}

export function canTransition(from: ConsultationStatus, event: string): boolean {
  return statusTransitions[from]?.includes(event) || false
}

export function calculateDuration(context: ConsultationContext): {
  directorConfirmHours?: number
  secretaryReviewHours?: number
} {
  const result: any = {}

  if (context.directorConfirmTime && context.secretaryReviewTime) {
    result.directorConfirmHours = (context.secretaryReviewTime - context.directorConfirmTime) / (1000 * 60 * 60)
  }

  return result
}
