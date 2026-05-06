import { useState } from 'react'
import { Badge, Dropdown, List, Avatar, Button, Space, Typography, Empty, Tag, Tooltip } from 'antd'
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
import { useNotificationPanel, useSimulatedWebSocket } from '../stores/notificationStore'
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
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    handleAction,
  } = useNotificationPanel()

  useSimulatedWebSocket()

  const menuItems = [
    {
      key: 'read-all',
      icon: <CheckOutlined />,
      label: '全部已读',
      onClick: markAllAsRead,
      disabled: unreadCount === 0,
    },
    {
      key: 'clear-all',
      icon: <ClearOutlined />,
      label: '清空全部',
      onClick: clearAll,
      disabled: notifications.length === 0,
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

      {notifications.length === 0 ? (
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