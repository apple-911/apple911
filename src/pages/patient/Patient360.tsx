import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Row, Col, Descriptions, Tag, List, Avatar, Timeline, Typography, Button, Space, Collapse, Modal, message, Tabs, Progress, Statistic, Table, Badge, Alert, Divider } from 'antd'
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
  FileTextOutlined,
  UserOutlined,
  PhoneOutlined,
  AlertOutlined,
  HistoryOutlined,
  PlusOutlined,
  CameraOutlined,
  PictureOutlined,
  HeartOutlined,
  ScheduleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  FileProtectOutlined,
  ExperimentOutlined,
  AppstoreOutlined,
  FireOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { mockPatients, mockConsultations, mockReports, mockFollowupPlans } from '../../mocks/data'
import RiskAssessment from '../../components/RiskAssessment'

const { Title, Text } = Typography
const { Panel } = Collapse

export default function Patient360() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('timeline')

  const patient = mockPatients.find(p => p.id === id)
  const consultations = mockConsultations.filter(c => c.patientId === id)
  const reports = mockReports.filter(r => consultations.some(c => c.id === r.consultationId))
  const followups = mockFollowupPlans.filter(f => f.patientId === id)

  if (!patient) {
    return (
      <Card>
        <div className="text-center py-8">
          <Text>未找到患者信息</Text>
          <Button onClick={() => navigate(-1)} className="ml-4">返回</Button>
        </div>
      </Card>
    )
  }

  const timelineItems = [
    { date: '2024-03-01', event: '入院', detail: '因咳嗽伴痰中带血入院' },
    { date: '2024-03-05', event: 'CT检查', detail: '胸部CT：左肺占位性病变' },
    { date: '2024-03-08', event: '病理活检', detail: '支气管镜活检：鳞状细胞癌' },
    { date: '2024-03-15', event: 'MDT会诊', detail: '肺癌MDT讨论，制定治疗方案' },
    { date: '2024-03-20', event: '开始治疗', detail: '开始第一周期化疗' },
    { date: '2024-04-05', event: '随访', detail: '第一次随访复查' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>返回</Button>
          <Title level={4} className="!mb-0">患者360视图</Title>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/consultation/apply')}>
          发起新会诊
        </Button>
      </div>

      {/* 患者信息卡片 */}
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <div className="text-center">
              <div className="flex justify-center items-center gap-3 mb-3">
                <Avatar size={64} icon={<UserOutlined />} style={{ background: '#045126' }} />
                <div className="text-left">
                  <Title level={3} className="!mb-1 !mt-0">{patient.name}</Title>
                  <Space size="small">
                    <Tag>{patient.gender}</Tag>
                    <Tag>{patient.age}岁</Tag>
                    <Tag>A 型血</Tag>
                  </Space>
                </div>
              </div>
              <Divider style={{ margin: '12px 0' }} />
              <div className="space-y-3 text-left">
                <div>
                  <Text type="secondary" className="text-xs">住院号</Text>
                  <div className="font-medium">{patient.inpatientNo}</div>
                </div>
                <div>
                  <Text type="secondary" className="text-xs">联系电话</Text>
                  <div className="font-medium">{patient.phone}</div>
                </div>
                <div>
                  <Text type="secondary" className="text-xs">科室</Text>
                  <div><Tag color="blue" size="small">{patient.department}</Tag></div>
                </div>
                <div>
                  <Text type="secondary" className="text-xs">主治医生</Text>
                  <div className="font-medium">{patient.doctor}</div>
                </div>
                <div>
                  <Text type="secondary" className="text-xs">入院时间</Text>
                  <div className="font-medium">{patient.admissionTime}</div>
                </div>
                <div>
                  <Text type="secondary" className="text-xs">病区床号</Text>
                  <div className="font-medium">A 区 15 床</div>
                </div>
                <div>
                  <Text type="secondary" className="text-xs">护理级别</Text>
                  <div><Tag color="green" size="small">二级护理</Tag></div>
                </div>
              </div>
              <Divider style={{ margin: '12px 0' }} />
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">BMI</div>
                  <div className="text-2xl font-bold text-green-600">22.5</div>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">ECOG</div>
                  <div className="text-2xl font-bold text-blue-600">1 分</div>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* 右侧信息区域 */}
        <Col span={18}>
          <div className="space-y-4">
            {/* 基本信息 */}
            <Card title="基本信息">
              <Descriptions column={6} size="small">
                <Descriptions.Item label="主要诊断" span={2}>
                  <Tag color="red">{patient.mainDiagnosis}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="临床分期" span={2}>
                  <Tag color="orange">T2N1M0 - IIB 期</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="病理类型" span={2}>
                  <Tag color="blue">鳞状细胞癌</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="过敏史" span={2}>
                  {patient.allergies?.length ? (
                    <Space wrap size="small">
                      {patient.allergies.map(a => <Tag key={a} color="orange">{a}</Tag>)}
                    </Space>
                  ) : <Text type="secondary">无已知过敏</Text>}
                </Descriptions.Item>
                <Descriptions.Item label="既往史" span={4}>
                  {patient.history?.length ? (
                    <Space wrap size="small">
                      {patient.history.map(h => <Tag key={h}>{h}</Tag>)}
                    </Space>
                  ) : '无明显既往史'}
                </Descriptions.Item>
                <Descriptions.Item label="吸烟史" span={2}>
                  <Text>40 包年（已戒 3 年）</Text>
                </Descriptions.Item>
                <Descriptions.Item label="饮酒史" span={2}>
                  <Text>偶尔</Text>
                </Descriptions.Item>
                <Descriptions.Item label="家族史" span={2}>
                  <Text>父亲患肺癌（75 岁）</Text>
                </Descriptions.Item>
                <Descriptions.Item label="基因检测" span={2}>
                  <Space size="small">
                    <Tag color="green">EGFR 野生型</Tag>
                    <Tag color="green">ALK 阴性</Tag>
                    <Tag color="orange">PD-L1: 60%</Tag>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="ECOG 评分" span={2}>
                  <Tag color="blue">1 分</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="BMI" span={2}>
                  <Text>22.5 kg/m²</Text>
                </Descriptions.Item>
                <Descriptions.Item label="血型" span={2}>
                  <Tag>A 型 Rh(+)</Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* 诊疗团队和入院信息并排 */}
            <Row gutter={16}>
              <Col span={12}>
                <Card title={<><TeamOutlined /> 诊疗团队</>} size="small" className="h-full">
                  <List
                    size="small"
                    dataSource={[
                      { name: '张明华', title: '主任医师', role: '主治医生', dept: '胸外科', phone: '138****1234' },
                      { name: '李芳', title: '副主任医师', role: '肿瘤内科', dept: '肿瘤科', phone: '139****5678' },
                      { name: '陈伟', title: '主治医师', role: '放疗科', dept: '放疗科', phone: '136****9012' },
                      { name: '王丽', title: '护师', role: '责任护士', dept: '胸外科', phone: '135****3456' },
                    ]}
                    renderItem={item => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar style={{ background: '#045126' }}>{item.name[0]}</Avatar>}
                          title={<div className="flex justify-between items-center">
                            <Text strong>{item.name}</Text>
                            <Tag color="blue" size="small">{item.title}</Tag>
                          </div>}
                          description={<div className="text-xs">
                            <div>{item.role} · {item.dept}</div>
                            <div className="text-gray-500">{item.phone}</div>
                          </div>}
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
              
              <Col span={12}>
                <Card title={<><FileProtectOutlined /> 入院信息</>} size="small" className="h-full">
                  <Descriptions column={2} size="small">
                    <Descriptions.Item label="入院时间">{patient.admissionTime}</Descriptions.Item>
                    <Descriptions.Item label="病区">胸外科 A 区</Descriptions.Item>
                    <Descriptions.Item label="护理级别"><Tag color="green" size="small">二级护理</Tag></Descriptions.Item>
                    <Descriptions.Item label="费用类别"><Tag color="blue" size="small">医保</Tag></Descriptions.Item>
                    <Descriptions.Item label="联系人">张建国（子）</Descriptions.Item>
                    <Descriptions.Item label="联系电话">138****1234</Descriptions.Item>
                    <Descriptions.Item label="入院方式">步行入院</Descriptions.Item>
                    <Descriptions.Item label="婚姻状况">已婚</Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>

      <Row gutter={16} className="mt-4">
        <Col span={16}>
          <Card>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: 'timeline',
                  label: <span><CalendarOutlined /> 诊疗时间轴</span>,
                  children: (
                    <Row gutter={16}>
                      <Col span={12}>
                        <Card title="时间轴" size="small">
                          <Timeline
                            items={timelineItems.map(item => ({
                              color: item.event === 'MDT 会诊' ? 'blue' : item.event === '开始治疗' ? 'green' : 'gray',
                              children: (
                                <div>
                                  <div className="flex justify-between items-center mb-1">
                                    <Text strong>{item.event}</Text>
                                    <Tag color="blue">{item.date}</Tag>
                                  </div>
                                  <Text type="secondary" className="text-sm">{item.detail}</Text>
                                </div>
                              )
                            }))}
                          />
                        </Card>
                      </Col>
                      <Col span={12}>
                        <Card title="治疗里程碑" size="small">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 p-2 bg-green-50 rounded">
                              <CheckCircleOutlined className="text-green-600 text-lg" />
                              <div>
                                <Text strong className="text-sm">诊断完成</Text>
                                <div className="text-xs text-gray-500">2024-03-08</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-2 bg-blue-50 rounded">
                              <CheckCircleOutlined className="text-blue-600 text-lg" />
                              <div>
                                <Text strong className="text-sm">MDT 会诊完成</Text>
                                <div className="text-xs text-gray-500">2024-03-15</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-2 bg-green-50 rounded">
                              <CheckCircleOutlined className="text-green-600 text-lg" />
                              <div>
                                <Text strong className="text-sm">治疗开始</Text>
                                <div className="text-xs text-gray-500">2024-03-20</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                              <ScheduleOutlined className="text-gray-600 text-lg" />
                              <div>
                                <Text strong className="text-sm">下次随访</Text>
                                <div className="text-xs text-gray-500">2024-04-20</div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </Col>
                    </Row>
                  )
                },
            {
              key: 'exams',
              label: <span><PictureOutlined /> 检查报告</span>,
              children: (
                <Collapse>
                  <Panel header={<><FileTextOutlined /> 影像检查 (3)</>} key="image">
                    <List
                      size="small"
                      dataSource={[
                        { name: '胸部 CT 平扫 + 增强', date: '2024-03-05', status: 'normal', hospital: '放射科' },
                        { name: '颅脑 MRI', date: '2024-03-06', status: 'normal', hospital: '放射科' },
                        { name: '腹部 B 超', date: '2024-03-07', status: 'warning', hospital: '超声科' },
                      ]}
                      renderItem={item => (
                        <List.Item
                          actions={[
                            <Button key="view" type="link" size="small">查看报告</Button>,
                            <Button key="image" icon={<PictureOutlined />} size="small">查看影像</Button>
                          ]}
                        >
                          <List.Item.Meta
                            avatar={<Badge status={item.status === 'normal' ? 'success' : 'warning'} />}
                            title={item.name}
                            description={
                              <Space size="small">
                                <Tag>{item.date}</Tag>
                                <Tag color="blue">{item.hospital}</Tag>
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </Panel>
                  <Panel header={<><FileTextOutlined /> 病理检查 (2)</>} key="pathology">
                    <List
                      size="small"
                      dataSource={[
                        { name: '支气管镜活检病理', date: '2024-03-08', result: '鳞状细胞癌', status: 'abnormal' },
                        { name: '免疫组化', date: '2024-03-10', result: 'CK5/6(+), TTF-1(-)', status: 'abnormal' },
                      ]}
                      renderItem={item => (
                        <List.Item
                          actions={[
                            <Button key="view" type="link" size="small">查看报告</Button>
                          ]}
                        >
                          <List.Item.Meta
                            avatar={<Badge status={item.status === 'abnormal' ? 'error' : 'success'} />}
                            title={<span className="text-red-600">{item.name}</span>}
                            description={
                              <Space size="small">
                                <Tag>{item.date}</Tag>
                                <Tag color="red">{item.result}</Tag>
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </Panel>
                  <Panel header={<><ExperimentOutlined /> 检验检查 (5)</>} key="lab">
                    <List
                      size="small"
                      dataSource={[
                        { name: '血常规', date: '2024-03-05', abnormal: false },
                        { name: '肝肾功能', date: '2024-03-05', abnormal: false },
                        { name: '肿瘤标志物', date: '2024-03-06', abnormal: true },
                        { name: '凝血功能', date: '2024-03-07', abnormal: false },
                        { name: '心电图', date: '2024-03-07', abnormal: false },
                      ]}
                      renderItem={item => (
                        <List.Item
                          actions={[
                            <Button key="view" type="link" size="small">查看结果</Button>
                          ]}
                        >
                          <List.Item.Meta
                            avatar={<Badge status={item.abnormal ? 'error' : 'success'} />}
                            title={item.name}
                            description={
                              <Space size="small">
                                <Tag>{item.date}</Tag>
                                {item.abnormal && <Tag color="red">异常</Tag>}
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </Panel>
                </Collapse>
              )
            },
            {
              key: 'consultations',
              label: <span><MedicineBoxOutlined /> 会诊历史 ({consultations.length})</span>,
              children: (
                <List
                  dataSource={consultations}
                  renderItem={c => (
                    <List.Item
                      actions={[
                        <Button key="view" type="link" size="small" onClick={() => navigate(`/consultation/detail/${c.id}`)}>
                          查看详情
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Badge 
                            status={c.status === '已完成' ? 'success' : c.status === '进行中' ? 'processing' : 'default'} 
                            size="large"
                          />
                        }
                        title={
                          <Space>
                            <Text strong>{c.mainDiagnosis}</Text>
                            <Tag color={c.status === '已完成' ? 'green' : c.status === '进行中' ? 'blue' : 'gray'}>
                              {c.status}
                            </Tag>
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size={0}>
                            <Space>
                              <CalendarOutlined className="text-gray-400" />
                              <Text type="secondary">会诊时间：{c.expectTime}</Text>
                            </Space>
                            <Space>
                              <UserOutlined className="text-gray-400" />
                              <Text type="secondary">参与专家：{c.experts.map(e => e.name).join('、')}</Text>
                            </Space>
                            <Space>
                              <FileTextOutlined className="text-gray-400" />
                              <Text type="secondary">会诊结论：{c.conclusion?.summary || '待完善'}</Text>
                            </Space>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              )
            },
            {
              key: 'followups',
              label: <span><CalendarOutlined /> 随访计划 ({followups.length})</span>,
              children: (
                <List
                  dataSource={followups}
                  renderItem={f => (
                    <List.Item
                      actions={[
                        <Button key="view" type="link" size="small">查看详情</Button>,
                        <Button key="edit" type="link" size="small">编辑</Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Badge 
                            status={f.status === '进行中' ? 'processing' : f.status === '已完成' ? 'success' : 'default'} 
                            size="large"
                          />
                        }
                        title={
                          <Space>
                            <Text strong>{f.purpose}</Text>
                            <Tag color={f.status === '进行中' ? 'green' : 'gray'}>{f.status}</Tag>
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size={0}>
                            <Space>
                              <CalendarOutlined className="text-gray-400" />
                              <Text type="secondary">计划周期：{f.startDate} 至 {f.endDate}</Text>
                            </Space>
                            <Space>
                              <ScheduleOutlined className="text-gray-400" />
                              <Text type="secondary">下次随访：{f.nextFollowup}</Text>
                            </Space>
                            <Space>
                              <UserOutlined className="text-gray-400" />
                              <Text type="secondary">负责医生：{f.doctor}</Text>
                            </Space>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              )
            },
          ]}
        />
      </Card>
    </Col>
    <Col span={8}>
      {/* 生命体征趋势 */}
      <Card title={<><HeartOutlined className="mr-2" />生命体征趋势</>} className="mb-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Text><HeartOutlined className="mr-2 text-red-500" />心率</Text>
            <Statistic value={82} suffix="次/分" valueStyle={{ fontSize: '18px' }} />
          </div>
          <Progress 
            percent={82} 
            strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
            format={() => '正常范围：60-100'}
            size="small"
          />
          
          <Divider style={{ margin: '12px 0' }} />
          
          <div className="flex justify-between items-center">
            <Text><FireOutlined className="mr-2 text-orange-500" />体温</Text>
            <Statistic value={36.5} suffix="℃" valueStyle={{ fontSize: '18px' }} />
          </div>
          <Progress 
            percent={100} 
            strokeColor="#faad14"
            format={() => '正常范围：36.0-37.0'}
            size="small"
          />
          
          <Divider style={{ margin: '12px 0' }} />
          
          <div className="flex justify-between items-center">
            <Text><AlertOutlined className="mr-2 text-blue-500" />血压</Text>
            <Statistic value={130} suffix="/85 mmHg" valueStyle={{ fontSize: '18px' }} />
          </div>
          <Alert 
            message="血压控制良好" 
            type="success" 
            showIcon 
            style={{ fontSize: '12px' }}
          />
        </div>
      </Card>

      {/* 用药情况 */}
      <Card title={<><AppstoreOutlined className="mr-2" />当前用药</>} className="mb-4">
        <List
          size="small"
          dataSource={[
            { name: '紫杉醇', dosage: '135mg/m²', frequency: 'D1', status: 'using' },
            { name: '卡铂', dosage: 'AUC 5', frequency: 'D1', status: 'using' },
            { name: '地塞米松', dosage: '10mg', frequency: 'D1-3', status: 'using' },
          ]}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                avatar={<Badge status={item.status === 'using' ? 'processing' : 'default'} />}
                title={<span className="text-sm">{item.name} {item.dosage}</span>}
                description={<span className="text-xs text-gray-500">{item.frequency}</span>}
              />
            </List.Item>
          )}
        />
      </Card>

      {/* 检验指标趋势 */}
      <Card title={<><ExperimentOutlined className="mr-2" />检验指标趋势</>} className="mb-4">
        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-1">
              <Text className="text-sm">白细胞 (WBC)</Text>
              <Text className="text-sm text-blue-600">6.5 → 7.2 → 6.8</Text>
            </div>
            <Progress percent={68} strokeColor="#1890ff" size="small" showInfo={false} />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <Text className="text-sm">血红蛋白 (HGB)</Text>
              <Text className="text-sm text-red-600">115 → 108 → 112</Text>
            </div>
            <Progress percent={75} strokeColor="#ff4d4f" size="small" showInfo={false} />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <Text className="text-sm">血小板 (PLT)</Text>
              <Text className="text-sm text-green-600">180 → 195 → 188</Text>
            </div>
            <Progress percent={82} strokeColor="#52c41a" size="small" showInfo={false} />
          </div>
        </div>
      </Card>

      <RiskAssessment
        patientId={patient.id}
        age={patient.age}
        diagnosis={patient.diagnosis}
        comorbidities={patient.history}
        vitalSigns={{
          bloodPressure: '130/85 mmHg',
          heartRate: 82,
          temperature: 36.5,
          spo2: 96,
        }}
        labResults={{
          wbc: 6.5,
          hemoglobin: 115,
          platelets: 180,
        }}
        performanceStatus={1}
      />
    </Col>
  </Row>
    </div>
  )
}