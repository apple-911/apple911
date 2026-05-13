-- ====================================
-- 会诊数据编码化整改 - 最终校验版
-- ====================================
-- 目的：将所有状态、类型等字段从中文存储改为编码存储
-- 时间：2026-05-13
-- 依据：系统码表初始化.sql 中的最新数据
-- ====================================

BEGIN;

-- ====================================
-- 第一部分：码表数据更新（确保与数据库现有数据一致）
-- ====================================

-- 1. 更新码表类型 - 添加会诊类型（新增）
INSERT INTO sys_code_types (id, name, description, sort_order) VALUES
('consultation_type', '会诊类型', '会诊的类型定义', 14)
ON CONFLICT DO NOTHING;

-- 2. 更新码表 - 添加会诊类型编码
INSERT INTO sys_codes (type_id, code, name, description, color, sort_order) VALUES
('consultation_type', 'inhospital', '院内会诊', NULL, 'blue', 1),
('consultation_type', 'remote', '远程会诊', NULL, 'green', 2)
ON CONFLICT (type_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  color = EXCLUDED.color,
  sort_order = EXCLUDED.sort_order,
  updated_at = CURRENT_TIMESTAMP;

-- 3. 更新码表 - 更新紧急程度（与数据库现有数据完全一致）
-- 注意：数据库中 critical=危急，urgent=紧急，normal=普通
INSERT INTO sys_codes (type_id, code, name, description, color, sort_order) VALUES
('urgency_level', 'critical', '危急', NULL, 'red', 1),
('urgency_level', 'urgent', '紧急', NULL, 'orange', 2),
('urgency_level', 'normal', '普通', NULL, 'green', 3)
ON CONFLICT (type_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  color = EXCLUDED.color,
  sort_order = EXCLUDED.sort_order,
  updated_at = CURRENT_TIMESTAMP;

-- 4. 更新码表 - 更新审核结果（与数据库现有数据完全一致）
-- 注意：保留原有的 approved, rejected, confirmed, cancelled，新增 scheduled 和 rescheduled
INSERT INTO sys_codes (type_id, code, name, description, color, sort_order) VALUES
('audit_result', 'approved', '通过', NULL, 'green', 1),
('audit_result', 'rejected', '拒绝', NULL, 'red', 2),
('audit_result', 'confirmed', '已确认', NULL, 'green', 3),
('audit_result', 'cancelled', '已取消', NULL, 'gray', 4),
('audit_result', 'scheduled', '已排期', '秘书首次排期', 'blue', 5),
('audit_result', 'rescheduled', '已重排', '秘书重新排期', 'purple', 6)
ON CONFLICT (type_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  color = EXCLUDED.color,
  sort_order = EXCLUDED.sort_order,
  updated_at = CURRENT_TIMESTAMP;

-- 5. 更新会诊状态码表 - 添加已重排状态（新增）
-- 注意：保留 secretary_approved 状态（已排期，sort_order=6）
INSERT INTO sys_codes (type_id, code, name, description, color, sort_order) VALUES
('consultation_status', 'rescheduled', '已重排', '会诊已重新安排时间', 'purple', 18)
ON CONFLICT (type_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  color = EXCLUDED.color,
  sort_order = EXCLUDED.sort_order,
  updated_at = CURRENT_TIMESTAMP;

-- 6. 更新流程节点码表 - 添加重新排期节点（新增）
INSERT INTO sys_codes (type_id, code, name, description, color, sort_order) VALUES
('process_node', 'rescheduled', '重新排期', '秘书重新安排会诊时间', 'purple', 11)
ON CONFLICT (type_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  color = EXCLUDED.color,
  sort_order = EXCLUDED.sort_order,
  updated_at = CURRENT_TIMESTAMP;

-- ====================================
-- 第二部分：历史数据转换（将中文转换为编码）
-- ====================================

-- 7. 转换会诊表 - 紧急程度字段
-- 数据库现有编码：normal, urgent, critical
UPDATE consultations 
SET urgency = CASE 
  WHEN urgency = '普通' OR urgency = '常规' THEN 'normal'
  WHEN urgency = '紧急' THEN 'urgent'
  WHEN urgency = '特急' OR urgency = '较急' OR urgency = '危急' THEN 'critical'
  ELSE urgency
END
WHERE urgency NOT IN ('normal', 'urgent', 'critical');

-- 8. 转换会诊表 - 类型字段
-- 数据库现有编码：inhospital, remote
UPDATE consultations 
SET type = CASE 
  WHEN type = '院内' OR type = '院内会诊' THEN 'inhospital'
  WHEN type = '远程' OR type = '远程会诊' THEN 'remote'
  WHEN type = '多学科会诊' THEN 'inhospital'
  ELSE type
END
WHERE type NOT IN ('inhospital', 'remote');

-- 9. 转换会诊表 - 状态字段（如果有中文）
-- 数据库现有编码：doctor_submit, director_pending, director_approved, director_rejected,
--                secretary_pending, scheduled, rejected, pending_supplement,
--                material_rejected, expert_invited, expert_confirmed, pending_meeting,
--                in_progress, completed, archived, cancelled, rescheduled
UPDATE consultations 
SET status = CASE 
  WHEN status = '医生提交' THEN 'doctor_submit'
  WHEN status = '待主任审核' THEN 'director_pending'
  WHEN status = '主任通过' THEN 'director_approved'
  WHEN status = '主任驳回' THEN 'director_rejected'
  WHEN status = '待秘书审核' THEN 'secretary_pending'
  WHEN status = '秘书通过' OR status = '已排期' THEN 'scheduled'
  WHEN status = '秘书驳回' OR status = '已驳回' THEN 'rejected'
  WHEN status = '待补正' THEN 'pending_supplement'
  WHEN status = '退回修改' THEN 'material_rejected'
  WHEN status = '专家邀请' THEN 'expert_invited'
  WHEN status = '专家确认' THEN 'expert_confirmed'
  WHEN status = '待会诊' THEN 'pending_meeting'
  WHEN status = '会诊中' THEN 'in_progress'
  WHEN status = '已完成' THEN 'completed'
  WHEN status = '已归档' THEN 'archived'
  WHEN status = '已取消' THEN 'cancelled'
  WHEN status = '已重排' THEN 'rescheduled'
  ELSE status
END
WHERE status NOT IN (
  'doctor_submit', 'director_pending', 'director_approved', 'director_rejected',
  'secretary_pending', 'scheduled', 'rejected', 'pending_supplement',
  'material_rejected', 'expert_invited', 'expert_confirmed', 'pending_meeting',
  'in_progress', 'completed', 'archived', 'cancelled', 'rescheduled'
);

-- 10. 转换会诊表 - 材料状态字段
-- 数据库现有编码：pending, submitted, approved, rejected
UPDATE consultations 
SET material_status = CASE 
  WHEN material_status = '待提交' THEN 'pending'
  WHEN material_status = '已提交' THEN 'submitted'
  WHEN material_status = '审核中' THEN 'reviewing'
  WHEN material_status = '通过' THEN 'approved'
  WHEN material_status = '驳回' THEN 'rejected'
  ELSE material_status
END
WHERE material_status NOT IN ('pending', 'submitted', 'reviewing', 'approved', 'rejected');

-- 11. 转换审核历史表 - 结果字段
-- 数据库现有编码：approved, rejected, scheduled, rescheduled, confirmed, cancelled
UPDATE audit_history 
SET result = CASE 
  WHEN result = '通过' OR result = '同意' THEN 'approved'
  WHEN result = '驳回' OR result = '拒绝' OR result = '秘书驳回' THEN 'rejected'
  WHEN result = '已排期' THEN 'scheduled'
  WHEN result = '已重排' THEN 'rescheduled'
  WHEN result = '已确认' THEN 'confirmed'
  WHEN result = '已取消' THEN 'cancelled'
  WHEN result = '已提交' THEN 'submitted'
  ELSE result
END
WHERE result NOT IN ('approved', 'rejected', 'scheduled', 'rescheduled', 'confirmed', 'cancelled', 'submitted');

-- 12. 转换审核历史表 - 节点字段（如果有中文）
-- 数据库现有编码：apply, department_audit, secretary_audit, rescheduled, expert_invite, schedule, meeting, report, followup, archive
UPDATE audit_history 
SET node = CASE 
  WHEN node = '申请提交' THEN 'apply'
  WHEN node = '科室审核' OR node = 'department_audit' THEN 'department_audit'
  WHEN node = '秘书审核' OR node = 'secretary_audit' THEN 'secretary_audit'
  WHEN node = '重新排期' THEN 'rescheduled'
  WHEN node = '专家邀请' THEN 'expert_invite'
  WHEN node = '排期安排' THEN 'schedule'
  WHEN node = '会诊实施' THEN 'meeting'
  WHEN node = '报告编写' THEN 'report'
  WHEN node = '随访跟踪' THEN 'followup'
  WHEN node = '归档' THEN 'archive'
  ELSE node
END
WHERE node NOT IN (
  'apply', 'department_audit', 'secretary_audit', 'rescheduled',
  'expert_invite', 'schedule', 'meeting', 'report', 'followup', 'archive'
);

-- 13. 转换专家邀请表 - 状态字段
-- 数据库现有编码：pending, accepted, confirmed, pending_meeting, rejected
UPDATE consultation_experts 
SET status = CASE 
  WHEN status = '待接受' OR status = 'pending' THEN 'pending'
  WHEN status = '已接受' OR status = 'accepted' THEN 'accepted'
  WHEN status = '已确认' OR status = 'confirmed' THEN 'confirmed'
  WHEN status = '待会诊' OR status = 'pending_meeting' THEN 'pending_meeting'
  WHEN status = '拒绝' OR status = 'rejected' THEN 'rejected'
  ELSE status
END
WHERE status NOT IN ('pending', 'accepted', 'confirmed', 'pending_meeting', 'rejected');

COMMIT;

-- ====================================
-- 第三部分：验证查询
-- ====================================

-- 验证会诊表紧急程度
SELECT '会诊表 - 紧急程度' as 表名，urgency, COUNT(*) as 数量 
FROM consultations 
GROUP BY urgency 
ORDER BY urgency;

-- 验证会诊表类型
SELECT '会诊表 - 类型' as 表名，type, COUNT(*) as 数量 
FROM consultations 
GROUP BY type 
ORDER BY type;

-- 验证会诊表状态
SELECT '会诊表 - 状态' as 表名，status, COUNT(*) as 数量 
FROM consultations 
GROUP BY status 
ORDER BY status;

-- 验证审核历史结果
SELECT '审核历史 - 结果' as 表名，result, COUNT(*) as 数量 
FROM audit_history 
GROUP BY result 
ORDER BY result;

-- 验证审核历史节点
SELECT '审核历史 - 节点' as 表名，node, COUNT(*) as 数量 
FROM audit_history 
GROUP BY node 
ORDER BY node;

-- 验证专家邀请状态
SELECT '专家邀请 - 状态' as 表名，status, COUNT(*) as 数量 
FROM consultation_experts 
GROUP BY status 
ORDER BY status;

-- 验证码表数据
SELECT '码表 - 紧急程度' as 码表类型，code, name, color, sort_order 
FROM sys_codes 
WHERE type_id = 'urgency_level'
ORDER BY sort_order;

SELECT '码表 - 会诊类型' as 码表类型，code, name, color, sort_order 
FROM sys_codes 
WHERE type_id = 'consultation_type'
ORDER BY sort_order;

SELECT '码表 - 审核结果' as 码表类型，code, name, color, sort_order 
FROM sys_codes 
WHERE type_id = 'audit_result'
ORDER BY sort_order;

SELECT '码表 - 会诊状态' as 码表类型，code, name, color, sort_order 
FROM sys_codes 
WHERE type_id = 'consultation_status'
ORDER BY sort_order;

SELECT '码表 - 流程节点' as 码表类型，code, name, color, sort_order 
FROM sys_codes 
WHERE type_id = 'process_node'
ORDER BY sort_order;

-- 检查是否还有未转换的中文数据
SELECT '未转换的紧急程度' as 检查项，urgency, COUNT(*) as 数量 
FROM consultations 
WHERE urgency IN ('普通', '常规', '紧急', '特急', '较急', '危急')
GROUP BY urgency;

SELECT '未转换的会诊类型' as 检查项，type, COUNT(*) as 数量 
FROM consultations 
WHERE type IN ('院内', '院内会诊', '远程', '远程会诊', '多学科会诊')
GROUP BY type;

SELECT '未转换的会诊状态' as 检查项，status, COUNT(*) as 数量 
FROM consultations 
WHERE status IN (
  '医生提交', '待主任审核', '主任通过', '主任驳回',
  '待秘书审核', '秘书通过', '已排期', '秘书驳回', '已驳回',
  '待补正', '退回修改', '专家邀请', '专家确认', '待会诊',
  '会诊中', '已完成', '已归档', '已取消', '已重排'
)
GROUP BY status;

SELECT '数据编码化整改完成！' as 结果;
