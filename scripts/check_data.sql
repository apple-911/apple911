-- 检查会诊记录
SELECT 
  c.id,
  c.consultation_code,
  c.patient_name,
  c.department,
  c.status,
  c.apply_doctor,
  c.apply_doctor_id,
  c.apply_time
FROM consultations c
WHERE c.patient_name = '张丽'
ORDER BY c.apply_time DESC;

-- 检查用户信息
SELECT 
  u.id,
  u.username,
  u.name,
  u.org_id,
  u.position,
  u.department,
  r.code as role_code,
  r.name as role_name
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
WHERE u.name IN ('刘主任', '王医生', '张丽')
ORDER BY u.name;

-- 检查组织机构
SELECT id, name, code FROM organizations;
