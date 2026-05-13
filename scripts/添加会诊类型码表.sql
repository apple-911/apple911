-- ====================================
-- 会诊类型码表数据插入
-- ====================================
-- 确保会诊类型码表数据存在
-- ====================================

-- 1. 插入码表类型
INSERT INTO sys_code_types (id, name, description, sort_order, status) VALUES
('consultation_type', '会诊类型', '会诊的类型定义', 14, 'active')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  status = EXCLUDED.status,
  updated_at = CURRENT_TIMESTAMP;

-- 2. 插入会诊类型码值
INSERT INTO sys_codes (type_id, code, name, description, color, sort_order, status) VALUES
('consultation_type', 'inhospital', '院内会诊', '在医院内部进行的会诊', 'blue', 1, 'active'),
('consultation_type', 'remote', '远程会诊', '通过远程方式进行的会诊', 'green', 2, 'active')
ON CONFLICT (type_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  color = EXCLUDED.color,
  sort_order = EXCLUDED.sort_order,
  status = EXCLUDED.status,
  updated_at = CURRENT_TIMESTAMP;

-- 3. 验证插入结果
SELECT '会诊类型码表数据' as 说明，code, name, color, sort_order 
FROM sys_codes 
WHERE type_id = 'consultation_type'
ORDER BY sort_order;

SELECT '会诊类型码表插入完成！' as 结果;
