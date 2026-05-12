import { useState, useEffect } from 'react'
import { Badge, Dropdown, List, Avatar, Button, Space, Typography, Empty, Tag, Tooltip, Spin } from 'antd'
import {
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  ClearOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons'
import { useNotificationPanel } from '../stores/notificationStore'
import { useAppStore } from '../stores/appStore'
import { formatRelativeTime } from '../utils/helpers'

const { Text, Title } = Typography

const iconMap = {
  info: <InfoCircleOutlined />,
  success: <CheckCircleOutlined />,
  warning: <ExclamationCircleOutlined />,
  error: <CloseCircleOutlined />,
}

const colorMap = {
  info: 'blue',
  success: 'green',
  warning: 'orange',
  error: 'red',
}

export default function NotificationPanel() {
  const [open, setOpen] = useState(false)
  const { user } = useAppStore()
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    handleAction,
    fetchNotifications,
  } = useNotificationPanel()

  useEffect(() => {
    if (user?.id) {
      fetchNotifications(user.id)
    }
  }, [user?.id])

  const menuItems = [
    {
      key: 'read-all',
      icon: <CheckOutlined />,
      label: '全部已读',
      onClick: () => user?.id && markAllAsRead(user.id),
      disabled: unreadCount === 0,
    },
    {
      key: 'clear-all',
      icon: <ClearOutlined />,
      label: '清空全部',
      onClick: () => user?.id && clearAll(user.id),
      disabled: notifications.length === 0,
    },
    {
      key: 'refresh',
      icon: <RefreshIcon />,
      label: '刷新',
      onClick: () => user?.id && fetchNotifications(user.id),
    },
  ]

  const notificationList = (
    <div className="w-96">
      <div className="flex items-center justify-between p-4 border-b">
        <Title level={5} className="!mb-0">
          消息通知
          {unreadCount > 0 && (
            <Tag color="red" className="ml-2">
              {unreadCount}
            </Tag>
          )}
        </Title>
        <Dropdown menu={{ items: menuItems }} placement="bottomRight" trigger={['click']}>
          <Space className="cursor-pointer">
            <Button type="link" size="small">
              批量操作
            </Button>
          </Space>
        </Dropdown>
      </div>

      {isLoading ? (
        <div className="py-12 text-center">
          <Spin size="default" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="py-12 text-center">
          <Empty description="暂无通知" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </div>
      ) : (
        <List
          dataSource={notifications}
          className="max-h-96 overflow-y-auto"
          renderItem={(item) => (
            <List.Item
              className={`!px-4 !py-3 cursor-pointer hover:bg-gray-50 ${
                !item.read ? '!bg-blue-50' : ''
              }`}
              onClick={() => handleAction(item)}
              actions={[
                <Tooltip key="delete" title="删除">
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => {
                      e.stopPropagation()
                      removeNotification(item.id)
                    }}
                  />
                </Tooltip>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    className={`!bg-${colorMap[item.type]}-500`}
                    icon={iconMap[item.type]}
                  />
                }
                title={
                  <Space>
                    <Text strong={!item.read}>{item.title}</Text>
                    {!item.read && <Badge color="red" />}
                  </Space>
                }
                description={
                  <Space direction="vertical" size={0} className="w-full">
                    <Text type="secondary" className="text-sm">
                      {item.message}
                    </Text>
                    <div className="flex justify-between items-center mt-1">
                      <Text type="secondary" className="text-xs">
                        {formatRelativeTime(new Date(item.timestamp))}
                      </Text>
                      {item.action && (
                        <Button type="link" size="small" className="!p-0">
                          {item.action.label}
                        </Button>
                      )}
                    </div>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  )

  return (
    <Dropdown
      menu={{ items: [{ key: 'list', label: notificationList }] }}
      trigger={['click']}
      open={open}
      onOpenChange={setOpen}
      overlayClassName="notification-dropdown"
    >
      <Badge count={unreadCount} size="small" offset={[-5, 5]}>
        <BellOutlined
          className={`text-xl cursor-pointer ${
            unreadCount > 0 ? 'text-medical-blue' : 'text-gray-400'
          }`}
        />
      </Badge>
    </Dropdown>
  )
}

// 刷新图标组件
function RefreshIcon(props: any) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="23 4 23 10 17 10"></polyline>
      <polyline points="1 20 1 14 7 14"></polyline>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
    </svg>
  )
}
