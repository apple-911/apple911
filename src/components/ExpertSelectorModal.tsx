import { useState, useEffect, useMemo } from 'react'
import type { Key } from 'react'
import { Modal, Table, Tag, Space, Button, Input, Select, Typography, Avatar, message, Spin, Badge } from 'antd'
import { UserOutlined, SearchOutlined, TeamOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { supabase } from '../lib/supabase'
import type { ColumnsType } from 'antd/es/table'

const { Text } = Typography

interface Expert {
  id: string
  name: string
  department: string
  title: string
  specialty?: string
  status?: string
  avatar?: string
}

interface ExpertSelectorModalProps {
  open: boolean
  onCancel: () => void
  onConfirm: (selectedExperts: Expert[]) => void
  selectedExperts?: Expert[]
}

export default function ExpertSelectorModal({ 
  open, 
  onCancel, 
  onConfirm, 
  selectedExperts = [],
}: ExpertSelectorModalProps) {
  const [loading, setLoading] = useState(false)
  const [experts, setExperts] = useState<Expert[]>([])
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])
  const [searchText, setSearchText] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState<string>('')
  
  useEffect(() => {
    if (open) {
      loadExperts()
      setSelectedRowKeys(selectedExperts.map(e => e.id))
    }
  }, [open, selectedExperts])
  
  const loadExperts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('experts')
        .select('*')
        .order('department')
      
      if (error) throw error
      setExperts(data || [])
    } catch (err) {
      console.error('加载专家失败:', err)
      message.error('加载专家列表失败')
    } finally {
      setLoading(false)
    }
  }
  
  const departments = useMemo(() => {
    const depts = [...new Set(experts.map(e => e.department).filter(Boolean))]
    return depts.map(d => ({ value: d, label: d }))
  }, [experts])
  
  const filteredExperts = useMemo(() => {
    return experts.filter(expert => {
      const matchesSearch = searchText === '' || 
        expert.name.toLowerCase().includes(searchText.toLowerCase()) ||
        expert.department.toLowerCase().includes(searchText.toLowerCase()) ||
        expert.title.toLowerCase().includes(searchText.toLowerCase())
      
      const matchesDept = departmentFilter === '' || expert.department === departmentFilter
      
      return matchesSearch && matchesDept
    })
  }, [experts, searchText, departmentFilter])
  
  const columns: ColumnsType<Expert> = [
    {
      title: '姓名',
      dataIndex: 'name',
      width: 100,
      render: (name, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} src={record.avatar} />
          <Text strong>{name}</Text>
        </Space>
      )
    },
    {
      title: '科室',
      dataIndex: 'department',
      width: 120,
      filters: departments.map(d => ({ text: d.label, value: d.value })),
      onFilter: (value, record) => record.department === value,
      render: (dept) => <Tag color="blue">{dept}</Tag>
    },
    {
      title: '职称',
      dataIndex: 'title',
      width: 100,
    },
    {
      title: '专长',
      dataIndex: 'specialty',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (status) => {
        if (!status) return <Badge status="default" text="未知" />
        if (status === '空闲' || status === 'active') return <Badge status="success" text="可用" />
        if (status === '忙碌') return <Badge status="error" text="忙碌" />
        if (status === '离线') return <Badge status="default" text="离线" />
        return <Badge status="default" text={status} />
      }
    },
    {
      title: '操作',
      width: 80,
      render: (_, record) => {
        const isSelected = selectedRowKeys.includes(record.id)
        return (
          <Button 
            type={isSelected ? 'default' : 'primary'} 
            size="small"
            icon={isSelected ? <CheckCircleOutlined /> : <TeamOutlined />}
            onClick={() => {
              if (isSelected) {
                setSelectedRowKeys(selectedRowKeys.filter(k => k !== record.id))
              } else {
                setSelectedRowKeys([...selectedRowKeys, record.id])
              }
            }}
          >
            {isSelected ? '已选' : '选择'}
          </Button>
        )
      }
    }
  ]
  
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
    getCheckboxProps: () => ({
      style: { display: 'none' }
    })
  }
  
  const handleConfirm = () => {
    const selected = experts.filter(e => selectedRowKeys.includes(e.id))
    onConfirm(selected)
  }
  
  return (
    <Modal
      title="选择会诊专家"
      open={open}
      onCancel={onCancel}
      onOk={handleConfirm}
      okText="确认选择"
      cancelText="取消"
      width={800}
    >
      <div className="space-y-4">
        <div className="flex gap-4 items-center">
          <Input
            placeholder="搜索专家姓名、科室、职称"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          <Select
            placeholder="按科室筛选"
            value={departmentFilter}
            onChange={setDepartmentFilter}
            options={[{ value: '', label: '全部科室' }, ...departments]}
            style={{ width: 180 }}
            allowClear
          />
          <div className="flex-1 text-right">
            <Text type="secondary">已选择 {selectedRowKeys.length} 位专家</Text>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <Spin tip="加载中..." />
          </div>
        ) : (
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={filteredExperts}
            rowKey="id"
            size="small"
            pagination={{ pageSize: 10, showSizeChanger: true }}
            scroll={{ y: 400 }}
          />
        )}
        
        {selectedRowKeys.length > 0 && (
          <div className="border-t pt-3">
            <Text type="secondary" className="mb-2 d-block">已选专家：</Text>
            <div className="flex flex-wrap gap-2">
              {experts.filter(e => selectedRowKeys.includes(e.id)).map(expert => (
                <Tag 
                  key={expert.id} 
                  color="green"
                  closable
                  onClose={() => setSelectedRowKeys(selectedRowKeys.filter(k => k !== expert.id))}
                >
                  {expert.name} - {expert.department}
                </Tag>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
