-- 添加"已重排"流程节点和更新相关码表

-- 1. 在会诊状态码表中添加"已重排"状态
INSERT INTO sys_codes (type_id, code, name, description, color, sort_order) VALUES
('consultation_status', 'rescheduled', '已重排', '会诊已重新安排时间', 'purple', 18)
ON CONFLICT (type_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  color = EXCLUDED.color,
  sort_order = EXCLUDED.sort_order,
  updated_at = CURRENT_TIMESTAMP;

-- 2. 在流程节点码表中添加"重新排期"节点
INSERT INTO sys_codes (type_id, code, name, description, color, sort_order) VALUES
('process_node', 'rescheduled', '重新排期', '秘书重新安排会诊时间', 'purple', 11)
ON CONFLICT (type_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  color = EXCLUDED.color,
  sort_order = EXCLUDED.sort_order,
  updated_at = CURRENT_TIMESTAMP;

-- 3. 在审核结果码表中添加"已排期"和"已重排"结果
INSERT INTO sys_codes (type_id, code, name, description, color, sort_order) VALUES
('audit_result', 'scheduled', '已排期', '秘书首次排期', 'blue', 5),
('audit_result', 'rescheduled', '已重排', '秘书重新排期', 'purple', 6)
ON CONFLICT (type_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  color = EXCLUDED.color,
  sort_order = EXCLUDED.sort_order,
  updated_at = CURRENT_TIMESTAMP;

-- 4. 更新原有的"秘书通过"为"已排期"（保持向后兼容）
UPDATE sys_codes 
SET 
  name = '已排期',
  description = '秘书审核通过并安排会诊时间',
  updated_at = CURRENT_TIMESTAMP
WHERE type_id = 'consultation_status' AND code = 'secretary_approved';

-- 5. 查询验证插入结果
SELECT '会诊状态码表' as 码表类型，code, name, description, color 
FROM sys_codes 
WHERE type_id = 'consultation_status' 
ORDER BY sort_order;

SELECT '流程节点码表' as 码表类型，code, name, description, color 
FROM sys_codes 
WHERE type_id = 'process_node' 
ORDER BY sort_order;

SELECT '审核结果码表' as 码表类型，code, name, description, color 
FROM sys_codes 
WHERE type_id = 'audit_result' 
ORDER BY sort_order;
