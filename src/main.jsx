import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import './styles.css';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingPage from './components/ui/LoadingPage';

// Lazy load pages
const LandingPage = React.lazy(() => import('./pages/public/LandingPage'));
const CoursesPage = React.lazy(() => import('./pages/public/CoursesPage'));
const CourseDetailPage = React.lazy(() => import('./pages/public/CourseDetailPage'));
const AuthPage = React.lazy(() => import('./pages/public/AuthPage'));
const VerifyCertificate = React.lazy(() => import('./pages/public/VerifyCertificate'));

const StudentDashboard = React.lazy(() => import('./pages/student/StudentDashboard'));
const MyCourses = React.lazy(() => import('./pages/student/MyCourses'));
const LearningPage = React.lazy(() => import('./pages/student/LearningPage'));
const AssessmentPage = React.lazy(() => import('./pages/student/AssessmentPage'));
const AssessmentResultPage = React.lazy(() => import('./pages/student/AssessmentResultPage'));
const ProgressPage = React.lazy(() => import('./pages/student/ProgressPage'));
const CertificatesPage = React.lazy(() => import('./pages/student/CertificatesPage'));
const StudentProfile = React.lazy(() => import('./pages/student/StudentProfile'));

const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const ManageStudents = React.lazy(() => import('./pages/admin/ManageStudents'));
const StudentProfileView = React.lazy(() => import('./pages/admin/StudentProfileView'));
const ManageCourses = React.lazy(() => import('./pages/admin/ManageCourses'));
const EditCourse = React.lazy(() => import('./pages/admin/EditCourse'));
const ManageAssessments = React.lazy(() => import('./pages/admin/ManageAssessments'));
const EditQuestions = React.lazy(() => import('./pages/admin/EditQuestions'));
const DatabaseViewer = React.lazy(() => import('./pages/admin/DatabaseViewer'));
const ReportsPage = React.lazy(() => import('./pages/admin/ReportsPage'));
const SettingsPage = React.lazy(() => import('./pages/admin/SettingsPage'));

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingPage />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/courses/:id" element={<CourseDetailPage />} />
              <Route path="/login" element={<AuthPage type="login" />} />
              <Route path="/register" element={<AuthPage type="register" />} />
              <Route path="/forgot-password" element={<AuthPage type="forgot" />} />
              <Route path="/verify" element={<VerifyCertificate />} />

              {/* Student Routes */}
              <Route
                path="/student"
                element={
                  <ProtectedRoute role="student">
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/courses"
                element={
                  <ProtectedRoute role="student">
                    <MyCourses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/learn/:courseId"
                element={
                  <ProtectedRoute role="student">
                    <LearningPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/assessment/:id"
                element={
                  <ProtectedRoute role="student">
                    <AssessmentPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/assessment/:id/result"
                element={
                  <ProtectedRoute role="student">
                    <AssessmentResultPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/progress"
                element={
                  <ProtectedRoute role="student">
                    <ProgressPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/certificates"
                element={
                  <ProtectedRoute role="student">
                    <CertificatesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/profile"
                element={
                  <ProtectedRoute role="student">
                    <StudentProfile />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute role="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/students"
                element={
                  <ProtectedRoute role="admin">
                    <ManageStudents />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/students/:id"
                element={
                  <ProtectedRoute role="admin">
                    <StudentProfileView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/courses"
                element={
                  <ProtectedRoute role="admin">
                    <ManageCourses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/courses/edit"
                element={
                  <ProtectedRoute role="admin">
                    <EditCourse />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/assessments"
                element={
                  <ProtectedRoute role="admin">
                    <ManageAssessments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/questions/edit"
                element={
                  <ProtectedRoute role="admin">
                    <EditQuestions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/certificates"
                element={
                  <ProtectedRoute role="admin">
                    <CertificatesPage admin />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/database"
                element={
                  <ProtectedRoute role="admin">
                    <DatabaseViewer />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <ProtectedRoute role="admin">
                    <ReportsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute role="admin">
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}

createRoot(document.getElementById('root')).render(<App />);

