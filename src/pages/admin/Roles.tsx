import { useState } from 'react'
import { Card, Row, Col, List, Button, Tag, Space, Typography, Modal, Tree, Switch, message, Input, Divider, Avatar } from 'antd'
import { PlusOutlined, CopyOutlined, SaveOutlined, UserOutlined } from '@ant-design/icons'
import type { DataNode } from 'antd/es/tree'

const { Title, Text } = Typography

const mockRoles = [
  { id: 'R1', name: '申请医生', description: '可申请会诊、查看自己的申请' },
  { id: 'R2', name: 'MDT秘书', description: '审核会诊申请、排期管理' },
  { id: 'R3', name: '会诊专家', description: '参加会诊、书写报告' },
  { id: 'R4', name: '质控员', description: '质量控制和审核' },
  { id: 'R5', name: '系统管理员', description: '系统配置和用户管理' },
]

const permissionTree: DataNode[] = [
  {
    title: '会诊管理',
    key: 'consultation',
    children: [
      { title: '申请会诊', key: 'consultation/apply' },
      { title: '我的申请', key: 'consultation/my-applies' },
      { title: '待审核列表', key: 'consultation/pending-review' },
      { title: '排期管理', key: 'consultation/schedule' },
      { title: '我的待参会', key: 'consultation/my-meetings' },
      { title: '会诊详情', key: 'consultation/detail' },
    ],
  },
  {
    title: '患者管理',
    key: 'patient',
    children: [
      { title: '患者档案库', key: 'patient/list' },
      { title: '患者360视图', key: 'patient/360' },
    ],
  },
  {
    title: '报告管理',
    key: 'report',
    children: [
      { title: '报告列表', key: 'report/list' },
      { title: '报告编辑', key: 'report/edit' },
    ],
  },
  {
    title: '随访管理',
    key: 'followup',
    children: [
      { title: '随访计划', key: 'followup/list' },
      { title: '疗效评估', key: 'followup/assessment' },
    ],
  },
  {
    title: '质控管理',
    key: 'quality',
    children: [
      { title: '统计分析', key: 'statistics' },
      { title: '质控任务', key: 'quality/tasks' },
    ],
  },
  {
    title: '系统管理',
    key: 'admin',
    children: [
      { title: '专家库', key: 'admin/expert-list' },
      { title: '团队管理', key: 'admin/team-list' },
      { title: '角色权限', key: 'admin/roles' },
      { title: '系统日志', key: 'admin/logs' },
    ],
  },
]

export default function Roles() {
  const [selectedRole, setSelectedRole] = useState(mockRoles[0])
  const [checkedKeys, setCheckedKeys] = useState<string[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [newRoleName, setNewRoleName] = useState('')

  const handleCopyRole = () => {
    Modal.confirm({
      title: '复制角色权限',
      content: `确定要复制"${selectedRole.name}"的权限作为新角色吗？`,
      onOk: () => message.success('已复制')
    })
  }

  const handleSave = () => {
    message.success('权限配置已保存')
  }

  const handleAddRole = () => {
    if (!newRoleName.trim()) return
    message.success(`角色"${newRoleName}"已创建`)
    setModalVisible(false)
    setNewRoleName('')
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Title level={4} className="!mb-0">角色权限配置</Title>
        <Space>
          <Button icon={<CopyOutlined />} onClick={handleCopyRole}>复制角色</Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>保存配置</Button>
        </Space>
      </div>

      <Row gutter={16}>
        <Col span={6}>
          <Card
            title="角色列表"
            extra={<Button type="text" icon={<PlusOutlined />} onClick={() => setModalVisible(true)} />}
          >
            <List
              dataSource={mockRoles}
              renderItem={(role) => (
                <List.Item
                  className={`cursor-pointer hover:bg-gray-50 ${selectedRole?.id === role.id ? 'bg-blue-50' : ''}`}
                  onClick={() => setSelectedRole(role)}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} className={selectedRole?.id === role.id ? '!bg-blue-500' : ''} />}
                    title={role.name}
                    description={<Text type="secondary" className="text-xs">{role.description}</Text>}
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
                <Tag color="blue">{selectedRole?.name}</Tag>
              </Space>
            }
          >
            <div className="mb-4 p-3 bg-yellow-50 rounded">
              <Text type="secondary">
                提示：修改权限后，当前在线用户需要重新登录才能生效
              </Text>
            </div>

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
          </Card>
        </Col>
      </Row>

      <Modal
        title="新增角色"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleAddRole}
      >
        <Input
          placeholder="请输入角色名称"
          value={newRoleName}
          onChange={(e) => setNewRoleName(e.target.value)}
        />
      </Modal>
    </div>
  )
}