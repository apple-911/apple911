/**
 * Phase 4.2 高级功能集成统一导出
 */

// DICOM 影像浏览器
export { DICOMViewer } from '../components/DICOMViewer'
export type { DICOMViewerProps } from '../components/DICOMViewer'

// 视频会议
export { VideoConference } from '../components/VideoConference'
export { videoConferenceService } from '../services/integration/video/conferenceService'
export type { Participant, Meeting, ChatMessage } from '../services/integration/video/conferenceService'

// 电子签名
export { electronicSignatureService } from '../services/integration/signature/signatureService'
export type { Signature, CACertificate, VerificationResult } from '../services/integration/signature/signatureService'

// LIS 检验系统
export { lisService } from '../services/integration/lis/lisService'
export type { LabOrder, LabResult, LabReport, CriticalValue } from '../services/integration/lis/lisService'

// 医保服务
export { insuranceService } from '../services/integration/insurance/insuranceService'
export type { InsurancePatient, InsuranceSettlement, SettlementItem } from '../services/integration/insurance/insuranceService'

// 远程会诊控制
export { remoteConsultationService } from '../services/integration/video/remoteService'
export type { ConsultationSession, SessionParticipant, SharedResource, Annotation } from '../services/integration/video/remoteService'
