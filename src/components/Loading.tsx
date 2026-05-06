import React, { useState, useEffect } from 'react'
import { Skeleton, Card, List, Table, Descriptions, Space, Avatar } from 'antd'
import { UserOutlined } from '@ant-design/icons'

interface LoadingProps {
  type?: 'card' | 'table' | 'list' | 'descriptions' | 'page'
  count?: number
}

/**
 * 通用加载骨架屏组件
 */
export const Loading: React.FC<LoadingProps> = ({ type = 'card', count = 3 }) => {
  switch (type) {
    case 'card':
      return (
        <div className="space-y-4">
          {Array.from({ length: count }).map((_, i) => (
            <Card key={i}>
              <Skeleton active paragraph={{ rows: 2 }} />
            </Card>
          ))}
        </div>
      )

    case 'table':
      return (
        <Card>
          <Skeleton active paragraph={{ rows: 0 }} />
          <div className="mt-4 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} avatar paragraph={{ rows: 1 }} />
            ))}
          </div>
        </Card>
      )

    case 'list':
      return (
        <List
          dataSource={Array.from({ length: count })}
          renderItem={() => (
            <List.Item>
              <Skeleton avatar active />
            </List.Item>
          )}
        />
      )

    case 'descriptions':
      return (
        <Card>
          <Descriptions>
            {Array.from({ length: 6 }).map((_, i) => (
              <Descriptions.Item key={i} label={<Skeleton.Input style={{ width: 80 }} />}>
                <Skeleton.Input style={{ width: 200 }} />
              </Descriptions.Item>
            ))}
          </Descriptions>
        </Card>
      )

    case 'page':
      return (
        <div className="space-y-4">
          <Skeleton active paragraph={{ rows: 1 }} />
          <Skeleton active paragraph={{ rows: 4 }} />
          <Skeleton active paragraph={{ rows: 2 }} />
        </div>
      )

    default:
      return <Skeleton active />
  }
}

/**
 * 卡片加载骨架屏
 */
export const CardSkeleton: React.FC<{ title?: boolean; avatar?: boolean; rows?: number }> = ({
  title = true,
  avatar = false,
  rows = 2,
}) => {
  return (
    <Card>
      <Skeleton
        active
        avatar={avatar}
        title={title}
        paragraph={{ rows }}
      />
    </Card>
  )
}

/**
 * 表格加载骨架屏
 */
export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <Card>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton.Avatar active size="small" />
            <div className="flex-1">
              <Skeleton.Input style={{ width: '60%' }} active />
            </div>
            <div className="flex-1">
              <Skeleton.Input style={{ width: '80%' }} active />
            </div>
            <div className="w-24">
              <Skeleton.Button active size="small" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

/**
 * 统计卡片加载骨架屏
 */
export const StatisticSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <Skeleton
            active
            avatar={{ size: 'large', shape: 'square' }}
            title={false}
            paragraph={{ rows: 2, width: ['60%', '80%'] }}
          />
        </Card>
      ))}
    </div>
  )
}

/**
 * 图片加载组件（带骨架屏）
 */
export const LazyImage: React.FC<{
  src: string
  alt?: string
  className?: string
  placeholder?: React.ReactNode
}> = ({ src, alt, className, placeholder }) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const img = new Image()
    img.src = src
    img.onload = () => setLoading(false)
    img.onerror = () => {
      setLoading(false)
      setError(true)
    }
  }, [src])

  if (error) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center`}>
        <UserOutlined className="text-gray-400 text-2xl" />
      </div>
    )
  }

  return (
    <>
      {loading && (placeholder || <Skeleton.Image active className={className} />)}
      <img
        src={src}
        alt={alt}
        className={`${className} ${loading ? 'hidden' : ''}`}
        onLoad={() => setLoading(false)}
      />
    </>
  )
}

export default Loading