/**
 * 数据映射和转换层
 * 
 * 负责 HIS/EMR 与 MDT 系统之间的数据格式转换和编码映射
 */

// 性别映射
export const genderMap: Record<string, '男' | '女' | '未知'> = {
  'M': '男',
  'F': '女',
  'U': '未知',
  '0': '未知',
  '1': '男',
  '2': '女'
}

// 科室映射 (根据医院实际编码配置)
export const departmentMap: Record<string, string> = {
  // 肿瘤相关
  'ONC': '肿瘤科',
  'ONCOLOGY': '肿瘤科',
  'ZL': '肿瘤科',
  
  // 外科
  'TS': '胸外科',
  'THORACIC': '胸外科',
  'XS': '胸外科',
  'GS': '胃肠外科',
  'GASTRO': '胃肠外科',
  'WS': '胃肠外科',
  'HS': '肝胆外科',
  'HEPATO': '肝胆外科',
  'DS': '神经外科',
  'NEURO': '神经外科',
  'NS': '神经外科',
  'US': '泌尿外科',
  'UROLOGY': '泌尿外科',
  'MN': '泌尿外科',
  
  // 内科
  'MED': '消化内科',
  'GASTROENTEROLOGY': '消化内科',
  'XH': '消化内科',
  'RESP': '呼吸科',
  'RESPIRATORY': '呼吸科',
  'HX': '呼吸科',
  'CARD': '心内科',
  'CARDIOLOGY': '心内科',
  'XN': '心内科',
  
  // 医技科室
  'RAD': '放射科',
  'RADIOLOGY': '放射科',
  'FS': '放射科',
  'LAB': '检验科',
  'LABORATORY': '检验科',
  'JY': '检验科',
  'PATH': '病理科',
  'PATHOLOGY': '病理科',
  'BL': '病理科',
  
  // 其他
  'ICU': 'ICU',
  'INTENSIVE': 'ICU',
  'EMER': '急诊科',
  'EMERGENCY': '急诊科',
  'JZ': '急诊科',
  'REHAB': '康复科',
  'REHABILITATION': '康复科',
  'KF': '康复科'
}

// 诊断编码映射 (ICD-10 部分常用编码)
export const diagnosisMap: Record<string, string> = {
  // 肿瘤
  'C34.9': '肺癌',
  'C34.0': '肺上叶恶性肿瘤',
  'C34.1': '肺中叶恶性肿瘤',
  'C34.2': '肺下叶恶性肿瘤',
  'C34.3': '肺上叶恶性肿瘤',
  'C34.8': '肺重叠病变恶性肿瘤',
  
  'C18.9': '结直肠癌',
  'C18': '结肠恶性肿瘤',
  'C19': '直肠乙状结肠交界处恶性肿瘤',
  'C20': '直肠恶性肿瘤',
  
  'C50.9': '乳腺癌',
  'C50': '乳腺恶性肿瘤',
  
  'C16.9': '胃癌',
  'C16': '胃恶性肿瘤',
  
  'C22.0': '肝癌',
  'C22': '肝和肝内胆管恶性肿瘤',
  
  'C61': '前列腺恶性肿瘤',
  'C64': '肾恶性肿瘤',
  'C67.9': '膀胱恶性肿瘤',
  
  'C53.9': '宫颈恶性肿瘤',
  'C54.1': '子宫体恶性肿瘤',
  'C56': '卵巢恶性肿瘤',
  
  // 非肿瘤
  'K80': '胆石症',
  'K81': '胆囊炎',
  'K25': '胃溃疡',
  'K26': '十二指肠溃疡',
  'I10': '原发性高血压',
  'E11': '2 型糖尿病',
  'J18': '肺炎',
  'I21': '急性心肌梗死'
}

// 医嘱类型映射
export const orderTypeMap: Record<string, string> = {
  '检查': '检查',
  '检验': '检验',
  '治疗': '治疗',
  '用药': '西药',
  '手术': '手术',
  '化疗': '化疗',
  '放疗': '放疗',
  '输血': '输血',
  '护理': '护理',
  '膳食': '膳食',
  '其他': '其他'
}

// 检查项目映射
export const examItemMap: Record<string, string> = {
  'CT': 'CT 检查',
  'CT_CHEST': '胸部 CT',
  'CT_ABDOMEN': '腹部 CT',
  'CT_PELVIS': '盆腔 CT',
  'CT_HEAD': '头颅 CT',
  
  'MR': '磁共振检查',
  'MR_CHEST': '胸部 MRI',
  'MR_ABDOMEN': '腹部 MRI',
  'MR_HEAD': '头颅 MRI',
  
  'XRAY': 'X 线检查',
  'XRAY_CHEST': '胸部 X 线',
  'XRAY_BONE': '骨 X 线',
  
  'US': '超声检查',
  'US_ABDOMEN': '腹部超声',
  'US_HEART': '心脏超声',
  'US_VESSEL': '血管超声',
  
  'PET': 'PET-CT',
  'PET_CT': '全身 PET-CT',
  
  'PATHOLOGY': '病理检查',
  'BIOPSY': '活检',
  
  'ENDOSCOPY': '内镜检查',
  'GASTROSCOPY': '胃镜',
  'COLONOSCOPY': '肠镜',
  'BRONCHOSCOPY': '支气管镜'
}

