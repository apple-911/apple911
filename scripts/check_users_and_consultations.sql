-- 查询所有用户及其科室
SELECT 
  u.id,
  u.username,
  u.name,
  u.org_id,
  u.department,
  u.position,
  o.name as org_name,
  r.code as role_code,
  r.name as role_name
FROM users u
LEFT JOIN organizations o ON u.org_id = o.id
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
WHERE u.name IN ('刘主任', '王医生')
ORDER BY u.name;

-- 查询所有会诊记录的 department 值
SELECT 
  id,
  patient_name,
  department,
  status,
  apply_doctor,
  apply_time
FROM consultations
ORDER BY apply_time DESC
LIMIT 20;

-- 查询所有不同的 department 值
SELECT DISTINCT department FROM consultations;
