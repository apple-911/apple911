import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Row, Col, Tree, Button, Modal, Form, Input, Select, message, Space, Typography, Tag, Popconfirm, Spin, Descriptions, Result } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, FolderOpenOutlined, BuildOutlined, TeamOutlined, ReloadOutlined } from '@ant-design/icons'
import type { DataNode } from 'antd/es/tree'
import type { Organization, OrganizationType } from '../../types'
import { supabase } from '../../lib/supabase'
import { hasPermission } from '../../utils/helpers'

const { Title, Text } = Typography

const orgTypeOptions: { value: OrganizationType; label: string; icon: typeof BuildOutlined }[] = [
  { value: 'organization', label: '组织', icon: BuildOutlined },
  { value: 'department', label: '科室', icon: FolderOpenOutlined },
  { value: 'team', label: '团队', icon: TeamOutlined },
]

// 将扁平数据转换为树形结构
const buildTree = (items: Organization[], parentId: string | null = null): Organization[] => {
  return items
    .filter(item => item.parent_id === parentId)
    .map(item => ({
      ...item,
      children: buildTree(items, item.id),
    }))
}

export default function Organizations() {
  const navigate = useNavigate()
  const [orgData, setOrgData] = useState<Organization[]>([])
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [parentOrg, setParentOrg] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [form] = Form.useForm()

  // 加载组织数据
  const loadOrgData = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) throw error

      const treeData = buildTree(data || [])
      setOrgData(treeData)
    } catch (err) {
      console.error('加载组织数据失败:', err)
      message.error('加载组织数据失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrgData()
  }, [])

  // 将组织数据转换为树节点
  const convertToTreeData = (orgs: Organization[]): DataNode[] => {
    return orgs.map(org => ({
      title: (
        <Space>
          {org.type === 'organization' ? <BuildOutlined /> : org.type === 'department' ? <FolderOpenOutlined /> : <TeamOutlined />}
          <span>{org.name}</span>
          <Tag color={org.status === 'active' ? 'green' : 'red'}>{org.status === 'active' ? '启用' : '禁用'}</Tag>
        </Space>
      ),
      key: org.id,
      children: org.children ? convertToTreeData(org.children) : undefined,
    }))
  }

  const handleSelect = (selectedKeys: (string | number | bigint)[], info: { node: DataNode }) => {
    const findOrg = (orgs: Organization[], id: string): Organization | null => {
      for (const org of orgs) {
        if (org.id === id) return org
        if (org.children) {
          const found = findOrg(org.children, id)
          if (found) return found
        }
      }
      return null
    }
    const org = findOrg(orgData, String(selectedKeys[0]))
    setSelectedOrg(org || null)
  }

  const handleAdd = () => {
    setIsEdit(false)
    setParentOrg(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleAddChild = () => {
    if (!selectedOrg) return
    setIsEdit(false)
    setParentOrg(selectedOrg.id)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = () => {
    if (!selectedOrg) return
    setIsEdit(true)
    setParentOrg(selectedOrg.parent_id || null)
    form.setFieldsValue({
      name: selectedOrg.name,
      code: selectedOrg.code,
      type: selectedOrg.type,
      description: selectedOrg.description,
      status: selectedOrg.status,
    })
    setModalVisible(true)
  }

  const handleDelete = () => {
    if (!selectedOrg) return
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除"${selectedOrg.name}"吗？删除后将影响所有关联的用户和数据。`,
      onOk: async () => {
        try {
          const { error } = await supabase
            .from('organizations')
            .delete()
            .eq('id', selectedOrg.id)

          if (error) throw error

          message.success('已删除')
          setSelectedOrg(null)
          loadOrgData()
        } catch (err) {
          console.error('删除组织失败:', err)
          message.error('删除组织失败')
        }
      },
    })
  }

  const handleSubmit = () => {
    form.validateFields().then(async values => {
      try {
        if (isEdit && selectedOrg) {
          // 更新组织
          const { error } = await supabase
            .from('organizations')
            .update({
              name: values.name,
              code: values.code,
              type: values.type,
              description: values.description,
              status: values.status,
              parent_id: parentOrg || null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', selectedOrg.id)

          if (error) throw error
          message.success('组织信息已更新')
        } else {
          // 创建新组织
          const { error } = await supabase
            .from('organizations')
            .insert({
              name: values.name,
              code: values.code,
              type: values.type,
              description: values.description,
              status: values.status,
              parent_id: parentOrg || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              sort_order: 0,
            })

          if (error) throw error
          message.success('组织已创建')
        }
        setModalVisible(false)
        loadOrgData()
      } catch (err) {
        console.error('保存组织失败:', err)
        message.error('保存组织失败')
      }
    })
  }

  // 权限检查
  if (!hasPermission('perm-admin-organizations')) {
    return (
      <Result
        status="403"
        title="暂无权限"
        subTitle="抱歉，您没有权限访问组织机构管理。如需获取权限，请联系系统管理员。"
        extra={<Button type="primary" onClick={() => navigate(-1)}>返回</Button>}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Title level={4} className="!mb-0">组织机构管理</Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadOrgData} loading={loading}>刷新</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增组织</Button>
        </Space>
      </div>

      <Row gutter={16}>
        {/* 左侧组织树 */}
        <Col span={10}>
          <Card title="组织架构">
            {loading ? (
              <div className="flex justify-center py-8">
                <Spin />
              </div>
            ) : (
              <Tree
                showLine
                defaultExpandAll
                treeData={convertToTreeData(orgData)}
                onSelect={handleSelect}
                selectedKeys={selectedOrg ? [selectedOrg.id] : []}
              />
            )}
          </Card>
        </Col>

        {/* 右侧详情 */}
        <Col span={14}>
          <Card
            title={selectedOrg ? (
              <Space>
                {selectedOrg.type === 'organization' ? <BuildOutlined /> : selectedOrg.type === 'department' ? <FolderOpenOutlined /> : <TeamOutlined />}
                <span>{selectedOrg.name}</span>
              </Space>
            ) : '请选择组织'}
            extra={selectedOrg && (
              <Space>
                <Button icon={<PlusOutlined />} onClick={handleAddChild}>新增子组织</Button>
                <Button icon={<EditOutlined />} onClick={handleEdit}>编辑</Button>
                <Popconfirm
                  title="确认删除"
                  description={`确定要删除"${selectedOrg.name}"吗？`}
                  onConfirm={handleDelete}
                >
                  <Button danger icon={<DeleteOutlined />}>删除</Button>
                </Popconfirm>
              </Space>
            )}
          >
            {selectedOrg ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-lg bg-gray-50">
                    {selectedOrg.type === 'organization' ? <BuildOutlined className="text-4xl mb-4" /> : selectedOrg.type === 'department' ? <FolderOpenOutlined className="text-4xl mb-4" /> : <TeamOutlined className="text-4xl mb-4" />}
                    <div className="text-center">
                      <Text strong>{selectedOrg.name}</Text>
                      <div className="text-sm text-gray-500">{selectedOrg.code}</div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <Descriptions bordered column={2} size="small">
                      <Descriptions.Item label="类型">
                        {orgTypeOptions.find(o => o.value === selectedOrg.type)?.label}
                      </Descriptions.Item>
                      <Descriptions.Item label="状态">
                        <Tag color={selectedOrg.status === 'active' ? 'green' : 'red'}>
                          {selectedOrg.status === 'active' ? '启用' : '禁用'}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="上级组织" span={2}>
                        {selectedOrg.parent_id ? '有上级组织' : '顶级组织'}
                      </Descriptions.Item>
                      <Descriptions.Item label="创建时间" span={2}>
                        {selectedOrg.created_at ? new Date(selectedOrg.created_at).toLocaleString() : '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label="更新时间" span={2}>
                        {selectedOrg.updated_at ? new Date(selectedOrg.updated_at).toLocaleString() : '-'}
                      </Descriptions.Item>
                    </Descriptions>
                  </div>
                </div>
                {selectedOrg.description && (
                  <Card size="small" title="描述">
                    <Text>{selectedOrg.description}</Text>
                  </Card>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <FolderOpenOutlined className="text-6xl text-gray-300 mb-4" />
                <Text type="secondary">请从左侧选择一个组织查看详情</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* 新增/编辑模态框 */}
      <Modal
        title={isEdit ? '编辑组织' : '新增组织'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="组织名称"
            rules={[{ required: true, message: '请输入组织名称' }]}
          >
            <Input placeholder="请输入组织名称" />
          </Form.Item>

          <Form.Item
            name="code"
            label="组织编码"
            rules={[{ required: true, message: '请输入组织编码' }]}
          >
            <Input placeholder="请输入组织编码" />
          </Form.Item>

          <Form.Item
            name="type"
            label="组织类型"
            rules={[{ required: true, message: '请选择组织类型' }]}
          >
            <Select placeholder="请选择组织类型">
              {orgTypeOptions.map(opt => (
                <Select.Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="description" label="描述">
            <Input.TextArea placeholder="请输入组织描述" rows={3} />
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Select.Option value="active">启用</Select.Option>
              <Select.Option value="inactive">禁用</Select.Option>
            </Select>
          </Form.Item>

          {parentOrg && (
            <Form.Item label="上级组织">
              <Text type="secondary">当前选择的上级组织: {selectedOrg?.name}</Text>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  )
}
