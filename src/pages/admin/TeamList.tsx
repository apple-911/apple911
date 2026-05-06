import { useState } from 'react'
import { Card, Row, Col, List, Avatar, Button, Tag, Space, Typography, Modal, Form, Input, Select, message, Divider } from 'antd'
import { PlusOutlined, TeamOutlined, UserOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { mockTeams, mockExperts } from '../../mocks/data'

const { Title, Text } = Typography

export default function TeamList() {
  const [teams, setTeams] = useState(mockTeams)
  const [selectedTeam, setSelectedTeam] = useState(mockTeams[0])
  const [modalVisible, setModalVisible] = useState(false)
  const [memberModalVisible, setMemberModalVisible] = useState(false)
  const [form] = Form.useForm()

  const availableExperts = mockExperts.filter(
    e => !selectedTeam?.members?.includes(e.id)
  )

  const handleAddTeam = () => {
    form.validateFields().then(values => {
      setTeams([...teams, { ...values, id: String(Date.now()), memberCount: 0 }])
      message.success('团队已创建')
      setModalVisible(false)
    })
  }

  const handleAddMember = (expertId: string) => {
    message.success('专家已添加')
    setMemberModalVisible(false)
  }

  const handleDeleteTeam = (teamId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该团队吗？',
      onOk: () => {
        setTeams(teams.filter(t => t.id !== teamId))
        message.success('团队已删除')
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Title level={4} className="!mb-0">团队管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
          创建MDT团队
        </Button>
      </div>

      <Row gutter={16}>
        <Col span={8}>
          <Card title="团队列表" className="h-full">
            <List
              dataSource={teams}
              renderItem={(team) => (
                <List.Item
                  className={`cursor-pointer hover:bg-gray-50 ${selectedTeam?.id === team.id ? 'bg-blue-50' : ''}`}
                  onClick={() => setSelectedTeam(team)}
                  actions={[
                    <Button key="edit" size="small" type="text" icon={<EditOutlined />} />,
                    <Button key="delete" size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => handleDeleteTeam(team.id)} />
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<TeamOutlined />} className="!bg-medical-blue" />}
                    title={team.name}
                    description={
                      <Space>
                        <Text type="secondary">负责人：{team.leader}</Text>
                        <Tag>{team.memberCount}人</Tag>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col span={16}>
          <Card
            title={
              <Space>
                <TeamOutlined />
                <span>{selectedTeam?.name}</span>
              </Space>
            }
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setMemberModalVisible(true)}
              >
                添加成员
              </Button>
            }
          >
            {selectedTeam && (
              <>
                <div className="mb-4">
                  <Text type="secondary">团队描述：</Text>
                  <Text>{selectedTeam.description}</Text>
                </div>
                <Divider />
                <Title level={5}>团队成员</Title>
                <List
                  dataSource={mockExperts.slice(0, selectedTeam.memberCount || 3)}
                  renderItem={(expert) => (
                    <List.Item
                      actions={[
                        <Button key="remove" size="small" danger>移除</Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<Avatar icon={<UserOutlined />} className="!bg-medical-blue" />}
                        title={expert.name}
                        description={`${expert.department} - ${expert.title}`}
                      />
                    </List.Item>
                  )}
                />
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <Text type="secondary">团队规则：</Text>
                  <ul className="mt-2 text-sm text-gray-600">
                    <li>每次会诊至少3位不同科室专家参与</li>
                    <li>团队负责人拥有最终决策权</li>
                    <li>会诊报告需团队负责人审核签字</li>
                  </ul>
                </div>
              </>
            )}
          </Card>
        </Col>
      </Row>

      <Modal
        title="创建MDT团队"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleAddTeam}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="团队名称" name="name" rules={[{ required: true }]}>
            <Input placeholder="如：肺癌MDT团队" />
          </Form.Item>
          <Form.Item label="负责人" name="leader" rules={[{ required: true }]}>
            <Select placeholder="选择团队负责人">
              {mockExperts.map(e => (
                <Select.Option key={e.id} value={e.name}>{e.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="团队描述" name="description">
            <Input.TextArea rows={3} placeholder="请输入团队描述..." />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="添加团队成员"
        open={memberModalVisible}
        onCancel={() => setMemberModalVisible(false)}
        footer={null}
      >
        <List
          dataSource={mockExperts}
          renderItem={(expert) => (
            <List.Item
              actions={[<Button key="add" size="small" onClick={() => handleAddMember(expert.id)}>添加</Button>]}
            >
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={expert.name}
                description={`${expert.department} - ${expert.title}`}
              />
            </List.Item>
          )}
        />
      </Modal>
    </div>
  )
}