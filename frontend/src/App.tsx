import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import WinesPage from "./pages/WinesPage";
import WineDetailPage from "./pages/WineDetailPage";
import WineFormPage from "./pages/WineFormPage";
import InventoryPage from "./pages/InventoryPage";
import AlertsPage from "./pages/AlertsPage";
import LogsPage from "./pages/LogsPage";
import UsersPage from "./pages/UsersPage";
import ProfilePage from "./pages/ProfilePage";
import Layout from "./components/Layout";
import LoadingSpinner from "./components/LoadingSpinner";

// 受保护的路由组件
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// 管理员专用路由组件
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      {/* 公开路由 */}
      <Route path="/login" element={<LoginPage />} />

      {/* 受保护的路由 */}
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
        path="/wines/new"
        element={
          <ProtectedRoute>
            <Layout>
              <WineFormPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/wines/:id/edit"
        element={
          <ProtectedRoute>
            <Layout>
              <WineFormPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/wines/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <WineDetailPage />
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
        path="/logs"
        element={
          <ProtectedRoute>
            <Layout>
              <LogsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* 管理员专用路由 */}
      <Route
        path="/users"
        element={
          <AdminRoute>
            <Layout>
              <UsersPage />
            </Layout>
          </AdminRoute>
        }
      />

      {/* 默认重定向 */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
          <AppRoutes />
        </div>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
