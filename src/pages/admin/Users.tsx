import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Table, Button, Tag, Space, Typography, Modal, Form, Input, Select, Avatar, message, Drawer, List, Divider, Spin, Result } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, LockOutlined, UnlockOutlined, UserAddOutlined, KeyOutlined, ReloadOutlined } from '@ant-design/icons'
import type { User, Role, Organization } from '../../types'
import type { ColumnsType } from 'antd/es/table'
import { supabase } from '../../lib/supabase'
import { hasPermission } from '../../utils/helpers'

const { Title, Text } = Typography

export default function Users() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [orgs, setOrgs] = useState<Organization[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [roleDrawerVisible, setRoleDrawerVisible] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [selectedUserRoles, setSelectedUserRoles] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [form] = Form.useForm()

  // 获取角色名称
  const getRoleName = (roleId: string) => roles.find(r => r.id === roleId)?.name || roleId

  // 获取组织名称
  const getOrgName = (orgId?: string) => orgId ? orgs.find(o => o.id === orgId)?.name || '-' : '无'

  // 获取受限制的角色（必须在 MDT 中心）
  const getRestrictedRoles = () => roles.filter(r => r.restricted_org_id)

  // 获取不受限制的角色
  const getUnrestrictedRoles = () => roles.filter(r => !r.restricted_org_id)

  // 获取科室主任列表（用于选择直属上级）
  const getDirectors = () => {
    return users.filter(u => 
      u.position?.includes('主任') && u.status === 'active'
    )
  }

  // 获取上级姓名
  const getManagerName = (managerId?: string) => {
    if (!managerId) return '-'
    const manager = users.find(u => u.id === managerId)
    return manager?.name || '-'
  }

  // 加载数据
  const loadData = async () => {
    try {
      setLoading(true)
      
      // 并行加载用户、角色和组织数据
      const [usersResult, rolesResult, orgsResult] = await Promise.all([
        supabase.from('users').select('*').order('created_at', { ascending: false }),
        supabase.from('roles').select('*').order('sort_order', { ascending: true }),
        supabase.from('organizations').select('*').order('sort_order', { ascending: true }),
      ])

      if (usersResult.error) throw usersResult.error
      if (rolesResult.error) throw rolesResult.error
      if (orgsResult.error) throw orgsResult.error

      setUsers(usersResult.data || [])
      setRoles(rolesResult.data || [])
      setOrgs(orgsResult.data || [])
    } catch (err) {
      console.error('加载数据失败:', err)
      message.error('加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAdd = () => {
    setEditingUser(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    form.setFieldsValue({
      username: user.username,
      name: user.name,
      email: user.email,
      phone: user.phone,
      org_id: user.org_id,
      position: user.position,
      status: user.status,
      manager_id: user.manager_id,
    })
    setModalVisible(true)
  }

  // 获取用户的所有上级主任（从 user_managers 表）
  const getUserManagers = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_managers')
        .select('manager_id, is_primary')
        .eq('user_id', userId)
      
      if (error) throw error
      return data || []
    } catch (err) {
      console.error('获取用户上级失败:', err)
      return []
    }
  }

  // 保存用户的多重上级关系
  const saveUserManagers = async (userId: string, managerIds: string[], primaryManagerId?: string) => {
    try {
      // 删除旧关系
      await supabase
        .from('user_managers')
        .delete()
        .eq('user_id', userId)
      
      // 插入新关系
      if (managerIds.length > 0) {
        const inserts = managerIds.map(managerId => ({
          user_id: userId,
          manager_id: managerId,
          is_primary: managerId === primaryManagerId,
        }))
        
        const { error } = await supabase
          .from('user_managers')
          .insert(inserts)
        
        if (error) throw error
      }
    } catch (err) {
      console.error('保存用户上级失败:', err)
      throw err
    }
  }

  const handleDelete = (userId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该用户吗？',
      onOk: async () => {
        try {
          const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', userId)

          if (error) throw error

          setUsers(users.filter(u => u.id !== userId))
          message.success('已删除')
        } catch (err) {
          console.error('删除用户失败:', err)
          message.error('删除用户失败')
        }
      },
    })
  }

  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active'
    try {
      const { error } = await supabase
        .from('users')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', user.id)

      if (error) throw error

      setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u))
      message.success(`用户已${newStatus === 'active' ? '启用' : '禁用'}`)
    } catch (err) {
      console.error('更新用户状态失败:', err)
      message.error('更新用户状态失败')
    }
  }

  const handleSubmit = () => {
    form.validateFields().then(async values => {
      try {
        if (editingUser) {
          // 更新用户
          const { error } = await supabase
            .from('users')
            .update({ ...values, updated_at: new Date().toISOString() })
            .eq('id', editingUser.id)

          if (error) throw error

          setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...values } : u))
          
          // 保存多重上级关系（如果选择了多个主任）
          if (values.manager_id) {
            await saveUserManagers(editingUser.id, [values.manager_id], values.manager_id)
          } else {
            // 如果清空了上级，也删除 user_managers 表的记录
            await supabase.from('user_managers').delete().eq('user_id', editingUser.id)
          }
          
          message.success('用户信息已更新')
        } else {
          // 创建新用户
          const { error } = await supabase
            .from('users')
            .insert({
              ...values,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })

          if (error) throw error

          loadData()
          message.success('用户已创建')
        }
        setModalVisible(false)
      } catch (err) {
        console.error('保存用户失败:', err)
        message.error('保存用户失败')
      }
    })
  }

  const handleOpenRoleDrawer = async (user: User) => {
    setEditingUser(user)
    
    // 从数据库获取用户角色
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role_id')
        .eq('user_id', user.id)

      if (error) throw error

      setSelectedUserRoles((data || []).map(r => r.role_id))
    } catch (err) {
      console.error('获取用户角色失败:', err)
      setSelectedUserRoles([])
    }
    
    setRoleDrawerVisible(true)
  }

  const handleSaveRoles = async () => {
    if (!editingUser) return

    try {
      // 删除旧角色
      const deleteError = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', editingUser.id)

      if (deleteError.error) throw deleteError.error

      // 插入新角色
      if (selectedUserRoles.length > 0) {
        const rolesToInsert = selectedUserRoles.map(roleId => ({
          user_id: editingUser.id,
          role_id: roleId,
          created_at: new Date().toISOString(),
        }))

        const insertError = await supabase
          .from('user_roles')
          .insert(rolesToInsert)

        if (insertError.error) throw insertError.error
      }

      message.success('角色已更新')
      setRoleDrawerVisible(false)
    } catch (err) {
      console.error('保存角色失败:', err)
      message.error('保存角色失败')
    }
  }

  const columns: ColumnsType<User> = [
    {
      title: '姓名',
      dataIndex: 'name',
      render: (name, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} className="!bg-medical-blue" />
          {name}
        </Space>
      ),
    },
    { title: '用户名', dataIndex: 'username' },
    { title: '科室', dataIndex: 'org_id', render: (id) => <Tag>{getOrgName(id)}</Tag> },
    { title: '职位', dataIndex: 'position' },
    { 
      title: '直属上级', 
      dataIndex: 'manager_id', 
      render: (managerId) => {
        const name = getManagerName(managerId)
        return name === '-' ? <Text type="secondary">无</Text> : <Tag color="blue">{name}</Tag>
      }
    },
    { title: '邮箱', dataIndex: 'email' },
    { title: '电话', dataIndex: 'phone' },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status, record) => (
        <Space>
          <Tag color={status === 'active' ? 'green' : 'red'}>
            {status === 'active' ? '启用' : '禁用'}
          </Tag>
          <Button
            size="small"
            icon={status === 'active' ? <LockOutlined /> : <UnlockOutlined />}
            onClick={() => handleToggleStatus(record)}
          >
            {status === 'active' ? '禁用' : '启用'}
          </Button>
        </Space>
      ),
    },
    {
      title: '操作',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Button size="small" icon={<UserAddOutlined />} onClick={() => handleOpenRoleDrawer(record)}>分配角色</Button>
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>删除</Button>
        </Space>
      ),
    },
  ]

  // 根据角色限制过滤组织选项
  const getOrgOptions = (roleId?: string) => {
    if (!roleId) return orgs
    const role = roles.find(r => r.id === roleId)
    if (role?.restricted_org_id) {
      return orgs.filter(o => o.id === role.restricted_org_id)
    }
    return orgs
  }

  // 权限检查
  if (!hasPermission('perm-admin-users')) {
    return (
      <Result
        status="403"
        title="暂无权限"
        subTitle="抱歉，您没有权限访问用户管理。如需获取权限，请联系系统管理员。"
        extra={<Button type="primary" onClick={() => navigate(-1)}>返回</Button>}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Title level={4} className="!mb-0">用户管理</Title>
        <Space>
          <Button icon={<KeyOutlined />}>重置密码</Button>
          <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading}>刷新</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增用户</Button>
        </Space>
      </div>

      <Card>
        {loading ? (
          <div className="flex justify-center py-8">
            <Spin />
          </div>
        ) : (
          <>
            <Space className="mb-4">
              <Input.Search placeholder="搜索用户名/姓名" allowClear style={{ width: 250 }} />
              <Select placeholder="筛选科室" allowClear style={{ width: 150 }}>
                {orgs.map(org => (
                  <Select.Option key={org.id} value={org.id}>{org.name}</Select.Option>
                ))}
              </Select>
              <Select placeholder="筛选状态" allowClear style={{ width: 120 }}>
                <Select.Option value="active">启用</Select.Option>
                <Select.Option value="inactive">禁用</Select.Option>
              </Select>
            </Space>

            <Table columns={columns} dataSource={users} rowKey="id" pagination={{ pageSize: 10 }} />
          </>
        )}
      </Card>

      {/* 添加/编辑用户弹窗 */}
      <Modal
        title={editingUser ? '编辑用户' : '新增用户'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="用户名" name="username" rules={[{ required: true }]}>
            <Input placeholder="请输入用户名" />
          </Form.Item>
          {!editingUser && (
            <Form.Item label="密码" name="password" rules={[{ required: true }]}>
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          )}
          <Form.Item label="姓名" name="name" rules={[{ required: true }]}>
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item label="邮箱" name="email">
            <Input type="email" placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item label="电话" name="phone">
            <Input placeholder="请输入电话号码" />
          </Form.Item>
          <Form.Item label="所属科室" name="org_id">
            <Select placeholder="选择科室">
              {orgs.map(org => (
                <Select.Option key={org.id} value={org.id}>{org.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="直属上级" name="manager_id">
            <Select placeholder="选择直属上级（科室主任）" allowClear>
              {getDirectors().map(director => (
                <Select.Option key={director.id} value={director.id}>
                  {director.name} - {director.position} ({orgs.find(o => o.id === director.org_id)?.name})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="职位" name="position">
            <Input placeholder="请输入职位" />
          </Form.Item>
          <Form.Item label="状态" name="status" initialValue="active">
            <Select>
              <Select.Option value="active">启用</Select.Option>
              <Select.Option value="inactive">禁用</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 角色分配抽屉 */}
      <Drawer
        title="分配角色"
        placement="right"
        width={400}
        open={roleDrawerVisible}
        onClose={() => setRoleDrawerVisible(false)}
      >
        {editingUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar icon={<UserOutlined />} className="!bg-medical-blue" size={64} />
              <div>
                <Title level={5} className="!mb-0">{editingUser.name}</Title>
                <Text type="secondary">{editingUser.username}</Text>
              </div>
            </div>

            <Divider />

            <Title level={5}>角色列表</Title>

            {/* 受限角色 */}
            {getRestrictedRoles().length > 0 && (
              <div className="space-y-2">
                <Text type="secondary" className="text-sm">MDT中心专属角色</Text>
                <List
                  dataSource={getRestrictedRoles()}
                  renderItem={role => (
                    <List.Item
                      key={role.id}
                      extra={
                        <Button
                          type={selectedUserRoles.includes(role.id) ? 'primary' : 'default'}
                          size="small"
                          onClick={() => {
                            if (selectedUserRoles.includes(role.id)) {
                              setSelectedUserRoles(selectedUserRoles.filter(r => r !== role.id))
                            } else {
                              setSelectedUserRoles([...selectedUserRoles, role.id])
                            }
                          }}
                        >
                          {selectedUserRoles.includes(role.id) ? '已分配' : '分配'}
                        </Button>
                      }
                    >
                      <List.Item.Meta
                        title={role.name}
                        description={role.description || '无描述'}
                      />
                    </List.Item>
                  )}
                />
              </div>
            )}

            {/* 不受限角色 */}
            {getUnrestrictedRoles().length > 0 && (
              <div className="space-y-2">
                <Text type="secondary" className="text-sm">通用角色</Text>
                <List
                  dataSource={getUnrestrictedRoles()}
                  renderItem={role => (
                    <List.Item
                      key={role.id}
                      extra={
                        <Button
                          type={selectedUserRoles.includes(role.id) ? 'primary' : 'default'}
                          size="small"
                          onClick={() => {
                            if (selectedUserRoles.includes(role.id)) {
                              setSelectedUserRoles(selectedUserRoles.filter(r => r !== role.id))
                            } else {
                              setSelectedUserRoles([...selectedUserRoles, role.id])
                            }
                          }}
                        >
                          {selectedUserRoles.includes(role.id) ? '已分配' : '分配'}
                        </Button>
                      }
                    >
                      <List.Item.Meta
                        title={role.name}
                        description={role.description || '无描述'}
                      />
                    </List.Item>
                  )}
                />
              </div>
            )}

            <Divider />

            <Space className="w-full justify-end">
              <Button onClick={() => setRoleDrawerVisible(false)}>取消</Button>
              <Button type="primary" onClick={handleSaveRoles}>保存</Button>
            </Space>
          </div>
        )}
      </Drawer>
    </div>
  )
}
