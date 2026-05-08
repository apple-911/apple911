export interface MedicalCase {
  id: string
  caseTitle: string
  consultationId: string
  patientInfo: {
    name: string
    gender: '男' | '女'
    age: number
    inpatientNo: string
    department: string
  }
  diagnosis: {
    primary: string
    icd10: string
    secondary: string[]
    tnmStage?: string
    department: string
  }
  medicalRecord: {
    chiefComplaint: string
    presentIllness: string
    pastHistory: string
    physicalExam: string
    auxiliaryExam: string
  }
  mdtInfo: {
    meetingDate: string
    location: string
    experts: Array<{
      name: string
      department: string
      title: string
      opinion: string
    }>
    discussion: string
    conclusion: string
  }
  treatmentPlan: {
    primary: string
    alternative?: string
    medications: string[]
    surgery?: string
    radiotherapy?: string
  }
  followUp: {
    status: '未开始' | '进行中' | '已完成'
    records: Array<{
      date: string
      result: string
      survivalStatus: string
      notes: string
    }>
  }
  qualityControl: {
    score: number
    reviewer: string
    reviewDate: string
    comments: string
  }
  tags: string[]
  attachments: {
    imagingReports: string[]
    pathologyReports: string[]
    audioUrl?: string
    videoUrl?: string
  }
  metadata: {
    createdAt: string
    updatedAt: string
    createdBy: string
    viewCount: number
    favoriteCount: number
  }
}

