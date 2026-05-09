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
    mainDiagnosis: '左肺鳞癌 III 期',
    lastConsultationTime: '2024-03-15',
    admissionTime: '2024-03-01',
    department: '肿瘤科',
    doctor: '张明华',
    allergies: ['青霉素'],
    history: ['高血压病史 10 年', '2 型糖尿病史 5 年'],
    imagingExams: [
      {
        id: 'CT001',
        type: 'CT',
        examDate: '2024-03-10',
        examBody: '胸部增强 CT',
        findings: '左肺上叶占位性病变，大小约 4.5cm×3.8cm，边界不清，呈分叶状，增强扫描不均匀强化；纵隔淋巴结肿大，最大短径约 1.8cm。',
        impression: '左肺上叶占位，考虑肺癌；纵隔淋巴结转移',
        reportDoctor: '王建国',
        reportUrl: '/reports/CT001.pdf',
        imageUrl: '/images/CT001.dcm'
      },
      {
        id: 'PET001',
        type: 'PET-CT',
        examDate: '2024-03-13',
        examBody: '全身 PET-CT',
        findings: '左肺上叶高代谢占位，SUVmax 12.5；纵隔淋巴结代谢增高，SUVmax 8.2；全身其他部位未见明显转移征象。',
        impression: '左肺上叶恶性病变，考虑鳞癌；纵隔淋巴结转移',
        reportDoctor: '王建国',
        reportUrl: '/reports/PET001.pdf'
      },
      {
        id: 'MRI001',
        type: 'MRI',
        examDate: '2024-03-12',
        examBody: '头颅 MRI 增强',
        findings: '脑实质内未见明显异常信号灶，脑室系统大小、形态正常，中线结构居中。',
        impression: '头颅 MRI 未见明显转移灶',
        reportDoctor: '李明',
        reportUrl: '/reports/MRI001.pdf'
      },
      {
        id: 'US001',
        type: '超声',
        examDate: '2024-03-11',
        examBody: '腹部超声',
        findings: '肝脏、胆囊、胰腺、脾脏、双肾未见明显异常。',
        impression: '腹部超声未见明显异常',
        reportDoctor: '赵丽',
        reportUrl: '/reports/US001.pdf'
      }
    ],
    labTests: [
      {
        id: 'LAB001',
        testName: '血常规',
        testDate: '2024-03-12',
        testItem: '白细胞计数',
        result: '6.8',
        unit: '×10^9/L',
        referenceRange: '3.5-9.5',
        flag: '正常'
      },
      {
        id: 'LAB002',
        testName: '血常规',
        testDate: '2024-03-12',
        testItem: '血红蛋白',
        result: '128',
        unit: 'g/L',
        referenceRange: '130-175',
        flag: '↓'
      },
      {
        id: 'LAB003',
        testName: '肿瘤标志物',
        testDate: '2024-03-11',
        testItem: 'SCC',
        result: '3.8',
        unit: 'ng/mL',
        referenceRange: '0-2.5',
        flag: '↑'
      },
      {
        id: 'LAB004',
        testName: '肿瘤标志物',
        testDate: '2024-03-11',
        testItem: 'CYFRA21-1',
        result: '6.5',
        unit: 'ng/mL',
        referenceRange: '0-3.3',
        flag: '↑'
      },
      {
        id: 'LAB005',
        testName: '肿瘤标志物',
        testDate: '2024-03-11',
        testItem: 'CEA',
        result: '5.2',
        unit: 'ng/mL',
        referenceRange: '0-5.0',
        flag: '↑'
      }
    ],
    pathologyReports: [
      {
        id: 'PATH001',
        reportDate: '2024-03-14',
        sampleType: '支气管镜活检',
        sampleSite: '左肺上叶',
        microscopicFindings: '镜下见癌细胞呈巢状、片状排列，细胞异型性明显，核分裂象多见，可见角化珠形成。',
        pathologicalDiagnosis: '（左肺上叶）鳞状细胞癌，中分化',
        immunohistochemistry: 'CK5/6(+)，P63(+)，TTF-1(-)，NapsinA(-)，Ki-67(30%+)',
        molecularTest: 'EGFR 野生型，ALK(-)',
        reportDoctor: '刘晓燕',
        reportUrl: '/reports/PATH001.pdf'
      }
    ],
    otherExams: [
      {
        id: 'ECG001',
        examType: '心电图',
        examDate: '2024-03-11',
        findings: '窦性心律，心率 82 次/分，PR 间期 160ms，QRS 时限 90ms，电轴不偏。',
        conclusion: '正常心电图',
        reportUrl: '/reports/ECG001.pdf'
      },
      {
        id: 'PFT001',
        examType: '肺功能',
        examDate: '2024-03-12',
        findings: 'FEV1 2.1L，FEV1% 78%，FVC 2.8L，FEV1/FVC 75%，DLCO 18.5ml/min/mmHg。',
        conclusion: '轻度限制性通气功能障碍，弥散功能轻度降低',
        reportUrl: '/reports/PFT001.pdf'
      }
    ]
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
    history: ['无明显既往史'],
    imagingExams: [
      {
        id: 'US002',
        type: '超声',
        examDate: '2024-03-12',
        examBody: '乳腺彩超',
        findings: '右乳外上象限实性占位，大小约 2.5cm×2.0cm，边界不清，形态不规则，BI-RADS 4C 类；右腋窝淋巴结肿大，最大约 1.5cm。',
        impression: '右乳占位，考虑乳腺癌；右腋窝淋巴结转移',
        reportDoctor: '赵丽',
        reportUrl: '/reports/US002.pdf'
      },
      {
        id: 'MG001',
        type: 'X 光',
        examDate: '2024-03-13',
        examBody: '乳腺钼靶',
        findings: '右乳外上象限高密度肿块影，边缘毛刺，可见细小钙化灶，BI-RADS 5 类。',
        impression: '右乳占位，考虑乳腺癌',
        reportDoctor: '李明',
        reportUrl: '/reports/MG001.pdf'
      },
      {
        id: 'CT002',
        type: 'CT',
        examDate: '2024-03-14',
        examBody: '胸部 CT 平扫',
        findings: '双肺未见明显转移灶，纵隔淋巴结未见肿大。',
        impression: '胸部 CT 未见明显转移',
        reportDoctor: '王建国',
        reportUrl: '/reports/CT002.pdf'
      }
    ],
    labTests: [
      {
        id: 'LAB006',
        testName: '血常规',
        testDate: '2024-03-14',
        testItem: '白细胞计数',
        result: '5.6',
        unit: '×10^9/L',
        referenceRange: '3.5-9.5',
        flag: '正常'
      },
      {
        id: 'LAB007',
        testName: '肿瘤标志物',
        testDate: '2024-03-14',
        testItem: 'CA15-3',
        result: '35',
        unit: 'U/mL',
        referenceRange: '0-25',
        flag: '↑'
      }
    ],
    pathologyReports: [
      {
        id: 'PATH002',
        reportDate: '2024-03-13',
        sampleType: '乳腺穿刺活检',
        sampleSite: '右乳外上象限',
        microscopicFindings: '镜下见癌细胞呈巢状、索状排列，腺管形成，细胞异型性明显，核分裂象可见。',
        pathologicalDiagnosis: '（右乳）浸润性导管癌 II 级',
        immunohistochemistry: 'ER(80%+), PR(60%+), HER2(1+), Ki-67(25%+)',
        molecularTest: 'FISH: HER2 基因无扩增',
        reportDoctor: '刘晓燕',
        reportUrl: '/reports/PATH002.pdf'
      }
    ],
    otherExams: [
      {
        id: 'ECG002',
        examType: '心电图',
        examDate: '2024-03-14',
        findings: '窦性心律，心率 78 次/分。',
        conclusion: '正常心电图',
        reportUrl: '/reports/ECG002.pdf'
      }
    ]
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
    history: ['吸烟史 20 年'],
    imagingExams: [
      {
        id: 'CT003',
        type: 'CT',
        examDate: '2024-03-12',
        examBody: '腹部增强 CT',
        findings: '直肠乙状结肠交界处肠壁不规则增厚，约 2.0cm，增强扫描不均匀强化；肝脏右叶可见多发低密度灶，较大者约 3.5cm×2.8cm；腹腔淋巴结肿大。',
        impression: '直肠乙状结肠交界处占位，考虑直肠癌；肝脏多发转移；腹腔淋巴结转移',
        reportDoctor: '王建国',
        reportUrl: '/reports/CT003.pdf'
      },
      {
        id: 'MRI002',
        type: 'MRI',
        examDate: '2024-03-13',
        examBody: '盆腔 MRI 增强',
        findings: '直肠乙状结肠交界处肠壁不规则增厚，T2WI 高信号，增强扫描不均匀强化，浆膜层受侵；直肠系膜内可见多发肿大淋巴结。',
        impression: '直肠乙状结肠交界处占位，考虑直肠癌，浆膜层受侵；直肠系膜淋巴结转移',
        reportDoctor: '李明',
        reportUrl: '/reports/MRI002.pdf'
      },
      {
        id: 'US003',
        type: '超声',
        examDate: '2024-03-12',
        examBody: '肝脏超声造影',
        findings: '肝脏右叶可见多发低回声结节，较大者约 3.2cm×2.5cm，动脉期周边强化，门脉期及延迟期消退。',
        impression: '肝脏多发占位，考虑转移瘤',
        reportDoctor: '赵丽',
        reportUrl: '/reports/US003.pdf'
      }
    ],
    labTests: [
      {
        id: 'LAB008',
        testName: '血常规',
        testDate: '2024-03-12',
        testItem: '血红蛋白',
        result: '105',
        unit: 'g/L',
        referenceRange: '130-175',
        flag: '↓'
      },
      {
        id: 'LAB009',
        testName: '肿瘤标志物',
        testDate: '2024-03-12',
        testItem: 'CEA',
        result: '85.5',
        unit: 'ng/mL',
        referenceRange: '0-5.0',
        flag: '↑'
      },
      {
        id: 'LAB010',
        testName: '肿瘤标志物',
        testDate: '2024-03-12',
        testItem: 'CA19-9',
        result: '245',
        unit: 'U/mL',
        referenceRange: '0-37',
        flag: '↑'
      }
    ],
    pathologyReports: [
      {
        id: 'PATH003',
        reportDate: '2024-03-13',
        sampleType: '肠镜活检',
        sampleSite: '直肠乙状结肠交界处',
        microscopicFindings: '镜下见癌细胞呈腺管状、乳头状排列，细胞异型性明显，核分裂象多见，间质反应明显。',
        pathologicalDiagnosis: '（直肠乙状结肠交界处）中分化腺癌',
        immunohistochemistry: 'CK20(+), CDX2(+), CK7(-), MSI-H, PD-L1(CPS=5)',
        molecularTest: 'KRAS 突变，NRAS 野生型，BRAF 野生型',
        reportDoctor: '刘晓燕',
        reportUrl: '/reports/PATH003.pdf'
      }
    ],
    otherExams: [
      {
        id: 'COLON001',
        examType: '肠镜',
        examDate: '2024-03-11',
        findings: '距肛门 15-18cm 可见环周肿物，表面溃烂，管腔狭窄，内镜可通过。',
        conclusion: '直肠乙状结肠交界处占位，考虑直肠癌',
        reportUrl: '/reports/COLON001.pdf'
      }
    ]
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
    history: ['冠心病史 3 年'],
    imagingExams: [
      {
        id: 'CT004',
        type: 'CT',
        examDate: '2024-03-10',
        examBody: '腹部增强 CT',
        findings: '胃窦部胃壁不规则增厚，约 2.5cm，增强扫描不均匀强化；肝脏左叶可见低密度灶，约 2.0cm×1.8cm；腹腔淋巴结肿大。',
        impression: '胃窦部占位，考虑胃癌；肝脏左叶转移；腹腔淋巴结转移',
        reportDoctor: '王建国',
        reportUrl: '/reports/CT004.pdf'
      },
      {
        id: 'US004',
        type: '超声',
        examDate: '2024-03-09',
        examBody: '腹部超声',
        findings: '胃窦部胃壁增厚，约 2.3cm，呈低回声；肝脏左叶可见低回声结节，约 1.8cm×1.5cm。',
        impression: '胃窦部占位；肝脏左叶占位，考虑转移',
        reportDoctor: '赵丽',
        reportUrl: '/reports/US004.pdf'
      }
    ],
    labTests: [
      {
        id: 'LAB011',
        testName: '血常规',
        testDate: '2024-03-09',
        testItem: '血红蛋白',
        result: '95',
        unit: 'g/L',
        referenceRange: '115-150',
        flag: '↓'
      },
      {
        id: 'LAB012',
        testName: '肿瘤标志物',
        testDate: '2024-03-09',
        testItem: 'CEA',
        result: '45.8',
        unit: 'ng/mL',
        referenceRange: '0-5.0',
        flag: '↑'
      },
      {
        id: 'LAB013',
        testName: '肿瘤标志物',
        testDate: '2024-03-09',
        testItem: 'CA72-4',
        result: '125',
        unit: 'U/mL',
        referenceRange: '0-6.9',
        flag: '↑'
      }
    ],
    pathologyReports: [
      {
        id: 'PATH004',
        reportDate: '2024-03-11',
        sampleType: '胃镜活检',
        sampleSite: '胃窦部',
        microscopicFindings: '镜下见癌细胞呈弥漫性分布，印戒细胞明显，细胞异型性明显，核分裂象多见。',
        pathologicalDiagnosis: '（胃窦）低分化腺癌，部分为印戒细胞癌',
        immunohistochemistry: 'HER2(0), PD-L1(CPS=10), MSI-H',
        molecularTest: 'EBER(-)',
        reportDoctor: '刘晓燕',
        reportUrl: '/reports/PATH004.pdf'
      }
    ],
    otherExams: [
      {
        id: 'GASTRO001',
        examType: '胃镜',
        examDate: '2024-03-09',
        findings: '胃窦部可见环周肿物，表面溃烂，覆污秽苔，质脆易出血，管腔狭窄。',
        conclusion: '胃窦部占位，考虑胃癌',
        reportUrl: '/reports/GASTRO001.pdf'
      },
      {
        id: 'ECG003',
        examType: '心电图',
        examDate: '2024-03-09',
        findings: '窦性心律，心率 76 次/分，ST-T 改变。',
        conclusion: '心肌缺血',
        reportUrl: '/reports/ECG003.pdf'
      }
    ]
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
    history: ['慢性阻塞性肺疾病'],
    imagingExams: [
      {
        id: 'MRI003',
        type: 'MRI',
        examDate: '2024-03-06',
        examBody: '前列腺 MRI 增强',
        findings: '前列腺体积增大，约 5.5cm×4.8cm×4.2cm，外周带可见多发异常信号灶，T2WI 低信号，增强扫描不均匀强化；精囊腺受侵。',
        impression: '前列腺占位，考虑前列腺癌；精囊腺受侵',
        reportDoctor: '李明',
        reportUrl: '/reports/MRI003.pdf'
      },
      {
        id: 'CT005',
        type: 'CT',
        examDate: '2024-03-07',
        examBody: '盆腔 CT 平扫',
        findings: '前列腺体积增大，密度不均，可见多发低密度灶；盆腔淋巴结肿大。',
        impression: '前列腺占位；盆腔淋巴结转移',
        reportDoctor: '王建国',
        reportUrl: '/reports/CT005.pdf'
      },
      {
        id: 'ECT001',
        type: '骨扫描',
        examDate: '2024-03-08',
        examBody: '全身骨显像',
        findings: '全身多处骨骼放射性浓聚异常增高，包括胸椎、腰椎、骨盆、肋骨等。',
        impression: '全身多发骨转移',
        reportDoctor: '李明',
        reportUrl: '/reports/ECT001.pdf'
      }
    ],
    labTests: [
      {
        id: 'LAB014',
        testName: '前列腺特异性抗原',
        testDate: '2024-03-06',
        testItem: 't-PSA',
        result: '125.5',
        unit: 'ng/mL',
        referenceRange: '0-4.0',
        flag: '↑'
      },
      {
        id: 'LAB015',
        testName: '前列腺特异性抗原',
        testDate: '2024-03-06',
        testItem: 'f-PSA',
        result: '12.8',
        unit: 'ng/mL',
        referenceRange: '0-1.0',
        flag: '↑'
      },
      {
        id: 'LAB016',
        testName: '前列腺特异性抗原',
        testDate: '2024-03-06',
        testItem: 'f-PSA/t-PSA',
        result: '0.10',
        unit: '',
        referenceRange: '>0.16',
        flag: '↓'
      }
    ],
    pathologyReports: [
      {
        id: 'PATH005',
        reportDate: '2024-03-07',
        sampleType: '前列腺穿刺活检',
        sampleSite: '前列腺外周带',
        microscopicFindings: '镜下见前列腺腺泡结构紊乱，腺体融合，细胞异型性明显，核仁明显。',
        pathologicalDiagnosis: '（前列腺）腺癌，Gleason 评分 4+5=9 分',
        immunohistochemistry: 'P504S(+), P63(-), 34βE12(-), NKX3.1(+)',
        molecularTest: 'AR(+)',
        reportDoctor: '刘晓燕',
        reportUrl: '/reports/PATH005.pdf'
      }
    ],
    otherExams: [
      {
        id: 'US005',
        examType: '超声',
        examDate: '2024-03-06',
        findings: '前列腺体积增大，约 5.2cm×4.5cm×4.0cm，内回声不均，可见多发低回声结节。',
        conclusion: '前列腺增大，考虑前列腺癌',
        reportUrl: '/reports/US005.pdf'
      }
    ]
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
    status: '待科室审核',
    urgency: '紧急',
    department: '肿瘤科',
    applyDoctor: '张明华',
    experts: [mockExperts[0], mockExperts[1], mockExperts[2]],
    mainDiagnosis: '左肺鳞癌 III 期，综合治疗方案讨论'
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