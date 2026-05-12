/**
 * 生成会诊编码
 * 格式：HZ + YYMMDD + 三位序号
 * 例如：HZ260420001
 */
export function generateConsultationCode(): string {
  const now = new Date()
  const year = now.getFullYear() % 100 // 取年份后两位
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  
  // 生成随机序号 (001-999)
  // 注意：实际应该从数据库获取当天最大序号 +1
  // 这里为了简化，使用随机数，实际项目应该在数据库层面实现
  const seq = String(Math.floor(Math.random() * 900) + 100)
  
  return `HZ${year}${month}${day}${seq}`
}

/**
 * 格式化会诊编码显示
 * @param code 会诊编码
 * @param id UUID（备用）
 */
export function formatConsultationCode(code?: string, id?: string): string {
  return code || id || '-'
}
