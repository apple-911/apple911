import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Row, Col, List, Tag, Button, Space, Typography, Tabs, Empty, Table, Descriptions, Modal } from 'antd'
import { FileTextOutlined, EditOutlined, PrinterOutlined, EyeOutlined } from '@ant-design/icons'
import { mockReports, mockConsultations, mockPatients } from '../../mocks/data'
import type { Report } from '../../stores/consultationStore'
import ReportView from '../../components/ReportView'

const { Title, Text } = Typography

export default function ReportList() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('unfinished')
  const [viewingReport, setViewingReport] = useState<Report | null>(null)

  const unfinishedReports = mockReports.filter(r => r.status === '草稿' || r.status === '待签名')
  const finishedReports = mockReports.filter(r => r.status === '已签名' || r.status === '已归档')

  const handleViewReport = (report: Report) => {
    setViewingReport(report)
  }

  const handleCloseView = () => {
    setViewingReport(null)
  }

  const renderReportList = (reports: Report[], isUnfinished: boolean) => {
    if (reports.length === 0) {
      return <Empty description={isUnfinished ? "暂无待编写报告" : "暂无已完成报告"} />
    }
    return (
      <List
        dataSource={reports}
        renderItem={(report) => {
          const consultation = mockConsultations.find(c => c.id === report.consultationId)
          const patient = consultation ? mockPatients.find(p => p.id === consultation.patientId) : null
          
          return (
            <>
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
                    <Button 
                      key="view" 
                      size="small" 
                      icon={<EyeOutlined />}
                      onClick={() => handleViewReport(report)}
                    >
                      查看
                    </Button>
                  ),
                  !isUnfinished && (
                    <Button 
                      key="print" 
                      size="small" 
                      icon={<PrinterOutlined />}
                      onClick={() => handleViewReport(report)}
                    >
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
                      {report.status === '草稿' && (
                        <Tag color="gray">需要完善</Tag>
                      )}
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={0}>
                      <Text type="secondary">会诊 ID：{report.consultationId}</Text>
                      <Text type="secondary">会诊时间：{report.consultationTime}</Text>
                      <Text type="secondary">负责专家：{report.responsibleExpert}</Text>
                      {patient && (
                        <Text type="secondary">诊断：{patient.mainDiagnosis}</Text>
                      )}
                    </Space>
                  }
                />
              </List.Item>
            </>
          )
        }}
      />
    )
  }

  const viewingConsultation = viewingReport ? mockConsultations.find(c => c.id === viewingReport.consultationId) : null
  const viewingPatient = viewingConsultation ? mockPatients.find(p => p.id === viewingConsultation.patientId) : null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Title level={4} className="!mb-0">会诊报告管理</Title>
        <Space>
          <Text type="secondary">总计：{mockReports.length} 份报告</Text>
          <Tag color="orange">未完成：{unfinishedReports.length}</Tag>
          <Tag color="green">已完成：{finishedReports.length}</Tag>
        </Space>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'unfinished',
            label: (
              <Space>
                <FileTextOutlined />
                <span>未完成报告</span>
                <Tag color="orange">{unfinishedReports.length}</Tag>
              </Space>
            ),
            children: (
              <Card>
                {renderReportList(unfinishedReports, true)}
              </Card>
            ),
          },
          {
            key: 'finished',
            label: (
              <Space>
                <FileTextOutlined />
                <span>已完成报告</span>
                <Tag color="green">{finishedReports.length}</Tag>
              </Space>
            ),
            children: (
              <Card>
                {renderReportList(finishedReports, false)}
              </Card>
            ),
          },
        ]}
      />

      {/* 报告查看弹窗 */}
      {viewingReport && viewingConsultation && viewingPatient && (
        <ReportView
          report={viewingReport}
          consultation={viewingConsultation}
          patient={viewingPatient}
          open={true}
          onClose={handleCloseView}
        />
      )}
    </div>
  )
}
