import { Card, Descriptions, Tag, Space, Typography, List, Avatar, Divider, Tabs, Table, Button } from 'antd'
import { UserOutlined, PhoneOutlined, MedicineBoxOutlined, FileTextOutlined, HeartOutlined, ExperimentOutlined, ToolOutlined, PictureOutlined, RiseOutlined, FileProtectOutlined, UnorderedListOutlined } from '@ant-design/icons'
import { mockPatients } from '../mocks/data'
import type { Patient } from '../stores/consultationStore'
import type { ColumnsType } from 'antd/es/table'

const { Text } = Typography

interface PatientInfoProps {
  patientId: string
  patientName?: string
  patientInpatientNo?: string
  compact?: boolean
  patientData?: any // 完整的患者数据（从数据库加载）
}

interface PatientMedicalRecord {
  chiefComplaint: string
  presentIllness: string
  pastHistory: string
  physicalExamination: string
  auxiliaryExamination: string
}

const mockMedicalRecords: Record<string, PatientMedicalRecord> = {
  'P001': {
    chiefComplaint: '咳嗽、咳痰 3 个月，加重伴痰中带血 2 周',
    presentIllness: `患者 3 个月前无明显诱因出现咳嗽、咳痰，为阵发性刺激性干咳，偶有少量白色粘痰，无发热、胸痛、呼吸困难等。2 周前症状加重，出现痰中带血，为鲜红色血丝，量不多。遂来我院就诊。

门诊胸部 CT 示：左肺上叶占位性病变，大小约 4.5cm×3.8cm，边界不清，伴纵隔淋巴结肿大。为求进一步诊治，门诊以"左肺占位"收入我科。

患者自发病以来，精神、睡眠可，食欲欠佳，大小便正常，体重近 3 个月下降约 5kg。`,
    pastHistory: `既往体健，否认高血压、糖尿病、冠心病等慢性病史。否认肝炎、结核等传染病史。否认手术外伤史。否认输血史。否认药物及食物过敏史。预防接种史不详。

个人史：生于原籍，久居本地，无疫区、疫情、疫水接触史，无牧区、矿区、低洼地带、沿海地区居住史，无放射性物质、粉尘及毒物接触史，无烟酒等不良嗜好。

婚育史：25 岁结婚，配偶体健，育有 1 子 1 女，均体健。

家族史：父母已故，死因不详。否认家族中有遗传性疾病及类似疾病患者。`,
    physicalExamination: `T 36.5℃  P 82 次/分  R 18 次/分  BP 135/85mmHg

一般情况：发育正常，营养中等，神志清，精神可，自主体位，查体合作。

皮肤黏膜：全身皮肤黏膜无黄染、皮疹及出血点，无肝掌及蜘蛛痣。

淋巴结：全身浅表淋巴结未触及肿大。

头部及其器官：头颅无畸形，结膜无充血，巩膜无黄染，瞳孔等大等圆，对光反射灵敏。

颈部：颈软，无抵抗，气管居中，甲状腺无肿大。

胸部：胸廓对称，双肺呼吸音粗，左肺上叶可闻及湿啰音，未闻及干啰音及胸膜摩擦音。心率 82 次/分，律齐，各瓣膜听诊区未闻及病理性杂音。

腹部：腹平软，无压痛、反跳痛及肌紧张，肝脾肋下未触及，肠鸣音正常。

四肢及脊柱：四肢活动自如，无水肿，脊柱无畸形，各关节活动正常。

神经系统：生理反射存在，病理反射未引出。`,
    auxiliaryExamination: `1. 胸部 CT（2024-03-10）：左肺上叶占位性病变，大小约 4.5cm×3.8cm，边界不清，伴纵隔淋巴结肿大。

2. 支气管镜（2024-03-12）：左肺上叶支气管新生物，活检病理示：鳞状细胞癌。

3. 病理报告（2024-03-13）：（左肺上叶）鳞状细胞癌，中分化。免疫组化：CK5/6(+)，P63(+)，TTF-1(-)，NapsinA(-)，Ki-67(30%+)。

4. 肿瘤标志物（2024-03-11）：CEA 5.2ng/mL，SCC 3.8ng/mL，CYFRA21-1 6.5ng/mL。

5. 肺功能（2024-03-12）：FEV1 2.1L，FEV1% 78%，FVC 2.8L，FEV1/FVC 75%。

6. 心电图（2024-03-11）：窦性心律，正常心电图。

7. 腹部超声（2024-03-11）：肝胆胰脾肾未见明显异常。

8. 头颅 MRI（2024-03-12）：未见转移灶。

9. 骨扫描（2024-03-13）：未见骨转移。`
  },
  'P002': {
    chiefComplaint: '乳腺癌改良根治术后 1 个月，要求制定辅助治疗方案',
    presentIllness: `患者 1 个月前因"右乳癌"于我院行右乳癌改良根治术，术后病理示：右乳浸润性导管癌，pT2N1M0，II 期。免疫组化：ER(+)，PR(+)，HER2(-)，Ki-67(20%+)。术后恢复良好，切口愈合佳。现为求进一步辅助治疗来诊。`,
    pastHistory: `既往体健，否认高血压、糖尿病等慢性病史。否认手术外伤史（本次手术除外）。否认药物及食物过敏史。

个人史：无烟酒等不良嗜好。

婚育史：28 岁结婚，育有 1 子，体健。

家族史：母亲患乳腺癌（60 岁确诊），已故。`,
    physicalExamination: `T 36.3℃  P 76 次/分  R 16 次/分  BP 120/75mmHg

一般情况：发育正常，营养中等，神志清，精神可。

手术切口：右胸壁切口愈合良好，无红肿渗液。

淋巴结：右腋窝未触及肿大淋巴结，左腋窝及锁骨上淋巴结未触及肿大。

心肺腹：心肺听诊未见异常，腹软无压痛。`,
    auxiliaryExamination: `1. 术后病理（2024-02-15）：右乳浸润性导管癌，pT2N1M0，II 期。

2. 免疫组化：ER(+)，PR(+)，HER2(-)，Ki-67(20%+)。

3. 血常规（2024-03-10）：WBC 6.2×10^9/L，Hb 118g/L，PLT 256×10^9/L。

4. 肝肾功能（2024-03-10）：ALT 25U/L，AST 22U/L，Cr 68μmol/L。

5. 心电图（2024-03-10）：窦性心律，正常心电图。

6. 超声心动图（2024-03-10）：LVEF 62%，心脏结构及功能未见异常。`
  },
  'P003': {
    chiefComplaint: '慢性阻塞性肺疾病急性加重 3 天',
    presentIllness: `患者有 COPD 病史 10 年，3 天前受凉后出现咳嗽加重，咳黄脓痰，量较前增多，伴气促加重，活动后明显。无发热、胸痛、咯血等。自行服用抗生素（具体不详）效果不佳，遂来我院就诊。`,
    pastHistory: `COPD 病史 10 年，间断使用吸入药物治疗。

冠心病史 5 年，规律服用阿司匹林、美托洛尔等药物。

高血压 3 级病史 8 年，规律服用氨氯地平等药物。

吸烟史 40 年，约 20 支/天，已戒烟 2 年。`,
    physicalExamination: `T 37.2℃  P 96 次/分  R 24 次/分  BP 155/92mmHg  SpO2 92%（室内空气）

一般情况：神志清，精神差，半卧位，呼吸急促，口唇轻度发绀。

胸部：桶状胸，双肺呼吸音减弱，双肺可闻及散在干湿啰音。

心脏：心率 96 次/分，律齐，各瓣膜听诊区未闻及病理性杂音。

腹部：腹软，无压痛，肝脾未触及。

下肢：双下肢轻度水肿。`,
    auxiliaryExamination: `1. 血常规（2024-03-15）：WBC 12.5×10^9/L，N 82%，Hb 145g/L。

2. 血气分析（2024-03-15）：pH 7.35，PaO2 65mmHg，PaCO2 52mmHg，HCO3- 28mmol/L。

3. 胸部 CT（2024-03-15）：双肺透亮度增加，肺纹理增粗紊乱，双肺散在斑片状阴影。

4. 肺功能（2024-03-10）：FEV1 1.2L，FEV1% 45%，FEV1/FVC 58%。

5. 心电图（2024-03-15）：窦性心律，右心室肥厚。

6. 超声心动图（2024-03-15）：肺动脉高压（中度），右心室扩大。`
  }
}

