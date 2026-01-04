import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Wine,
  LayoutDashboard,
  TrendingUp,
  AlertCircle,
  BarChart3,
  FileText,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  User,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = [
    { icon: LayoutDashboard, label: "仪表盘", path: "/dashboard" },
    { icon: Wine, label: "红酒管理", path: "/wines" },
    { icon: TrendingUp, label: "出入库管理", path: "/inventory" },
    { icon: AlertCircle, label: "库存预警", path: "/alerts" },
    { icon: BarChart3, label: "数据报表", path: "/reports" },
    { icon: FileText, label: "操作日志", path: "/logs" },
    ...(isAdmin
      ? [
          { icon: Users, label: "用户管理", path: "/users" },
          { icon: Settings, label: "系统设置", path: "/settings" },
        ]
      : []),
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-red-500/5 to-transparent dark:from-red-500/10">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl shadow-lg bg-red-600">
              <Wine className="w-7 h-7 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-display font-bold leading-tight text-gray-900 dark:text-white">
                红酒库存
              </h1>
              <p className="text-xs font-medium tracking-wide text-red-600 dark:text-yellow-400">
                WINE INVENTORY
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-6 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex gap-3 px-6 py-3 transition-colors border-l-4 ${
                    active
                      ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-red-600 dark:border-yellow-400 rounded-l-lg"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-yellow-400"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-600">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-gray-900 dark:text-white">
                  {user?.name}
                </p>
                <p className="text-xs truncate text-gray-600 dark:text-gray-300">
                  {user?.role === "admin" ? "管理员" : "用户"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white"
            >
              {sidebarOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            {/* Breadcrumb */}
            <div className="hidden lg:block">
              <h2 className="text-xl font-display font-semibold text-gray-900 dark:text-white">
                {navItems.find((item) => isActive(item.path))?.label ||
                  "仪表盘"}
              </h2>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white"
                aria-label="切换主题"
              >
                {theme === "light" ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5" />
                )}
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-900 dark:text-white"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">退出</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-6 lg:p-8 min-h-screen">{children}</main>
      </div>
    </div>
  );
}
