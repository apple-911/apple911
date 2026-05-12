import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Row, Col, List, Button, Tag, Space, Typography, Modal, Tree, Switch, message, Input, Divider, Avatar, Form, Select, Spin, Result } from 'antd'
import { PlusOutlined, CopyOutlined, SaveOutlined, UserOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons'
import type { DataNode } from 'antd/es/tree'
import type { Role, Organization } from '../../types'
import { supabase } from '../../lib/supabase'
import { hasPermission } from '../../utils/helpers'

const { Title, Text } = Typography

// 权限树定义（与数据库中的权限 ID 保持一致）
const permissionTree: DataNode[] = [
  {
    title: '会诊管理',
    key: 'perm-consultation',
    children: [
      { title: '申请会诊', key: 'perm-consultation-apply' },
      { title: '我的申请', key: 'perm-consultation-my-applies' },
      { title: '待审核列表', key: 'perm-consultation-pending-review' },
      { title: '排期管理', key: 'perm-consultation-schedule' },
      { title: '我的待参会', key: 'perm-consultation-my-meetings' },
      { title: '会诊详情', key: 'perm-consultation-detail' },
      { title: '会诊进度', key: 'perm-consultation-tracking' },
      { title: '材料管理', key: 'perm-consultation-material' },
      { title: '会诊确认', key: 'perm-consultation-confirm' },
    ],
  },
  {
    title: '患者管理',
    key: 'perm-patient',
    children: [
      { title: '患者列表', key: 'perm-patient-list' },
      { title: '患者360视图', key: 'perm-patient-360' },
    ],
  },
  {
    title: '报告管理',
    key: 'perm-report',
    children: [
      { title: '报告列表', key: 'perm-report-list' },
      { title: '报告编辑', key: 'perm-report-edit' },
    ],
  },
  {
    title: '随访管理',
    key: 'perm-followup',
    children: [
      { title: '随访计划', key: 'perm-followup-list' },
      { title: '随访执行', key: 'perm-followup-execute' },
      { title: '疗效评估', key: 'perm-followup-assessment' },
    ],
  },
  {
    title: '质控管理',
    key: 'perm-quality',
    children: [
      { title: '质控仪表盘', key: 'perm-quality-dashboard' },
      { title: '质控任务', key: 'perm-quality-tasks' },
      { title: '统计分析', key: 'perm-quality-statistics' },
    ],
  },
  {
    title: '病案库',
    key: 'perm-case-library',
    children: [
      { title: '病案库首页', key: 'perm-case-library-index' },
      { title: '病案检索', key: 'perm-case-library-search' },
      { title: '典型病例', key: 'perm-case-library-typical' },
      { title: '统计分析', key: 'perm-case-library-statistics' },
      { title: '我的收藏', key: 'perm-case-library-favorites' },
    ],
  },
  {
    title: 'AI功能',
    key: 'perm-ai',
    children: [
      { title: '患者筛查', key: 'perm-ai-screening' },
    ],
  },
  {
    title: '系统管理',
    key: 'perm-admin',
    children: [
      { title: '组织机构', key: 'perm-admin-org' },
      { title: '用户管理', key: 'perm-admin-users' },
      { title: '角色权限', key: 'perm-admin-roles' },
      { title: '专家库', key: 'perm-admin-experts' },
      { title: '团队管理', key: 'perm-admin-teams' },
      { title: '系统日志', key: 'perm-admin-logs' },
      { title: '审计日志', key: 'perm-admin-audit-logs' },
    ],
  },
]

export default function Roles() {
  const navigate = useNavigate()
  const [roles, setRoles] = useState<Role[]>([])
  const [orgs, setOrgs] = useState<Organization[]>([])
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [checkedKeys, setCheckedKeys] = useState<string[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form] = Form.useForm()

  // 获取组织名称
  const getOrgName = (orgId?: string) => orgId ? orgs.find(o => o.id === orgId)?.name || '-' : '-'

  // 加载数据
  const loadData = async () => {
    try {
      setLoading(true)
      
      // 并行加载角色和组织数据
      const [rolesResult, orgsResult] = await Promise.all([
        supabase.from('roles').select('*').order('sort_order', { ascending: true }),
        supabase.from('organizations').select('*').order('sort_order', { ascending: true }),
      ])

      if (rolesResult.error) throw rolesResult.error
      if (orgsResult.error) throw orgsResult.error

      const rolesData = rolesResult.data || []
      setRoles(rolesData)
      setOrgs(orgsResult.data || [])

      // 如果有角色，选择第一个并加载其权限
      if (rolesData.length > 0) {
        await handleSelectRole(rolesData[0])
      }
    } catch (err) {
      console.error('加载数据失败:', err)
      message.error('加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  // 获取权限的父节点
  const getParentPermission = (permissionId: string): string | null => {
    // 根据权限 ID 推断父节点
    const parentMap: Record<string, string> = {
      'perm-consultation-apply': 'perm-consultation',
      'perm-consultation-my-applies': 'perm-consultation',
      'perm-consultation-pending-review': 'perm-consultation',
      'perm-consultation-schedule': 'perm-consultation',
      'perm-consultation-my-meetings': 'perm-consultation',
      'perm-consultation-detail': 'perm-consultation',
      'perm-consultation-tracking': 'perm-consultation',
      'perm-consultation-material': 'perm-consultation',
      'perm-consultation-confirm': 'perm-consultation',
      'perm-patient-list': 'perm-patient',
      'perm-patient-360': 'perm-patient',
      'perm-report-list': 'perm-report',
      'perm-report-edit': 'perm-report',
      'perm-followup-list': 'perm-followup',
      'perm-followup-execute': 'perm-followup',
      'perm-followup-assessment': 'perm-followup',
      'perm-quality-dashboard': 'perm-quality',
      'perm-quality-tasks': 'perm-quality',
      'perm-quality-statistics': 'perm-quality',
      'perm-case-library-index': 'perm-case-library',
      'perm-case-library-search': 'perm-case-library',
      'perm-case-library-typical': 'perm-case-library',
      'perm-case-library-statistics': 'perm-case-library',
      'perm-case-library-favorites': 'perm-case-library',
      'perm-ai-screening': 'perm-ai',
      'perm-admin-org': 'perm-admin',
      'perm-admin-users': 'perm-admin',
      'perm-admin-roles': 'perm-admin',
      'perm-admin-experts': 'perm-admin',
      'perm-admin-teams': 'perm-admin',
      'perm-admin-logs': 'perm-admin',
      'perm-admin-audit-logs': 'perm-admin',
    }
    return parentMap[permissionId] || null
  }

  // 加载角色权限
  const loadRolePermissions = async (roleId: string) => {
    try {
      console.log(`正在加载角色 ${roleId} 的权限...`)
      
      const { data, error } = await supabase
        .from('role_permissions')
        .select('permission_id')
        .eq('role_id', roleId)

      if (error) {
        console.error('Supabase 查询错误:', error)
        throw error
      }

      const permissionIds = (data || []).map(r => r.permission_id)
      console.log(`查询到的权限ID:`, permissionIds)
      
      // 添加父节点权限以正确显示半选状态
      const allKeys = new Set<string>(permissionIds)
      permissionIds.forEach(id => {
        const parent = getParentPermission(id)
        if (parent) {
          allKeys.add(parent)
        }
      })

      const finalKeys = Array.from(allKeys)
      console.log(`最终的 checkedKeys:`, finalKeys)
      setCheckedKeys(finalKeys)
    } catch (err) {
      console.error('加载角色权限失败:', err)
      setCheckedKeys([])
    }
  }

  // 选择角色
  const handleSelectRole = async (role: Role) => {
    setSelectedRole(role)
    await loadRolePermissions(role.id)
  }

  const handleCopyRole = () => {
    if (!selectedRole) return

    Modal.confirm({
      title: '复制角色权限',
      content: `确定要复制"${selectedRole.name}"的权限作为新角色吗？`,
      onOk: () => {
        setIsEdit(false)
        form.setFieldsValue({
          name: `${selectedRole.name}（副本）`,
          code: `${selectedRole.code}_COPY`,
          description: selectedRole.description,
          org_required: selectedRole.org_required,
          restricted_org_id: selectedRole.restricted_org_id,
          status: 'active',
        })
        setModalVisible(true)
      }
    })
  }

  // 保存权限配置
  const handleSave = async () => {
    if (!selectedRole) return

    try {
      // 删除旧权限
      const deleteError = await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', selectedRole.id)

      if (deleteError.error) throw deleteError.error

      // 插入新权限
      if (checkedKeys.length > 0) {
        const permissionsToInsert = checkedKeys.map(permissionId => ({
          role_id: selectedRole.id,
          permission_id: permissionId,
          created_at: new Date().toISOString(),
        }))

        const insertError = await supabase
          .from('role_permissions')
          .insert(permissionsToInsert)

        if (insertError.error) throw insertError.error
      }

      message.success('权限配置已保存')
    } catch (err) {
      console.error('保存权限失败:', err)
      message.error('保存权限失败')
    }
  }

  const handleAddRole = () => {
    setIsEdit(false)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEditRole = () => {
    if (!selectedRole) return

    setIsEdit(true)
    form.setFieldsValue({
      name: selectedRole.name,
      code: selectedRole.code,
      description: selectedRole.description,
      org_required: selectedRole.org_required,
      restricted_org_id: selectedRole.restricted_org_id,
      status: selectedRole.status,
    })
    setModalVisible(true)
  }

  const handleDeleteRole = () => {
    if (!selectedRole) return

    Modal.confirm({
      title: '确认删除',
      content: `确定要删除"${selectedRole.name}"角色吗？`,
      onOk: async () => {
        try {
          // 删除角色关联的权限
          const deletePermissionsError = await supabase
            .from('role_permissions')
            .delete()
            .eq('role_id', selectedRole.id)

          if (deletePermissionsError.error) throw deletePermissionsError.error

          // 删除角色关联的用户角色
          const deleteUserRolesError = await supabase
            .from('user_roles')
            .delete()
            .eq('role_id', selectedRole.id)

          if (deleteUserRolesError.error) throw deleteUserRolesError.error

          // 删除角色
          const deleteRoleError = await supabase
            .from('roles')
            .delete()
            .eq('id', selectedRole.id)

          if (deleteRoleError.error) throw deleteRoleError.error

          // 更新状态
          const newRoles = roles.filter(r => r.id !== selectedRole.id)
          setRoles(newRoles)
          
          if (newRoles.length > 0) {
            await handleSelectRole(newRoles[0])
          } else {
            setSelectedRole(null)
            setCheckedKeys([])
          }

          message.success('已删除')
        } catch (err) {
          console.error('删除角色失败:', err)
          message.error('删除角色失败')
        }
      }
    })
  }

  const handleSubmit = () => {
    form.validateFields().then(async values => {
      try {
        if (isEdit && selectedRole) {
          // 更新角色
          const { error } = await supabase
            .from('roles')
            .update({ ...values, updated_at: new Date().toISOString() })
            .eq('id', selectedRole.id)

          if (error) throw error

          setRoles(roles.map(r => r.id === selectedRole.id ? { ...r, ...values } : r))
          message.success('角色信息已更新')
        } else {
          // 创建新角色
          const newRole: Role = {
            ...values,
            id: `role-${Date.now()}`,
            sort_order: roles.length + 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }

          const { error } = await supabase
            .from('roles')
            .insert(newRole)

          if (error) throw error

          setRoles([...roles, newRole])
          message.success('角色已创建')
        }
        setModalVisible(false)
      } catch (err) {
        console.error('保存角色失败:', err)
        message.error('保存角色失败')
      }
    })
  }

  useEffect(() => {
    loadData()
  }, [])

  // 权限检查
  if (!hasPermission('perm-admin-roles')) {
    return (
      <Result
        status="403"
        title="暂无权限"
        subTitle="抱歉，您没有权限访问角色权限配置。如需获取权限，请联系系统管理员。"
        extra={<Button type="primary" onClick={() => navigate(-1)}>返回</Button>}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Title level={4} className="!mb-0">角色权限配置</Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading}>刷新</Button>
          <Button icon={<CopyOutlined />} onClick={handleCopyRole} disabled={!selectedRole}>复制角色</Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} disabled={!selectedRole}>保存配置</Button>
        </Space>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Spin />
        </div>
      ) : (
        <Row gutter={16}>
          <Col span={6}>
            <Card
              title="角色列表"
              extra={<Button type="text" icon={<PlusOutlined />} onClick={handleAddRole} />}
            >
              <List
                dataSource={roles}
                renderItem={(role) => (
                  <List.Item
                    className={`cursor-pointer hover:bg-gray-50 ${selectedRole?.id === role.id ? 'bg-blue-50' : ''}`}
                    onClick={() => handleSelectRole(role)}
                    actions={selectedRole?.id === role.id ? [
                      <Button key="edit" size="small" type="text" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); handleEditRole(); }} />,
                      <Button key="delete" size="small" type="text" danger icon={<DeleteOutlined />} onClick={(e) => { e.stopPropagation(); handleDeleteRole(); }} />
                    ] : []}
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} className={selectedRole?.id === role.id ? '!bg-blue-500' : ''} />}
                      title={role.name}
                      description={
                        <div className="text-xs">
                          <Text type="secondary">{role.description}</Text>
                          {role.restricted_org_id && (
                            <Tag color="orange" className="ml-2">限制: {getOrgName(role.restricted_org_id)}</Tag>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          <Col span={18}>
            <Card
              title={
                <Space>
                  <Text strong>权限配置：</Text>
                  <Tag color="blue">{selectedRole?.name || '请选择角色'}</Tag>
                  {selectedRole?.restricted_org_id && (
                    <Tag color="orange">限制组织: {getOrgName(selectedRole.restricted_org_id)}</Tag>
                  )}
                </Space>
              }
            >
              <div className="mb-4 p-3 bg-yellow-50 rounded">
                <Text type="secondary">
                  提示：修改权限后，当前在线用户需要重新登录才能生效
                </Text>
              </div>

              {selectedRole ? (
                <>
                  <Tree
                    checkable
                    defaultExpandAll
                    treeData={permissionTree}
                    checkedKeys={checkedKeys}
                    onCheck={(keys) => setCheckedKeys(keys as string[])}
                  />

                  <Divider />

                  <div className="flex justify-between items-center">
                    <Text>已选择 {checkedKeys.length} 项权限</Text>
                    <Space>
                      <Button onClick={() => setCheckedKeys([])}>清空</Button>
                      <Button type="primary" onClick={handleSave}>保存</Button>
                    </Space>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  请从左侧选择一个角色进行权限配置
                </div>
              )}
            </Card>
          </Col>
        </Row>
      )}

      <Modal
        title={isEdit ? '编辑角色' : '新增角色'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="角色名称" name="name" rules={[{ required: true }]}>
            <Input placeholder="请输入角色名称" />
          </Form.Item>
          <Form.Item label="角色编码" name="code" rules={[{ required: true }]}>
            <Input placeholder="请输入角色编码（唯一标识）" />
          </Form.Item>
          <Form.Item label="角色描述" name="description">
            <Input.TextArea rows={3} placeholder="请输入角色描述" />
          </Form.Item>
          <Form.Item label="是否必须关联组织" name="org_required" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
          <Form.Item label="限制组织（仅该组织成员可分配此角色）" name="restricted_org_id">
            <Select placeholder="选择限制的组织（可选）">
              <Select.Option value="">不限制</Select.Option>
              {orgs.filter(o => o.type === 'department').map(org => (
                <Select.Option key={org.id} value={org.id}>{org.name}</Select.Option>
              ))}
            </Select>
            <Text type="secondary" className="block mt-1 text-sm">
              例如：MDT秘书和质控员应限制为MDT中心
            </Text>
          </Form.Item>
          <Form.Item label="状态" name="status" initialValue="active">
            <Select>
              <Select.Option value="active">启用</Select.Option>
              <Select.Option value="inactive">禁用</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
