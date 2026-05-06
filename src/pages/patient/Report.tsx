import { Card, Button, Divider, Tag } from 'antd'
import { LeftOutlined, DownloadOutlined, PrinterOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'

const PatientReport = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  const report = {
    id: 1,
    patientName: '张建国',
    gender: '男',
    age: 58,
    medicalCard: 'M123456789',
    department: '肿瘤科',
    consultationDate: '2024-01-10 10:00',
    location: '北京协和医院 2 楼 MDT 会诊室',
    chiefComplaint: '咳嗽、咳痰 2 个月，加重 1 周',
    presentIllness: '患者 2 个月前无明显诱因出现咳嗽、咳痰，痰中带血丝，近 1 周症状加重，伴胸闷、气短。',
    pastHistory: '高血压病史 5 年，规律服药，血压控制可。否认糖尿病、冠心病史。',
    physicalExam: 'T 36.5℃, P 80 次/分，R 18 次/分，BP 135/85mmHg。神志清，精神可。',
    auxiliaryExam: '胸部 CT：右肺上叶占位，约 3.5cm×3.0cm，纵隔淋巴结肿大。',
    diagnosis: '右肺上叶癌（cT2N2M0 IIB 期）',
    treatmentPlan: [
      '完善相关检查，评估手术指征',
      '如可手术，建议行右肺上叶切除术 + 纵隔淋巴结清扫术',
      '术后辅助化疗 4 周期',
      '定期复查，随访观察'
    ],
    followupPlan: '术后 2 周复查，之后每 3 个月复查一次，持续 2 年',
    experts: [
      { name: '李志强', title: '主任医师', department: '肿瘤科', role: '会诊组长' },
      { name: '王建华', title: '主任医师', department: '胸外科' },
      { name: '张明华', title: '副主任医师', department: '放疗科' },
      { name: '刘伟', title: '副主任医师', department: '病理科' }
    ],
    reportDate: '2024-01-11'
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-default)' }}>
      {/* 顶部导航 */}
      <div className="sticky top-0 z-50 bg-white border-b" style={{ borderColor: 'var(--border-light)' }}>
        <div className="h-12 flex items-center px-4">
          <Button type="text" icon={<LeftOutlined />} onClick={() => navigate('/patient/progress')}>
            返回
          </Button>
          <span className="flex-1 text-center font-bold">会诊报告</span>
          <div className="w-16" />
        </div>
      </div>

      {/* 内容区域 */}
      <div className="p-4 space-y-4 pb-24">
        {/* 报告头 */}
        <Card className="text-center py-6" style={{ background: 'var(--xiehe-green-bg)' }}>
          <div className="text-xl font-bold" style={{ color: 'var(--xiehe-green)' }}>MDT 会诊报告</div>
          <div className="text-sm text-gray-500 mt-2">报告日期：{report.reportDate}</div>
        </Card>

        {/* 基本信息 */}
        <Card title="患者信息">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-gray-500">姓名：</span>{report.patientName}</div>
            <div><span className="text-gray-500">性别：</span>{report.gender}</div>
            <div><span className="text-gray-500">年龄：</span>{report.age}岁</div>
            <div><span className="text-gray-500">就诊卡号：</span>{report.medicalCard}</div>
            <div><span className="text-gray-500">科室：</span>{report.department}</div>
            <div><span className="text-gray-500">会诊日期：</span>{report.consultationDate}</div>
          </div>
        </Card>

        {/* 病情摘要 */}
        <Card title="病情摘要">
          <div className="space-y-3 text-sm">
            <div>
              <div className="font-medium mb-1">主诉</div>
              <div className="text-gray-600">{report.chiefComplaint}</div>
            </div>
            <Divider className="my-2" />
            <div>
              <div className="font-medium mb-1">现病史</div>
              <div className="text-gray-600">{report.presentIllness}</div>
            </div>
            <Divider className="my-2" />
            <div>
              <div className="font-medium mb-1">既往史</div>
              <div className="text-gray-600">{report.pastHistory}</div>
            </div>
            <Divider className="my-2" />
            <div>
              <div className="font-medium mb-1">体格检查</div>
              <div className="text-gray-600">{report.physicalExam}</div>
            </div>
            <Divider className="my-2" />
            <div>
              <div className="font-medium mb-1">辅助检查</div>
              <div className="text-gray-600">{report.auxiliaryExam}</div>
            </div>
          </div>
        </Card>

        {/* 会诊诊断 */}
        <Card title="会诊诊断" className="border-l-4" style={{ borderLeftColor: 'var(--xiehe-green)' }}>
          <div className="text-base font-medium" style={{ color: 'var(--xiehe-green)' }}>
            {report.diagnosis}
          </div>
        </Card>

        {/* 治疗方案 */}
        <Card title="治疗方案">
          <div className="space-y-2">
            {report.treatmentPlan.map((plan, index) => (
              <div key={index} className="flex items-start gap-2">
                <Tag color="green">{index + 1}</Tag>
                <span className="text-sm">{plan}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* 随访计划 */}
        <Card title="随访计划">
          <div className="text-sm text-gray-600">{report.followupPlan}</div>
        </Card>

        {/* 会诊专家 */}
        <Card title="会诊专家">
          <div className="space-y-3">
            {report.experts.map((expert, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{expert.name} <Tag color="green">{expert.role}</Tag></div>
                  <div className="text-xs text-gray-500">{expert.title} | {expert.department}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 温馨提示 */}
        <Card className="bg-blue-50">
          <div className="text-sm text-blue-800">
            <div className="font-medium mb-2">温馨提示：</div>
            <div>1. 请按照会诊治疗方案进行治疗</div>
            <div>2. 按时复查随访，如有不适及时就诊</div>
            <div>3. 保持良好心态，积极配合治疗</div>
            <div>4. 本报告的最终解释权归医院所有</div>
          </div>
        </Card>
      </div>

      {/* 底部操作栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4" style={{ borderColor: 'var(--border-light)' }}>
        <div className="flex gap-3">
          <Button 
            block 
            icon={<PrinterOutlined />}
            onClick={() => window.print()}
          >
            打印报告
          </Button>
          <Button 
            block 
            type="primary" 
            icon={<DownloadOutlined />}
          >
            下载报告
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PatientReport
