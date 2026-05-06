import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Row, Col, List, Tag, Button, Space, Typography, Tabs, Empty } from 'antd'
import { FileTextOutlined, EditOutlined, PrinterOutlined, EyeOutlined } from '@ant-design/icons'
import { mockReports } from '../../mocks/data'
import type { Report } from '../../stores/consultationStore'

const { Title, Text } = Typography

export default function ReportList() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('unfinished')

  const unfinishedReports = mockReports.filter(r => r.status === '草稿' || r.status === '待签名')
  const finishedReports = mockReports.filter(r => r.status === '已签名' || r.status === '已归档')

  const renderReportList = (reports: Report[], isUnfinished: boolean) => {
    if (reports.length === 0) {
      return <Empty description={isUnfinished ? "暂无待编写报告" : "暂无已完成报告"} />
    }
    return (
      <List
        dataSource={reports}
        renderItem={(report) => (
          <List.Item
            actions={[
              isUnfinished ? (
                <Button
                  key="edit"
                  type="primary"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/report/edit/${report.id}`)}
                >
                  编写报告
                </Button>
              ) : (
                <Button key="view" size="small" icon={<EyeOutlined />}>
                  查看
                </Button>
              ),
              !isUnfinished && (
                <Button key="print" size="small" icon={<PrinterOutlined />}>
                  打印
                </Button>
              )
            ]}
          >
            <List.Item.Meta
              title={
                <Space>
                  {report.patientName}
                  <Tag color={report.status === '已签名' ? 'green' : report.status === '待签名' ? 'orange' : 'default'}>
                    {report.status}
                  </Tag>
                </Space>
              }
              description={
                <Space direction="vertical" size={0}>
                  <Text type="secondary">会诊ID：{report.consultationId}</Text>
                  <Text type="secondary">会诊时间：{report.consultationTime}</Text>
                  <Text type="secondary">负责专家：{report.responsibleExpert}</Text>
                </Space>
              }
            />
          </List.Item>
        )}
      />
    )
  }

  return (
    <div className="space-y-4">
      <Title level={4}>会诊报告管理</Title>

      <Row gutter={16}>
        <Col span={12}>
          <Card
            title={
              <Space>
                <FileTextOutlined />
                <span>未完成报告</span>
                <Tag color="orange">{unfinishedReports.length}</Tag>
              </Space>
            }
          >
            {renderReportList(unfinishedReports, true)}
          </Card>
        </Col>
        <Col span={12}>
          <Card
            title={
              <Space>
                <FileTextOutlined />
                <span>已完成报告</span>
                <Tag color="green">{finishedReports.length}</Tag>
              </Space>
            }
          >
            {renderReportList(finishedReports, false)}
          </Card>
        </Col>
      </Row>
    </div>
  )
}