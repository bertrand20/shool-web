import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { I18nProvider } from './i18n/context'
import PublicLayout from './components/PublicLayout'
import Layout from './components/Layout'
import ParentDashboard from './pages/ParentDashboard'
import ParentAnnouncements from './pages/ParentAnnouncements'
import ParentGallery from './pages/ParentGallery'
import ParentAbout from './pages/ParentAbout'
import ParentContact from './pages/ParentContact'
import ParentRegister from './pages/ParentRegister'
import ParentPayFees from './pages/ParentPayFees'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import Enrollment from './pages/Enrollment'
import Parents from './pages/Parents'
import StaffManagement from './pages/StaffManagement'
import Attendance from './pages/Attendance'
import Billing from './pages/Billing'
import AnnouncementsManager from './pages/AnnouncementsManager'
import GalleryManager from './pages/GalleryManager'
import SchoolInfoManager from './pages/SchoolInfoManager'
import PaymentsManager from './pages/PaymentsManager'
import MarksManager from './pages/MarksManager'
import ParentReportCard from './pages/ParentReportCard'
import TimetableManager from './pages/TimetableManager'
import HomeworkManager from './pages/HomeworkManager'
import NotificationsManager from './pages/NotificationsManager'
import ReportsManager from './pages/ReportsManager'
import LibraryManager from './pages/LibraryManager'
import TransportManager from './pages/TransportManager'
import HealthManager from './pages/HealthManager'
import PayrollManager from './pages/PayrollManager'
import LeaveManager from './pages/LeaveManager'
import EventsManager from './pages/EventsManager'
import BehaviorManager from './pages/BehaviorManager'
import InventoryManager from './pages/InventoryManager'
import AuditLogs from './pages/AuditLogs'
import CertificatesManager from './pages/CertificatesManager'

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('admin_token')
  if (!token) return <Navigate to="/admin/login" replace />
  return children
}

function App() {
  return (
    <I18nProvider>
      <BrowserRouter>
        <Routes>
        <Route path="/login" element={<Navigate to="/admin/login" replace />} />

        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Layout>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/enrollment"
          element={
            <ProtectedRoute>
              <Layout><Enrollment /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/parents"
          element={
            <ProtectedRoute>
              <Layout><Parents /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/staff"
          element={
            <ProtectedRoute>
              <Layout><StaffManagement /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/attendance"
          element={
            <ProtectedRoute>
              <Layout><Attendance /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/billing"
          element={
            <ProtectedRoute>
              <Layout><Billing /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/announcements"
          element={
            <ProtectedRoute>
              <Layout><div className="max-w-4xl mx-auto"><AnnouncementsManager /></div></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/gallery"
          element={
            <ProtectedRoute>
              <Layout><div className="max-w-4xl mx-auto"><GalleryManager /></div></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/school-info"
          element={
            <ProtectedRoute>
              <Layout><div className="max-w-4xl mx-auto"><SchoolInfoManager /></div></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <ProtectedRoute>
              <Layout><PaymentsManager /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/marks"
          element={
            <ProtectedRoute>
              <Layout><MarksManager /></Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/timetable"
          element={
            <ProtectedRoute>
              <Layout><TimetableManager /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/homework"
          element={
            <ProtectedRoute>
              <Layout><HomeworkManager /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <ProtectedRoute>
              <Layout><NotificationsManager /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute>
              <Layout><ReportsManager /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/library"
          element={
            <ProtectedRoute>
              <Layout><LibraryManager /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/transport"
          element={
            <ProtectedRoute>
              <Layout><TransportManager /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/health"
          element={
            <ProtectedRoute>
              <Layout><HealthManager /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/payroll"
          element={
            <ProtectedRoute>
              <Layout><PayrollManager /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/leave"
          element={
            <ProtectedRoute>
              <Layout><LeaveManager /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/events"
          element={
            <ProtectedRoute>
              <Layout><EventsManager /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/behavior"
          element={
            <ProtectedRoute>
              <Layout><BehaviorManager /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/inventory"
          element={
            <ProtectedRoute>
              <Layout><InventoryManager /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/audit-logs"
          element={
            <ProtectedRoute>
              <Layout><AuditLogs /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/certificates"
          element={
            <ProtectedRoute>
              <Layout><CertificatesManager /></Layout>
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<PublicLayout><ParentDashboard /></PublicLayout>} />
        <Route path="/announcements" element={<PublicLayout><ParentAnnouncements /></PublicLayout>} />
        <Route path="/gallery" element={<PublicLayout><ParentGallery /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><ParentAbout /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><ParentContact /></PublicLayout>} />
        <Route path="/register" element={<PublicLayout><ParentRegister /></PublicLayout>} />
        <Route path="/pay-fees" element={<PublicLayout><ParentPayFees /></PublicLayout>} />
        <Route path="/report-card" element={<PublicLayout><ParentReportCard /></PublicLayout>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </I18nProvider>
  )
}

export default App