export default function PatientInfo({ patientId, patientName, patientInpatientNo, compact = false, patientData }: PatientInfoProps) {
  const patient = mockPatients.find((p: Patient) => p.id === patientId)
  const medicalRecord = patientId ? mockMedicalRecords[patientId] : null

  if (!patient && !patientName && !patientData) {
    return null
  }

  // 优先使用传入的 patientData，否则使用 mockPatients 的数据
  const displayPatient = patientData ? {
    id: patientData.id,
    name: patientData.name,
    gender: patientData.gender,
    age: patientData.age,
    inpatientNo: patientData.inpatientNo,
    phone: patientData.phone || '-',
    admissionTime: patientData.admissionTime || '-',
    department: patientData.department || '-',
    doctor: patientData.doctor || '-',
    allergies: patientData.allergies || [],
    history: patientData.history || [],
    mainDiagnosis: patientData.mainDiagnosis || '-',
    imagingExams: patientData.imagingExams ? [{
      id: '1',
      type: '影像学检查',
      examDate: '',
      examBody: patientData.imagingExams,
      description: patientData.imagingExams,
      conclusion: ''
    }] : [],
    labTests: [],
    pathologyReports: [],
    otherExams: [],
    // 病历相关字段（从数据库加载）
    physicalExamination: patientData.physicalExamination || '',
    initialDiagnosis: patientData.initialDiagnosis || '',
    treatmentPlan: patientData.treatmentPlan || '',
    chiefComplaint: patientData.chiefComplaint || '',
    presentIllness: patientData.presentIllness || '',
    pastHistory: patientData.pastHistory || '',
    auxiliaryExamination: patientData.auxiliaryExamination || '',
  } : (patient || {
    id: patientId,
    name: patientName,
    inpatientNo: patientInpatientNo,
    gender: '-',
    age: '-',
    phone: '-',
    admissionTime: '-',
    department: '-',
    doctor: '-',
    allergies: [],
    history: [],
    mainDiagnosis: '-',
    imagingExams: [],
    labTests: [],
    pathologyReports: [],
    otherExams: [],
    physicalExamination: '',
    initialDiagnosis: '',
    treatmentPlan: '',
    chiefComplaint: '',
    presentIllness: '',
    pastHistory: '',
    auxiliaryExamination: '',
  })

  // 合并 mock 数据和数据库数据：优先使用数据库数据
  const mergedMedicalRecord = {
    chiefComplaint: displayPatient.chiefComplaint || medicalRecord?.chiefComplaint || '',
    presentIllness: displayPatient.presentIllness || medicalRecord?.presentIllness || '',
    pastHistory: displayPatient.pastHistory || medicalRecord?.pastHistory || '',
    physicalExamination: displayPatient.physicalExamination || medicalRecord?.physicalExamination || '',
    auxiliaryExamination: displayPatient.auxiliaryExamination || medicalRecord?.auxiliaryExamination || '',
    initialDiagnosis: displayPatient.initialDiagnosis || displayPatient.mainDiagnosis || '',
    treatmentPlan: displayPatient.treatmentPlan || '',
  }

  if (compact) {
    return (
      <Card size="small" title={<Space><UserOutlined />患者信息</Space>} className="bg-blue-50 border-blue-200">
        <Descriptions bordered column={3} size="small">
          <Descriptions.Item label="姓名">{displayPatient.name}</Descriptions.Item>
          <Descriptions.Item label="性别">{displayPatient.gender}</Descriptions.Item>
          <Descriptions.Item label="年龄">{displayPatient.age}岁</Descriptions.Item>
          <Descriptions.Item label="住院号">{displayPatient.inpatientNo}</Descriptions.Item>
          <Descriptions.Item label="联系电话">{displayPatient.phone}</Descriptions.Item>
          <Descriptions.Item label="入院时间">{displayPatient.admissionTime}</Descriptions.Item>
          <Descriptions.Item label="主治医生">{displayPatient.doctor}</Descriptions.Item>
          <Descriptions.Item label="所在科室">{displayPatient.department}</Descriptions.Item>
          <Descriptions.Item label="过敏史">
            {displayPatient.allergies && displayPatient.allergies.length > 0 ? (
              <Space wrap>
                {displayPatient.allergies.map((a: string) => <Tag key={a} color="red">{a}</Tag>)}
              </Space>
            ) : '无'}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card size="small" title={<Space><UserOutlined />患者基本信息</Space>} className="bg-blue-50 border-blue-200">
        <Descriptions bordered column={3} size="small">
          <Descriptions.Item label="姓名">{displayPatient.name}</Descriptions.Item>
          <Descriptions.Item label="性别">{displayPatient.gender}</Descriptions.Item>
          <Descriptions.Item label="年龄">{displayPatient.age}岁</Descriptions.Item>
          <Descriptions.Item label="住院号">{displayPatient.inpatientNo}</Descriptions.Item>
          <Descriptions.Item label="联系电话">{displayPatient.phone}</Descriptions.Item>
          <Descriptions.Item label="入院时间">{displayPatient.admissionTime}</Descriptions.Item>
          <Descriptions.Item label="主治医生">{displayPatient.doctor}</Descriptions.Item>
          <Descriptions.Item label="所在科室">{displayPatient.department}</Descriptions.Item>
          <Descriptions.Item label="初步诊断">
            <div className="font-medium text-blue-600">{displayPatient.mainDiagnosis}</div>
          </Descriptions.Item>
          <Descriptions.Item label="过敏史">
            {displayPatient.allergies && displayPatient.allergies.length > 0 ? (
              <Space wrap>
                {displayPatient.allergies.map((a: string) => <Tag key={a} color="red">{a}</Tag>)}
              </Space>
            ) : '无'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {displayPatient.history && displayPatient.history.length > 0 && (
        <Card size="small" title={<Space><MedicineBoxOutlined />既往病史</Space>}>
          <List
            dataSource={displayPatient.history}
            renderItem={(item: string) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar icon={<FileTextOutlined />} size="small" />}
                  title={item}
                />
              </List.Item>
            )}
          />
        </Card>
      )}

      {(mergedMedicalRecord.chiefComplaint || mergedMedicalRecord.presentIllness || mergedMedicalRecord.pastHistory || mergedMedicalRecord.physicalExamination || mergedMedicalRecord.auxiliaryExamination || mergedMedicalRecord.treatmentPlan || patient && (patient.imagingExams || patient.labTests || patient.pathologyReports || patient.otherExams)) ? (
        <Card size="small" title={<Space><FileTextOutlined />病历资料</Space>}>
          <Tabs
            defaultActiveKey="diagnosis"
            size="small"
            items={[
              {
                key: 'diagnosis',
                label: <Space><FileTextOutlined />初步诊断</Space>,
                children: (mergedMedicalRecord.initialDiagnosis || mergedMedicalRecord.presentIllness) ? (
                  <div className="space-y-2">
                    <div className="font-medium text-blue-600 text-base">{mergedMedicalRecord.initialDiagnosis || displayPatient.mainDiagnosis}</div>
                    {mergedMedicalRecord.presentIllness && (
                      <div>
                        <Text strong>诊断依据：</Text>
                        <div className="whitespace-pre-wrap text-sm mt-1">
                          {mergedMedicalRecord.chiefComplaint}\n\n{mergedMedicalRecord.presentIllness}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="font-medium text-blue-600 text-base">{displayPatient.mainDiagnosis}</div>
                )
              },
              {
                key: 'chief',
                label: <Space><FileTextOutlined />主诉</Space>,
                children: mergedMedicalRecord.chiefComplaint ? <div className="whitespace-pre-wrap text-sm">{mergedMedicalRecord.chiefComplaint}</div> : '无记录'
              },
              {
                key: 'present',
                label: <Space><HeartOutlined />现病史</Space>,
                children: mergedMedicalRecord.presentIllness ? <div className="whitespace-pre-wrap text-sm">{mergedMedicalRecord.presentIllness}</div> : '无记录'
              },
              {
                key: 'past',
                label: <Space><MedicineBoxOutlined />既往史</Space>,
                children: mergedMedicalRecord.pastHistory ? <div className="whitespace-pre-wrap text-sm">{mergedMedicalRecord.pastHistory}</div> : '无记录'
              },
              {
                key: 'physical',
                label: <Space><ToolOutlined />体格检查</Space>,
                children: mergedMedicalRecord.physicalExamination ? <div className="whitespace-pre-wrap text-sm">{mergedMedicalRecord.physicalExamination}</div> : '无记录'
              },
              {
                key: 'treatment',
                label: <Space><ToolOutlined />治疗方案</Space>,
                children: mergedMedicalRecord.treatmentPlan ? <div className="whitespace-pre-wrap text-sm">{mergedMedicalRecord.treatmentPlan}</div> : '无记录'
              },
              {
                key: 'imaging',
                label: <Space><PictureOutlined />影像学检查</Space>,
                children: patient && patient.imagingExams && patient.imagingExams.length > 0 ? (
                  <Tabs
                    size="small"
                    type="card"
                    items={patient.imagingExams.map(exam => ({
                      key: exam.id,
                      label: (
                        <Space>
                          <Tag color="blue">{exam.type}</Tag>
                          <span className="text-xs">{exam.examDate}</span>
                        </Space>
                      ),
                      children: (
                        <div className="space-y-3">
                          <div>
                            <Text strong>检查部位：</Text>
                            <span className="text-sm">{exam.examBody}</span>
                          </div>
                          <div>
                            <Text strong>检查所见：</Text>
                            <div className="whitespace-pre-wrap text-sm mt-1">{exam.findings}</div>
                          </div>
                          <div>
                            <Text strong>诊断意见：</Text>
                            <div className="whitespace-pre-wrap text-sm mt-1 text-blue-600 font-medium">{exam.impression}</div>
                          </div>
                          {exam.reportDoctor && (
                            <div>
                              <Text strong>报告医生：</Text>
                              <span className="text-sm">{exam.reportDoctor}</span>
                            </div>
                          )}
                          {exam.reportUrl && (
                            <div>
                              <Button type="link" size="small" icon={<FileProtectOutlined />}>
                                查看报告
                              </Button>
                            </div>
                          )}
                        </div>
                      )
                    }))}
                  />
                ) : '无影像学检查记录'
              },
              {
                key: 'lab',
                label: <Space><RiseOutlined />实验室检查</Space>,
                children: patient && patient.labTests && patient.labTests.length > 0 ? (
                  <Table
                    columns={[
                      {
                        title: '检查日期',
                        dataIndex: 'testDate',
                        key: 'testDate',
                        width: 100,
                        sorter: (a, b) => a.testDate.localeCompare(b.testDate)
                      },
                      {
                        title: '检查项目',
                        dataIndex: 'testName',
                        key: 'testName',
                        width: 150
                      },
                      {
                        title: '具体指标',
                        dataIndex: 'testItem',
                        key: 'testItem',
                        width: 150
                      },
                      {
                        title: '结果',
                        dataIndex: 'result',
                        key: 'result',
                        width: 80,
                        render: (value: string, record: any) => (
                          <Space>
                            <span className="font-medium">{value}</span>
                            {record.flag && record.flag !== '正常' && (
                              <Tag color={record.flag === '↑' || record.flag === 'H' ? 'red' : 'green'}>
                                {record.flag}
                              </Tag>
                            )}
                            {record.flag === '正常' && <Tag color="green">正常</Tag>}
                          </Space>
                        )
                      },
                      {
                        title: '单位',
                        dataIndex: 'unit',
                        key: 'unit',
                        width: 100
                      },
                      {
                        title: '参考范围',
                        dataIndex: 'referenceRange',
                        key: 'referenceRange',
                        width: 120
                      }
                    ] as ColumnsType<any>}
                    dataSource={patient.labTests}
                    rowKey="id"
                    size="small"
                    pagination={{ pageSize: 10, showSizeChanger: false }}
                    scroll={{ y: 300 }}
                  />
                ) : '无实验室检查记录'
              },
              {
                key: 'pathology',
                label: <Space><FileProtectOutlined />病理报告</Space>,
                children: patient && patient.pathologyReports && patient.pathologyReports.length > 0 ? (
                  <Tabs
                    size="small"
                    type="card"
                    items={patient.pathologyReports.map(report => ({
                      key: report.id,
                      label: (
                        <Space>
                          <Tag color="purple">{report.sampleType}</Tag>
                          <span className="text-xs">{report.reportDate}</span>
                        </Space>
                      ),
                      children: (
                        <div className="space-y-3">
                          <div>
                            <Text strong>取材部位：</Text>
                            <span className="text-sm">{report.sampleSite}</span>
                          </div>
                          <div>
                            <Text strong>镜下所见：</Text>
                            <div className="whitespace-pre-wrap text-sm mt-1">{report.microscopicFindings}</div>
                          </div>
                          <div>
                            <Text strong>病理诊断：</Text>
                            <div className="whitespace-pre-wrap text-sm mt-1 text-purple-600 font-medium">{report.pathologicalDiagnosis}</div>
                          </div>
                          {report.immunohistochemistry && (
                            <div>
                              <Text strong>免疫组化：</Text>
                              <div className="whitespace-pre-wrap text-sm mt-1">{report.immunohistochemistry}</div>
                            </div>
                          )}
                          {report.molecularTest && (
                            <div>
                              <Text strong>分子检测：</Text>
                              <div className="whitespace-pre-wrap text-sm mt-1">{report.molecularTest}</div>
                            </div>
                          )}
                          {report.reportDoctor && (
                            <div>
                              <Text strong>报告医生：</Text>
                              <span className="text-sm">{report.reportDoctor}</span>
                            </div>
                          )}
                          {report.reportUrl && (
                            <div>
                              <Button type="link" size="small" icon={<FileProtectOutlined />}>
                                查看报告
                              </Button>
                            </div>
                          )}
                        </div>
                      )
                    }))}
                  />
                ) : '无病理报告'
              },
              {
                key: 'other',
                label: <Space><UnorderedListOutlined />其他检查</Space>,
                children: patient && patient.otherExams && patient.otherExams.length > 0 ? (
                  <Tabs
                    size="small"
                    type="card"
                    items={patient.otherExams.map(exam => ({
                      key: exam.id,
                      label: (
                        <Space>
                          <Tag color="orange">{exam.examType}</Tag>
                          <span className="text-xs">{exam.examDate}</span>
                        </Space>
                      ),
                      children: (
                        <div className="space-y-3">
                          {exam.findings && (
                            <div>
                              <Text strong>检查所见：</Text>
                              <div className="whitespace-pre-wrap text-sm mt-1">{exam.findings}</div>
                            </div>
                          )}
                          <div>
                            <Text strong>结论：</Text>
                            <div className="whitespace-pre-wrap text-sm mt-1 text-orange-600 font-medium">{exam.conclusion}</div>
                          </div>
                          {exam.reportUrl && (
                            <div>
                              <Button type="link" size="small" icon={<FileProtectOutlined />}>
                                查看报告
                              </Button>
                            </div>
                          )}
                        </div>
                      )
                    }))}
                  />
                ) : '无其他检查记录'
              }
            ]}
          />
        </Card>
      ) : null}
    </div>
  )
}
