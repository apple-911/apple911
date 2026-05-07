import { Expert, Patient, Consultation, Report, FollowupPlan } from '../stores/consultationStore'

export const mockExperts: Expert[] = [
  { id: '1', name: '张明华', department: '肿瘤科', title: '主任医师', specialty: '肺癌综合治疗', status: '空闲' },
  { id: '2', name: '李芳', department: '胸外科', title: '副主任医师', specialty: '微创手术', status: '忙碌' },
  { id: '3', name: '王建国', department: '放射科', title: '主任医师', specialty: '影像诊断', status: '空闲' },
  { id: '4', name: '刘晓燕', department: '病理科', title: '主任医师', specialty: '分子病理', status: '空闲' },
  { id: '5', name: '陈伟', department: '肿瘤科', title: '副主任医师', specialty: '化疗方案', status: '忙碌' },
  { id: '6', name: '赵红梅', department: '呼吸科', title: '主任医师', specialty: '呼吸介入', status: '空闲' },
  { id: '7', name: '孙志强', department: '放疗科', title: '副主任医师', specialty: '精确放疗', status: '离线' },
  { id: '8', name: '周丽萍', department: '营养科', title: '副主任医师', specialty: '临床营养', status: '空闲' },
]

export const mockPatients: Patient[] = [
  {
    id: 'P001',
    name: '王建国',
    gender: '男',
    age: 62,
    inpatientNo: 'ZY2024001234',
    phone: '138****5678',
    mainDiagnosis: '左肺鳞癌III期',
    lastConsultationTime: '2024-03-15',
    admissionTime: '2024-03-01',
    department: '肿瘤科',
    doctor: '张明华',
    allergies: ['青霉素'],
    history: ['高血压病史10年', '2型糖尿病史5年']
  },
  {
    id: 'P002',
    name: '李秀英',
    gender: '女',
    age: 55,
    inpatientNo: 'ZY2024001256',
    phone: '139****8765',
    mainDiagnosis: '乳腺癌改良根治术后',
    admissionTime: '2024-03-10',
    department: '乳腺外科',
    doctor: '陈伟',
    allergies: [],
    history: ['无明显既往史']
  },
  {
    id: 'P003',
    name: '张伟',
    gender: '男',
    age: 45,
    inpatientNo: 'ZY2024001301',
    phone: '137****2345',
    mainDiagnosis: '直肠癌伴肝转移',
    admissionTime: '2024-03-12',
    department: '肛肠外科',
    doctor: '李芳',
    allergies: ['磺胺类'],
    history: ['吸烟史20年']
  },
  {
    id: 'P004',
    name: '刘芳',
    gender: '女',
    age: 68,
    inpatientNo: 'ZY2024001356',
    phone: '136****9876',
    mainDiagnosis: '胃癌晚期',
    admissionTime: '2024-03-08',
    department: '消化内科',
    doctor: '王建国',
    allergies: [],
    history: ['冠心病史3年']
  },
  {
    id: 'P005',
    name: '陈刚',
    gender: '男',
    age: 72,
    inpatientNo: 'ZY2024001402',
    phone: '135****4567',
    mainDiagnosis: '前列腺癌去势抵抗性',
    admissionTime: '2024-03-05',
    department: '泌尿外科',
    doctor: '赵红梅',
    allergies: ['头孢类'],
    history: ['慢性阻塞性肺疾病']
  }
]

