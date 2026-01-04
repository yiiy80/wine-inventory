import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import WinesPage from './pages/WinesPage';
import InventoryPage from './pages/InventoryPage';
import AlertsPage from './pages/AlertsPage';
import ReportsPage from './pages/ReportsPage';
import LogsPage from './pages/LogsPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/wines"
              element={
                <ProtectedRoute>
                  <Layout>
                    <WinesPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <ProtectedRoute>
                  <Layout>
                    <InventoryPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/alerts"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AlertsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ReportsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/logs"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LogsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Admin Only Routes */}
            <Route
              path="/users"
              element={
                <ProtectedRoute adminOnly>
                  <Layout>
                    <UsersPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute adminOnly>
                  <Layout>
                    <SettingsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          </Router>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