// 检验项目映射
export const labTestMap: Record<string, string> = {
  // 血常规
  'CBC': '血常规',
  'WBC': '白细胞计数',
  'RBC': '红细胞计数',
  'HGB': '血红蛋白',
  'PLT': '血小板计数',
  
  // 生化
  'LFT': '肝功能',
  'ALT': '丙氨酸氨基转移酶',
  'AST': '天门冬氨酸氨基转移酶',
  'TBIL': '总胆红素',
  'ALB': '白蛋白',
  
  'RFT': '肾功能',
  'CREA': '肌酐',
  'BUN': '尿素氮',
  'UA': '尿酸',
  
  'GLU': '血糖',
  'HBA1C': '糖化血红蛋白',
  
  'LIPID': '血脂',
  'CHOL': '总胆固醇',
  'TG': '甘油三酯',
  'HDL': '高密度脂蛋白',
  'LDL': '低密度脂蛋白',
  
  // 肿瘤标志物
  'AFP': '甲胎蛋白',
  'CEA': '癌胚抗原',
  'CA199': '糖类抗原 19-9',
  'CA125': '糖类抗原 125',
  'CA153': '糖类抗原 15-3',
  'PSA': '前列腺特异性抗原',
  'NSE': '神经元特异性烯醇化酶',
  'CYFRA211': '细胞角蛋白 19 片段',
  
  // 凝血功能
  'COAG': '凝血功能',
  'PT': '凝血酶原时间',
  'APTT': '活化部分凝血活酶时间',
  'INR': '国际标准化比值',
  
  // 感染指标
  'CRP': 'C 反应蛋白',
  'PCT': '降钙素原',
  'ESR': '血沉'
}

// 病理诊断映射
export const pathologyMap: Record<string, string> = {
  'ADENOCARCINOMA': '腺癌',
  'SQUAMOUS': '鳞癌',
  'SMALL_CELL': '小细胞癌',
  'LARGE_CELL': '大细胞癌',
  'CARCINOMA': '癌',
  'SARCOMA': '肉瘤',
  'LYMPHOMA': '淋巴瘤',
  'MELANOMA': '黑色素瘤',
  
  // 分化程度
  'WELL_DIFFERENTIATED': '高分化',
  'MODERATELY_DIFFERENTIATED': '中分化',
  'POORLY_DIFFERENTIATED': '低分化',
  'UNDIFFERENTIATED': '未分化'
}

/**
 * 数据映射工具类
 */
export const DataMapping = {
  /**
   * 性别映射
   */
  get gender() {
    return genderMap
  },

  /**
   * 科室映射
   */
  get department() {
    return departmentMap
  },

  /**
   * 诊断映射
   * @param code ICD-10 编码
   * @param defaultText 默认文本（可选）
   */
  transformDiagnosis(code: string, defaultText?: string): string {
    return diagnosisMap[code] || defaultText || code
  },

  /**
   * 医嘱类型映射
   */
  get orderType() {
    return orderTypeMap
  },

  /**
   * 检查项目映射
   */
  get examItem() {
    return examItemMap
  },

  /**
   * 检验项目映射
   */
  get labTest() {
    return labTestMap
  },

  /**
   * 病理诊断映射
   */
  get pathology() {
    return pathologyMap
  },

  /**
   * 反向映射：中文转编码
   * @param map 映射表
   * @param value 中文值
   */
  reverseLookup(map: Record<string, string>, value: string): string | undefined {
    return Object.keys(map).find(key => map[key] === value)
  },

  /**
   * 批量转换
   * @param map 映射表
   * @param values 待转换的值
   */
  batchTransform(map: Record<string, string>, values: string[]): string[] {
    return values.map(v => map[v] || v)
  },

  /**
   * 添加自定义映射
   * @param map 映射表
   * @param key 键
   * @param value 值
   */
  addMapping(map: Record<string, string>, key: string, value: string): void {
    map[key] = value
  },

  /**
   * 导出映射表
   * @param map 映射表
   */
  exportMapping(map: Record<string, string>): string {
    return JSON.stringify(map, null, 2)
  },

  /**
   * 导入映射表
   * @param json JSON 字符串
   */
  importMapping(json: string): Record<string, string> {
    return JSON.parse(json)
  }
}