export const mockConsultations: Consultation[] = [
  {
    id: 'C001',
    patientId: 'P001',
    patientName: '王建国',
    patientInpatientNo: 'ZY2024001234',
    type: '院内',
    applyTime: '2024-03-15 09:30',
    expectTime: '2024-03-20 14:00',
    status: '待审核',
    urgency: '紧急',
    department: '肿瘤科',
    applyDoctor: '张明华',
    experts: [mockExperts[0], mockExperts[1], mockExperts[2]],
    mainDiagnosis: '左肺鳞癌III期，综合治疗方案讨论'
  },
  {
    id: 'C002',
    patientId: 'P002',
    patientName: '李秀英',
    patientInpatientNo: 'ZY2024001256',
    type: '院内',
    applyTime: '2024-03-14 10:00',
    expectTime: '2024-03-18 15:00',
    status: '已通过',
    urgency: '普通',
    department: '乳腺外科',
    applyDoctor: '陈伟',
    experts: [mockExperts[1], mockExperts[3], mockExperts[7]],
    mainDiagnosis: '乳腺癌术后辅助治疗方案'
  },
  {
    id: 'C003',
    patientId: 'P003',
    patientName: '张伟',
    patientInpatientNo: 'ZY2024001301',
    type: '远程',
    applyTime: '2024-03-13 14:20',
    expectTime: '2024-03-19 10:00',
    status: '进行中',
    urgency: '紧急',
    department: '肛肠外科',
    applyDoctor: '李芳',
    experts: [mockExperts[0], mockExperts[2], mockExperts[4]],
    mainDiagnosis: '直肠癌肝转移多学科讨论'
  },
  {
    id: 'C004',
    patientId: 'P004',
    patientName: '刘芳',
    patientInpatientNo: 'ZY2024001356',
    type: '院内',
    applyTime: '2024-03-12 08:45',
    expectTime: '2024-03-17 09:00',
    status: '已完成',
    urgency: '普通',
    department: '消化内科',
    applyDoctor: '王建国',
    experts: [mockExperts[1], mockExperts[3], mockExperts[5]],
    mainDiagnosis: '胃癌晚期姑息治疗方案'
  },
  {
    id: 'C005',
    patientId: 'P005',
    patientName: '陈刚',
    patientInpatientNo: 'ZY2024001402',
    type: '院内',
    applyTime: '2024-03-11 16:30',
    expectTime: '2024-03-16 11:00',
    status: '已拒绝',
    urgency: '普通',
    department: '泌尿外科',
    applyDoctor: '赵红梅',
    experts: [mockExperts[0], mockExperts[4]],
    mainDiagnosis: '前列腺癌去势抵抗治疗选择'
  }
]

