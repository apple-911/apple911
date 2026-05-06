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
    content: '会诊意见：患者胃癌晚期，建议行姑息性化疗联合免疫治疗...'
  },
  {
    id: 'R002',
    consultationId: 'C003',
    patientName: '张伟',
    consultationTime: '2024-03-19 10:00',
    responsibleExpert: '李芳',
    status: '草稿'
  },
  {
    id: 'R003',
    consultationId: 'C002',
    patientName: '李秀英',
    consultationTime: '2024-03-18 15:00',
    responsibleExpert: '陈伟',
    status: '待签名'
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
  { id: 'T1', name: '肺癌MDT团队', leader: '张明华', memberCount: 5, description: '专注于肺癌多学科诊疗' },
  { id: 'T2', name: '消化道肿瘤MDT团队', leader: '王建国', memberCount: 4, description: '消化道恶性肿瘤综合治疗' },
  { id: 'T3', name: '乳腺疾病MDT团队', leader: '陈伟', memberCount: 4, description: '乳腺疾病多学科讨论' },
]

export const mockRoles = [
  { id: 'R1', name: '申请医生', description: '可申请会诊、查看自己的申请' },
  { id: 'R2', name: 'MDT秘书', description: '审核会诊申请、排期管理' },
  { id: 'R3', name: '会诊专家', description: '参加会诊、书写报告' },
  { id: 'R4', name: '质控员', description: '质量控制和审核' },
  { id: 'R5', name: '系统管理员', description: '系统配置和用户管理' },
]