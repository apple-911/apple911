import { create } from 'zustand'
import { useEffect, useCallback } from 'react'

export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: number
  read: boolean
  action?: {
    label: string
    url: string
  }
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (notification) =>
    set((state) => {
      const newNotification: Notification = {
        ...notification,
        id: `${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        read: false,
      }
      const notifications = [newNotification, ...state.notifications]
      return {
        notifications,
        unreadCount: state.unreadCount + 1,
      }
    }),
  markAsRead: (id) =>
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
      const unreadCount = notifications.filter((n) => !n.read).length
      return { notifications, unreadCount }
    }),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
  removeNotification: (id) =>
    set((state) => {
      const notifications = state.notifications.filter((n) => n.id !== id)
      const unreadCount = notifications.filter((n) => !n.read).length
      return { notifications, unreadCount }
    }),
  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}))

/**
 * 模拟 WebSocket 推送通知
 */
export function useSimulatedWebSocket() {
  const addNotification = useNotificationStore((state) => state.addNotification)

  useEffect(() => {
    const mockNotifications = [
      {
        type: 'info' as NotificationType,
        title: '会诊邀请',
        message: '王建国申请会诊，邀请您参加',
        action: { label: '查看', url: '/consultation/detail/C001' },
      },
      {
        type: 'warning' as NotificationType,
        title: '会诊提醒',
        message: '张伟患者的会诊将在 15 分钟后开始',
        action: { label: '进入', url: '/consultation/room/C003' },
      },
      {
        type: 'info' as NotificationType,
        title: '报告待签',
        message: '刘芳会诊报告待您签名',
        action: { label: '签名', url: '/report/edit/R003' },
      },
    ]

    const intervals = [5000, 15000, 30000]

    const timers = intervals.map((delay, index) =>
      setTimeout(() => {
        addNotification(mockNotifications[index])
      }, delay)
    )

    return () => {
      timers.forEach(clearTimeout)
    }
  }, [addNotification])
}

/**
 * 通知面板 Hook
 */
export function useNotificationPanel() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  } = useNotificationStore()

  const handleAction = useCallback(
    (notification: Notification) => {
      markAsRead(notification.id)
      if (notification.action) {
        window.location.href = notification.action.url
      }
    },
    [markAsRead]
  )

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    handleAction,
  }
}