export const mockMedicalCases: MedicalCase[] = [
  {
    id: 'CASE001',
    caseTitle: '左肺鳞癌III期MDT病例',
    consultationId: 'C001',
    patientInfo: {
      name: '王**',
      gender: '男',
      age: 62,
      inpatientNo: 'ZY2024001234',
      department: '肿瘤科',
    },
    diagnosis: {
      primary: '左肺鳞癌III期',
      icd10: 'C34.900',
      secondary: ['高血压2级', '2型糖尿病'],
      tnmStage: 'cT4N2M0',
      department: '肿瘤科',
    },
    medicalRecord: {
      chiefComplaint: '反复咳嗽、咳痰3月，加重伴咯血1周',
      presentIllness: '患者3月前无明显诱因出现咳嗽、咳痰，为白色粘痰，无发热、胸痛。1周前症状加重，出现痰中带血，每日约5-10ml，鲜红色。外院胸部CT示：左肺上叶占位性病变，伴纵隔淋巴结肿大。',
      pastHistory: '高血压病史10年，最高180/100mmHg，目前服用氨氯地平5mg qd。2型糖尿病史5年，目前服用二甲双胍0.5g tid。',
      physicalExam: 'T 36.5℃，P 78次/分，R 18次/分，BP 145/85mmHg。左锁骨上可触及一枚肿大淋巴结，约1.5cm×1.0cm，质硬，无压痛，活动度差。',
      auxiliaryExam: '胸部CT（2024-03-10）：左肺上叶占位，约4.5cm×3.8cm，伴纵隔淋巴结转移。PET-CT（2024-03-12）：左肺上叶高代谢病灶，SUVmax 12.5。病理活检（2024-03-13）：（左肺穿刺）鳞癌，低分化。',
    },
    mdtInfo: {
      meetingDate: '2024-03-15',
      location: 'MDT会诊中心',
      experts: [
        { name: '张明华', department: '肿瘤科', title: '主任医师', opinion: '建议同步放化疗，紫杉醇+卡铂方案' },
        { name: '李芳', department: '胸外科', title: '副主任医师', opinion: '目前无手术指征，建议先放化疗降期' },
        { name: '王建国', department: '放射科', title: '主任医师', opinion: 'PET-CT显示局部晚期，建议根治性放疗DT 60-66Gy' },
        { name: '刘晓燕', department: '病理科', title: '主任医师', opinion: '鳞癌低分化，建议完善PD-L1检测' },
      ],
      discussion: '2024-03-15 14:00-15:30 在MDT会诊中心召开多学科会诊。各科专家详细讨论后一致认为患者目前无手术指征，建议行同步放化疗。',
      conclusion: '同步放化疗 + 免疫治疗',
    },
    treatmentPlan: {
      primary: '同步放化疗：紫杉醇+卡铂方案，根治性放疗DT 60-66Gy/30-33f',
      alternative: '免疫治疗联合化疗：PD-1抑制剂+紫杉醇+卡铂',
      medications: ['紫杉醇', '卡铂', '帕博利珠单抗'],
      radiotherapy: '根治性放疗，DT 60-66Gy/30-33f',
    },
    followUp: {
      status: '进行中',
      records: [
        { date: '2024-04-15', result: 'PR（部分缓解）', survivalStatus: '存活', notes: '复查胸部CT示病灶缩小约40%' },
        { date: '2024-07-15', result: 'PR', survivalStatus: '存活', notes: '继续随访中' },
      ],
    },
    qualityControl: {
      score: 96.8,
      reviewer: '质控员A',
      reviewDate: '2024-03-16',
      comments: '会诊记录完整，专家意见充分，治疗方案规范',
    },
    tags: ['典型病例', '教学示范', '科研价值'],
    attachments: {
      imagingReports: ['/reports/C001_ct.pdf', '/reports/C001_petct.pdf'],
      pathologyReports: ['/reports/C001_pathology.pdf'],
      audioUrl: '/recordings/C001_audio.mp3',
      videoUrl: '/recordings/C001_video.mp4',
    },
    metadata: {
      createdAt: '2024-03-15',
      updatedAt: '2024-07-15',
      createdBy: '张明华',
      viewCount: 156,
      favoriteCount: 23,
    },
  },
  {
    id: 'CASE002',
    caseTitle: '乳腺癌IIB期MDT病例',
    consultationId: 'C002',
    patientInfo: {
      name: '李**',
      gender: '女',
      age: 55,
      inpatientNo: 'ZY2024001256',
      department: '乳腺外科',
    },
    diagnosis: {
      primary: '乳腺癌改良根治术后',
      icd10: 'C50.900',
      secondary: [],
      tnmStage: 'pT2N1M0，IIB期',
      department: '乳腺外科',
    },
    medicalRecord: {
      chiefComplaint: '发现乳腺肿物2个月',
      presentIllness: '患者2个月前洗澡时无意中发现左乳外上象限肿物，约2cm×2cm，无疼痛，无乳头溢液。穿刺活检：左乳浸润性导管癌。',
      pastHistory: '否认高血压、糖尿病史。月经史：14岁初潮，50岁绝经。生育史：孕2产2。',
      physicalExam: '左乳外上象限可触及一肿物，约2cm×2cm，质硬，边界不清，活动度可，无压痛。',
      auxiliaryExam: '乳腺彩超：左乳外上象限低回声结节（2.1cm×1.8cm），BI-RADS 5类。穿刺活检：左乳浸润性导管癌，ER(+)，PR(+)，HER2(-)，Ki-67 30%。',
    },
    mdtInfo: {
      meetingDate: '2024-03-14',
      location: 'MDT会诊中心',
      experts: [
        { name: '陈伟', department: '乳腺外科', title: '副主任医师', opinion: '建议新辅助化疗后手术治疗' },
        { name: '张明华', department: '肿瘤科', title: '主任医师', opinion: 'Luminal B型，建议AC-T方案' },
        { name: '刘晓燕', department: '病理科', title: '主任医师', opinion: '建议完善BRCA1/2基因检测' },
      ],
      discussion: '2024-03-14 10:00-11:00 完成多学科会诊，参加专家5人。',
      conclusion: '新辅助化疗+手术治疗',
    },
    treatmentPlan: {
      primary: 'AC-T方案（多柔比星+环磷酰胺序贯紫杉醇）×4周期',
      medications: ['多柔比星', '环磷酰胺', '紫杉醇'],
      surgery: '乳腺癌改良根治术',
    },
    followUp: {
      status: '已完成',
      records: [
        { date: '2024-06-14', result: 'CR（完全缓解）', survivalStatus: '存活', notes: '术后恢复良好' },
        { date: '2024-09-14', result: 'NED（无疾病证据）', survivalStatus: '存活', notes: '定期复查中' },
      ],
    },
    qualityControl: {
      score: 95.2,
      reviewer: '质控员A',
      reviewDate: '2024-03-15',
      comments: '会诊流程规范，治疗方案符合指南',
    },
    tags: ['典型病例', '教学示范'],
    attachments: {
      imagingReports: ['/reports/C002_ultrasound.pdf'],
      pathologyReports: ['/reports/C002_pathology.pdf'],
    },
    metadata: {
      createdAt: '2024-03-14',
      updatedAt: '2024-09-14',
      createdBy: '陈伟',
      viewCount: 98,
      favoriteCount: 15,
    },
  },
  {
    id: 'CASE003',
    caseTitle: '直肠癌伴肝转移MDT病例',
    consultationId: 'C003',
    patientInfo: {
      name: '张**',
      gender: '男',
      age: 58,
      inpatientNo: 'ZY2024001301',
      department: '肛肠外科',
    },
    diagnosis: {
      primary: '直肠癌伴肝转移',
      icd10: 'C18.900',
      secondary: ['2型糖尿病'],
      tnmStage: 'cT3N1M1，IV期',
      department: '肛肠外科',
    },
    medicalRecord: {
      chiefComplaint: '便血伴排便习惯改变3个月',
      presentIllness: '患者3个月前出现便血，鲜红色，伴排便习惯改变，大便变细。肠镜示：直肠距肛门8cm处见一菜花样肿物。',
      pastHistory: '2型糖尿病史8年，目前使用胰岛素治疗。',
      physicalExam: '直肠指检：距肛门8cm处可触及一质硬肿物，占肠腔1/2周。',
      auxiliaryExam: '肠镜：直肠距肛门8cm处菜花样肿物。病理：直肠腺癌。腹部CT：肝右叶见2个转移灶，最大约3cm。',
    },
    mdtInfo: {
      meetingDate: '2024-03-13',
      location: 'MDT会诊中心',
      experts: [
        { name: '王建国', department: '胃肠外科', title: '主任医师', opinion: '建议新辅助化疗后评估手术可能性' },
        { name: '李芳', department: '肿瘤科', title: '副主任医师', opinion: 'FOLFOX方案联合靶向治疗' },
      ],
      discussion: '2024-03-13 15:00-16:30 完成多学科会诊。',
      conclusion: '转化治疗+手术评估',
    },
    treatmentPlan: {
      primary: 'FOLFOX方案+贝伐珠单抗',
      alternative: 'FOLFIRI方案+西妥昔单抗',
      medications: ['奥沙利铂', '亚叶酸钙', '氟尿嘧啶', '贝伐珠单抗'],
      surgery: '如转化成功，行直肠癌根治术+肝转移灶切除术',
    },
    followUp: {
      status: '进行中',
      records: [
        { date: '2024-05-13', result: 'SD（疾病稳定）', survivalStatus: '存活', notes: '继续化疗中' },
      ],
    },
    qualityControl: {
      score: 89.2,
      reviewer: '质控员B',
      reviewDate: '2024-03-14',
      comments: '会诊记录基本完整，建议补充基因检测结果',
    },
    tags: ['疑难病例', '科研价值'],
    attachments: {
      imagingReports: ['/reports/C003_ct.pdf'],
      pathologyReports: ['/reports/C003_pathology.pdf'],
    },
    metadata: {
      createdAt: '2024-03-13',
      updatedAt: '2024-05-13',
      createdBy: '王建国',
      viewCount: 67,
      favoriteCount: 8,
    },
  },
  {
    id: 'CASE004',
    caseTitle: '胃癌晚期MDT病例',
    consultationId: 'C004',
    patientInfo: {
      name: '刘**',
      gender: '女',
      age: 68,
      inpatientNo: 'ZY2024001356',
      department: '消化内科',
    },
    diagnosis: {
      primary: '胃癌晚期',
      icd10: 'C16.900',
      secondary: ['冠心病'],
      tnmStage: 'cT4N3M1，IV期',
      department: '消化内科',
    },
    medicalRecord: {
      chiefComplaint: '发现胃癌晚期3个月，腹痛伴消瘦2个月',
      presentIllness: '患者3个月前因"上腹不适"就诊，胃镜检查示：胃窦低分化腺癌。2个月来出现腹痛、纳差、消瘦，体重下降约8kg。',
      pastHistory: '高血压病史5年，规律服药控制可。冠心病史3年。',
      physicalExam: '神志清楚，精神萎靡，消瘦体型。上腹部轻压痛，无反跳痛及肌紧张。',
      auxiliaryExam: '胃镜：胃窦低分化腺癌。PET-CT：胃窦癌伴腹腔多发淋巴结转移，肝左叶可疑转移灶。肿瘤标志物：CEA 45.6ng/mL↑。',
    },
    mdtInfo: {
      meetingDate: '2024-03-12',
      location: 'MDT会诊中心',
      experts: [
        { name: '王建国', department: '消化内科', title: '主任医师', opinion: '建议姑息性化疗联合免疫治疗' },
        { name: '张明华', department: '肿瘤科', title: '主任医师', opinion: 'SOX方案+帕博利珠单抗' },
      ],
      discussion: '2024-03-12 09:00-10:00 完成多学科会诊。',
      conclusion: '姑息化疗+免疫治疗+支持治疗',
    },
    treatmentPlan: {
      primary: 'SOX方案（奥沙利铂+替吉奥）+帕博利珠单抗',
      medications: ['奥沙利铂', '替吉奥', '帕博利珠单抗'],
    },
    followUp: {
      status: '进行中',
      records: [
        { date: '2024-04-12', result: 'SD', survivalStatus: '存活', notes: '症状有所缓解' },
      ],
    },
    qualityControl: {
      score: 91.8,
      reviewer: '质控员A',
      reviewDate: '2024-03-13',
      comments: '治疗方案合理，注意支持治疗',
    },
    tags: ['疑难病例'],
    attachments: {
      imagingReports: ['/reports/C004_gastroscopy.pdf'],
      pathologyReports: ['/reports/C004_pathology.pdf'],
    },
    metadata: {
      createdAt: '2024-03-12',
      updatedAt: '2024-04-12',
      createdBy: '王建国',
      viewCount: 45,
      favoriteCount: 5,
    },
  },
  {
    id: 'CASE005',
    caseTitle: '前列腺癌去势抵抗性MDT病例',
    consultationId: 'C005',
    patientInfo: {
      name: '陈**',
      gender: '男',
      age: 72,
      inpatientNo: 'ZY2024001402',
      department: '泌尿外科',
    },
    diagnosis: {
      primary: '前列腺癌去势抵抗性',
      icd10: 'C61.000',
      secondary: ['慢性阻塞性肺疾病'],
      tnmStage: 'T3N1M1',
      department: '泌尿外科',
    },
    medicalRecord: {
      chiefComplaint: '前列腺癌内分泌治疗2年后PSA升高',
      presentIllness: '患者2年前确诊前列腺癌，行内分泌治疗，近期PSA进行性升高。',
      pastHistory: '慢性阻塞性肺疾病史10年。',
      physicalExam: '前列腺指检：前列腺增大，质硬。',
      auxiliaryExam: 'PSA：45.6ng/mL↑。骨扫描：多发骨转移。',
    },
    mdtInfo: {
      meetingDate: '2024-03-11',
      location: 'MDT会诊中心',
      experts: [
        { name: '赵红梅', department: '泌尿外科', title: '主任医师', opinion: '建议更换内分泌治疗方案' },
        { name: '张明华', department: '肿瘤科', title: '主任医师', opinion: '考虑化疗或新型内分泌治疗' },
      ],
      discussion: '2024-03-11 16:30-17:30 完成多学科会诊。',
      conclusion: '新型内分泌治疗+骨保护治疗',
    },
    treatmentPlan: {
      primary: '阿比特龙+泼尼松',
      medications: ['阿比特龙', '泼尼松', '唑来膦酸'],
    },
    followUp: {
      status: '进行中',
      records: [
        { date: '2024-04-11', result: 'PSA下降', survivalStatus: '存活', notes: 'PSA降至28.5ng/mL' },
      ],
    },
    qualityControl: {
      score: 85.3,
      reviewer: '质控员B',
      reviewDate: '2024-03-12',
      comments: '会诊记录需完善',
    },
    tags: [],
    attachments: {
      imagingReports: ['/reports/C005_bonescan.pdf'],
      pathologyReports: [],
    },
    metadata: {
      createdAt: '2024-03-11',
      updatedAt: '2024-04-11',
      createdBy: '赵红梅',
      viewCount: 32,
      favoriteCount: 3,
    },
  },
]

export const mockCaseStatistics = {
  totalCases: 1247,
  departments: [
    { name: '肿瘤科', count: 320, percentage: 25.7 },
    { name: '胸外科', count: 280, percentage: 22.5 },
    { name: '放疗科', count: 245, percentage: 19.6 },
    { name: '病理科', count: 198, percentage: 15.9 },
    { name: '影像科', count: 204, percentage: 16.4 },
  ],
  diseaseTypes: [
    { name: '肺癌', count: 320, percentage: 25.7 },
    { name: '乳腺癌', count: 280, percentage: 22.5 },
    { name: '消化道肿瘤', count: 245, percentage: 19.6 },
    { name: '泌尿系肿瘤', count: 198, percentage: 15.9 },
    { name: '其他', count: 204, percentage: 16.4 },
  ],
  typicalCases: 32,
  difficultCases: 45,
  teachingCases: 28,
  researchCases: 56,
  monthlyTrend: [
    { month: '2023-10', count: 85 },
    { month: '2023-11', count: 92 },
    { month: '2023-12', count: 105 },
    { month: '2024-01', count: 118 },
    { month: '2024-02', count: 125 },
    { month: '2024-03', count: 142 },
  ],
}
