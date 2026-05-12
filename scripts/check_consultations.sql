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
LIMIT 10;

-- 查询患者张丽的会诊记录
SELECT 
  id,
  patient_name,
  department,
  status,
  apply_doctor,
  apply_time
FROM consultations
WHERE patient_name LIKE '%张丽%'
   OR patient_name LIKE '%丽%';

-- 查询所有不同的 department 值
SELECT DISTINCT department FROM consultations;

-- 查询肿瘤科相关的会诊
SELECT 
  id,
  patient_name,
  department,
  status,
  apply_doctor
FROM consultations
WHERE department LIKE '%肿瘤%' OR department LIKE '%瘤%';
