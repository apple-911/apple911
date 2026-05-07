import { useState, useEffect } from 'react'
import { Card, Table, Button, Tag, Space, Typography, Modal, Form, Input, Upload, message, Steps, Divider, Select, Tabs, Descriptions } from 'antd'
import {
  FileTextOutlined,
  UploadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  AudioOutlined,
  PlayCircleOutlined,
  EditOutlined,
  EyeOutlined,
  BookOutlined,
  UserOutlined,
  TeamOutlined,
  CheckSquareOutlined,
  SafetyOutlined,
  MedicineBoxOutlined,
  ApiOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography

interface MaterialTask {
  id: string
  consultationId: string
  patientName: string
  patientInpatientNo: string
  meetingDate: string
  meetingTime: string
  department: string
  applyDoctor: string
  experts: Array<{ name: string; department: string }>
  status: '待提交' | '待秘书审核' | '待质控审核' | '审核通过' | '已退回'
  submitTime?: string
  // 完整病历资料
  chiefComplaint?: string  // 主诉
  presentIllness?: string  // 现病史
  pastHistory?: string  // 既往史
  physicalExamination?: string  // 体格检查
  auxiliaryExamination?: string  // 辅助检查
  // 会诊资料
  meetingRecord?: string
  consultationReport?: string
  recommendations?: string[]
  recordingUrl?: string
  videoUrl?: string
  recordingDuration?: string
  videoDuration?: string
  rejectReason?: string
  // 审批记录相关字段
  secretaryAuditTime?: string  // 秘书审核时间
  secretaryAuditResult?: string  // 秘书审核结果
  secretaryComment?: string  // 秘书意见
  qualityAuditTime?: string  // 质控审核时间
  qualityReviewer?: string  // 质控审核人
  qualityScore?: number  // 质控评分
  qualityResult?: string  // 质控审核结果
  qualityComment?: string  // 质控意见
}

const mockTasks: MaterialTask[] = [
  {
    id: 'M001',
    consultationId: 'C001',
    patientName: '王建国',
    patientInpatientNo: 'ZY2024001234',
    meetingDate: '2024-03-15',
    meetingTime: '14:00-15:30',
    department: '肿瘤科',
    applyDoctor: '张明华',
    experts: [
      { name: '李芳', department: '胸外科' },
      { name: '王建国', department: '放射科' },
      { name: '刘晓燕', department: '病理科' }
    ],
    status: '待提交',
    // 完整病历资料
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

胸部：胸廓无畸形，双肺呼吸运动对称，语颤正常，双肺叩诊清音，呼吸音清，双肺未闻及干湿性啰音。心前区无隆起，心率 82 次/分，律齐，各瓣膜听诊区未闻及病理性杂音。

腹部：腹平软，无压痛、反跳痛及肌紧张，肝脾肋下未触及，墨菲氏征阴性，肾区无叩痛，移动性浊音阴性，肠鸣音正常。

肛门直肠外生殖器：未查。

脊柱四肢：脊柱呈生理弯曲，四肢活动自如，双下肢无水肿，无杵状指（趾）。

神经系统：腹壁反射、肱二头肌反射、膝腱反射正常存在，巴宾斯基征阴性。`,
    auxiliaryExamination: `【2024-03-12 我院】
胸部增强 CT：左肺上叶占位性病变，大小约 4.5cm×3.8cm，边界不清，呈分叶状，增强扫描不均匀强化；纵隔淋巴结肿大，最大短径约 1.8cm。

【2024-03-13 我院】
PET-CT：左肺上叶高代谢占位，考虑恶性病变；纵隔淋巴结转移；全身其他部位未见明显转移征象。

【2024-03-14 我院】
支气管镜 + 活检：（左肺上叶）低分化鳞癌。免疫组化：P63(+), P40(+), CK5/6(+), TTF-1(-), NapsinA(-), Ki-67 约 70%。

【2024-03-14 我院】
血常规：WBC 6.8×10^9/L, Hb 128g/L, PLT 215×10^9/L。
肝肾功能：ALT 18U/L, AST 22U/L, Cr 78μmol/L。
肿瘤标志物：SCC 2.8ng/mL↑, CEA 3.2ng/mL, CYFRA21-1 5.6ng/mL↑。

【2024-03-15 我院】
心电图：窦性心律，正常心电图。
肺功能：中度限制性通气功能障碍。`,
    meetingRecord: `2024-03-15 14:00-15:30 在 MDT 会诊中心召开多学科会诊。

参加专家：
- 胸外科：李芳 副主任医师
- 放射科：王建国 主任医师
- 病理科：刘晓燕 主任医师
- 肿瘤科：张明华 主任医师

会诊过程：
1. 申请科室汇报病史：患者王建国，65 岁，因"咳嗽、咳痰 3 个月，加重伴痰中带血 2 周"入院。胸部 CT 示左肺上叶占位，PET-CT 考虑恶性病变，支气管镜活检确诊为低分化鳞癌。

2. 病理科汇报：（左肺穿刺）低分化鳞癌。免疫组化：P63(+), P40(+), CK5/6(+), TTF-1(-), NapsinA(-), Ki-67 约 70%。

3. 放射科汇报：PET-CT 显示左肺上叶高代谢占位，大小约 4.5cm×3.8cm，伴纵隔淋巴结转移，未见远处转移。

4. 胸外科汇报：患者目前肿瘤分期为 III 期（cT4N2M0），无手术指征，建议行根治性同步放化疗。

5. 肿瘤科汇报：患者一般情况可，心肺功能可耐受放化疗，建议行同步放化疗，方案选择紫杉醇 + 卡铂联合根治性放疗。

6. 各科专家讨论后一致同意：
   - 诊断：左肺鳞癌 III 期（cT4N2M0）
   - 治疗方案：同步放化疗
   - 放疗：根治性放疗，DT 60-66Gy/30-33f
   - 化疗：紫杉醇 + 卡铂方案，每 3 周一次，共 4 周期`,
    consultationReport: `一、诊断
左肺鳞癌 III 期（cT4N2M0）
ECOG 评分：1 分

二、鉴别诊断
1. 肺结核：患者无低热、盗汗等结核中毒症状，PPD 试验阴性，不支持结核诊断。
2. 肺炎性假瘤：患者病程较长，抗炎治疗无效，肿瘤标志物升高，影像学表现不支持炎症。

三、治疗方案
1. 首选治疗方案：同步放化疗
   - 放疗：根治性放疗，DT 60-66Gy/30-33f，采用 IMRT 技术
   - 化疗：紫杉醇 135mg/m² d1 + 卡铂 AUC=5 d1，每 3 周一次，共 4 周期

2. 备选治疗方案：免疫治疗联合化疗
   - PD-1 抑制剂（卡瑞利珠单抗 200mg d1）+ 紫杉醇 + 卡铂
   - 如经济条件允许，可考虑联合免疫治疗

3. 支持治疗
   - 营养支持：肠内营养粉，每日 2 次
   - 止咳化痰：氨溴索口服液
   - 止痛：按需使用 NSAIDs 类药物

四、随访计划
1. 治疗期间：每周复查血常规、肝肾功能
2. 治疗结束后 4 周复查胸部 CT、肿瘤标志物
3. 之后每 3 个月复查一次，2 年后可改为每 6 个月一次
4. 如出现不适，随时就诊`,
    recommendations: [
      '完善基因检测（EGFR、ALK、ROS1 等）',
      '评估心肺功能，确保能耐受放化疗',
      '营养支持治疗，改善营养状况',
      '定期复查血常规、肝肾功能',
      '戒烟，避免二手烟',
      '保持良好心态，适当运动'
    ],
    recordingUrl: '/recordings/C001_audio.mp3',
    videoUrl: '/recordings/C001_video.mp4',
    recordingDuration: '1:30:25',
    videoDuration: '1:28:15'
  },
  {
    id: 'M002',
    consultationId: 'C002',
    patientName: '李秀英',
    patientInpatientNo: 'ZY2024001256',
    meetingDate: '2024-03-14',
    meetingTime: '10:00-11:00',
    department: '乳腺外科',
    applyDoctor: '陈伟',
    experts: [
      { name: '陈伟', department: '乳腺外科' },
      { name: '张明华', department: '肿瘤科' }
    ],
    status: '待质控审核',
    submitTime: '2024-03-14 15:30',
    chiefComplaint: '发现右乳肿块 2 个月',
    presentIllness: `患者 2 个月前洗澡时无意中发现右乳外上象限肿块，约花生米大小，质硬，边界不清，活动度可，无疼痛，无乳头溢液，无皮肤凹陷。未予重视，肿块逐渐增大。为求诊治来我院就诊。

门诊乳腺彩超示：右乳外上象限实性占位，大小约 2.5cm×2.0cm，边界不清，形态不规则，伴腋窝淋巴结肿大。为求进一步诊治，门诊以"右乳占位"收入我科。

患者自发病以来，精神、睡眠可，食欲正常，大小便正常，体重无明显变化。`,
    pastHistory: `既往体健，否认高血压、糖尿病、冠心病等慢性病史。否认肝炎、结核等传染病史。否认手术外伤史。否认输血史。否认药物及食物过敏史。

个人史：生于原籍，久居本地，无不良嗜好。

婚育史：24 岁结婚，26 岁顺产 1 子，28 岁顺产 1 女，配偶及子女均体健。月经史：14 岁初潮，周期 28-30 天，经期 5-7 天，50 岁绝经。

家族史：母亲患乳腺癌，已故。否认家族中有其他遗传性疾病患者。`,
    physicalExamination: `T 36.3℃  P 78 次/分  R 18 次/分  BP 125/80mmHg

一般情况：发育正常，营养中等，神志清，精神可，自主体位，查体合作。

皮肤黏膜：全身皮肤黏膜无黄染、皮疹及出血点。

淋巴结：右腋窝可触及 2 枚肿大淋巴结，最大约 1.5cm×1.0cm，质硬，活动度可，无压痛。左腋窝及锁骨上淋巴结未触及肿大。

头部及其器官：头颅无畸形，结膜无充血，巩膜无黄染，瞳孔等大等圆，对光反射灵敏。

颈部：颈软，无抵抗，气管居中，甲状腺无肿大。

胸部：胸廓无畸形，双肺呼吸运动对称，语颤正常，双肺叩诊清音，呼吸音清，双肺未闻及干湿性啰音。心前区无隆起，心率 78 次/分，律齐，各瓣膜听诊区未闻及病理性杂音。

腹部：腹平软，无压痛、反跳痛及肌紧张，肝脾肋下未触及，移动性浊音阴性，肠鸣音正常。

专科情况：
右乳外上象限可触及一肿块，大小约 2.5cm×2.0cm，质硬，边界不清，表面不光滑，活动度欠佳，无压痛。乳头无凹陷，无溢液。乳房皮肤无红肿、破溃、橘皮样变。

脊柱四肢：脊柱呈生理弯曲，四肢活动自如，双下肢无水肿。

神经系统：腹壁反射、肱二头肌反射、膝腱反射正常存在，巴宾斯基征阴性。`,
    auxiliaryExamination: `【2024-03-11 我院】
乳腺彩超：右乳外上象限实性占位，大小约 2.5cm×2.0cm，边界不清，形态不规则，BI-RADS 5 类；右腋窝淋巴结肿大，最大约 1.5cm×1.0cm。

【2024-03-12 我院】
乳腺钼靶：右乳外上象限高密度影，边界不清，可见毛刺征，BI-RADS 5 类。

【2024-03-13 我院】
乳腺穿刺活检：（右乳）浸润性导管癌，II 级。免疫组化：ER(90%+), PR(80%+), HER2(-), Ki-67 约 30%。

【2024-03-13 我院】
血常规：WBC 5.8×10^9/L, Hb 132g/L, PLT 225×10^9/L。
肝肾功能：ALT 15U/L, AST 19U/L, Cr 72μmol/L。
肿瘤标志物：CA15-3 28.5U/mL↑, CEA 4.1ng/mL。

【2024-03-14 我院】
心电图：窦性心律，正常心电图。
胸部 CT：双肺未见明显转移灶。
腹部彩超：肝、胆、胰、脾、肾未见明显异常。`,
    meetingRecord: `2024-03-14 10:00-11:00 在 MDT 会诊中心召开多学科会诊。

参加专家：
- 乳腺外科：陈伟 副主任医师
- 肿瘤科：张明华 主任医师

会诊过程：
1. 申请科室汇报病史：患者李秀英，52 岁，因"发现右乳肿块 2 个月"入院。乳腺彩超示右乳外上象限实性占位，穿刺活检确诊为浸润性导管癌，ER(+), PR(+), HER2(-)。

2. 病理科汇报：（右乳穿刺）浸润性导管癌，II 级。免疫组化：ER(90%+), PR(80%+), HER2(-), Ki-67 约 30%。

3. 影像科汇报：乳腺钼靶示右乳外上象限高密度影，边界不清，可见毛刺征；彩超示右腋窝淋巴结肿大。

4. 乳腺外科汇报：患者目前肿瘤分期为 IIB 期（cT2N1M0），有手术指征，建议行右乳癌改良根治术。

5. 肿瘤科汇报：患者为 Lumnial B 型（HER2 阴性），术后需行辅助化疗及内分泌治疗。

6. 各科专家讨论后一致同意：
   - 诊断：右乳浸润性导管癌 IIB 期（cT2N1M0）
   - 治疗方案：手术治疗 + 术后辅助治疗
   - 手术：右乳癌改良根治术 + 前哨淋巴结活检
   - 术后辅助化疗：TC 方案×4 周期
   - 术后内分泌治疗：他莫昔芬 5 年`,
    consultationReport: `一、诊断
右乳浸润性导管癌 IIB 期（cT2N1M0）
ER(+), PR(+), HER2(-)
Ki-67 约 30%

二、鉴别诊断
1. 乳腺纤维腺瘤：患者年龄较大，肿块质硬，边界不清，影像学表现不支持良性病变。
2. 乳腺炎性病变：患者无红肿热痛等炎症表现，不支持炎症。

三、治疗方案
1. 首选治疗方案：手术治疗
   - 右乳癌改良根治术
   - 前哨淋巴结活检
   - 如前哨淋巴结阳性，行腋窝淋巴结清扫

2. 术后辅助治疗
   - 化疗：TC 方案（多西他赛 75mg/m² d1 + 环磷酰胺 600mg/m² d1），每 3 周一次，共 4 周期
   - 内分泌治疗：他莫昔芬 20mg qd×5 年

3. 放疗
   - 如术后病理提示高危因素，考虑行术后放疗

四、随访计划
1. 术后 2 年内每 3 个月复查一次
2. 3-5 年每 6 个月复查一次
3. 5 年后每年复查一次`,
    recommendations: [
      '完善术前检查',
      '评估心肺功能',
      '营养支持治疗',
      '术后定期复查'
    ],
    recordingUrl: '/recordings/C002_audio.mp3',
    videoUrl: '/recordings/C002_video.mp4',
    recordingDuration: '1:00:15',
    videoDuration: '0:58:30',
    secretaryAuditTime: '2024-03-14 16:00',
    secretaryAuditResult: '通过',
    secretaryComment: '材料完整，符合规范'
  },
  {
    id: 'M003',
    consultationId: 'C003',
    patientName: '张伟',
    patientInpatientNo: 'ZY2024001189',
    meetingDate: '2024-03-13',
    meetingTime: '15:00-16:30',
    department: '胃肠外科',
    applyDoctor: '王建国',
    experts: [
      { name: '王建国', department: '胃肠外科' },
      { name: '李芳', department: '肿瘤科' }
    ],
    status: '已退回',
    submitTime: '2024-03-13 18:00',
    rejectReason: '会诊记录过于简单，请补充专家讨论详情',
    chiefComplaint: '腹痛、消瘦 3 个月，加重伴黑便 1 周',
    presentIllness: `患者 3 个月前无明显诱因出现上腹部隐痛，为持续性钝痛，进食后加重，伴食欲减退、乏力，近 3 个月体重下降约 8kg。1 周前出现黑便，每日 2-3 次，柏油样，无呕血。为求诊治来我院就诊。

门诊胃镜示：胃窦部溃疡性病变，大小约 4.0cm×3.5cm，边界不清，底部凹凸不平。病理活检示：低分化腺癌。为求进一步诊治，门诊以"胃占位"收入我科。

患者自发病以来，精神、睡眠欠佳，食欲明显减退，大小便正常（黑便），体重近 3 个月下降约 8kg。`,
    pastHistory: `既往体健，否认高血压、糖尿病、冠心病等慢性病史。否认肝炎、结核等传染病史。10 年前曾行"阑尾切除术"。否认输血史。否认药物及食物过敏史。

个人史：生于原籍，久居本地，吸烟 30 年，20 支/日；饮酒 30 年，白酒约 250ml/日。

婚育史：26 岁结婚，配偶体健，育有 1 子 1 女，均体健。

家族史：父亲患胃癌去世，母亲患高血压病。否认家族中有其他遗传性疾病患者。`,
    physicalExamination: `T 36.6℃  P 88 次/分  R 20 次/分  BP 130/85mmHg

一般情况：发育正常，营养中等偏瘦，神志清，精神欠佳，自主体位，查体合作。贫血貌。

皮肤黏膜：全身皮肤黏膜轻度苍白，无黄染、皮疹及出血点。

淋巴结：左锁骨上可触及 1 枚肿大淋巴结，大小约 1.0cm×0.8cm，质硬，固定，无压痛。全身其他部位浅表淋巴结未触及肿大。

头部及其器官：头颅无畸形，结膜苍白，巩膜无黄染，瞳孔等大等圆，对光反射灵敏。

颈部：颈软，无抵抗，气管居中，甲状腺无肿大。

胸部：胸廓无畸形，双肺呼吸运动对称，语颤正常，双肺叩诊清音，呼吸音清，双肺未闻及干湿性啰音。心前区无隆起，心率 88 次/分，律齐，各瓣膜听诊区未闻及病理性杂音。

腹部：腹平软，上腹部轻压痛，无反跳痛及肌紧张，未触及明显包块，肝脾肋下未触及，墨菲氏征阴性，移动性浊音阴性，肠鸣音 4 次/分。

肛门直肠外生殖器：未查。

脊柱四肢：脊柱呈生理弯曲，四肢活动自如，双下肢无水肿。

神经系统：腹壁反射、肱二头肌反射、膝腱反射正常存在，巴宾斯基征阴性。`,
    auxiliaryExamination: `【2024-03-10 我院】
胃镜：胃窦部溃疡性病变，大小约 4.0cm×3.5cm，边界不清，底部凹凸不平，覆污秽苔，周围黏膜皱襞中断。

【2024-03-11 我院】
病理活检：（胃窦）低分化腺癌。免疫组化：HER2(-), Ki-67 约 60%, p53(+).

【2024-03-12 我院】
腹部增强 CT：胃窦部胃壁不规则增厚，强化明显，周围脂肪间隙模糊；腹腔干周围、肠系膜上动脉周围多发淋巴结肿大，最大短径约 2.2cm；肝脏未见明显转移灶。

【2024-03-12 我院】
胸部 CT：双肺未见明显转移灶。

【2024-03-12 我院】
血常规：WBC 7.2×10^9/L, Hb 98g/L↓, PLT 195×10^9/L。
肝肾功能：ALT 22U/L, AST 25U/L, Alb 32g/L↓, Cr 75μmol/L。
肿瘤标志物：CEA 15.8ng/mL↑, CA19-9 68.5U/mL↑, CA72-4 25.6U/mL↑。

【2024-03-13 我院】
心电图：窦性心律，正常心电图。`,
    meetingRecord: `2024-03-13 15:00-16:30 在 MDT 会诊中心召开多学科会诊。

参加专家：
- 胃肠外科：王建国 主任医师
- 肿瘤科：李芳 副主任医师

会诊过程：
1. 申请科室汇报病史：患者张伟，68 岁，因"腹痛、消瘦 3 个月，加重伴黑便 1 周"入院。胃镜示胃窦部溃疡性病变，病理确诊为低分化腺癌。腹部 CT 示腹腔淋巴结转移。

2. 病理科汇报：（胃窦）低分化腺癌。免疫组化：HER2(-), Ki-67 约 60%, p53(+)。

3. 影像科汇报：腹部增强 CT 示胃窦部胃壁不规则增厚，腹腔干周围、肠系膜上动脉周围多发淋巴结肿大，最大短径约 2.2cm；肝脏未见明显转移灶。

4. 胃肠外科汇报：患者目前肿瘤分期为 IV 期（cT4N3M0），腹腔广泛淋巴结转移，无手术指征，建议行转化治疗。

5. 肿瘤科汇报：患者为低分化腺癌，HER2 阴性，建议行 SOX 方案转化治疗，评估疗效后考虑手术治疗。

6. 各科专家讨论后一致同意：
   - 诊断：胃窦低分化腺癌 IV 期（cT4N3M0）
   - 治疗方案：转化治疗 + 疗效评估
   - 转化治疗：SOX 方案×4 周期
   - 疗效评估：每 2 周期复查 CT
   - 手术治疗：如疗效好，考虑行根治性胃切除术`,
    consultationReport: `一、诊断
胃窦低分化腺癌 IV 期（cT4N3M0）
ECOG 评分：2 分

二、鉴别诊断
1. 胃溃疡：患者病程较长，消瘦明显，肿瘤标志物升高，胃镜及病理支持恶性病变。
2. 胃淋巴瘤：患者无发热、盗汗等全身症状，影像学表现不支持淋巴瘤。

三、治疗方案
1. 转化治疗：SOX 方案（替吉奥 40mg bid d1-14 + 奥沙利铂 130mg/m² d1），每 3 周一次，共 4 周期

2. 疗效评估
   - 每 2 周期复查腹部 CT、肿瘤标志物
   - 如肿瘤缩小、淋巴结消退，考虑行根治性胃切除术
   - 如疾病进展，更换化疗方案或加入免疫治疗

3. 支持治疗
   - 营养支持：肠内营养粉，每日 3 次
   - 止痛：按需使用 NSAIDs 类药物
   - 纠正贫血：必要时输血

四、随访计划
1. 治疗期间：每周复查血常规、肝肾功能
2. 每 2 周期复查腹部 CT、肿瘤标志物
3. 如出现不适，随时就诊`,
    recommendations: [
      '完善基因检测（MSI、PD-L1 等）',
      '营养支持治疗，改善营养状况',
      '疼痛管理，提高生活质量',
      '定期复查血常规、肝肾功能',
      '戒烟戒酒'
    ],
    recordingUrl: '/recordings/C003_audio.mp3',
    videoUrl: '/recordings/C003_video.mp4',
    recordingDuration: '1:28:45',
    videoDuration: '1:26:20',
    secretaryAuditTime: '2024-03-13 19:00',
    secretaryAuditResult: '通过',
    secretaryComment: '材料已审核'
  },
  {
    id: 'M004',
    consultationId: 'C004',
    patientName: '刘芳',
    patientInpatientNo: 'ZY2024001356',
    meetingDate: '2024-03-12',
    meetingTime: '09:00-10:30',
    department: '消化内科',
    applyDoctor: '周丽萍',
    experts: [
      { name: '张明华', department: '肿瘤科' },
      { name: '周丽萍', department: '营养科' }
    ],
    status: '审核通过',
    submitTime: '2024-03-12 14:00',
    chiefComplaint: '反复上腹部不适 6 个月，加重伴呕吐 1 个月',
    presentIllness: `患者 6 个月前无明显诱因出现上腹部不适，隐痛，餐后饱胀感，无反酸、嗳气、恶心、呕吐。未予重视，症状反复。1 个月前症状加重，出现餐后呕吐，为胃内容物，无咖啡样物。为求诊治来我院就诊。

门诊胃镜示：胃窦部溃疡性病变，活检病理提示低分化腺癌。为求进一步诊治，门诊以"胃窦癌"收入我科。

患者自发病以来，精神、睡眠欠佳，食欲明显下降，大小便正常，体重近 6 个月下降约 8kg。`,
    pastHistory: `既往体健，否认高血压、糖尿病、冠心病等慢性病史。否认肝炎、结核等传染病史。否认手术外伤史。否认输血史。否认药物及食物过敏史。

个人史：生于原籍，久居本地，饮食不规律，喜食腌制食品。否认烟酒等不良嗜好。

婚育史：25 岁结婚，27 岁顺产 1 子，配偶及子女均体健。月经史：13 岁初潮，周期 28-30 天，经期 5-6 天，49 岁绝经。

家族史：父亲患胃癌去世，母亲体健。否认家族中有其他遗传性疾病患者。`,
    physicalExamination: `T 36.4℃  P 76 次/分  R 18 次/分  BP 120/75mmHg

一般情况：发育正常，营养中等偏瘦，神志清，精神欠佳，自主体位，查体合作。

皮肤黏膜：全身皮肤黏膜无黄染、皮疹及出血点。

淋巴结：全身浅表淋巴结未触及肿大。

头部及其器官：头颅无畸形，结膜无充血，巩膜无黄染，瞳孔等大等圆，对光反射灵敏。

颈部：颈软，无抵抗，气管居中，甲状腺无肿大。

胸部：胸廓无畸形，双肺呼吸运动对称，语颤正常，双肺叩诊清音，呼吸音清，双肺未闻及干湿性啰音。心前区无隆起，心率 76 次/分，律齐，各瓣膜听诊区未闻及病理性杂音。

腹部：腹平软，上腹部轻压痛，无反跳痛及肌紧张，未触及明显包块，肝脾肋下未触及，移动性浊音阴性，肠鸣音 4 次/分。

脊柱四肢：脊柱呈生理弯曲，四肢活动自如，双下肢无水肿。

神经系统：腹壁反射、肱二头肌反射、膝腱反射正常存在，巴宾斯基征阴性。`,
    auxiliaryExamination: `【2024-03-09 我院】
胃镜：胃窦部溃疡性病变，大小约 3.5cm×3.0cm，边界不清，底部覆白苔，周围黏膜皱襞中断。

【2024-03-10 我院】
病理活检：（胃窦）低分化腺癌。免疫组化：HER2(-), Ki-67 约 55%, p53(+).

【2024-03-10 我院】
腹部增强 CT：胃窦部胃壁不规则增厚，周围脂肪间隙模糊；腹腔干周围多发淋巴结肿大，最大短径约 1.5cm。

【2024-03-11 我院】
血常规：WBC 6.5×10^9/L, Hb 115g/L, PLT 205×10^9/L。
肝肾功能：ALT 20U/L, AST 23U/L, Alb 35g/L, Cr 70μmol/L。
肿瘤标志物：CEA 12.5ng/mL↑, CA19-9 45.2U/mL↑, CA72-4 18.6U/mL↑。`,
    meetingRecord: `2024-03-12 09:00-10:30 在 MDT 会诊中心召开多学科会诊。

参加专家：
- 肿瘤科：张明华 主任医师
- 营养科：周丽萍 主任医师

会诊过程：
1. 申请科室汇报病史：患者刘芳，50 岁，因"反复上腹部不适 6 个月，加重伴呕吐 1 个月"入院。胃镜及病理确诊为胃窦低分化腺癌。

2. 肿瘤科汇报：患者目前肿瘤分期为 III 期（cT3N1M0），建议行新辅助化疗后评估手术指征。

3. 营养科汇报：患者营养状况欠佳，BMI 18.5，需行营养支持治疗。

4. 各科专家讨论后一致同意：
   - 诊断：胃窦低分化腺癌 III 期（cT3N1M0）
   - 治疗方案：新辅助化疗 + 营养支持
   - 化疗：SOX 方案，每 3 周一次，共 4 周期
   - 营养支持：肠内营养粉，每日 3 次`,
    consultationReport: `一、诊断
胃窦低分化腺癌 III 期（cT3N1M0）
ECOG 评分：1 分
营养不良（BMI 18.5）

二、鉴别诊断
1. 胃溃疡：患者病程较长，消瘦明显，肿瘤标志物升高，胃镜及病理支持恶性病变。
2. 胃淋巴瘤：患者无发热、盗汗等全身症状，影像学表现不支持淋巴瘤。

三、治疗方案
1. 新辅助化疗
   - SOX 方案（替吉奥 40mg bid d1-14 + 奥沙利铂 130mg/m² d1）
   - 每 3 周一次，共 4 周期

2. 疗效评估
   - 每 2 周期复查腹部 CT、肿瘤标志物
   - 如肿瘤缩小，考虑行根治性胃切除术
   - 如疾病进展，更换化疗方案

3. 营养支持
   - 肠内营养粉，每日 3 次
   - 定期评估营养状况

四、随访计划
1. 治疗期间：每周复查血常规、肝肾功能
2. 每 2 周期复查腹部 CT、肿瘤标志物
3. 如出现不适，随时就诊`,
    recommendations: [
      '完善基因检测（MSI、PD-L1 等）',
      '营养支持治疗，改善营养状况',
      '定期复查血常规、肝肾功能',
      '每 2 周期评估疗效',
      '保持良好心态，适当运动'
    ],
    recordingUrl: '/recordings/C004_audio.mp3',
    videoUrl: '/recordings/C004_video.mp4',
    recordingDuration: '1:25:30',
    videoDuration: '1:23:15',
    secretaryAuditTime: '2024-03-12 15:00',
    secretaryAuditResult: '通过',
    secretaryComment: '材料完整规范',
    qualityAuditTime: '2024-03-12 16:30',
    qualityReviewer: '质控员 A',
    qualityScore: 4.5,
    qualityResult: '通过',
    qualityComment: '会诊记录详细，诊疗方案规范，符合指南要求'
  },
]

export default function SubmitMaterial() {
  const [tasks, setTasks] = useState(mockTasks)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedTask, setSelectedTask] = useState<MaterialTask | null>(null)
  const [form] = Form.useForm()
  const [currentStep, setCurrentStep] = useState(0)

  const handleSubmit = (task: MaterialTask) => {
    setSelectedTask(task)
    setCurrentStep(0)
    setModalVisible(true)
  }

  // 当 Modal 打开且 selectedTask 变化时，智能填充表单
  useEffect(() => {
    if (modalVisible && selectedTask && (selectedTask.status === '待提交' || selectedTask.status === '已退回')) {
      // 延迟填充，确保表单已初始化
      setTimeout(() => {
        form.setFieldsValue({
          meetingRecord: selectedTask.meetingRecord || '',
          consultationReport: selectedTask.consultationReport || '',
          recommendations: selectedTask.recommendations?.join('\n') || ''
        })
      }, 200)
    }
  }, [modalVisible, selectedTask])

  const handleView = (task: MaterialTask) => {
    setSelectedTask(task)
    setModalVisible(true)
  }

  const handleUpload = () => {
    form.validateFields().then(values => {
      if (currentStep < 2) {
        setCurrentStep(currentStep + 1)
      } else {
        // 提交
        setTasks(tasks.map(t => t.id === selectedTask?.id ? {
          ...t,
          status: '待秘书审核' as const,
          submitTime: new Date().toLocaleString('zh-CN', { hour12: false }),
          meetingRecord: values.meetingRecord,
          consultationReport: values.consultationReport,
          recommendations: values.recommendations?.split('\n').filter((r: string) => r.trim())
          // 保留原有病历资料字段
        } : t))
        setModalVisible(false)
        message.success('材料已提交，等待秘书审核')
      }
    })
  }

  const handleResubmit = () => {
    form.validateFields().then(values => {
      setTasks(tasks.map(t => t.id === selectedTask?.id ? {
        ...t,
        status: '待秘书审核' as const,
        submitTime: new Date().toLocaleString('zh-CN', { hour12: false }),
        meetingRecord: values.meetingRecord,
        consultationReport: values.consultationReport,
        recommendations: values.recommendations?.split('\n').filter((r: string) => r.trim()),
        rejectReason: undefined
      } : t))
      setModalVisible(false)
      message.success('材料已重新提交')
    })
  }

  const columns: ColumnsType<MaterialTask> = [
    { title: '任务 ID', dataIndex: 'id', width: 80 },
    {
      title: '会诊 ID',
      dataIndex: 'consultationId',
      width: 100,
      render: t => <Tag color="blue">#{t}</Tag>
    },
    {
      title: '患者信息',
      key: 'patient',
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.patientName}</div>
          <div className="text-xs text-gray-500">{record.patientInpatientNo}</div>
        </div>
      )
    },
    {
      title: '会诊时间',
      key: 'meetingTime',
      width: 150,
      render: (_, record) => (
        <div>
          <div>{record.meetingTime}</div>
          <div className="text-xs text-gray-500">{record.meetingDate}</div>
        </div>
      )
    },
    { title: '申请科室', dataIndex: 'department', width: 120 },
    {
      title: '参会专家',
      dataIndex: 'experts',
      width: 200,
      render: (experts: Array<{ name: string; department: string }>) => (
        <Space direction="vertical" size={0}>
          {experts.slice(0, 2).map((e, i) => (
            <div key={i} className="text-xs">
              {e.name}({e.department})
            </div>
          ))}
          {experts.length > 2 && (
            <Tag color="gray">+{experts.length - 2}人</Tag>
          )}
        </Space>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 120,
      render: (status: string) => {
        const config = {
          '待提交': { color: 'orange', icon: <ClockCircleOutlined /> },
          '待秘书审核': { color: 'blue', icon: <FileTextOutlined /> },
          '待质控审核': { color: 'purple', icon: <ExclamationCircleOutlined /> },
          '审核通过': { color: 'green', icon: <CheckCircleOutlined /> },
          '已退回': { color: 'red', icon: <ExclamationCircleOutlined /> }
        }
        const c = config[status as keyof typeof config]
        return (
          <Tag color={c.color} icon={c.icon}>
            {status}
          </Tag>
        )
      }
    },
    {
      title: '提交时间',
      dataIndex: 'submitTime',
      width: 160,
      render: (t?: string) => t ? <Text className="text-xs">{t}</Text> : '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          {record.status === '待提交' && (
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleSubmit(record)}
              block
            >
              提交材料
            </Button>
          )}
          {record.status === '已退回' && (
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleSubmit(record)}
              block
            >
              修改重提
            </Button>
          )}
          {['待秘书审核', '待质控审核', '审核通过'].includes(record.status) && (
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
              block
            >
              查看
            </Button>
          )}
        </Space>
      )
    },
  ]

  const isEditMode = selectedTask?.status === '待提交' || selectedTask?.status === '已退回'

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Title level={4}>MDT 材料归档</Title>
        <Space>
          <Text type="secondary">
            会诊结束后 24-48 小时内提交材料
          </Text>
        </Space>
      </div>

      <Card>
        <Space className="mb-4">
          <Select placeholder="状态筛选" allowClear style={{ width: 150 }}>
            <Select.Option value="待提交">待提交</Select.Option>
            <Select.Option value="待秘书审核">待秘书审核</Select.Option>
            <Select.Option value="待质控审核">待质控审核</Select.Option>
            <Select.Option value="审核通过">审核通过</Select.Option>
            <Select.Option value="已退回">已退回</Select.Option>
          </Select>
          <Select placeholder="时间段" allowClear style={{ width: 150 }}>
            <Select.Option value="week">本周</Select.Option>
            <Select.Option value="month">本月</Select.Option>
          </Select>
        </Space>

        <Table
          columns={columns}
          dataSource={tasks}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1400 }}
        />
      </Card>

      <Modal
        title={
          <Space>
            <FileTextOutlined />
            <span>
              {selectedTask?.status === '待提交' ? '提交会诊材料' :
               selectedTask?.status === '已退回' ? '修改并重新提交' :
               '查看会诊材料'} - {selectedTask?.consultationId}
            </span>
          </Space>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={900}
        footer={isEditMode ? [
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            取消
          </Button>,
          currentStep > 0 && (
            <Button key="prev" onClick={() => setCurrentStep(currentStep - 1)}>
              上一步
            </Button>
          ),
          currentStep < 2 ? (
            <Button
              key="next"
              type="primary"
              onClick={() => setCurrentStep(currentStep + 1)}
            >
              下一步
            </Button>
          ) : (
            <Button
              key="submit"
              type="primary"
              onClick={selectedTask?.status === '已退回' ? handleResubmit : handleUpload}
            >
              {selectedTask?.status === '已退回' ? '重新提交' : '提交'}
            </Button>
          ),
        ] : [
          <Button key="close" onClick={() => setModalVisible(false)}>
            关闭
          </Button>,
        ]}
      >
        {isEditMode ? (
          <Steps
            current={currentStep}
            items={[
              {
                title: '填写会诊记录',
                icon: <FileTextOutlined />
              },
              {
                title: '填写会诊报告',
                icon: <EditOutlined />
              },
              {
                title: '确认提交',
                icon: <CheckCircleOutlined />
              }
            ]}
            className="mb-6"
          />
        ) : (
          <Divider>会诊信息</Divider>
        )}

        {isEditMode && currentStep === 0 && (
          <div className="space-y-4">
            <Card title={<><UserOutlined className="text-blue-600" /> 患者基本信息</>} size="small" className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <Space direction="vertical">
                <div><Text strong>患者姓名：</Text>{selectedTask?.patientName}</div>
                <div><Text strong>住院号：</Text>{selectedTask?.patientInpatientNo}</div>
                <div><Text strong>会诊时间：</Text>{selectedTask?.meetingDate} {selectedTask?.meetingTime}</div>
                <div><Text strong>申请科室：</Text>{selectedTask?.department}</div>
                <div><Text strong>申请医生：</Text>{selectedTask?.applyDoctor}</div>
                <div><Text strong>参会专家：</Text>
                  <Space wrap>
                    {selectedTask?.experts.map((e, i) => (
                      <Tag key={i} color="blue">{e.name}({e.department})</Tag>
                    ))}
                  </Space>
                </div>
              </Space>
            </Card>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
              <Space>
                <ExclamationCircleOutlined className="text-blue-600" />
                <Text className="text-blue-800">
                  以下是患者病历资料，可作为填写会诊记录的参考
                </Text>
              </Space>
            </div>

            <Tabs 
              defaultActiveKey="1" 
              size="small"
              className="bg-white border border-gray-200 rounded-lg"
              items={[
                {
                  key: '1',
                  label: '📄 主诉',
                  children: (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded text-sm whitespace-pre-line min-h-[200px] max-h-[400px] overflow-y-auto">
                      {selectedTask?.chiefComplaint || '暂无相关记录'}
                    </div>
                  )
                },
                {
                  key: '2',
                  label: '📄 现病史',
                  children: (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded text-sm whitespace-pre-line min-h-[200px] max-h-[400px] overflow-y-auto">
                      {selectedTask?.presentIllness || '暂无相关记录'}
                    </div>
                  )
                },
                {
                  key: '3',
                  label: '📄 既往史',
                  children: (
                    <div className="p-4 bg-green-50 border border-green-200 rounded text-sm whitespace-pre-line min-h-[200px] max-h-[400px] overflow-y-auto">
                      {selectedTask?.pastHistory || '暂无相关记录'}
                    </div>
                  )
                },
                {
                  key: '4',
                  label: '🩺 体格检查',
                  children: (
                    <div className="p-4 bg-cyan-50 border border-cyan-200 rounded text-sm whitespace-pre-line min-h-[200px] max-h-[400px] overflow-y-auto">
                      {selectedTask?.physicalExamination || '暂无相关记录'}
                    </div>
                  )
                },
                {
                  key: '5',
                  label: '🧪 辅助检查',
                  children: (
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded text-sm whitespace-pre-line min-h-[200px] max-h-[400px] overflow-y-auto">
                      {selectedTask?.auxiliaryExamination || '暂无相关记录'}
                    </div>
                  )
                },
              ]}
            />

            <Form form={form} layout="vertical">
              <Form.Item
                name="meetingRecord"
                label="会诊记录"
                rules={[{ required: true, message: '请输入会诊记录' }]}
                tooltip="详细记录会诊过程，包括专家讨论内容"
                extra={selectedTask?.meetingRecord ? 
                  <Tag color="blue">已自动填充</Tag> : 
                  <Tag>需手动填写</Tag>
                }
              >
                <Input.TextArea
                  rows={8}
                  placeholder={`请输入会诊记录，包括：
1. 申请科室汇报病史
2. 各科专家检查汇报
3. 专家讨论意见
4. 最终诊疗方案`}
                />
              </Form.Item>
            </Form>

            {selectedTask?.recordingUrl && (
              <Card title={<><AudioOutlined /> 会诊录音（参考）</>} size="small" className="bg-blue-50">
                <div className="space-y-3">
                  <audio controls className="w-full" src={selectedTask.recordingUrl}>
                    您的浏览器不支持音频播放
                  </audio>
                  <div className="text-sm text-gray-600">
                    <Space>
                      <Tag icon={<PlayCircleOutlined />} color="blue">时长：{selectedTask.recordingDuration}</Tag>
                      <Tag color="green">格式：MP3</Tag>
                    </Space>
                  </div>
                </div>
              </Card>
            )}

            {selectedTask?.videoUrl && (
              <Card title={<><PlayCircleOutlined /> 会诊录像（参考）</>} size="small" className="bg-red-50">
                <div className="space-y-3">
                  <video controls className="w-full rounded" src={selectedTask.videoUrl}>
                    您的浏览器不支持视频播放
                  </video>
                  <div className="text-sm text-gray-600">
                    <Space>
                      <Tag icon={<PlayCircleOutlined />} color="blue">时长：{selectedTask.videoDuration}</Tag>
                      <Tag color="red">格式：MP4</Tag>
                    </Space>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {isEditMode && currentStep === 1 && (
          <div className="space-y-4">
            <Card title={<><UserOutlined className="text-blue-600" /> 患者基本信息</>} size="small" className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <Space direction="vertical">
                <div><Text strong>患者姓名：</Text>{selectedTask?.patientName}</div>
                <div><Text strong>住院号：</Text>{selectedTask?.patientInpatientNo}</div>
                <div><Text strong>会诊时间：</Text>{selectedTask?.meetingDate} {selectedTask?.meetingTime}</div>
                <div><Text strong>申请科室：</Text>{selectedTask?.department}</div>
                <div><Text strong>申请医生：</Text>{selectedTask?.applyDoctor}</div>
              </Space>
            </Card>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
              <Space>
                <ExclamationCircleOutlined className="text-blue-600" />
                <Text className="text-blue-800">
                  以下是患者病历资料，可作为填写会诊报告的参考
                </Text>
              </Space>
            </div>

            <Tabs 
              defaultActiveKey="1" 
              size="small"
              className="bg-white border border-gray-200 rounded-lg"
              items={[
                {
                  key: '1',
                  label: '📄 主诉',
                  children: (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded text-sm whitespace-pre-line min-h-[200px] max-h-[400px] overflow-y-auto">
                      {selectedTask?.chiefComplaint || '暂无相关记录'}
                    </div>
                  )
                },
                {
                  key: '2',
                  label: '📄 现病史',
                  children: (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded text-sm whitespace-pre-line min-h-[200px] max-h-[400px] overflow-y-auto">
                      {selectedTask?.presentIllness || '暂无相关记录'}
                    </div>
                  )
                },
                {
                  key: '3',
                  label: '📄 既往史',
                  children: (
                    <div className="p-4 bg-green-50 border border-green-200 rounded text-sm whitespace-pre-line min-h-[200px] max-h-[400px] overflow-y-auto">
                      {selectedTask?.pastHistory || '暂无相关记录'}
                    </div>
                  )
                },
                {
                  key: '4',
                  label: '🩺 体格检查',
                  children: (
                    <div className="p-4 bg-cyan-50 border border-cyan-200 rounded text-sm whitespace-pre-line min-h-[200px] max-h-[400px] overflow-y-auto">
                      {selectedTask?.physicalExamination || '暂无相关记录'}
                    </div>
                  )
                },
                {
                  key: '5',
                  label: '🧪 辅助检查',
                  children: (
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded text-sm whitespace-pre-line min-h-[200px] max-h-[400px] overflow-y-auto">
                      {selectedTask?.auxiliaryExamination || '暂无相关记录'}
                    </div>
                  )
                },
              ]}
            />

            <Form form={form} layout="vertical">
              <Form.Item
                name="consultationReport"
                label="会诊报告"
                rules={[{ required: true, message: '请输入会诊报告' }]}
                tooltip="最终形成的诊疗方案"
                extra={selectedTask?.consultationReport ? 
                  <Tag color="blue">已自动填充</Tag> : 
                  <Tag>需手动填写</Tag>
                }
              >
                <Input.TextArea
                  rows={6}
                  placeholder={`请输入会诊报告，包括：
一、诊断
二、治疗方案
三、随访计划`}
                />
              </Form.Item>

              <Form.Item
                name="recommendations"
                label="会诊建议"
                tooltip="给患者的后续治疗建议，每行一条"
                extra={selectedTask?.recommendations && selectedTask.recommendations.length > 0 ? 
                  <Tag color="blue">已自动填充 {selectedTask.recommendations.length} 条</Tag> : 
                  <Tag>需手动填写</Tag>
                }
              >
                <Input.TextArea
                  rows={4}
                  placeholder="请输入会诊建议，每行一条，例如：
完善基因检测
评估心肺功能
营养支持治疗"
                />
              </Form.Item>
            </Form>
          </div>
        )}

        {isEditMode && currentStep === 2 && (
          <div className="space-y-4">
            <Card 
              title={<><CheckCircleOutlined className="text-green-600" /> 请确认以下信息</>} 
              size="small"
              className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200"
            >
              <div className="space-y-4">
                {/* 基本信息 */}
                <div className="flex items-start gap-3 pb-3 border-b border-green-200">
                  <UserOutlined className="text-green-600 mt-1" />
                  <div className="flex-1">
                    <div className="mb-2">
                      <Text className="text-gray-600">患者：</Text>
                      <Text strong className="text-lg">{selectedTask?.patientName}</Text>
                      <Tag className="ml-2">{selectedTask?.patientInpatientNo}</Tag>
                    </div>
                    <div>
                      <Text className="text-gray-600">会诊时间：</Text>
                      <Text>{selectedTask?.meetingDate} {selectedTask?.meetingTime}</Text>
                    </div>
                  </div>
                </div>

                {/* 会诊记录 */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileTextOutlined className="text-blue-600" />
                    <Text strong className="text-base">会诊记录</Text>
                    <Tag color="blue" icon={<CheckCircleOutlined />}>已填写</Tag>
                  </div>
                  <div className="ml-6 p-3 bg-white rounded border border-blue-100 text-sm max-h-48 overflow-y-auto shadow-sm">
                    <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                      {form.getFieldValue('meetingRecord')?.substring(0, 500)}
                      {form.getFieldValue('meetingRecord')?.length > 500 ? '...' : ''}
                    </div>
                  </div>
                </div>

                {/* 会诊报告 */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileTextOutlined className="text-purple-600" />
                    <Text strong className="text-base">会诊报告</Text>
                    <Tag color="purple" icon={<CheckCircleOutlined />}>已填写</Tag>
                  </div>
                  <div className="ml-6 p-3 bg-white rounded border border-purple-100 text-sm max-h-48 overflow-y-auto shadow-sm">
                    <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                      {form.getFieldValue('consultationReport')?.substring(0, 500)}
                      {form.getFieldValue('consultationReport')?.length > 500 ? '...' : ''}
                    </div>
                  </div>
                </div>

                {/* 会诊建议 */}
                {form.getFieldValue('recommendations') && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckSquareOutlined className="text-orange-600" />
                      <Text strong className="text-base">会诊建议</Text>
                      <Tag color="orange" icon={<CheckCircleOutlined />}>
                        {form.getFieldValue('recommendations').split('\n').filter((r: string) => r.trim()).length} 条
                      </Tag>
                    </div>
                    <div className="ml-6 p-3 bg-white rounded border border-orange-100 shadow-sm">
                      <ul className="space-y-1">
                        {form.getFieldValue('recommendations').split('\n').filter((r: string) => r.trim()).map((rec: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="text-orange-500 mt-1">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* 会诊录音 */}
                {selectedTask?.recordingUrl && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <AudioOutlined className="text-green-600" />
                      <Text strong className="text-base">会诊录音</Text>
                      <Tag color="green" icon={<CheckCircleOutlined />}>已上传</Tag>
                    </div>
                    <div className="ml-6 p-3 bg-green-50 rounded border border-green-100 shadow-sm">
                      <audio controls className="w-full" src={selectedTask.recordingUrl}>
                        您的浏览器不支持音频播放
                      </audio>
                      <div className="mt-2 text-xs text-gray-600">
                        <Space>
                          <Tag icon={<PlayCircleOutlined />} color="blue">时长：{selectedTask.recordingDuration || '未知'}</Tag>
                          <Tag color="green">格式：MP3</Tag>
                        </Space>
                      </div>
                    </div>
                  </div>
                )}

                {/* 会诊录像 */}
                {selectedTask?.videoUrl && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <PlayCircleOutlined className="text-red-600" />
                      <Text strong className="text-base">会诊录像</Text>
                      <Tag color="red" icon={<CheckCircleOutlined />}>已上传</Tag>
                    </div>
                    <div className="ml-6 p-3 bg-red-50 rounded border border-red-100 shadow-sm">
                      <video controls className="w-full rounded" src={selectedTask.videoUrl}>
                        您的浏览器不支持视频播放
                      </video>
                      <div className="mt-2 text-xs text-gray-600">
                        <Space>
                          <Tag icon={<PlayCircleOutlined />} color="blue">时长：{selectedTask.videoDuration || '未知'}</Tag>
                          <Tag color="red">格式：MP4</Tag>
                        </Space>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-lg shadow-sm">
              <Space>
                <ExclamationCircleOutlined className="text-amber-600 text-lg" />
                <Text className="text-amber-800 font-medium">
                  请确认信息无误后提交，提交后将进入审核流程
                </Text>
              </Space>
            </div>
          </div>
        )}

        {!isEditMode && (
          <div className="space-y-4">
            {/* 基本信息 - 完整展示 */}
            <Card 
              title={<><UserOutlined className="text-blue-600" /> 基本信息</>} 
              size="small"
              className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 shadow-md"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Text className="text-gray-600">患者姓名：</Text>
                    <Text strong className="text-lg ml-2">{selectedTask?.patientName}</Text>
                  </div>
                  <div>
                    <Text className="text-gray-600">住院号：</Text>
                    <Text strong className="ml-2">{selectedTask?.patientInpatientNo}</Text>
                  </div>
                  <div>
                    <Text className="text-gray-600">会诊日期：</Text>
                    <Text className="ml-2">{selectedTask?.meetingDate}</Text>
                  </div>
                  <div>
                    <Text className="text-gray-600">会诊时间：</Text>
                    <Text className="ml-2">{selectedTask?.meetingTime}</Text>
                  </div>
                  <div>
                    <Text className="text-gray-600">申请科室：</Text>
                    <Tag className="ml-2" color="blue">{selectedTask?.department}</Tag>
                  </div>
                  <div>
                    <Text className="text-gray-600">申请医生：</Text>
                    <Text className="ml-2">{selectedTask?.applyDoctor}</Text>
                  </div>
                  {selectedTask?.submitTime && (
                    <div>
                      <Text className="text-gray-600">提交时间：</Text>
                      <Text className="ml-2">{selectedTask.submitTime}</Text>
                    </div>
                  )}
                  <div>
                    <Text className="text-gray-600">状态：</Text>
                    <Tag className="ml-2" color={selectedTask?.status === '审核通过' ? 'green' : 'blue'}>
                      {selectedTask?.status}
                    </Tag>
                  </div>
                </div>

                {/* 参会专家 */}
                <Divider className="my-2">参会专家</Divider>
                <div className="flex flex-wrap gap-2">
                  {selectedTask?.experts.map((e, i) => (
                    <Tag key={i} color="cyan" className="text-sm px-3 py-1">
                      <UserOutlined className="mr-1" />
                      {e.name} ({e.department})
                    </Tag>
                  ))}
                </div>
              </div>
            </Card>

            {/* MDT 会诊记录 */}
            <Card 
              title={<><FileTextOutlined className="text-indigo-600" /> MDT 会诊记录</>} 
              size="small"
              className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 shadow-md"
            >
              {selectedTask?.meetingRecord ? (
                <div className="whitespace-pre-line text-sm text-gray-700 leading-relaxed max-h-[600px] overflow-y-auto p-3 bg-white rounded border border-indigo-100">
                  {selectedTask.meetingRecord}
                </div>
              ) : (
                <div className="text-gray-500 text-sm py-8 text-center">暂无会诊记录</div>
              )}
            </Card>

            {/* 会诊报告 */}
            <Card 
              title={<><FileTextOutlined className="text-purple-600" /> MDT 会诊报告</>} 
              size="small"
              className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 shadow-md"
            >
              {selectedTask?.consultationReport ? (
                <div className="whitespace-pre-line text-sm text-gray-700 leading-relaxed max-h-[600px] overflow-y-auto p-3 bg-white rounded border border-purple-100">
                  {selectedTask.consultationReport}
                </div>
              ) : (
                <div className="text-gray-500 text-sm py-8 text-center">暂无会诊报告</div>
              )}
            </Card>

            {/* 会诊建议 */}
            {selectedTask?.recommendations && selectedTask.recommendations.length > 0 && (
              <Card 
                title={<><CheckSquareOutlined className="text-orange-600" /> MDT 会诊建议</>} 
                size="small"
                className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 shadow-md"
              >
                <div className="p-3 bg-white rounded border border-orange-100">
                  <ul className="space-y-2">
                    {selectedTask.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-orange-500 mt-1 font-bold">✓</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            )}

            {/* 音视频资料 */}
            {(selectedTask?.recordingUrl || selectedTask?.videoUrl) && (
              <Card 
                title={<><PlayCircleOutlined className="text-red-600" /> MDT 会诊音视频</>} 
                size="small"
                className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 shadow-md"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedTask?.recordingUrl && (
                    <div className="p-3 bg-green-50 rounded border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <AudioOutlined className="text-green-600" />
                        <Text strong className="text-sm">会诊录音</Text>
                      </div>
                      <audio controls className="w-full mb-2" src={selectedTask.recordingUrl}>
                        您的浏览器不支持音频播放
                      </audio>
                      <div className="text-xs text-gray-600">
                        <Tag icon={<PlayCircleOutlined />} color="blue">时长：{selectedTask.recordingDuration || '未知'}</Tag>
                      </div>
                    </div>
                  )}
                  {selectedTask?.videoUrl && (
                    <div className="p-3 bg-red-50 rounded border border-red-200">
                      <div className="flex items-center gap-2 mb-2">
                        <PlayCircleOutlined className="text-red-600" />
                        <Text strong className="text-sm">会诊录像</Text>
                      </div>
                      <video controls className="w-full rounded mb-2" src={selectedTask.videoUrl}>
                        您的浏览器不支持视频播放
                      </video>
                      <div className="text-xs text-gray-600">
                        <Tag icon={<PlayCircleOutlined />} color="blue">时长：{selectedTask.videoDuration || '未知'}</Tag>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* 患者病历资料 - Tabs 展示 */}
            <Card 
              title={<><FileTextOutlined className="text-amber-600" /> 患者病历资料</>} 
              size="small"
              className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200"
            >
              <Tabs 
                defaultActiveKey="1" 
                size="small"
                className="bg-white border border-gray-200 rounded-lg"
                items={[
                  {
                    key: '1',
                    label: '📄 主诉',
                    children: (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded text-sm whitespace-pre-line min-h-[150px] max-h-[400px] overflow-y-auto">
                        {selectedTask?.chiefComplaint || '暂无相关记录'}
                      </div>
                    )
                  },
                  {
                    key: '2',
                    label: '📄 现病史',
                    children: (
                      <div className="p-4 bg-orange-50 border border-orange-200 rounded text-sm whitespace-pre-line min-h-[150px] max-h-[400px] overflow-y-auto">
                        {selectedTask?.presentIllness || '暂无相关记录'}
                      </div>
                    )
                  },
                  {
                    key: '3',
                    label: '📄 既往史',
                    children: (
                      <div className="p-4 bg-green-50 border border-green-200 rounded text-sm whitespace-pre-line min-h-[150px] max-h-[400px] overflow-y-auto">
                        {selectedTask?.pastHistory || '暂无相关记录'}
                      </div>
                    )
                  },
                  {
                    key: '4',
                    label: '🩺 体格检查',
                    children: (
                      <div className="p-4 bg-cyan-50 border border-cyan-200 rounded text-sm whitespace-pre-line min-h-[150px] max-h-[400px] overflow-y-auto">
                        {selectedTask?.physicalExamination || '暂无相关记录'}
                      </div>
                    )
                  },
                  {
                    key: '5',
                    label: '🧪 辅助检查',
                    children: (
                      <div className="p-4 bg-purple-50 border border-purple-200 rounded text-sm whitespace-pre-line min-h-[150px] max-h-[400px] overflow-y-auto">
                        {selectedTask?.auxiliaryExamination || '暂无相关记录'}
                      </div>
                    )
                  },
                ]}
              />
            </Card>

            {/* 审批记录 */}
            {(selectedTask?.secretaryAuditTime || selectedTask?.qualityReviewer) && (
              <Card 
                title={<><SafetyOutlined className="text-cyan-600" /> 审批记录</>} 
                size="small"
                className="bg-gradient-to-r from-cyan-50 to-teal-50 border border-cyan-200"
              >
                <div className="space-y-3">
                  {selectedTask?.secretaryAuditTime && (
                    <div className="p-3 bg-blue-50 rounded border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <Text strong className="text-blue-800">MDT 秘书审核</Text>
                        <Tag color={selectedTask.secretaryAuditResult === '通过' ? 'green' : 'red'}>
                          {selectedTask.secretaryAuditResult}
                        </Tag>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>审核时间：{selectedTask.secretaryAuditTime}</div>
                        {selectedTask.secretaryComment && (
                          <div>审核意见：{selectedTask.secretaryComment}</div>
                        )}
                      </div>
                    </div>
                  )}
                  {selectedTask?.qualityReviewer && (
                    <div className="p-3 bg-purple-50 rounded border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <Text strong className="text-purple-800">质控审核</Text>
                        <Tag color={selectedTask.qualityResult === '通过' ? 'green' : 'red'}>
                          {selectedTask.qualityResult}
                        </Tag>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>审核时间：{selectedTask.qualityAuditTime}</div>
                        <div>审核人：{selectedTask.qualityReviewer}</div>
                        {selectedTask.qualityScore && (
                          <div>质控评分：<Tag color="blue">{selectedTask.qualityScore} 分</Tag></div>
                        )}
                        {selectedTask.qualityComment && (
                          <div>审核意见：{selectedTask.qualityComment}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
