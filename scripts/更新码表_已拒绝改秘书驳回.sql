-- 将会诊状态 'rejected' 的名称从"已拒绝"更新为"秘书驳回"
UPDATE sys_codes
SET name = '秘书驳回',
    description = '秘书审核驳回'
WHERE type_id = 'consultation_status'
  AND code = 'rejected';

-- 确认更新结果
SELECT * FROM sys_codes
WHERE type_id = 'consultation_status'
  AND code = 'rejected';

-- 如果数据库中存储了中文状态名称的历史数据，也需要更新
-- 会诊表中的 reject_reason 字段如果包含"已拒绝"状态值，也需要清理
UPDATE consultations
SET reject_reason = NULL
WHERE status = 'rejected'
  AND reject_reason IN ('已拒绝', '已拒绝状态');

-- 如果审核历史表中有相关记录也需要更新
UPDATE audit_history
SET result = '秘书驳回'
WHERE consultation_id IN (SELECT id FROM consultations WHERE status = 'rejected')
  AND result = '已拒绝';

-- 查询相关数据确认
SELECT
  c.id,
  c.consultation_code,
  c.patient_name,
  c.status,
  c.reject_reason,
  ah.result as audit_result
FROM consultations c
LEFT JOIN audit_history ah ON c.id = ah.consultation_id
WHERE c.status = 'rejected'
ORDER BY c.apply_time DESC
LIMIT 20;
