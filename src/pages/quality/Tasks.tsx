import { useState } from 'react'
import { Card, Table, Button, Tag, Space, Typography, Modal, Form, Input, Select, Rate, message, Tabs, Descriptions, Divider } from 'antd'
import { CheckOutlined, CloseOutlined, ExclamationCircleOutlined, FileTextOutlined, BookOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography

interface QualityTask {
  id: string
  consultationId: string
  patientName: string
  patientInpatientNo: string
  age?: number
  gender?: 'male' | 'female'
  consultationTime: string
  reviewer: string
  status: '待审核' | '已审核' | '已退回'
  score?: number
  mainDiagnosis?: string
  otherDiagnoses?: string[]
  consultationPurpose?: string
  experts?: Array<{ name: string; department: string; title: string }>
  meetingRecord?: string
  consultationReport?: string
  recommendations?: string[]
}

const mockTasks: QualityTask[] = [
  { 
    id: 'Q001', 
    consultationId: 'C001', 
    patientName: '王建国', 
    patientInpatientNo: 'ZY2024001234',
    age: 65,
    gender: 'male',
    consultationTime: '2024-03-15', 
    reviewer: '质控员 A', 
    status: '待审核',
    mainDiagnosis: '左肺鳞癌 III 期',
    otherDiagnoses: ['高血压 2 级', '2 型糖尿病'],
    consultationPurpose: '明确分期及后续治疗方案',
    experts: [
      { name: '李芳', department: '胸外科', title: '副主任医师' },
      { name: '王建国', department: '放射科', title: '主任医师' },
      { name: '刘晓燕', department: '病理科', title: '主任医师' }
    ],
    meetingRecord: `
2024-03-15 14:00-15:30 在 MDT 会诊中心召开多学科会诊。

参加专家：
- 胸外科：李芳 副主任医师
- 放射科：王建国 主任医师
- 病理科：刘晓燕 主任医师
- 肿瘤科：张明华 主任医师

会诊过程：
1. 申请科室汇报病史
2. 病理科汇报：（左肺穿刺）鳞癌，低分化
3. 放射科汇报：PET-CT 显示左肺上叶占位，伴纵隔淋巴结转移
4. 胸外科汇报：患者目前无手术指征
5. 各科专家讨论...
    `,
    consultationReport: `
一、诊断
左肺鳞癌 III 期（cT4N2M0）

二、治疗方案
1. 首选治疗方案：同步放化疗
   - 放疗：根治性放疗，DT 60-66Gy/30-33f
   - 化疗：紫杉醇 + 卡铂方案

2. 备选治疗方案：免疫治疗联合化疗
   - PD-1 抑制剂 + 紫杉醇 + 卡铂

三、随访计划
治疗结束后 4 周复查胸部 CT，之后每 3 个月复查一次。
    `,
    recommendations: [
      '完善基因检测',
      '评估心肺功能',
      '营养支持治疗'
    ]
  },
  { 
    id: 'Q002', 
    consultationId: 'C002', 
    patientName: '李秀英', 
    patientInpatientNo: 'ZY2024001256',
    age: 52,
    gender: 'female',
    consultationTime: '2024-03-14', 
    reviewer: '质控员 A', 
    status: '已审核', 
    score: 4.5,
    mainDiagnosis: '乳腺癌改良根治术后辅助治疗',
    consultationReport: '术后辅助化疗方案：TC 方案（多西他赛 + 环磷酰胺）× 4 周期'
  },
  { 
    id: 'Q003', 
    consultationId: 'C003', 
    patientName: '张伟', 
    patientInpatientNo: 'ZY2024001189',
    age: 58,
    gender: 'male',
    consultationTime: '2024-03-13', 
    reviewer: '质控员 B', 
    status: '已退回',
    mainDiagnosis: '胃癌晚期',
    consultationReport: '姑息化疗方案'
  },
]

export default function QualityTasks() {
  const [tasks, setTasks] = useState(mockTasks)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedTask, setSelectedTask] = useState<QualityTask | null>(null)
  const [scores, setScores] = useState<Record<string, number>>({
    document: 0,
    guideline: 0,
    participation: 0,
  })
  const [comment, setComment] = useState('')
  const [form] = Form.useForm()

  const handleReview = (task: QualityTask) => {
    setSelectedTask(task)
    setModalVisible(true)
  }

  const handleSubmit = () => {
    const totalScore = Object.values(scores).reduce((sum, s) => sum + s, 0) / 3
    setTasks(tasks.map(t => t.id === selectedTask?.id ? { ...t, status: '已审核' as const, score: totalScore } : t))
    setModalVisible(false)
    message.success('质控审核完成')
  }

  const handleReturn = () => {
    setTasks(tasks.map(t => t.id === selectedTask?.id ? { ...t, status: '已退回' as const } : t))
    setModalVisible(false)
    message.warning('已退回要求整改')
  }

  const renderPatientInfo = () => (
    <Descriptions column={2} size="small" bordered>
      <Descriptions.Item label="患者姓名">{selectedTask?.patientName}</Descriptions.Item>
      <Descriptions.Item label="住院号">{selectedTask?.patientInpatientNo}</Descriptions.Item>
      <Descriptions.Item label="年龄">{selectedTask?.age}岁</Descriptions.Item>
      <Descriptions.Item label="性别">{selectedTask?.gender === 'male' ? '男' : selectedTask?.gender === 'female' ? '女' : '-'}</Descriptions.Item>
      <Descriptions.Item label="主要诊断" span={2}>{selectedTask?.mainDiagnosis}</Descriptions.Item>
      {selectedTask?.otherDiagnoses && selectedTask.otherDiagnoses.length > 0 && (
        <Descriptions.Item label="其他诊断" span={2}>{selectedTask.otherDiagnoses.join('、')}</Descriptions.Item>
      )}
      <Descriptions.Item label="会诊目的" span={2}>{selectedTask?.consultationPurpose}</Descriptions.Item>
    </Descriptions>
  )

  const renderMeetingRecord = () => (
    <div className="p-4 bg-gray-50 rounded whitespace-pre-line text-sm">
      {selectedTask?.meetingRecord || '暂无会诊记录'}
    </div>
  )

  const renderReport = () => (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 rounded whitespace-pre-line text-sm">
        {selectedTask?.consultationReport || '暂无会诊报告'}
      </div>
      {selectedTask?.recommendations && selectedTask.recommendations.length > 0 && (
        <div>
          <Text strong>会诊建议：</Text>
          <ul className="list-disc list-inside mt-2">
            {selectedTask.recommendations.map((rec, i) => (
              <li key={i} className="text-sm text-gray-700">{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )

  const renderExperts = () => (
    <Table
      columns={[
        { title: '姓名', dataIndex: 'name' },
        { title: '科室', dataIndex: 'department' },
        { title: '职称', dataIndex: 'title' }
      ]}
      dataSource={selectedTask?.experts || []}
      rowKey="name"
      pagination={false}
      size="small"
    />
  )

  const columns: ColumnsType<QualityTask> = [
    { title: '任务ID', dataIndex: 'id' },
    { title: '会诊ID', dataIndex: 'consultationId', render: t => <Tag>#{t}</Tag> },
    { title: '患者', dataIndex: 'patientName' },
    { title: '会诊时间', dataIndex: 'consultationTime' },
    { title: '审核人', dataIndex: 'reviewer' },
    {
      title: '状态',
      dataIndex: 'status',
      render: (t: string) => (
        <Tag color={t === '待审核' ? 'orange' : t === '已审核' ? 'green' : 'red'}>{t}</Tag>
      )
    },
    {
      title: '评分',
      dataIndex: 'score',
      render: (s?: number) => s ? <Rate disabled defaultValue={s} allowHalf /> : '-'
    },
    {
      title: '操作',
      render: (_, record) => (
        record.status === '待审核' && (
          <Button type="primary" size="small" onClick={() => handleReview(record)}>
            审核
          </Button>
        )
      )
    },
  ]

  return (
    <div className="space-y-4">
      <Title level={4}>质控任务审核</Title>

      <Card>
        <Space className="mb-4">
          <Select placeholder="状态筛选" allowClear style={{ width: 150 }}>
            <Select.Option value="待审核">待审核</Select.Option>
            <Select.Option value="已审核">已审核</Select.Option>
            <Select.Option value="已退回">已退回</Select.Option>
          </Select>
          <Select placeholder="时间段" allowClear style={{ width: 150 }}>
            <Select.Option value="week">本周</Select.Option>
            <Select.Option value="month">本月</Select.Option>
          </Select>
        </Space>

        <Table columns={columns} dataSource={tasks} rowKey="id" pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title={
          <Space>
            <ExclamationCircleOutlined />
            <span>质控评分 - {selectedTask?.consultationId}</span>
          </Space>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={900}
        footer={[
          <Button key="return" danger onClick={handleReturn}>
            <CloseOutlined /> 退回整改
          </Button>,
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={handleSubmit}>
            <CheckOutlined /> 提交审核
          </Button>,
        ]}
      >
        <div className="space-y-4">
          <Tabs
            defaultActiveKey="patient"
            items={[
              {
                key: 'patient',
                label: <><UserOutlined /> 患者信息</>,
                children: renderPatientInfo()
              },
              {
                key: 'experts',
                label: <><TeamOutlined /> 参会专家</>,
                children: renderExperts()
              },
              {
                key: 'record',
                label: <><FileTextOutlined /> 会诊记录</>,
                children: renderMeetingRecord()
              },
              {
                key: 'report',
                label: <><BookOutlined /> 会诊报告</>,
                children: renderReport()
              }
            ]}
          />

          <Divider />

          <Title level={5}>质控评分</Title>
          <Form form={form} layout="vertical">
            <Form.Item label="文书完整性（0-5 分）" tooltip="会诊记录、报告等文书的完整性和规范性">
              <Space>
                <Rate
                  value={scores.document}
                  onChange={(v) => setScores({ ...scores, document: v })}
                />
                <Text type="secondary">{scores.document}分</Text>
              </Space>
            </Form.Item>
            <Form.Item label="指南依从性（0-5 分）" tooltip="治疗方案是否符合临床诊疗指南">
              <Space>
                <Rate
                  value={scores.guideline}
                  onChange={(v) => setScores({ ...scores, guideline: v })}
                />
                <Text type="secondary">{scores.guideline}分</Text>
              </Space>
            </Form.Item>
            <Form.Item label="专家参与度（0-5 分）" tooltip="各学科专家的参与程度和贡献">
              <Space>
                <Rate
                  value={scores.participation}
                  onChange={(v) => setScores({ ...scores, participation: v })}
                />
                <Text type="secondary">{scores.participation}分</Text>
              </Space>
            </Form.Item>
            <Form.Item label="质控意见">
              <Input.TextArea
                rows={3}
                placeholder="请输入质控意见，包括优点、不足及改进建议..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </Form.Item>
          </Form>

          <div className="p-4 bg-blue-50 rounded text-center">
            <Text strong>综合评分：</Text>
            <Text className="text-2xl text-medical-blue">
              {(Object.values(scores).reduce((sum, s) => sum + s, 0) / 3).toFixed(1)} 分
            </Text>
          </div>
        </div>
      </Modal>
    </div>
  )
}