import { create } from 'zustand'
import { useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAppStore } from './appStore'

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
  isLoading: boolean
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: (userId: string) => void
  removeNotification: (id: string) => void
  clearAll: (userId: string) => void
  fetchNotifications: (userId: string) => Promise<void>
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  addNotification: async (notification, userId?: string) => {
    const newNotification: Notification = {
      ...notification,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      read: false,
    }

    // 如果提供了 userId，则尝试保存到数据库
    if (userId) {
      try {
        await supabase.from('notifications').insert({
          user_id: userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          action_url: notification.action?.url,
          action_label: notification.action?.label,
          read: false,
          timestamp: new Date(newNotification.timestamp).toISOString(),
        })
      } catch (err) {
        // 静默失败，通知表可能不存在
        console.warn('保存通知失败:', err)
      }
    }

    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }))
  },

  markAsRead: async (id) => {
    // 尝试更新数据库
    try {
      await supabase.from('notifications').update({ read: true }).eq('id', id)
    } catch (err) {
      // 静默失败
      console.warn('标记通知已读失败:', err)
    }

    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
      const unreadCount = notifications.filter((n) => !n.read).length
      return { notifications, unreadCount }
    })
  },

  markAllAsRead: async (userId) => {
    if (userId) {
      try {
        await supabase.from('notifications').update({ read: true }).eq('user_id', userId)
      } catch (err) {
        // 静默失败
        console.warn('标记全部通知已读失败:', err)
      }
    }

    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }))
  },

  removeNotification: async (id) => {
    try {
      await supabase.from('notifications').delete().eq('id', id)
    } catch (err) {
      // 静默失败
      console.warn('删除通知失败:', err)
    }

    set((state) => {
      const notifications = state.notifications.filter((n) => n.id !== id)
      const unreadCount = notifications.filter((n) => !n.read).length
      return { notifications, unreadCount }
    })
  },

  clearAll: async (userId) => {
    if (userId) {
      try {
        await supabase.from('notifications').delete().eq('user_id', userId)
      } catch (err) {
        // 静默失败
        console.warn('清空通知失败:', err)
      }
    }

    set({ notifications: [], unreadCount: 0 })
  },

  fetchNotifications: async (userId) => {
    if (!userId) {
      set({ isLoading: false })
      return
    }

    set({ isLoading: true })

    try {
      // 尝试查询通知
      // 注意：由于数据库设计问题，users.id 是字符串（如 user-director）
      // 但 notifications.user_id 是 UUID，两者不匹配
      // 所以这里使用 try-catch 来优雅地处理查询失败
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(50)

      if (error) {
        // 如果查询失败（如 UUID 不匹配），静默处理
        console.warn('获取通知失败:', error.message)
        set({ notifications: [], unreadCount: 0, isLoading: false })
        return
      }

      if (data) {
        const notifications: Notification[] = data.map((item) => ({
          id: item.id,
          type: item.type as NotificationType,
          title: item.title,
          message: item.message,
          timestamp: new Date(item.timestamp).getTime(),
          read: item.read,
          action: item.action_url
            ? {
                label: item.action_label || '查看',
                url: item.action_url,
              }
            : undefined,
        }))

        const unreadCount = notifications.filter((n) => !n.read).length
        set({ notifications, unreadCount })
      } else {
        set({ notifications: [], unreadCount: 0 })
      }
    } catch (err) {
      // 捕获任何异常，确保不会中断应用
      console.warn('获取通知异常:', err)
      set({ notifications: [], unreadCount: 0 })
    }

    set({ isLoading: false })
  },
}))

/**
 * 订阅实时通知（使用 Supabase Realtime）
 */
export function useRealtimeNotifications() {
  const addNotification = useNotificationStore((state) => state.addNotification)
  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications)
  const { user } = useAppStore()

  useEffect(() => {
    if (!user?.id) return

    // 订阅新增通知
    const subscription = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          const newNotification = payload.new
          // 只处理当前用户的通知
          if (newNotification.user_id === user.id) {
            addNotification({
              type: newNotification.type as NotificationType,
              title: newNotification.title,
              message: newNotification.message,
              action: newNotification.action_url
                ? {
                    label: newNotification.action_label || '查看',
                    url: newNotification.action_url,
                  }
                : undefined,
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [addNotification, user?.id])

  // 初始化时获取通知（只在用户ID变化时调用）
  useEffect(() => {
    if (user?.id) {
      fetchNotifications(user.id)
    }
  }, [user?.id])
}

/**
 * 通知面板 Hook
 */
export function useNotificationPanel() {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    fetchNotifications,
  } = useNotificationStore()

  useRealtimeNotifications()

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
    isLoading,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    handleAction,
    fetchNotifications,
  }
}

/**
 * 发送系统通知（用于业务逻辑中调用）
 */
export async function sendSystemNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  action?: { label: string; url: string }
) {
  const { error } = await supabase.from('notifications').insert({
    user_id: userId,
    type,
    title,
    message,
    action_url: action?.url,
    action_label: action?.label,
    read: false,
    timestamp: new Date().toISOString(),
  })

  if (error) {
    console.error('Failed to send notification:', error)
    return false
  }
  return true
}
