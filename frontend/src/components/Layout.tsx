import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Wine,
  Package,
  AlertTriangle,
  FileText,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  User,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // 导航菜单配置
  const navigation = [
    {
      name: "仪表盘",
      href: "/dashboard",
      icon: LayoutDashboard,
      current: location.pathname === "/dashboard",
    },
    {
      name: "红酒管理",
      href: "/wines",
      icon: Wine,
      current: location.pathname.startsWith("/wines"),
    },
    {
      name: "出入库管理",
      href: "/inventory",
      icon: Package,
      current: location.pathname === "/inventory",
    },
    {
      name: "库存预警",
      href: "/alerts",
      icon: AlertTriangle,
      current: location.pathname === "/alerts",
    },
    {
      name: "操作日志",
      href: "/logs",
      icon: FileText,
      current: location.pathname === "/logs",
    },
  ];

  // 管理员专用菜单
  const adminNavigation = [
    {
      name: "用户管理",
      href: "/users",
      icon: Users,
      current: location.pathname === "/users",
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      // 错误已在AuthContext中处理
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex">
      {/* 移动端侧边栏遮罩 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-black bg-opacity-25"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 侧边栏 */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface-light dark:bg-surface-dark border-r border-border-light dark:border-border-dark transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:w-64 lg:flex-shrink-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo区域 */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-border-light dark:border-border-dark">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
                <Wine className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-display font-bold text-text-primary-light dark:text-text-primary-dark">
                红酒管理系统
              </span>
            </div>
          </div>

          {/* 导航菜单 */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  item.current
                    ? "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200"
                    : "text-text-secondary-light dark:text-text-secondary-dark hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}

            {/* 管理员菜单 */}
            {user?.role === "admin" && (
              <>
                <div className="pt-4">
                  <div className="px-3 py-2 text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                    管理员功能
                  </div>
                </div>
                {adminNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      item.current
                        ? "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200"
                        : "text-text-secondary-light dark:text-text-secondary-dark hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600"
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                ))}
              </>
            )}
          </nav>

          {/* 用户信息和设置 */}
          <div className="border-t border-border-light dark:border-border-dark p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark truncate">
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <Link
                to="/profile"
                className="flex items-center px-3 py-2 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark rounded-md hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <Settings className="mr-3 h-4 w-4" />
                个人设置
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors"
              >
                <LogOut className="mr-3 h-4 w-4" />
                登出
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 min-w-0">
        {/* 顶部导航栏 */}
        <header className="bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark px-4 py-3 lg:px-6">
          <div className="flex items-center justify-between">
            {/* 移动端菜单按钮 */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-text-secondary-light dark:text-text-secondary-dark hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* 面包屑导航占位 */}
            <div className="hidden lg:block">
              {/* 这里可以添加面包屑导航 */}
            </div>

            {/* 右侧操作区域 */}
            <div className="flex items-center space-x-4">
              {/* 主题切换 */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-text-secondary-light dark:text-text-secondary-dark hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 transition-colors"
                title={theme === "light" ? "切换到深色主题" : "切换到浅色主题"}
              >
                {theme === "light" ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
              </button>

              {/* 用户菜单 */}
              <div className="relative">
                <button className="flex items-center space-x-2 p-2 rounded-md text-text-secondary-light dark:text-text-secondary-dark hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600">
                  <div className="h-6 w-6 bg-primary-600 rounded-full flex items-center justify-center">
                    <User className="h-3 w-3 text-white" />
                  </div>
                  <span className="hidden md:block text-sm font-medium">
                    {user?.name}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* 页面内容 */}
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