export const mockReports: Report[] = [
  {
    id: 'R001',
    consultationId: 'C004',
    patientName: '刘芳',
    consultationTime: '2024-03-17 09:00',
    responsibleExpert: '王建国',
    status: '已签名',
    chiefComplaint: '发现胃癌晚期 3 个月，腹痛伴消瘦 2 个月',
    historyOfPresentIllness: '患者 3 个月前因"上腹不适"就诊，胃镜检查示：胃窦低分化腺癌，病理活检证实。2 个月来出现腹痛、纳差、消瘦，体重下降约 8kg。PET-CT 提示：胃窦癌伴腹腔多发淋巴结转移，肝左叶可疑转移灶。',
    pastHistory: '高血压病史 5 年，规律服药控制可。否认糖尿病、心脏病史。无手术外伤史。无输血史。无药物食物过敏史。',
    physicalExamination: 'T 36.5℃, P 78 次/分，R 18 次/分，BP 135/85mmHg。神志清楚，精神萎靡，消瘦体型。全身皮肤黏膜无黄染，浅表淋巴结未触及肿大。心肺查体无异常。腹平坦，上腹部轻压痛，无反跳痛及肌紧张，肝脾肋下未触及，移动性浊音阴性，肠鸣音正常。',
    auxiliaryExamination: '胃镜：胃窦低分化腺癌。病理：（胃窦）低分化腺癌，部分印戒细胞癌。PET-CT：胃窦癌伴腹腔多发淋巴结转移，肝左叶可疑转移灶。肿瘤标志物：CEA 45.6ng/mL, CA19-9 128.5U/mL, CA72-4 35.2U/mL。',
    consultationOpinion: '1. 诊断：胃窦低分化腺癌伴腹腔淋巴结转移（cT4N3M1，IV 期）\n2. 分期：晚期胃癌，不可手术切除\n3. ECOG 评分：2 分\n4. 建议行姑息性化疗联合免疫治疗',
    treatmentSuggestion: '1. 化疗方案：SOX 方案（奥沙利铂 + 替吉奥）\n2. 免疫治疗：帕博利珠单抗 200mg q3w\n3. 支持治疗：营养支持、止痛、抑酸等对症治疗\n4. 建议行基因检测（HER2、MSI、PD-L1 等）指导后续治疗\n5. 定期复查血常规、肝肾功能、肿瘤标志物及影像学检查',
    followupPlan: '1. 每 3 周复查血常规、肝肾功能\n2. 每 2 周期复查胸腹盆 CT 评估疗效\n3. 每 3 周期复查胃镜\n4. 如出现不良反应及时就诊\n5. 加强营养支持，改善生活质量'
  },
  {
    id: 'R002',
    consultationId: 'C003',
    patientName: '张伟',
    consultationTime: '2024-03-19 10:00',
    responsibleExpert: '李芳',
    status: '草稿',
    chiefComplaint: '咳嗽、咳痰伴痰中带血 3 个月',
    historyOfPresentIllness: '患者 3 个月前无明显诱因出现咳嗽、咳痰，痰中带血丝，伴右侧胸痛、气促。在外院行胸部 CT 示：右肺上叶占位，考虑肺癌可能性大。支气管镜检查：右肺上叶新生物，病理示：肺腺癌。',
    pastHistory: '吸烟史 20 年，20 支/天。否认高血压、糖尿病史。无手术外伤史。',
    physicalExamination: 'T 36.8℃, P 82 次/分，R 20 次/分，BP 128/82mmHg。神清，精神可。全身浅表淋巴结未触及肿大。气管居中，右肺呼吸音稍低，未闻及干湿啰音。心率 82 次/分，律齐，无杂音。',
    auxiliaryExamination: '胸部 CT：右肺上叶占位（约 4.5cm×3.8cm），伴右侧肺门及纵隔淋巴结肿大。头颅 MRI 未见明显转移灶。腹部 B 超：肝、胆、胰、脾、双肾未见明显异常。骨扫描：未见骨转移征象。',
    consultationOpinion: '1. 诊断：右肺上叶肺腺癌 cT2aN2M0，IIIA 期\n2. EGFR 基因突变检测：19 号外显子缺失突变阳性\n3. 建议行靶向治疗联合局部放疗',
    treatmentSuggestion: '1. 靶向治疗：奥希替尼 80mg qd 口服\n2. 局部放疗：建议行右肺病灶及纵隔淋巴结调强放疗\n3. 定期复查胸部 CT、肿瘤标志物\n4. 戒烟，加强营养支持',
    followupPlan: '1. 每 4 周复查血常规、肝肾功能\n2. 每 8 周复查胸部 CT 评估疗效\n3. 每 12 周复查头颅 MRI\n4. 监测靶向药物不良反应（皮疹、腹泻等）\n5. 定期随访，如有不适及时就诊'
  },
  {
    id: 'R003',
    consultationId: 'C002',
    patientName: '李秀英',
    consultationTime: '2024-03-18 15:00',
    responsibleExpert: '陈伟',
    status: '待签名',
    chiefComplaint: '发现乳腺肿物 2 个月',
    historyOfPresentIllness: '患者 2 个月前洗澡时无意中发现左乳外上象限肿物，约 2cm×2cm，无疼痛，无乳头溢液。在外院行乳腺彩超示：左乳外上象限低回声结节，BI-RADS 5 类。乳腺钼靶：左乳外上象限高密度影，伴细小钙化。穿刺活检：左乳浸润性导管癌。',
    pastHistory: '否认高血压、糖尿病、心脏病史。无手术外伤史。无输血史。无药物食物过敏史。月经史：14 岁初潮，50 岁绝经。生育史：孕 2 产 2。',
    physicalExamination: 'T 36.5℃, P 76 次/分，R 18 次/分，BP 125/80mmHg。神清，精神可。全身浅表淋巴结未触及肿大。双乳对称，左乳外上象限可触及一肿物，约 2cm×2cm，质硬，边界不清，活动度可，无压痛。双侧乳头无溢液。',
    auxiliaryExamination: '乳腺彩超：左乳外上象限低回声结节（2.1cm×1.8cm），BI-RADS 5 类，左侧腋窝淋巴结肿大。乳腺钼靶：左乳外上象限高密度影，伴细小钙化。穿刺活检：左乳浸润性导管癌，ER(+)，PR(+)，HER2(-)，Ki-67 30%。',
    consultationOpinion: '1. 诊断：左乳浸润性导管癌 cT2N1M0，IIB 期\n2. 分子分型：Luminal B 型（HR+/HER2-）\n3. 建议行新辅助化疗后手术治疗',
    treatmentSuggestion: '1. 新辅助化疗：AC-T 方案（多柔比星 + 环磷酰胺序贯紫杉醇）\n2. 化疗 4 周期后评估疗效，如肿瘤缩小则行乳腺癌改良根治术\n3. 术后根据病理情况决定是否行辅助放疗及内分泌治疗\n4. 建议行基因检测（BRCA1/2）',
    followupPlan: '1. 每周期化疗前复查血常规、肝肾功能、心电图\n2. 每 2 周期复查乳腺彩超及钼靶评估疗效\n3. 化疗结束后复查全身 PET-CT\n4. 监测化疗不良反应（骨髓抑制、胃肠道反应等）\n5. 加强营养支持，预防感染'
  }
]

