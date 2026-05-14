import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Checkbox, message, Select, Divider, Card } from 'antd'
import {
  UserOutlined,
  LockOutlined,
  SafetyOutlined,
  QqOutlined,
  WechatOutlined
} from '@ant-design/icons'
import { useAppStore, Role } from '../../stores/appStore'
import { supabase } from '../../lib/supabase'
import { setCurrentUser, CurrentUser } from '../../utils/helpers'
import { loadCodeTables } from '../../utils/codeTable'

interface LoginForm {
  username: string
  password: string
  role: Role
  userId?: string  // 新增：用户 ID
}

interface UserOption {
  value: string
  label: string
  username: string
}

const roleOptions: { value: Role; label: string }[] = [
  { value: 'apply_doctor', label: '申请医生' },
  { value: 'director', label: '主任医生' },
  { value: 'secretary', label: 'MDT 秘书' },
  { value: 'expert', label: '会诊专家' },
  { value: 'quality_controller', label: '质控员' },
  { value: 'admin', label: '系统管理员' },
  { value: 'super_admin', label: '超级管理员' },
]

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const { setUser, setRole } = useAppStore()
  const [userOptions, setUserOptions] = useState<UserOption[]>([])
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)

  // 检查是否已登录（从 localStorage 恢复）
  useEffect(() => {
    const savedUser = localStorage.getItem('mdt_user')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        // 同步到权限验证模块
        if (userData.id && userData.permissions) {
          setCurrentUser({
            id: userData.id,
            name: userData.name,
            org_id: userData.org_id,
            roles: [userData.role],
            permissions: userData.permissions || [],
          })
        }
        setUser(userData)
        setRole(userData.role)
        navigate('/workbench')
      } catch (e) {
        localStorage.removeItem('mdt_user')
      }
    }
  }, [navigate, setUser, setRole])

  // 测试账号配置
  const testAccounts: Record<Role, { username: string; password: string }> = {
    'apply_doctor': { username: 'doctor', password: '123456' },
    'director': { username: 'director', password: '123456' },
    'secretary': { username: 'secretary', password: '123456' },
    'expert': { username: 'expert', password: '123456' },
    'quality_controller': { username: 'qa', password: '123456' },
    'admin': { username: 'admin', password: '123456' },
    'super_admin': { username: 'superadmin', password: '123456' },
  }

  // 根据角色加载用户列表
  const loadUsersByRole = async (role: Role) => {
    try {
      console.log('=== 开始加载角色用户 ===')
      console.log('选择的角色:', role)
      
      // 1. 先查询角色 ID (数据库中的 code 是大写，需要转换)
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('code', role.toUpperCase())
        .single()
      
      if (roleError || !roleData) {
        console.error('角色不存在:', role, '错误:', roleError)
        setUserOptions([])
        return
      }

      console.log('角色 ID:', roleData.id)

      // 2. 查询该角色下的所有用户 ID
      const { data: userRoles, error: userRolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role_id', roleData.id)

      if (userRolesError || !userRoles || userRoles.length === 0) {
        console.log('该角色下没有用户', '错误:', userRolesError)
        setUserOptions([])
        return
      }

      console.log('角色下的用户 ID 列表:', userRoles)
      const userIds = userRoles.map(ur => ur.user_id)
      console.log('用户 ID 数组:', userIds)

      // 3. 查询用户详细信息
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, username, name, org_id, status')
        .filter('id', 'in', `(${userIds.join(',')})`)

      console.log('查询结果:', { users, usersError })

      if (usersError || !users || users.length === 0) {
        console.log('没有查询到用户', '错误:', usersError)
        setUserOptions([])
        return
      }

      console.log('查询到的用户:', users)

      // 4. 构建选项列表
      const options = users.map(user => ({
        value: user.id,
        label: `${user.name} (${user.username})`,
        username: user.username,
      }))

      setUserOptions(options)
      console.log('用户选项列表:', options)

      // 如果只有一个用户，自动选中
      if (options.length === 1) {
        form.setFieldsValue({
          userId: options[0].value,
          username: options[0].username,
          password: '123456',
        })
      } else if (options.length > 1) {
        // 清空用户名和密码，等待用户选择
        form.setFieldsValue({
          userId: undefined,
          username: '',
          password: '',
        })
      }
    } catch (err) {
      console.error('加载用户列表失败:', err)
      setUserOptions([])
    }
  }

  // 页面加载时自动加载默认角色的用户列表
  useEffect(() => {
    const defaultRole: Role = 'apply_doctor'
    setSelectedRole(defaultRole)
    loadUsersByRole(defaultRole)
  }, [])

  const handleSubmit = async (values: LoginForm) => {
    setLoading(true)
    
    try {
      let userId = values.userId
      
      // 如果没有 userId，尝试通过用户名密码查询
      if (!userId) {
        // 1. 先从 users 表查询用户基本信息
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('id, username, name, org_id, position, avatar, status')
          .eq('username', values.username)
          .eq('password', values.password)
          .single()
        
        if (userError || !user) {
          message.error('用户名或密码错误')
          setLoading(false)
          return
        }
        
        userId = user.id
      }

      // 使用 userId 查询用户信息
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, username, name, org_id, position, avatar, status')
        .eq('id', userId)
        .single()
      
      if (userError || !user) {
        message.error('用户不存在')
        setLoading(false)
        return
      }
      
      // 检查用户状态
      if (user.status !== 'active') {
        message.error('用户已被禁用')
        setLoading(false)
        return
      }
      
      // 2. 获取用户的角色信息（从 user_roles 表）
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role_id')
        .eq('user_id', user.id)
      
      if (rolesError || !userRoles || userRoles.length === 0) {
        message.error('用户未分配角色')
        setLoading(false)
        return
      }
      
      // 3. 获取角色信息（从 roles 表）
      const roleIds = userRoles.map(ur => ur.role_id)
      const { data: roles, error: roleInfoError } = await supabase
        .from('roles')
        .select('id, name, code')
        .in('id', roleIds)
      
      if (roleInfoError || !roles || roles.length === 0) {
        message.error('角色信息获取失败')
        setLoading(false)
        return
      }
      
      // 4. 获取组织名称（从 organizations 表）
      let orgName = ''
      if (user.org_id) {
        const { data: org, error: orgError } = await supabase
          .from('organizations')
          .select('name')
          .eq('id', user.org_id)
          .single()
        
        if (!orgError && org) {
          orgName = org.name
        }
      }
      
      // 检查用户选择的角色是否匹配
      // 支持中文名称和英文代码两种方式匹配
      const roleCodes = roles.map(r => (r.code || '').toUpperCase())
      const roleNames = roles.map(r => r.name)
      const selectedRoleCode = (values.role || '').toUpperCase()
      
      console.log('=== 角色匹配调试信息 ===')
      console.log('用户选择的角色:', values.role)
      console.log('转换为大写:', selectedRoleCode)
      console.log('用户拥有的角色:', roles.map(r => ({ id: r.id, name: r.name, code: r.code })))
      console.log('角色代码列表 (大写):', roleCodes)
      
      // 尝试找到匹配的角色（同时匹配 code 和 name）
      const matchedRole = roles.find(r => 
        (r.code || '').toUpperCase() === selectedRoleCode || 
        r.name === values.role ||
        r.name.toUpperCase() === selectedRoleCode
      )
      
      if (!matchedRole) {
        console.error('角色不匹配:', { selectedRoleCode, roleCodes, roleNames, valuesRole: values.role })
        message.error('选择的角色与用户实际角色不匹配')
        setLoading(false)
        return
      }

      // 5. 获取角色的权限信息（从 role_permissions 表）
      const roleId = matchedRole?.id || ''
      const { data: rolePermissions, error: permsError } = await supabase
        .from('role_permissions')
        .select('permission_id')
        .eq('role_id', roleId)

      const permissions = (rolePermissions || []).map(rp => rp.permission_id)

      // 6. 构建 CurrentUser 对象并同步到权限验证模块
      const currentUserData: CurrentUser = {
        id: user.id,
        name: user.name,
        org_id: user.org_id,
        roles: roleCodes,
        permissions: permissions,
      }
      setCurrentUser(currentUserData)

      // 登录成功，保存用户信息
      const userData = {
        id: user.id,
        name: user.name,
        org_id: user.org_id,  // 添加 org_id
        role: ((matchedRole.code || '').toLowerCase() as Role) || 'apply_doctor',
        department: orgName,
        avatar: user.avatar,
        permissions: permissions,
      }

      setUser(userData)
      setRole(userData.role)

      // 保存到 localStorage
      localStorage.setItem('mdt_user', JSON.stringify(userData))

      // 加载系统码表
      await loadCodeTables()

      message.success('登录成功')
      setLoading(false)
      navigate('/workbench')
      
    } catch (err) {
      console.error('登录失败:', err)
      message.error('登录失败，请稍后重试')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden" style={{ 
      background: 'linear-gradient(135deg, #045126 0%, #0d7a3d 50%, #0a6b35 100%)'
    }}>
      {/* 背景装饰 */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3"></div>
        
        {/* 网格背景 */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* 内容区 */}
      <div className="relative z-10 w-full h-full flex items-center justify-center p-8 overflow-auto">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          
          {/* 左侧品牌信息 */}
          <div className="text-white hidden lg:block text-center lg:text-left">
            {/* Logo - 使用 SVG 绘制 */}
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto lg:mx-0 mb-4 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-20 h-20">
                  <circle cx="50" cy="50" r="45" fill="white" stroke="#045126" strokeWidth="2"/>
                  <text x="50" y="45" textAnchor="middle" fill="#045126" fontSize="14" fontWeight="bold">PUMC</text>
                  <text x="50" y="62" textAnchor="middle" fill="#045126" fontSize="10">1917</text>
                </svg>
              </div>
            </div>
            
            {/* 校名 */}
            <h1 className="text-3xl lg:text-4xl font-bold mb-3 leading-tight">
              中国医学科学院<br/>
              北京协和医学院
            </h1>
            
            {/* 系统名称 */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-1 opacity-90">MDT 多学科会诊系统</h2>
              <p className="text-base opacity-70">Multi-Disciplinary Team Consultation System</p>
            </div>

            {/* 分隔线 */}
            <div className="w-16 h-0.5 bg-white/30 mb-6 mx-auto lg:mx-0"></div>

            {/* 特性数据 */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-3xl font-bold mb-1">500+</div>
                <div className="text-sm opacity-70">专家团队</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-1">10000+</div>
                <div className="text-sm opacity-70">会诊案例</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-1">98%</div>
                <div className="text-sm opacity-70">满意度</div>
              </div>
            </div>
          </div>

          {/* 右侧登录卡片 */}
          <div className="flex justify-center lg:justify-end">
            <Card 
              className="w-full max-w-sm shadow-xl"
              style={{ 
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(10px)',
                border: 'none',
                padding: '32px'
              }}
            >
              {/* Logo 移动端显示 */}
              <div className="lg:hidden text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-3 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-12 h-12">
                    <circle cx="50" cy="50" r="45" fill="white" stroke="#045126" strokeWidth="2"/>
                    <text x="50" y="45" textAnchor="middle" fill="#045126" fontSize="14" fontWeight="bold">PUMC</text>
                    <text x="50" y="62" textAnchor="middle" fill="#045126" fontSize="10">1917</text>
                  </svg>
                </div>
                <h1 className="text-xl font-bold mb-1" style={{ color: '#045126' }}>中国医学科学院</h1>
                <h1 className="text-xl font-bold mb-4" style={{ color: '#045126' }}>北京协和医学院</h1>
              </div>

              {/* 标题 */}
              <div className="mb-6 text-center lg:text-left">
                <h2 className="text-2xl font-bold mb-1" style={{ color: '#045126' }}>欢迎登录</h2>
                <p className="text-sm text-gray-500">MDT 多学科会诊系统</p>
              </div>

              <Form
                form={form}
                layout="horizontal"
                onFinish={handleSubmit}
                initialValues={{ 
                  role: 'apply_doctor',
                }}
                size="large"
              >
                <Form.Item name="role" label={<span className="font-medium text-gray-700 text-sm whitespace-nowrap">选择角色</span>} className="mb-3">
                  <Select 
                    options={roleOptions} 
                    size="large"
                    className="rounded-lg"
                    onChange={(value: Role) => {
                      setSelectedRole(value)
                      loadUsersByRole(value)
                    }}
                  />
                </Form.Item>

                <Form.Item name="userId" label={<span className="font-medium text-gray-700 text-sm whitespace-nowrap">选择用户</span>} className="mb-3">
                  <Select 
                    options={userOptions}
                    size="large"
                    className="rounded-lg"
                    placeholder="请选择用户"
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    onChange={(value: string, option: any) => {
                      console.log('选择用户:', { value, option })
                      if (option) {
                        form.setFieldsValue({
                          username: option.username,
                          password: '123456',
                        })
                        console.log('填充用户名密码:', option.username)
                      }
                    }}
                  />
                </Form.Item>

                <Form.Item 
                  name="username" 
                  label={<span className="font-medium text-gray-700 text-sm whitespace-nowrap">用户名</span>}
                  rules={[{ required: true, message: '请输入用户名' }]}
                  className="mb-3"
                >
                  <Input
                    prefix={<UserOutlined className="text-gray-400" />}
                    placeholder="请输入用户名/手机号"
                    size="large"
                    className="rounded-lg"
                    style={{ borderRadius: '8px' }}
                    readOnly={userOptions.length > 0}  // 有用户列表时只读
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label={<span className="font-medium text-gray-700 text-sm whitespace-nowrap">密码</span>}
                  rules={[{ required: true, message: '请输入密码' }]}
                  className="mb-3"
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-gray-400" />}
                    placeholder="请输入密码"
                    size="large"
                    className="rounded-lg"
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Item>

                {/* 隐藏的 userId 字段 */}
                <Form.Item name="userId" hidden={true}>
                  <input type="hidden" />
                </Form.Item>

                <Form.Item className="mb-4">
                  <div className="flex justify-between items-center">
                    <Checkbox className="text-sm">记住密码</Checkbox>
                    <a 
                      className="hover:underline text-sm"
                      style={{ color: '#045126' }}
                    >
                      忘记密码？
                    </a>
                  </div>
                </Form.Item>

                <Form.Item className="mb-4">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    size="large"
                    className="rounded-lg font-semibold"
                    style={{ 
                      background: '#045126',
                      borderColor: '#045126',
                      color: '#ffffff',
                      height: '44px',
                      borderRadius: '8px'
                    }}
                  >
                    立即登录
                  </Button>
                </Form.Item>

                <Divider className="!text-gray-400 !my-4 text-sm">其他登录方式</Divider>
                
                <div className="flex justify-center gap-4 mb-4">
                  <QqOutlined className="text-2xl text-gray-400 cursor-pointer hover:text-[#045126] transition-colors" />
                  <WechatOutlined className="text-2xl text-gray-400 cursor-pointer hover:text-[#045126] transition-colors" />
                  <SafetyOutlined className="text-2xl text-gray-400 cursor-pointer hover:text-[#045126] transition-colors" />
                </div>

                <div className="text-center">
                  <Button 
                    type="link" 
                    className="font-medium text-sm"
                    style={{ color: '#045126' }}
                    onClick={() => navigate('/patient/home')}
                  >
                    患者端入口 →
                  </Button>
                </div>
              </Form>

              {/* 底部说明 */}
              <div className="mt-4 text-center text-xs text-gray-400">
                <p className="mb-2">演示账号：选择不同角色可体验不同权限的菜单</p>
                <div className="flex items-center justify-center gap-3">
                  <a className="hover:underline" style={{ color: '#045126' }}>使用帮助</a>
                  <span>|</span>
                  <a className="hover:underline" style={{ color: '#045126' }}>技术支持</a>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
