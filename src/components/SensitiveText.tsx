import { useState } from 'react'
import { Typography, Button, Space, Tooltip, Tag } from 'antd'
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons'
import { maskName, maskPhone, maskIdCard } from '../../utils/helpers'

const { Text } = Typography

interface SensitiveTextProps {
  value: string
  type?: 'name' | 'phone' | 'idCard' | 'custom'
  maskPattern?: string
  level?: 'full' | 'masked'
  showToggle?: boolean
  className?: string
}

/**
 * 敏感数据脱敏组件
 * 支持姓名、手机号、身份证号等脱敏
 */
export default function SensitiveText({
  value,
  type = 'name',
  level = 'masked',
  showToggle = true,
  className,
}: SensitiveTextProps) {
  const [visible, setVisible] = useState(false)

  const maskValue = () => {
    if (visible || level === 'full') return value

    switch (type) {
      case 'name':
        return maskName(value, 'masked')
      case 'phone':
        return maskPhone(value)
      case 'idCard':
        return maskIdCard(value)
      default:
        return value
    }
  }

  return (
    <Space size={0} className={className}>
      <Text className={visible || level === 'full' ? '' : 'text-gray-400'}>
        {maskValue()}
      </Text>
      {showToggle && (
        <Tooltip title={visible ? '隐藏敏感信息' : '显示敏感信息'}>
          <Button
            type="link"
            size="small"
            icon={visible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            onClick={() => setVisible(!visible)}
            className="!p-0"
          />
        </Tooltip>
      )}
      {level === 'masked' && (
        <Tag color="orange" className="text-xs">
          已脱敏
        </Tag>
      )}
    </Space>
  )
}

/**
 * 敏感数据展示容器
 */
export function SensitiveDataContainer({
  children,
  defaultMasked = true,
}: {
  children: React.ReactNode
  defaultMasked?: boolean
}) {
  const [masked, setMasked] = useState(defaultMasked)

  return (
    <div className="relative">
      <div className={masked ? 'blur-sm' : ''}>{children}</div>
      <Button
        type="primary"
        size="small"
        icon={masked ? <EyeOutlined /> : <EyeInvisibleOutlined />}
        onClick={() => setMasked(!masked)}
        className="absolute top-2 right-2 z-10"
      >
        {masked ? '显示' : '隐藏'}
      </Button>
    </div>
  )
}

/**
 * 患者信息脱敏展示
 */
export function PatientInfo({
  patient,
  level = 'masked',
}: {
  patient: {
    name: string
    idCard?: string
    phone?: string
    inpatientNo?: string
  }
  level?: 'masked' | 'full'
}) {
  return (
    <Space direction="vertical" size={0}>
      <div>
        <Text type="secondary">姓名：</Text>
        <SensitiveText value={patient.name} type="name" level={level} />
      </div>
      {patient.idCard && (
        <div>
          <Text type="secondary">身份证号：</Text>
          <SensitiveText value={patient.idCard} type="idCard" level={level} />
        </div>
      )}
      {patient.phone && (
        <div>
          <Text type="secondary">联系电话：</Text>
          <SensitiveText value={patient.phone} type="phone" level={level} />
        </div>
      )}
      {patient.inpatientNo && (
        <div>
          <Text type="secondary">住院号：</Text>
          <Text>{patient.inpatientNo}</Text>
        </div>
      )}
    </Space>
  )
}

/**
 * 专家信息脱敏展示
 */
export function ExpertInfo({
  expert,
  level = 'masked',
}: {
  expert: {
    name: string
    phone?: string
    department: string
    title: string
  }
  level?: 'masked' | 'full'
}) {
  return (
    <Space direction="vertical" size={0}>
      <div>
        <Text type="secondary">姓名：</Text>
        <SensitiveText value={expert.name} type="name" level={level} />
      </div>
      <div>
        <Text type="secondary">科室：</Text>
        <Text>{expert.department}</Text>
      </div>
      <div>
        <Text type="secondary">职称：</Text>
        <Text>{expert.title}</Text>
      </div>
      {expert.phone && (
        <div>
          <Text type="secondary">联系电话：</Text>
          <SensitiveText value={expert.phone} type="phone" level={level} />
        </div>
      )}
    </Space>
  )
}