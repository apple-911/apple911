/**
 * Phase 4.3 前沿技术集成统一导出
 * 
 * 包含区块链、5G、VR/AR、AI 导诊、医疗机器人等功能
 */

// 区块链服务
export { blockchainService } from './blockchain/blockchainService'
export type {
  Block,
  Transaction,
  EvidenceRecord,
  MerkleProof,
  AccessConsent,
  AccessLog
} from './blockchain/blockchainService'

// 5G 远程医疗服务
export { fiveGRemoteService } from './fiveg/remoteService'
export type {
  NetworkQuality,
  RemoteSurgery,
  VideoStream,
  SurgeryVitals,
  ARAnnotation
} from './fiveg/remoteService'

// VR/AR 影像浏览
export { VRImageViewer } from '../../components/VRImageViewer'
export type { VRImageViewerProps } from '../../components/VRImageViewer'

// AI 智能导诊
export { intelligentTriageService } from './ai/triageService'
export type {
  Symptom,
  TriageResult,
  DepartmentRecommendation,
  PreConsultation
} from './ai/triageService'

// 医疗机器人
export { medicalRobotService } from './robot/robotService'
export type {
  RobotInfo,
  SurgeryRobotStatus,
  NursingTask,
  DeliveryTask,
  DisinfectionTask,
  RehabilitationSession,
  RobotCommand,
  TeleoperationControl
} from './robot/robotService'