export const mockFollowupPlans: FollowupPlan[] = [
  {
    id: 'F001',
    patientId: 'P001',
    patientName: '王建国',
    startDate: '2024-03-20',
    endDate: '2024-06-20',
    nextFollowup: '2024-04-05',
    purpose: '肺癌术后辅助治疗随访',
    status: '进行中',
    doctor: '张明华'
  },
  {
    id: 'F002',
    patientId: 'P002',
    patientName: '李秀英',
    startDate: '2024-03-18',
    endDate: '2024-09-18',
    nextFollowup: '2024-04-10',
    purpose: '乳腺癌术后复查',
    status: '进行中',
    doctor: '陈伟'
  },
  {
    id: 'F003',
    patientId: 'P003',
    patientName: '张伟',
    startDate: '2024-03-19',
    endDate: '2024-08-19',
    nextFollowup: '2024-04-02',
    purpose: '直肠癌肝转移治疗后评估',
    status: '进行中',
    doctor: '李芳'
  }
]

export const mockLogs = [
  { id: 1, time: '2024-03-15 14:30:25', user: '张明华', ip: '192.168.1.100', action: '用户[张明华]申请会诊#C001', result: '成功' },
  { id: 2, time: '2024-03-15 14:31:00', user: '系统', ip: 'localhost', action: '会诊申请#C001已提交，等待秘书审核', result: '成功' },
  { id: 3, time: '2024-03-15 15:20:10', user: '李秘书', ip: '192.168.1.105', action: '用户[李秘书]审核通过会诊#C001', result: '成功' },
  { id: 4, time: '2024-03-15 15:21:00', user: '系统', ip: 'localhost', action: '会诊#C001已排期，通知专家张明华、李芳、王建国', result: '成功' },
  { id: 5, time: '2024-03-15 16:00:00', user: '张明华', ip: '192.168.1.100', action: '用户[张明华]签到参加会诊#C001', result: '成功' },
]

export const mockTeams = [
  { id: 'T1', name: '肺癌 MDT 团队', leader: '张明华', memberCount: 5, description: '专注于肺癌多学科诊疗', members: ['E1', 'E2', 'E3', 'E4', 'E5'] },
  { id: 'T2', name: '消化道肿瘤 MDT 团队', leader: '王建国', memberCount: 4, description: '消化道恶性肿瘤综合治疗', members: ['E2', 'E6', 'E7', 'E8'] },
  { id: 'T3', name: '乳腺疾病 MDT 团队', leader: '陈伟', memberCount: 4, description: '乳腺疾病多学科讨论', members: ['E3', 'E9', 'E10', 'E11'] },
]

export const mockRoles = [
  { id: 'R1', name: '申请医生', description: '可申请会诊、查看自己的申请' },
  { id: 'R2', name: 'MDT秘书', description: '审核会诊申请、排期管理' },
  { id: 'R3', name: '会诊专家', description: '参加会诊、书写报告' },
  { id: 'R4', name: '质控员', description: '质量控制和审核' },
  { id: 'R5', name: '系统管理员', description: '系统配置和用户管理' },
]