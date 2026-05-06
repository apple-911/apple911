import { create } from 'zustand'
import { useEffect } from 'react'
import React from 'react'

/**
 * 审计日志类型
 */
export enum AuditAction {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  VIEW_PATIENT = 'VIEW_PATIENT',
  CREATE_CONSULTATION = 'CREATE_CONSULTATION',
  APPROVE_CONSULTATION = 'APPROVE_CONSULTATION',
  REJECT_CONSULTATION = 'REJECT_CONSULTATION',
  START_CONSULTATION = 'START_CONSULTATION',
  COMPLETE_CONSULTATION = 'COMPLETE_CONSULTATION',
  SIGN_REPORT = 'SIGN_REPORT',
  MODIFY_REPORT = 'MODIFY_REPORT',
  EXPORT_DATA = 'EXPORT_DATA',
  DELETE_DATA = 'DELETE_DATA',
  ELECTRONIC_SIGNATURE = 'ELECTRONIC_SIGNATURE',
  SYSTEM_CONFIG = 'SYSTEM_CONFIG',
}

/**
 * 审计日志结果
 */
export type AuditResult = 'success' | 'failure'

/**
 * 审计日志条目
 */
export interface AuditLog {
  id: string
  userId: string
  userName: string
  action: AuditAction
  targetId?: string
  targetType?: string
  ip: string
  timestamp: number
  result: AuditResult
  details?: any
  riskLevel?: 'low' | 'medium' | 'high'
}

interface AuditState {
  logs: AuditLog[]
  addLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void
  getLogs: (filters?: {
    userId?: string
    action?: AuditAction
    startDate?: string
    endDate?: string
  }) => AuditLog[]
  clearLogs: () => void
}

export const useAuditStore = create<AuditState>((set, get) => ({
  logs: [],
  addLog: (log) =>
    set((state) => {
      const newLog: AuditLog = {
        ...log,
        id: `${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        riskLevel: assessRisk(log.action, log.targetType),
      }
      return {
        logs: [newLog, ...state.logs],
      }
    }),
  getLogs: (filters) => {
    const state = get()
    let filteredLogs = [...state.logs]

    if (filters?.userId) {
      filteredLogs = filteredLogs.filter((log) => log.userId === filters.userId)
    }
    if (filters?.action) {
      filteredLogs = filteredLogs.filter((log) => log.action === filters.action)
    }
    if (filters?.startDate) {
      const start = new Date(filters.startDate).getTime()
      filteredLogs = filteredLogs.filter((log) => log.timestamp >= start)
    }
    if (filters?.endDate) {
      const end = new Date(filters.endDate).getTime()
      filteredLogs = filteredLogs.filter((log) => log.timestamp <= end)
    }

    return filteredLogs
  },
  clearLogs: () => set({ logs: [] }),
}))

/**
 * 评估风险等级
 */
function assessRisk(action: AuditAction, targetType?: string): 'low' | 'medium' | 'high' {
  // 高风险操作
  const highRiskActions = [
    AuditAction.DELETE_DATA,
    AuditAction.ELECTRONIC_SIGNATURE,
    AuditAction.SYSTEM_CONFIG,
  ]
  if (highRiskActions.includes(action)) {
    return 'high'
  }

  // 中等风险操作
  const mediumRiskActions = [
    AuditAction.EXPORT_DATA,
    AuditAction.MODIFY_REPORT,
    AuditAction.VIEW_PATIENT,
  ]
  if (mediumRiskActions.includes(action)) {
    return 'medium'
  }

  return 'low'
}

/**
 * 审计日志 Hook
 * 自动记录用户操作
 */
export function useAuditLogger() {
  const addLog = useAuditStore((state) => state.addLog)

  const log = (
    action: AuditAction,
    targetId?: string,
    targetType?: string,
    details?: any,
    result: AuditResult = 'success'
  ) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const ip = '192.168.1.100' // 实际应该从后端获取

    addLog({
      userId: user.id || 'unknown',
      userName: user.name || 'unknown',
      action,
      targetId,
      targetType,
      ip,
      result,
      details,
    })
  }

  return { log }
}

/**
 * 审计日志组件（自动记录页面访问）
 */
export function AuditLogger({
  action,
  targetId,
  targetType,
}: {
  action: AuditAction
  targetId?: string
  targetType?: string
}) {
  const { log } = useAuditLogger()

  useEffect(() => {
    log(action, targetId, targetType)

    // 页面离开时记录
    return () => {
      // 可以在这里记录页面停留时间等
    }
  }, [])

  return null
}

/**
 * 手动记录审计日志的 HOC
 */
export function withAudit<P extends Record<string, any>>(
  WrappedComponent: React.ComponentType<P>,
  action: AuditAction,
  getTargetInfo?: (props: P) => { targetId?: string; targetType?: string; details?: any }
) {
  return function AuditedComponent(props: P) {
    const { log } = useAuditLogger()

    const enhancedProps = {
      ...props,
      logAudit: (
        result: AuditResult = 'success',
        overrideInfo?: { targetId?: string; targetType?: string; details?: any }
      ) => {
        const info = getTargetInfo?.(props) || {}
        log(
          action,
          overrideInfo?.targetId || info.targetId,
          overrideInfo?.targetType || info.targetType,
          overrideInfo?.details || info.details,
          result
        )
      },
    } as P & { logAudit: (result?: AuditResult, overrideInfo?: any) => void }

    return React.createElement(WrappedComponent, enhancedProps)
  }
}