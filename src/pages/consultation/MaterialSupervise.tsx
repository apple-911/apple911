import { useState } from 'react'
import { Card, Table, Button, Tag, Space, Typography, Modal, message, Select, DatePicker, Descriptions, Divider, Tabs, Input, Drawer, Result } from 'antd'
import {
  BellOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  UserOutlined,
  AudioOutlined,
  PlayCircleOutlined,
  MedicineBoxOutlined,
  ApiOutlined,
  SafetyOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import PatientInfo from '../../components/PatientInfo'
import { useNavigate } from 'react-router-dom'
import { hasPermission } from '../../utils/helpers'

const { Title, Text } = Typography

interface MaterialTask {
  id: string
  consultationId: string
  patientId: string
  patientName: string
  patientInpatientNo: string
  meetingDate: string
  meetingTime: string
  department: string
  applyDoctor: string
  experts: Array<{ name: string; department: string }>
  status: '待提交' | '待秘书审核' | '待质控审核' | '审核通过' | '已退回'
  submitTime?: string
  rejectReason?: string
  // 完整病历资料
  chiefComplaint?: string
  presentIllness?: string
  pastHistory?: string
  physicalExamination?: string
  auxiliaryExamination?: string
  // 会诊信息
  meetingRecord?: string
  consultationReport?: string
  recommendations?: string[]
  recordingUrl?: string
  videoUrl?: string
  recordingDuration?: string
  videoDuration?: string
  // 审核信息
  secretaryAuditTime?: string
  secretaryAuditResult?: string
  secretaryComment?: string
  qualityAuditTime?: string
  qualityReviewer?: string
  qualityScore?: number
  qualityResult?: string
  qualityComment?: string
}

const mockTasks: MaterialTask[] = [
  {
    id: 'M001',
    consultationId: 'C001',
    patientId: 'P001',
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
    patientId: 'P002',
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
    status: '待秘书审核',
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

胸部：胸廓无畸形，双肺呼吸音清，未闻及干湿性啰音。心率 78 次/分，律齐，各瓣膜听诊区未闻及病理性杂音。

腹部：腹平软，无压痛、反跳痛及肌紧张，肝脾肋下未触及，移动性浊音阴性，肠鸣音正常。

专科检查：右乳外上象限可触及一肿块，约 2.5cm×2.0cm，质硬，边界不清，活动度可，无压痛，与皮肤及胸肌无粘连。左乳未触及明显肿块。双侧乳头无凹陷，无溢液。`,
    auxiliaryExamination: `【2024-03-12 我院】
乳腺彩超：右乳外上象限实性占位，大小约 2.5cm×2.0cm，边界不清，形态不规则，BI-RADS 4C 类；右腋窝淋巴结肿大。

【2024-03-13 我院】
乳腺钼靶：右乳外上象限高密度肿块影，边缘毛刺，BI-RADS 5 类。

【2024-03-13 我院】
乳腺穿刺活检：（右乳）浸润性导管癌 II 级。免疫组化：ER(80%+), PR(60%+), HER2(1+), Ki-67 约 25%。

【2024-03-14 我院】
血常规：WBC 5.6×10^9/L, Hb 125g/L, PLT 220×10^9/L。
肝肾功能：ALT 15U/L, AST 18U/L, Cr 65μmol/L。
肿瘤标志物：CA15-3 35U/mL↑, CEA 2.8ng/mL。

【2024-03-14 我院】
心电图：窦性心律，正常心电图。
胸部 CT：双肺未见明显转移灶。
腹部彩超：肝脏、胆囊、胰腺、脾脏未见明显异常。`,
    meetingRecord: `2024-03-14 10:00-11:00 在 MDT 会诊中心召开多学科会诊。

参加专家：
- 乳腺外科：陈伟 主任医师
- 肿瘤科：张明华 主任医师

会诊过程：
1. 申请科室汇报病史：患者李秀英，55 岁，因"发现右乳肿块 2 个月"入院。乳腺彩超、钼靶均提示右乳占位，穿刺活检确诊为浸润性导管癌 II 级。

2. 病理科汇报：（右乳穿刺）浸润性导管癌 II 级。免疫组化：ER(80%+), PR(60%+), HER2(1+), Ki-67 约 25%。分子分型：Luminal B 型。

3. 乳腺外科汇报：患者肿瘤大小约 2.5cm，伴腋窝淋巴结转移，临床分期为 IIB 期（cT2N1M0）。建议行改良根治术或保乳手术 + 前哨淋巴结活检。

4. 肿瘤科汇报：患者为 Luminal B 型乳腺癌，术后需行内分泌治疗 + 化疗。建议术后行 AC-T 方案化疗，之后行内分泌治疗。

5. 各科专家讨论后一致同意：
   - 诊断：右乳浸润性导管癌 IIB 期（cT2N1M0）Luminal B 型
   - 治疗方案：先行新辅助化疗，之后行手术治疗
   - 化疗方案：AC-T 方案（多柔比星 + 环磷酰胺序贯紫杉醇）
   - 手术方式：根据新辅助化疗疗效决定保乳或改良根治术`,
    consultationReport: `一、诊断
右乳浸润性导管癌 IIB 期（cT2N1M0）
分子分型：Luminal B 型（ER 80%+, PR 60%+, HER2 1+, Ki-67 25%）

二、鉴别诊断
1. 乳腺纤维腺瘤：多见于年轻女性，肿块边界清，活动度好，与本例不符。
2. 乳腺囊肿：超声表现为无回声区，与本例实性占位不符。

三、治疗方案
1. 新辅助化疗
   - AC-T 方案：
     * AC 阶段：多柔比星 60mg/m² + 环磷酰胺 600mg/m²，每 3 周一次，共 4 周期
     * T 阶段：紫杉醇 175mg/m²，每 3 周一次，共 4 周期

2. 手术治疗
   - 新辅助化疗后评估疗效
   - 如肿瘤缩小明显，可行保乳手术 + 前哨淋巴结活检
   - 如肿瘤缩小不明显，行改良根治术

3. 术后辅助治疗
   - 内分泌治疗：他莫昔芬 20mg qd × 5 年（绝经前）或来曲唑 2.5mg qd × 5 年（绝经后）
   - 根据术后病理决定是否行放疗

四、随访计划
1. 化疗期间：每周复查血常规、肝肾功能
2. 每 2 周期评估疗效（乳腺彩超、钼靶）
3. 术后定期复查，每 3 个月一次，持续 2 年
4. 之后每 6 个月复查一次`,
    recommendations: [
      '完善心脏彩超检查，评估心功能',
      '置入 PICC 管或输液港',
      '化疗期间注意骨髓抑制及胃肠道反应',
      '保持良好心态，适当运动',
      '均衡饮食，保证营养'
    ],
    recordingUrl: '/recordings/C002_audio.mp3',
    videoUrl: '/recordings/C002_video.mp4',
    recordingDuration: '1:00:15',
    videoDuration: '0:58:30',
    secretaryAuditTime: '2024-03-14 16:00',
    secretaryAuditResult: '通过',
    secretaryComment: '材料完整规范'
  },
  {
    id: 'M003',
    consultationId: 'C003',
    patientId: 'P003',
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
    chiefComplaint: '反复上腹部不适 3 个月，加重伴黑便 1 周',
    presentIllness: `患者 3 个月前无明显诱因出现上腹部不适，隐痛，餐后饱胀感，无恶心、呕吐，无反酸、嗳气。1 周前症状加重，出现黑便，每日 1-2 次，为柏油样便，无呕血。遂来我院就诊。

门诊胃镜示：胃窦部溃疡性病变，大小约 3.0cm×2.5cm，边缘隆起，底部覆白苔。活检病理提示：（胃窦）低分化腺癌。为求进一步诊治，门诊以"胃癌"收入我科。

患者自发病以来，精神、睡眠可，食欲欠佳，大小便正常，体重近 3 个月下降约 4kg。`,
    pastHistory: `既往体健，否认高血压、糖尿病、冠心病等慢性病史。否认肝炎、结核等传染病史。否认手术外伤史。否认输血史。否认药物及食物过敏史。

个人史：生于原籍，久居本地，无不良嗜好。吸烟 20 年，每日 20 支，已戒烟 5 年。

婚育史：26 岁结婚，配偶体健，育有 1 子 1 女，均体健。

家族史：父亲患胃癌，已故。否认家族中有其他遗传性疾病患者。`,
    physicalExamination: `T 36.4℃  P 76 次/分  R 18 次/分  BP 120/75mmHg

一般情况：发育正常，营养中等，神志清，精神可，自主体位，查体合作。

皮肤黏膜：全身皮肤黏膜无黄染、皮疹及出血点，睑结膜略苍白。

淋巴结：左锁骨上可触及 1 枚肿大淋巴结，约 1.0cm×0.8cm，质硬，活动度可，无压痛。

胸部：胸廓无畸形，双肺呼吸音清，未闻及干湿性啰音。心率 76 次/分，律齐，各瓣膜听诊区未闻及病理性杂音。

腹部：腹平软，上腹部轻压痛，无反跳痛及肌紧张，肝脾肋下未触及，墨菲氏征阴性，肾区无叩痛，移动性浊音阴性，肠鸣音正常。

肛门直肠外生殖器：未查。

脊柱四肢：脊柱呈生理弯曲，四肢活动自如，双下肢无水肿。

神经系统：腹壁反射、肱二头肌反射、膝腱反射正常存在，巴宾斯基征阴性。`,
    auxiliaryExamination: `【2024-03-10 我院】
胃镜：胃窦部溃疡性病变，大小约 3.0cm×2.5cm，边缘隆起，底部覆白苔。

【2024-03-11 我院】
病理：（胃窦）低分化腺癌。免疫组化：HER2(0), PD-L1(CPS=8), MSI-H。

【2024-03-12 我院】
腹部增强 CT：胃窦部胃壁增厚，约 2.5cm，伴周围淋巴结肿大；肝脏、胰腺、脾脏未见明显异常。

【2024-03-12 我院】
胸部 CT：双肺未见明显转移灶。

【2024-03-13 我院】
血常规：WBC 5.8×10^9/L, Hb 105g/L↓, PLT 210×10^9/L。
肝肾功能：ALT 20U/L, AST 25U/L, Cr 72μmol/L。
肿瘤标志物：CEA 8.5ng/mL↑, CA19-9 45U/mL↑, CA72-4 28U/mL↑。`,
    meetingRecord: `2024-03-13 15:00-16:30 在 MDT 会诊中心召开多学科会诊。

参加专家：
- 胃肠外科：王建国 主任医师
- 肿瘤科：李芳 副主任医师

会诊过程：
1. 申请科室汇报病史：患者张伟，58 岁，因"反复上腹部不适 3 个月，加重伴黑便 1 周"入院。胃镜示胃窦部溃疡性病变，活检确诊为低分化腺癌。

2. 病理科汇报：（胃窦）低分化腺癌。免疫组化：HER2(0), PD-L1(CPS=8), MSI-H。

3. 放射科汇报：腹部增强 CT 示胃窦部胃壁增厚，伴周围淋巴结肿大，未见远处转移。

4. 胃肠外科汇报：患者临床分期为 III 期（cT3N1M0），建议行新辅助化疗后行根治性远端胃切除术。

5. 肿瘤科汇报：患者为 MSI-H 型胃癌，可考虑免疫治疗联合化疗。建议行 SOX 方案新辅助化疗。

6. 各科专家讨论后一致同意：
   - 诊断：胃窦低分化腺癌 III 期（cT3N1M0）MSI-H
   - 治疗方案：新辅助化疗 + 手术治疗
   - 化疗方案：SOX 方案（替吉奥 + 奥沙利铂）
   - 手术方式：根治性远端胃切除术 + D2 淋巴结清扫`,
    consultationReport: `一、诊断
胃窦低分化腺癌 III 期（cT3N1M0）
MSI-H 型

二、鉴别诊断
1. 胃溃疡：患者病程较长，抗炎治疗无效，病理确诊为腺癌，不支持良性溃疡。
2. 胃淋巴瘤：病理不支持淋巴瘤诊断。

三、治疗方案
1. 新辅助化疗
   - SOX 方案：替吉奥 40mg bid d1-14 + 奥沙利铂 130mg/m² d1，每 3 周一次，共 4 周期

2. 手术治疗
   - 新辅助化疗后评估疗效
   - 行根治性远端胃切除术 + D2 淋巴结清扫

3. 术后辅助治疗
   - 根据术后病理决定后续治疗方案
   - 如为 MSI-H 型，可考虑免疫治疗

四、随访计划
1. 化疗期间：每周复查血常规、肝肾功能
2. 每 2 周期复查腹部 CT、肿瘤标志物
3. 术后定期复查胃镜、腹部 CT，每 3 个月一次，持续 2 年
4. 之后每 6 个月复查一次`,
    recommendations: [
      '完善营养评估，改善营养状况',
      '化疗期间注意胃肠道反应及骨髓抑制',
      '定期复查血常规、肝肾功能',
      '保持良好心态，适当运动',
      '戒烟，避免二手烟'
    ],
    recordingUrl: '/recordings/C003_audio.mp3',
    videoUrl: '/recordings/C003_video.mp4',
    recordingDuration: '1:25:10',
    videoDuration: '1:22:45'
  },
  {
    id: 'M004',
    consultationId: 'C004',
    patientId: 'P004',
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
    presentIllness: `患者 6 个月前无明显诱因出现上腹部不适，隐痛，餐后饱胀感，无恶心、呕吐，无反酸、嗳气。1 个月前症状加重，出现呕吐，为胃内容物，无咖啡样物。遂来我院就诊。

门诊胃镜示：胃窦部溃疡性病变，大小约 4.0cm×3.5cm，边缘隆起，底部覆白苔，伴幽门梗阻。活检病理提示：（胃窦）低分化腺癌。为求进一步诊治，门诊以"胃癌伴幽门梗阻"收入我科。

患者自发病以来，精神、睡眠可，食欲欠佳，大小便正常，体重近 6 个月下降约 8kg。`,
    pastHistory: `既往体健，否认高血压、糖尿病、冠心病等慢性病史。否认肝炎、结核等传染病史。否认手术外伤史。否认输血史。否认药物及食物过敏史。

个人史：生于原籍，久居本地，无不良嗜好。

婚育史：25 岁结婚，配偶体健，育有 1 子 1 女，均体健。

家族史：父母已故，死因不详。否认家族中有遗传性疾病及类似疾病患者。`,
    physicalExamination: `T 36.4℃  P 76 次/分  R 18 次/分  BP 120/75mmHg

一般情况：发育正常，营养中等，神志清，精神可，自主体位，查体合作。

皮肤黏膜：全身皮肤黏膜无黄染、皮疹及出血点，睑结膜略苍白。

淋巴结：全身浅表淋巴结未触及肿大。

胸部：胸廓无畸形，双肺呼吸音清，未闻及干湿性啰音。心率 76 次/分，律齐，各瓣膜听诊区未闻及病理性杂音。

腹部：腹平软，上腹部轻压痛，无反跳痛及肌紧张，肝脾肋下未触及，墨菲氏征阴性，肾区无叩痛，移动性浊音阴性，肠鸣音正常。

肛门直肠外生殖器：未查。

脊柱四肢：脊柱呈生理弯曲，四肢活动自如，双下肢无水肿。

神经系统：腹壁反射、肱二头肌反射、膝腱反射正常存在，巴宾斯基征阴性。`,
    auxiliaryExamination: `【2024-03-09 我院】
胃镜：胃窦部溃疡性病变，大小约 4.0cm×3.5cm，边缘隆起，底部覆白苔，伴幽门梗阻。

【2024-03-10 我院】
病理：（胃窦）低分化腺癌。免疫组化：HER2(0), PD-L1(CPS=5), MSS。

【2024-03-10 我院】
腹部增强 CT：胃窦部胃壁增厚，约 3.5cm，伴周围淋巴结肿大；肝脏、胰腺、脾脏未见明显异常。

【2024-03-11 我院】
胸部 CT：双肺未见明显转移灶。

【2024-03-11 我院】
血常规：WBC 5.5×10^9/L, Hb 98g/L↓, PLT 205×10^9/L。
肝肾功能：ALT 18U/L, AST 22U/L, Cr 68μmol/L。
肿瘤标志物：CEA 12.5ng/mL↑, CA19-9 58U/mL↑, CA72-4 35U/mL↑。`,
    meetingRecord: `2024-03-12 09:00-10:30 在 MDT 会诊中心召开多学科会诊。

参加专家：
- 肿瘤科：张明华 主任医师
- 营养科：周丽萍 主任医师

会诊过程：
1. 申请科室汇报病史：患者刘芳，62 岁，因"反复上腹部不适 6 个月，加重伴呕吐 1 个月"入院。胃镜示胃窦部溃疡性病变伴幽门梗阻，活检确诊为低分化腺癌。

2. 病理科汇报：（胃窦）低分化腺癌。免疫组化：HER2(0), PD-L1(CPS=5), MSS。

3. 放射科汇报：腹部增强 CT 示胃窦部胃壁增厚，伴周围淋巴结肿大，未见远处转移。

4. 肿瘤科汇报：患者临床分期为 III 期（cT3N1M0），伴幽门梗阻，建议先行胃肠减压、营养支持，之后行新辅助化疗。

5. 营养科汇报：患者营养不良，BMI 17.5，建议行肠内营养支持，改善营养状况后再行化疗。

6. 各科专家讨论后一致同意：
   - 诊断：胃窦低分化腺癌 III 期（cT3N1M0）伴幽门梗阻
   - 治疗方案：先行营养支持 + 胃肠减压，之后行新辅助化疗
   - 化疗方案：SOX 方案（替吉奥 + 奥沙利铂）
   - 手术方式：根治性远端胃切除术 + D2 淋巴结清扫`,
    consultationReport: `一、诊断
胃窦低分化腺癌 III 期（cT3N1M0）
伴幽门梗阻

二、鉴别诊断
1. 胃溃疡：患者病程较长，抗炎治疗无效，病理确诊为腺癌，不支持良性溃疡。
2. 胃淋巴瘤：病理不支持淋巴瘤诊断。

三、治疗方案
1. 营养支持
   - 肠内营养粉，每日 3 次
   - 必要时行肠外营养支持

2. 新辅助化疗
   - SOX 方案：替吉奥 40mg bid d1-14 + 奥沙利铂 130mg/m² d1，每 3 周一次，共 4 周期

3. 手术治疗
   - 新辅助化疗后评估疗效
   - 行根治性远端胃切除术 + D2 淋巴结清扫

4. 术后辅助治疗
   - 根据术后病理决定后续治疗方案

四、随访计划
1. 化疗期间：每周复查血常规、肝肾功能
2. 每 2 周期复查腹部 CT、肿瘤标志物
3. 术后定期复查胃镜、腹部 CT，每 3 个月一次，持续 2 年
4. 之后每 6 个月复查一次`,
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

export default function MaterialSupervise() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState(mockTasks)
  const [selectedTask, setSelectedTask] = useState<MaterialTask | null>(null)
  const [reminderVisible, setReminderVisible] = useState(false)
  const [viewVisible, setViewVisible] = useState(false)
  const [auditVisible, setAuditVisible] = useState(false)
  const [auditCommentVisible, setAuditCommentVisible] = useState(false)
  const [rejectVisible, setRejectVisible] = useState(false)
  const [auditComment, setAuditComment] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [patientDrawerVisible, setPatientDrawerVisible] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState<string>('')
  const [selectedPatientName, setSelectedPatientName] = useState<string>('')
  const [selectedPatientInpatientNo, setSelectedPatientInpatientNo] = useState<string>('')

  const handleRemind = (task: MaterialTask) => {
    setSelectedTask(task)
    setReminderVisible(true)
  }

  const sendReminder = () => {
    message.success(`已提醒 ${selectedTask?.department} ${selectedTask?.applyDoctor} 医生提交会诊材料`)
    setReminderVisible(false)
  }

  const handleView = (task: MaterialTask) => {
    setSelectedTask(task)
    setViewVisible(true)
  }

  const showPatientInfo = (patientId: string, patientName: string, patientInpatientNo: string) => {
    setSelectedPatientId(patientId)
    setSelectedPatientName(patientName)
    setSelectedPatientInpatientNo(patientInpatientNo)
    setPatientDrawerVisible(true)
  }

  const handleAudit = (task: MaterialTask) => {
    setSelectedTask(task)
    setAuditComment('')
    setRejectReason('')
    setAuditVisible(true)
  }

  const handleAuditPassClick = () => {
    setAuditComment('')
    setAuditCommentVisible(true)
  }

  const handleAuditPass = () => {
    setTasks(tasks.map(t => t.id === selectedTask?.id ? {
      ...t,
      status: '待质控审核' as const,
      secretaryAuditTime: new Date().toLocaleString('zh-CN', { hour12: false }),
      secretaryAuditResult: '通过',
      secretaryComment: auditComment
    } : t))
    setAuditCommentVisible(false)
    setAuditVisible(false)
    message.success('审核通过，已提交质控审核')
  }

  const handleRejectClick = () => {
    setRejectReason('')
    setRejectVisible(true)
  }

  const handleAuditReject = () => {
    if (!rejectReason.trim()) {
      message.error('请填写退回原因')
      return
    }
    setTasks(tasks.map(t => t.id === selectedTask?.id ? {
      ...t,
      status: '已退回' as const,
      secretaryAuditTime: new Date().toLocaleString('zh-CN', { hour12: false }),
      secretaryAuditResult: '退回',
      rejectReason
    } : t))
    setRejectVisible(false)
    setAuditVisible(false)
    message.success('已退回，申请医生可修改后重新提交')
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
          <Button
            type="link"
            size="small"
            className="!p-0 mt-1"
            icon={<UserOutlined />}
            onClick={() => showPatientInfo(record.patientId, record.patientName, record.patientInpatientNo)}
          >
            查看
          </Button>
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
    { title: '申请医生', dataIndex: 'applyDoctor', width: 100 },
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
              icon={<BellOutlined />}
              onClick={() => handleRemind(record)}
              block
            >
              提醒提交
            </Button>
          )}
          {record.status === '待秘书审核' && (
            <>
              <Button
                type="primary"
                size="small"
                icon={<FileTextOutlined />}
                onClick={() => handleAudit(record)}
                block
              >
                审核
              </Button>
              <Button
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleView(record)}
                block
              >
                查看
              </Button>
            </>
          )}
          {['待质控审核', '审核通过', '已退回'].includes(record.status) && (
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

  const pendingCount = tasks.filter(t => t.status === '待提交').length
  const auditingCount = tasks.filter(t => t.status === '待秘书审核').length

  // 权限检查
  if (!hasPermission('perm-consultation-material')) {
    return (
      <Result
        status="403"
        title="暂无权限"
        subTitle="抱歉，您没有权限访问材料督办页面。如需获取权限，请联系系统管理员。"
        extra={<Button type="primary" onClick={() => navigate(-1)}>返回</Button>}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Title level={4}>会诊材料督办</Title>
        <Space>
          <Text type="secondary">
            待提交：{pendingCount} 待审核：{auditingCount}
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
          <Select placeholder="申请科室" allowClear style={{ width: 150 }}>
            <Select.Option value="肿瘤科">肿瘤科</Select.Option>
            <Select.Option value="胸外科">胸外科</Select.Option>
            <Select.Option value="乳腺外科">乳腺外科</Select.Option>
          </Select>
          <DatePicker placeholder="会诊日期" style={{ width: 150 }} />
        </Space>

        <Table
          columns={columns}
          dataSource={tasks}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* 提醒 Modal */}
      <Modal
        title={<><BellOutlined /> 提醒提交材料</>}
        open={reminderVisible}
        onCancel={() => setReminderVisible(false)}
        onOk={sendReminder}
        okText="发送提醒"
        cancelText="取消"
      >
        <div className="space-y-4">
          <p>
            确定要提醒 <Text strong>{selectedTask?.department}</Text> 的{' '}
            <Text strong>{selectedTask?.applyDoctor}</Text> 医生提交会诊材料吗？
          </p>
          <div className="p-4 bg-blue-50 rounded">
            <div className="space-y-2 text-sm">
              <div><Text strong>患者：</Text>{selectedTask?.patientName}</div>
              <div><Text strong>会诊时间：</Text>{selectedTask?.meetingDate} {selectedTask?.meetingTime}</div>
              <div><Text strong>会诊 ID：</Text>#{selectedTask?.consultationId}</div>
            </div>
          </div>
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
            <Text type="warning">提醒将通过系统消息和短信发送给申请医生</Text>
          </div>
        </div>
      </Modal>

      {/* 查看 Modal */}
      <Modal
        title={<><EyeOutlined /> 查看会诊材料 - {selectedTask?.consultationId}</>}
        open={viewVisible}
        onCancel={() => setViewVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewVisible(false)}>
            关闭
          </Button>,
        ]}
        width={900}
      >
        {selectedTask && (
          <div className="space-y-4">
            {/* 基本信息 */}
            <Card 
              title={<><UserOutlined className="text-blue-600" /> 基本信息</>} 
              size="small"
              className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 shadow-md"
            >
              <Descriptions column={2} size="small">
                <Descriptions.Item label="患者姓名">{selectedTask.patientName}</Descriptions.Item>
                <Descriptions.Item label="住院号">{selectedTask.patientInpatientNo}</Descriptions.Item>
                <Descriptions.Item label="会诊日期">{selectedTask.meetingDate}</Descriptions.Item>
                <Descriptions.Item label="会诊时间">{selectedTask.meetingTime}</Descriptions.Item>
                <Descriptions.Item label="申请科室">{selectedTask.department}</Descriptions.Item>
                <Descriptions.Item label="申请医生">{selectedTask.applyDoctor}</Descriptions.Item>
                {selectedTask.submitTime && (
                  <Descriptions.Item label="提交时间">{selectedTask.submitTime}</Descriptions.Item>
                )}
                <Descriptions.Item label="状态">
                  <Tag color={selectedTask.status === '审核通过' ? 'green' : 'blue'}>
                    {selectedTask.status}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>

              <Divider className="my-2">参会专家</Divider>
              <div className="flex flex-wrap gap-2">
                {selectedTask.experts.map((e, i) => (
                  <Tag key={i} color="cyan" className="text-sm px-3 py-1">
                    <UserOutlined className="mr-1" />
                    {e.name} ({e.department})
                  </Tag>
                ))}
              </div>
            </Card>

            {/* 病历资料 - Tabs */}
            <Card 
              title={<><MedicineBoxOutlined className="text-amber-600" /> 患者病历资料</>} 
              size="small"
              className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 shadow-md"
            >
              <Tabs 
                defaultActiveKey="1" 
                size="small"
                items={[
                  {
                    key: '1',
                    label: '📄 主诉',
                    children: (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded text-sm whitespace-pre-line min-h-[200px] max-h-[400px] overflow-y-auto">
                        {selectedTask.chiefComplaint || '暂无相关记录'}
                      </div>
                    )
                  },
                  {
                    key: '2',
                    label: '📄 现病史',
                    children: (
                      <div className="p-4 bg-orange-50 border border-orange-200 rounded text-sm whitespace-pre-line min-h-[200px] max-h-[400px] overflow-y-auto">
                        {selectedTask.presentIllness || '暂无相关记录'}
                      </div>
                    )
                  },
                  {
                    key: '3',
                    label: '📄 既往史',
                    children: (
                      <div className="p-4 bg-green-50 border border-green-200 rounded text-sm whitespace-pre-line min-h-[200px] max-h-[400px] overflow-y-auto">
                        {selectedTask.pastHistory || '暂无相关记录'}
                      </div>
                    )
                  },
                  {
                    key: '4',
                    label: '🩺 体格检查',
                    children: (
                      <div className="p-4 bg-cyan-50 border border-cyan-200 rounded text-sm whitespace-pre-line min-h-[200px] max-h-[400px] overflow-y-auto">
                        {selectedTask.physicalExamination || '暂无相关记录'}
                      </div>
                    )
                  },
                  {
                    key: '5',
                    label: '🧪 辅助检查',
                    children: (
                      <div className="p-4 bg-purple-50 border border-purple-200 rounded text-sm whitespace-pre-line min-h-[200px] max-h-[400px] overflow-y-auto">
                        {selectedTask.auxiliaryExamination || '暂无相关记录'}
                      </div>
                    )
                  },
                ]}
              />
            </Card>

            {/* MDT 会诊记录 */}
            <Card 
              title={<><FileTextOutlined className="text-indigo-600" /> MDT 会诊记录</>} 
              size="small"
              className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 shadow-md"
            >
              {selectedTask.meetingRecord ? (
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
              {selectedTask.consultationReport ? (
                <div className="whitespace-pre-line text-sm text-gray-700 leading-relaxed max-h-[600px] overflow-y-auto p-3 bg-white rounded border border-purple-100">
                  {selectedTask.consultationReport}
                </div>
              ) : (
                <div className="text-gray-500 text-sm py-8 text-center">暂无会诊报告</div>
              )}
            </Card>

            {/* 会诊建议 */}
            <Card 
              title={<><CheckCircleOutlined className="text-orange-600" /> MDT 会诊建议</>} 
              size="small"
              className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 shadow-md"
            >
              {selectedTask.recommendations && selectedTask.recommendations.length > 0 ? (
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
              ) : (
                <div className="text-gray-500 text-sm py-8 text-center">暂无会诊建议</div>
              )}
            </Card>

            {/* 音视频资料 */}
            {(selectedTask.recordingUrl || selectedTask.videoUrl) && (
              <Card 
                title={<><PlayCircleOutlined className="text-red-600" /> MDT 会诊音视频</>} 
                size="small"
                className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 shadow-md"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedTask.recordingUrl && (
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
                  {selectedTask.videoUrl && (
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

            {/* 审批记录 */}
            {(selectedTask.secretaryAuditTime || selectedTask.qualityAuditTime) && (
              <Card 
                title={<><SafetyOutlined className="text-teal-600" /> 审批记录</>} 
                size="small"
                className="bg-gradient-to-r from-teal-50 to-cyan-50 border-2 border-teal-200 shadow-md"
              >
                <div className="space-y-3">
                  {selectedTask.secretaryAuditTime && (
                    <div className="p-3 bg-blue-50 rounded border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <FileTextOutlined className="text-blue-600" />
                        <Text strong>MDT 秘书审核</Text>
                        <Tag color={selectedTask.secretaryAuditResult === '通过' ? 'green' : 'red'}>
                          {selectedTask.secretaryAuditResult}
                        </Tag>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><Text strong>审核时间：</Text>{selectedTask.secretaryAuditTime}</div>
                        {selectedTask.secretaryComment && (
                          <div><Text strong>审核意见：</Text>{selectedTask.secretaryComment}</div>
                        )}
                      </div>
                    </div>
                  )}
                  {selectedTask.qualityAuditTime && (
                    <div className="p-3 bg-purple-50 rounded border border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <SafetyOutlined className="text-purple-600" />
                        <Text strong>质控审核</Text>
                        <Tag color={selectedTask.qualityResult === '通过' ? 'green' : 'red'}>
                          {selectedTask.qualityResult}
                        </Tag>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><Text strong>审核时间：</Text>{selectedTask.qualityAuditTime}</div>
                        {selectedTask.qualityReviewer && (
                          <div><Text strong>审核人：</Text>{selectedTask.qualityReviewer}</div>
                        )}
                        {selectedTask.qualityScore && (
                          <div><Text strong>评分：</Text>{selectedTask.qualityScore} / 5.0</div>
                        )}
                        {selectedTask.qualityComment && (
                          <div><Text strong>审核意见：</Text>{selectedTask.qualityComment}</div>
                        )}
                      </div>
                    </div>
                  )}
                  {selectedTask.rejectReason && (
                    <div className="p-3 bg-red-50 rounded border border-red-200">
                      <div className="flex items-center gap-2 mb-2">
                        <ExclamationCircleOutlined className="text-red-600" />
                        <Text strong>退回原因</Text>
                      </div>
                      <div className="text-sm text-red-700 whitespace-pre-line">
                        {selectedTask.rejectReason}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        )}
      </Modal>

      {/* 审核 Modal */}
      <Modal
        title={<><FileTextOutlined /> 审核会诊材料 - {selectedTask?.consultationId}</>}
        open={auditVisible}
        onCancel={() => setAuditVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setAuditVisible(false)}>
            关闭
          </Button>,
          <Button
            key="reject"
            danger
            onClick={handleRejectClick}
          >
            退回
          </Button>,
          <Button
            key="pass"
            type="primary"
            onClick={handleAuditPassClick}
          >
            审核通过
          </Button>,
        ]}
        width={900}
      >
        {selectedTask && (
          <div className="space-y-4">
            {/* 基本信息 */}
            <Card 
              title={<><UserOutlined className="text-blue-600" /> 基本信息</>} 
              size="small"
              className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 shadow-md"
            >
              <Descriptions column={2} size="small">
                <Descriptions.Item label="患者姓名">{selectedTask.patientName}</Descriptions.Item>
                <Descriptions.Item label="住院号">{selectedTask.patientInpatientNo}</Descriptions.Item>
                <Descriptions.Item label="会诊日期">{selectedTask.meetingDate}</Descriptions.Item>
                <Descriptions.Item label="会诊时间">{selectedTask.meetingTime}</Descriptions.Item>
                <Descriptions.Item label="申请科室">{selectedTask.department}</Descriptions.Item>
                <Descriptions.Item label="申请医生">{selectedTask.applyDoctor}</Descriptions.Item>
                {selectedTask.submitTime && (
                  <Descriptions.Item label="提交时间">{selectedTask.submitTime}</Descriptions.Item>
                )}
                <Descriptions.Item label="状态">
                  <Tag color={selectedTask.status === '审核通过' ? 'green' : 'blue'}>
                    {selectedTask.status}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>

              <Divider className="my-2">参会专家</Divider>
              <div className="flex flex-wrap gap-2">
                {selectedTask.experts.map((e, i) => (
                  <Tag key={i} color="cyan" className="text-sm px-3 py-1">
                    <UserOutlined className="mr-1" />
                    {e.name} ({e.department})
                  </Tag>
                ))}
              </div>
            </Card>

            {/* 病历资料 - Tabs */}
            <Card 
              title={<><MedicineBoxOutlined className="text-amber-600" /> 患者病历资料</>} 
              size="small"
              className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 shadow-md"
            >
              <Tabs 
                defaultActiveKey="1" 
                size="small"
                items={[
                  {
                    key: '1',
                    label: '📄 主诉',
                    children: (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded text-sm whitespace-pre-line min-h-[200px] max-h-[400px] overflow-y-auto">
                        {selectedTask.chiefComplaint || '暂无相关记录'}
                      </div>
                    )
                  },
                  {
                    key: '2',
                    label: '📄 现病史',
                    children: (
                      <div className="p-4 bg-orange-50 border border-orange-200 rounded text-sm whitespace-pre-line min-h-[200px] max-h-[400px] overflow-y-auto">
                        {selectedTask.presentIllness || '暂无相关记录'}
                      </div>
                    )
                  },
                  {
                    key: '3',
                    label: '📄 既往史',
                    children: (
                      <div className="p-4 bg-green-50 border border-green-200 rounded text-sm whitespace-pre-line min-h-[200px] max-h-[400px] overflow-y-auto">
                        {selectedTask.pastHistory || '暂无相关记录'}
                      </div>
                    )
                  },
                  {
                    key: '4',
                    label: '🩺 体格检查',
                    children: (
                      <div className="p-4 bg-cyan-50 border border-cyan-200 rounded text-sm whitespace-pre-line min-h-[200px] max-h-[400px] overflow-y-auto">
                        {selectedTask.physicalExamination || '暂无相关记录'}
                      </div>
                    )
                  },
                  {
                    key: '5',
                    label: '🧪 辅助检查',
                    children: (
                      <div className="p-4 bg-purple-50 border border-purple-200 rounded text-sm whitespace-pre-line min-h-[200px] max-h-[400px] overflow-y-auto">
                        {selectedTask.auxiliaryExamination || '暂无相关记录'}
                      </div>
                    )
                  },
                ]}
              />
            </Card>

            {/* MDT 会诊记录 */}
            <Card 
              title={<><FileTextOutlined className="text-indigo-600" /> MDT 会诊记录</>} 
              size="small"
              className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 shadow-md"
            >
              {selectedTask.meetingRecord ? (
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
              {selectedTask.consultationReport ? (
                <div className="whitespace-pre-line text-sm text-gray-700 leading-relaxed max-h-[600px] overflow-y-auto p-3 bg-white rounded border border-purple-100">
                  {selectedTask.consultationReport}
                </div>
              ) : (
                <div className="text-gray-500 text-sm py-8 text-center">暂无会诊报告</div>
              )}
            </Card>

            {/* 会诊建议 */}
            <Card 
              title={<><CheckCircleOutlined className="text-orange-600" /> MDT 会诊建议</>} 
              size="small"
              className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 shadow-md"
            >
              {selectedTask.recommendations && selectedTask.recommendations.length > 0 ? (
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
              ) : (
                <div className="text-gray-500 text-sm py-8 text-center">暂无会诊建议</div>
              )}
            </Card>

            {/* 音视频资料 */}
            {(selectedTask.recordingUrl || selectedTask.videoUrl) && (
              <Card 
                title={<><PlayCircleOutlined className="text-red-600" /> MDT 会诊音视频</>} 
                size="small"
                className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 shadow-md"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedTask.recordingUrl && (
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
                  {selectedTask.videoUrl && (
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

            {/* 审批记录 */}
            {(selectedTask.secretaryAuditTime || selectedTask.qualityAuditTime) && (
              <Card 
                title={<><SafetyOutlined className="text-teal-600" /> 审批记录</>} 
                size="small"
                className="bg-gradient-to-r from-teal-50 to-cyan-50 border-2 border-teal-200 shadow-md"
              >
                <div className="space-y-3">
                  {selectedTask.secretaryAuditTime && (
                    <div className="p-3 bg-blue-50 rounded border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <FileTextOutlined className="text-blue-600" />
                        <Text strong>MDT 秘书审核</Text>
                        <Tag color={selectedTask.secretaryAuditResult === '通过' ? 'green' : 'red'}>
                          {selectedTask.secretaryAuditResult}
                        </Tag>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><Text strong>审核时间：</Text>{selectedTask.secretaryAuditTime}</div>
                        {selectedTask.secretaryComment && (
                          <div><Text strong>审核意见：</Text>{selectedTask.secretaryComment}</div>
                        )}
                      </div>
                    </div>
                  )}
                  {selectedTask.qualityAuditTime && (
                    <div className="p-3 bg-purple-50 rounded border border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <SafetyOutlined className="text-purple-600" />
                        <Text strong>质控审核</Text>
                        <Tag color={selectedTask.qualityResult === '通过' ? 'green' : 'red'}>
                          {selectedTask.qualityResult}
                        </Tag>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><Text strong>审核时间：</Text>{selectedTask.qualityAuditTime}</div>
                        {selectedTask.qualityReviewer && (
                          <div><Text strong>审核人：</Text>{selectedTask.qualityReviewer}</div>
                        )}
                        {selectedTask.qualityScore && (
                          <div><Text strong>评分：</Text>{selectedTask.qualityScore} / 5.0</div>
                        )}
                        {selectedTask.qualityComment && (
                          <div><Text strong>审核意见：</Text>{selectedTask.qualityComment}</div>
                        )}
                      </div>
                    </div>
                  )}
                  {selectedTask.rejectReason && (
                    <div className="p-3 bg-red-50 rounded border border-red-200">
                      <div className="flex items-center gap-2 mb-2">
                        <ExclamationCircleOutlined className="text-red-600" />
                        <Text strong>退回原因</Text>
                      </div>
                      <div className="text-sm text-red-700 whitespace-pre-line">
                        {selectedTask.rejectReason}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        )}
      </Modal>

      {/* 审核通过 - 填写审核意见 */}
      <Modal
        title={<><CheckCircleOutlined className="text-green-600" /> 审核通过</>}
        open={auditCommentVisible}
        onCancel={() => setAuditCommentVisible(false)}
        onOk={handleAuditPass}
        okText="确认通过"
        cancelText="取消"
      >
        <div className="space-y-4">
          <div className="p-3 bg-green-50 border border-green-200 rounded text-sm">
            <Text type="success">审核通过后，材料将提交至质控审核环节</Text>
          </div>
          <div className="space-y-2">
            <Text strong>审核意见（选填）：</Text>
            <Input.TextArea
              rows={3}
              placeholder="例如：会诊记录详细，诊疗方案规范，符合指南要求"
              value={auditComment}
              onChange={(e) => setAuditComment(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      {/* 退回 - 填写退回原因 */}
      <Modal
        title={<><ExclamationCircleOutlined className="text-red-600" /> 退回材料</>}
        open={rejectVisible}
        onCancel={() => setRejectVisible(false)}
        onOk={handleAuditReject}
        okText="确认退回"
        cancelText="取消"
        okButtonProps={{ danger: true }}
      >
        <div className="space-y-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded text-sm">
            <Text type="danger">退回后，申请医生可修改后重新提交</Text>
          </div>
          <div className="space-y-2">
            <Text strong className="text-red-600">退回原因（必填）：</Text>
            <Input.TextArea
              rows={4}
              placeholder="例如：会诊记录过于简单，请补充专家讨论详情"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      <Drawer
        title="患者详细信息"
        placement="right"
        width={1200}
        open={patientDrawerVisible}
        onClose={() => setPatientDrawerVisible(false)}
      >
        <PatientInfo
          patientId={selectedPatientId}
          patientName={selectedPatientName}
          patientInpatientNo={selectedPatientInpatientNo}
          compact={false}
        />
      </Drawer>
    </div>
  )
}
