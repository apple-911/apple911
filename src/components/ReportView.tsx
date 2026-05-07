import { useRef } from 'react'
import { Modal, Button, Space, Typography, Divider, Table, Descriptions, Tag, message } from 'antd'
import { PrinterOutlined, FilePdfOutlined, CloseOutlined } from '@ant-design/icons'

interface Report {
  id: string
  title: string
  content: string
  createdAt: string
  createdBy: string
  patientName?: string
  treatmentSuggestion?: string
  followupPlan?: string
  consultationTime?: string
  responsibleExpert?: string
  chiefComplaint?: string
  diagnosisSummary?: string
  examRecommendations?: string
  treatmentRecommendations?: string
  followupSchedule?: string
  historyOfPresentIllness?: string
  pastHistory?: string
  physicalExamination?: string
  auxiliaryExamination?: string
  consultationOpinion?: string
  experts?: any[]
}

interface Consultation {
  id: string
  patientName: string
  status: string
  type?: string
  location?: string
  responsibleExpert?: string
  experts?: any[]
}

interface Patient {
  id: string
  name: string
  age?: number
  gender?: string
  inpatientNo?: string
  department?: string
  doctor?: string
  mainDiagnosis?: string
}

const { Title, Text, Paragraph } = Typography

interface ReportViewProps {
  report: Report
  consultation?: Consultation
  patient?: Patient
  open: boolean
  onClose: () => void
}

export default function ReportView({ report, consultation, patient, open, onClose }: ReportViewProps) {
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    const printContent = printRef.current
    if (printContent) {
      const printWindow = window.open('', '_blank')
      printWindow?.document.write(`
        <html>
          <head>
            <title>MDT 会诊报告 - ${report.patientName}</title>
            <style>
              body { font-family: 'SimSun', serif; padding: 40px; }
              h1 { text-align: center; font-size: 24px; margin-bottom: 10px; }
              .subtitle { text-align: center; color: #666; margin-bottom: 30px; }
              .section { margin: 20px 0; }
              .section-title { font-weight: bold; font-size: 16px; margin-bottom: 10px; border-bottom: 2px solid #333; padding-bottom: 5px; }
              .content { line-height: 1.8; text-align: justify; }
              .signature { margin-top: 40px; text-align: right; }
              table { width: 100%; border-collapse: collapse; margin: 15px 0; }
              td, th { border: 1px solid #000; padding: 8px; }
              @media print {
                body { padding: 20px; }
              }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `)
      printWindow?.document.close()
      printWindow?.focus()
      setTimeout(() => {
        printWindow?.print()
        printWindow?.close()
      }, 250)
    }
  }

  const renderReportContent = () => (
    <div ref={printRef} className="bg-white p-6">
      <div className="text-center mb-6">
        <Title level={3} className="!mb-2">MDT 多学科会诊报告</Title>
        <Text type="secondary">报告编号：{report.id}</Text>
      </div>

      <Divider />

      <div className="section">
        <div className="section-title">患者基本信息</div>
        <Table
          size="small"
          pagination={false}
          columns={[
            { title: '姓名', dataIndex: 'name', width: '25%' },
            { title: '性别', dataIndex: 'gender', width: '25%' },
            { title: '年龄', dataIndex: 'age', width: '25%' },
            { title: '住院号', dataIndex: 'inpatientNo', width: '25%' },
          ]}
          dataSource={[{
            name: patient?.name,
            gender: patient?.gender,
            age: patient?.age,
            inpatientNo: patient?.inpatientNo,
          }]}
          showHeader={false}
          bordered
        />
        <div className="mt-2">
          <Text strong>科室：</Text>{patient?.department} | <Text strong>主治医生：</Text>{patient?.doctor}
        </div>
        <div>
          <Text strong>主要诊断：</Text><Tag color="red">{patient?.mainDiagnosis}</Tag>
        </div>
      </div>

      <Divider />

      <div className="section">
        <div className="section-title">会诊信息</div>
        <Descriptions column={2} size="small" bordered>
          <Descriptions.Item label="会诊时间">{report.consultationTime}</Descriptions.Item>
          <Descriptions.Item label="会诊类型">{consultation?.type}</Descriptions.Item>
          <Descriptions.Item label="会诊地点" span={2}>{consultation?.location}</Descriptions.Item>
          <Descriptions.Item label="负责专家" span={2}>{report.responsibleExpert}</Descriptions.Item>
        </Descriptions>
      </div>

      <Divider />

      <div className="section">
        <div className="section-title">病情摘要</div>
        <div className="content">
          <div className="mb-3">
            <Text strong>主诉：</Text>
            <Paragraph>{report.chiefComplaint || '（未填写）'}</Paragraph>
          </div>
          <div className="mb-3">
            <Text strong>现病史：</Text>
            <Paragraph>{report.historyOfPresentIllness || '（未填写）'}</Paragraph>
          </div>
          <div className="mb-3">
            <Text strong>既往史：</Text>
            <Paragraph>{report.pastHistory || '（未填写）'}</Paragraph>
          </div>
          <div className="mb-3">
            <Text strong>体格检查：</Text>
            <Paragraph>{report.physicalExamination || '（未填写）'}</Paragraph>
          </div>
          <div className="mb-3">
            <Text strong>辅助检查：</Text>
            <Paragraph>{report.auxiliaryExamination || '（未填写）'}</Paragraph>
          </div>
        </div>
      </div>

      <Divider />

      <div className="section">
        <div className="section-title">会诊意见</div>
        <div className="content">
          <Paragraph className="bg-blue-50 p-3 border-l-4 border-blue-500">
            {report.consultationOpinion || '（未填写）'}
          </Paragraph>
        </div>
      </div>

      <Divider />

      <div className="section">
        <div className="section-title">诊疗建议</div>
        <div className="content">
          <Paragraph>{report.treatmentSuggestion || '（未填写）'}</Paragraph>
        </div>
      </div>

      <Divider />

      <div className="section">
        <div className="section-title">随访计划</div>
        <div className="content">
          <Paragraph>{report.followupPlan || '（未填写）'}</Paragraph>
        </div>
      </div>

      <Divider />

      <div className="section signature">
        <div className="mb-4">
          <Text strong>参与会诊专家：</Text>
          <Space wrap className="mt-2">
            {consultation?.experts?.map((e: any) => (
              <Tag key={e.id} color="blue">{e.name} {e.title}</Tag>
            ))}
          </Space>
        </div>
        <div className="mt-6">
          <Text strong>报告生成日期：</Text>{new Date().toLocaleDateString('zh-CN')}
        </div>
      </div>
    </div>
  )

  return (
    <Modal
      title={
        <div className="flex items-center justify-between">
          <span>报告详情</span>
          <Space>
            <Button 
              icon={<PrinterOutlined />} 
              onClick={handlePrint}
              size="small"
            >
              打印
            </Button>
            <Button 
              icon={<FilePdfOutlined />} 
              onClick={() => message.info('导出 PDF 功能开发中')}
              size="small"
            >
              导出 PDF
            </Button>
            <Button 
              icon={<CloseOutlined />} 
              onClick={onClose}
              size="small"
            >
              关闭
            </Button>
          </Space>
        </div>
      }
      open={open}
      onCancel={onClose}
      width={1000}
      footer={null}
    >
      <div className="max-h-[80vh] overflow-y-auto">
        {renderReportContent()}
      </div>
    </Modal>
  )
}
