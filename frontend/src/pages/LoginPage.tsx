import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Wine, Lock, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 获取重定向地址
  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("请输入邮箱和密码");
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password, rememberMe);
      navigate(from, { replace: true });
    } catch (error) {
      // 错误已在AuthContext中处理
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-950 dark:to-secondary-950 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo和标题 */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center">
            <Wine className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-display font-bold text-text-primary-light dark:text-text-primary-dark">
            红酒库存管理系统
          </h2>
          <p className="mt-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">
            专业的红酒资产管理平台
          </p>
        </div>

        {/* 登录表单 */}
        <div className="card p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark"
              >
                邮箱地址
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="请输入邮箱地址"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark"
              >
                密码
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pr-10"
                  placeholder="请输入密码"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-text-secondary-light dark:text-text-secondary-dark" />
                  ) : (
                    <Eye className="h-5 w-5 text-text-secondary-light dark:text-text-secondary-dark" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-border-light rounded"
                  disabled={isLoading}
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-text-secondary-light dark:text-text-secondary-dark"
                >
                  记住我
                </label>
              </div>

              <div className="text-sm">
                <button
                  type="button"
                  className="text-primary-600 hover:text-primary-500 font-medium"
                  onClick={() => toast("密码重置功能即将上线")}
                  disabled={isLoading}
                >
                  忘记密码？
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full flex justify-center items-center"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    登录中...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    登录
                  </>
                )}
              </button>
            </div>
          </form>

          {/* 默认管理员账户提示 */}
          <div className="mt-6 p-4 bg-secondary-50 dark:bg-secondary-950 rounded-md">
            <div className="text-sm">
              <p className="font-medium text-secondary-800 dark:text-secondary-200 mb-1">
                默认管理员账户：
              </p>
              <p className="text-secondary-600 dark:text-secondary-400">
                邮箱: admin@wine.com
                <br />
                密码: admin123
              </p>
              <p className="text-xs text-secondary-500 dark:text-secondary-500 mt-2">
                ⚠️ 请及时修改默认密码
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
