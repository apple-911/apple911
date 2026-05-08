import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Row, Col, Table, Tag, Space, Typography, Button, Select, Empty, Divider, message } from 'antd'
import { StarOutlined, EyeOutlined, DownloadOutlined, FilterOutlined, StarFilled } from '@ant-design/icons'
import { useCaseLibraryStore } from '../../stores/caseLibraryStore'
import { mockMedicalCases } from '../../mocks/caseData'

const { Title, Text } = Typography

export default function MyFavorites() {
  const navigate = useNavigate()
  const { favorites, removeFavorite } = useCaseLibraryStore()
  const [filterType, setFilterType] = useState<string>('all')

  const filteredFavorites = filterType === 'all' 
    ? favorites 
    : favorites.filter(f => {
        const caseData = mockMedicalCases.find(c => c.id === f.caseId)
        return caseData?.tags.includes(filterType)
      })

  const handleExportFavorites = () => {
    try {
      const exportData = filteredFavorites.map(f => {
        const caseData = mockMedicalCases.find(c => c.id === f.caseId)
        return {
          '病案ID': f.caseId,
          '病案标题': f.caseTitle,
          '诊断': f.diagnosis,
          '科室': f.department,
          '会诊日期': f.meetingDate,
          '收藏日期': f.createdAt,
          '笔记': f.notes || '',
          '标签': caseData?.tags.join(', ') || '',
        }
      })

      const jsonStr = JSON.stringify(exportData, null, 2)
      const blob = new Blob([jsonStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `我的收藏_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      message.success(`成功导出 ${filteredFavorites.length} 条收藏数据`)
    } catch (error) {
      message.error('导出失败，请重试')
    }
  }

  const columns = [
    {
      title: '病案ID',
      dataIndex: 'caseId',
      key: 'caseId',
      width: 120,
      render: (id: string) => (
        <Button type="link" onClick={() => navigate(`/case-library/detail/${id}`)}>
          {id}
        </Button>
      ),
    },
    {
      title: '病案标题',
      dataIndex: 'caseTitle',
      key: 'caseTitle',
      ellipsis: true,
    },
    {
      title: '诊断',
      dataIndex: 'diagnosis',
      key: 'diagnosis',
      width: 200,
      ellipsis: true,
      render: (text: string) => <Tag color="red">{text}</Tag>,
    },
    {
      title: '科室',
      dataIndex: 'department',
      key: 'department',
      width: 120,
    },
    {
      title: '会诊日期',
      dataIndex: 'meetingDate',
      key: 'meetingDate',
      width: 120,
    },
    {
      title: '收藏日期',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
    },
    {
      title: '笔记',
      dataIndex: 'notes',
      key: 'notes',
      width: 150,
      ellipsis: true,
      render: (text: string) => text ? <Text type="secondary">{text}</Text> : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: any) => (
        <Space>
          <Button 
            type="link" 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => navigate(`/case-library/detail/${record.caseId}`)}
          >
            查看
          </Button>
          <Button 
            type="link" 
            size="small" 
            danger
            icon={<StarFilled />}
            onClick={() => removeFavorite(record.caseId)}
          >
            取消收藏
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Title level={4} className="mb-0">我的收藏</Title>
        <Space>
          <Select
            value={filterType}
            onChange={setFilterType}
            style={{ width: 150 }}
            options={[
              { value: 'all', label: '全部类型' },
              { value: '典型病例', label: '典型病例' },
              { value: '疑难病例', label: '疑难病例' },
              { value: '教学示范', label: '教学示范' },
              { value: '科研价值', label: '科研价值' },
            ]}
          />
          <Button icon={<DownloadOutlined />} onClick={handleExportFavorites}>导出收藏</Button>
        </Space>
      </div>

      <Card>
        {filteredFavorites.length > 0 ? (
          <Table
            columns={columns}
            dataSource={filteredFavorites}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        ) : (
          <Empty description="暂无收藏病案" />
        )}
      </Card>
    </div>
  )
}
