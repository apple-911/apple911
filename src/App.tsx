import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import BlankLayout from './layouts/BlankLayout'
import Login from './pages/public/Login'
import PatientLogin from './pages/patient/Login'
import Dashboard from './pages/public/Dashboard'
import Apply from './pages/consultation/Apply'
import MyApplies from './pages/consultation/MyApplies'
import PendingReview from './pages/consultation/PendingReview'
import Schedule from './pages/consultation/Schedule'
import MyMeetings from './pages/consultation/MyMeetings'
import ConsultationDetail from './pages/consultation/Detail'
import SubmitMaterial from './pages/consultation/SubmitMaterial'
import MaterialSupervise from './pages/consultation/MaterialSupervise'
import PatientList from './pages/patient/List'
import Patient360 from './pages/patient/Patient360'
import ConsultationRoom from './pages/consultation/Room'
import Bedside from './pages/consultation/Bedside'
import ReportList from './pages/report/List'
import ReportEdit from './pages/report/Edit'
import FollowupList from './pages/followup/List'
import FollowupExecute from './pages/followup/Execute'
import Assessment from './pages/followup/Assessment'
import FollowupPlanner from './pages/followup/Planner'
import Statistics from './pages/quality/Statistics'
import QualityTasks from './pages/quality/Tasks'
import QualityDashboard from './pages/quality/Dashboard'
import CaseLibraryIndex from './pages/caselibrary/Index'
import CaseSearch from './pages/caselibrary/Search'
import CaseDetail from './pages/caselibrary/Detail'
import TypicalCases from './pages/caselibrary/Typical'
import CaseStatistics from './pages/caselibrary/Statistics'
import MyFavorites from './pages/caselibrary/MyFavorites'
import LearningProgress from './pages/caselibrary/LearningProgress'
import CaseComparison from './pages/caselibrary/CaseComparison'
import ConsultationTracking from './pages/consultation/Tracking'
import MDTManagement from './pages/consultation/MDTManagement'
import DirectorConfirm from './pages/consultation/DirectorConfirm'
import ExpertConfirm from './pages/consultation/ExpertConfirm'
import ExpertInvite from './pages/consultation/ExpertInvite'
import SupplementMaterial from './pages/consultation/SupplementMaterial'
import MHome from './pages/m/Home'
import MRoom from './pages/m/Room'
import ExpertList from './pages/admin/ExpertList'
import TeamList from './pages/admin/TeamList'
import Roles from './pages/admin/Roles'
import Logs from './pages/admin/Logs'
import AuditLogs from './pages/admin/AuditLogs'
import Organizations from './pages/admin/Organizations'
import Users from './pages/admin/Users'
import CodeTable from './pages/admin/CodeTable'
import AIFeatures from './pages/ai/Features'
import AIScreening from './pages/ai/Screening'
import ScreeningDetail from './pages/ai/ScreeningDetail'
// 患者端页面
import PatientHome from './pages/patient/Home'
import PatientApply from './pages/patient/Apply'
import PatientProgress from './pages/patient/Progress'
import PatientReport from './pages/patient/Report'
import PatientFollowup from './pages/patient/Followup'
import PatientMessage from './pages/patient/Message'
// 工作台页面
import Workbench from './pages/workbench/Index'
import { useAppStore } from './stores/appStore'
import ErrorBoundary from './components/ErrorBoundary'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const { role } = useAppStore()

  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<BlankLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/patient/login" element={<PatientLogin />} />
        </Route>
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/" element={<Navigate to="/workbench" replace />} />
          <Route path="/workbench" element={<Workbench />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/consultation/apply" element={<Apply />} />
          <Route path="/consultation/my-applies" element={<MyApplies />} />
          <Route path="/consultation/submit-material" element={<SubmitMaterial />} />
          <Route path="/consultation/pending-review" element={<PendingReview />} />
          <Route path="/consultation/schedule" element={<Schedule />} />
          <Route path="/consultation/material-supervise" element={<MaterialSupervise />} />
          <Route path="/consultation/my-meetings" element={<MyMeetings />} />
          <Route path="/consultation/detail/:id" element={<ConsultationDetail />} />
          <Route path="/consultation/room/:id" element={<ConsultationRoom />} />
          <Route path="/consultation/bedside/:id" element={<Bedside />} />
          <Route path="/ai/features" element={<AIFeatures />} />
          <Route path="/ai/screening" element={<AIScreening />} />
          <Route path="/ai/screening/:id" element={<ScreeningDetail />} />
          <Route path="/patient/list" element={<PatientList />} />
          <Route path="/patient/360/:id" element={<Patient360 />} />
          <Route path="/report/list" element={<ReportList />} />
          <Route path="/report/edit/:id" element={<ReportEdit />} />
          <Route path="/followup/list" element={<FollowupList />} />
          <Route path="/followup/execute" element={<FollowupExecute />} />
          <Route path="/followup/assessment" element={<Assessment />} />
          <Route path="/followup/planner" element={<FollowupPlanner />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/quality/tasks" element={<QualityTasks />} />
          <Route path="/quality/dashboard" element={<QualityDashboard />} />
          <Route path="/consultation/tracking" element={<ConsultationTracking />} />
          <Route path="/consultation/mdt-management" element={<MDTManagement />} />
          <Route path="/consultation/director-confirm" element={<DirectorConfirm />} />
          <Route path="/consultation/expert-confirm" element={<ExpertConfirm />} />
          <Route path="/consultation/expert-invite/:id" element={<ExpertInvite />} />
          <Route path="/consultation/supplement-material/:id" element={<SupplementMaterial />} />
          <Route path="/case-library" element={<CaseLibraryIndex />} />
          <Route path="/case-library/search" element={<CaseSearch />} />
          <Route path="/case-library/detail/:id" element={<CaseDetail />} />
          <Route path="/case-library/typical" element={<TypicalCases />} />
          <Route path="/case-library/statistics" element={<CaseStatistics />} />
          <Route path="/case-library/favorites" element={<MyFavorites />} />
          <Route path="/case-library/learning" element={<LearningProgress />} />
          <Route path="/case-library/comparison" element={<CaseComparison />} />
          <Route path="/admin/expert-list" element={<ExpertList />} />
          <Route path="/admin/team-list" element={<TeamList />} />
          <Route path="/admin/roles" element={<Roles />} />
          <Route path="/admin/logs" element={<Logs />} />
          <Route path="/admin/audit-logs" element={<AuditLogs />} />
          <Route path="/admin/organizations" element={<Organizations />} />
          <Route path="/admin/users" element={<Users />} />
          <Route path="/admin/code-table" element={<CodeTable />} />
          <Route path="/m/home" element={<MHome />} />
          <Route path="/m/room/:id" element={<MRoom />} />
        </Route>
        {/* 患者端路由（独立，无需登录） */}
        <Route path="/patient/home" element={<PatientHome />} />
        <Route path="/patient/apply" element={<PatientApply />} />
        <Route path="/patient/progress" element={<PatientProgress />} />
        <Route path="/patient/progress/:id" element={<PatientProgress />} />
        <Route path="/patient/report" element={<PatientReport />} />
        <Route path="/patient/report/:id" element={<PatientReport />} />
        <Route path="/patient/followup" element={<PatientFollowup />} />
        <Route path="/patient/message" element={<PatientMessage />} />
      </Routes>
    </ErrorBoundary>
  )
}

export default App