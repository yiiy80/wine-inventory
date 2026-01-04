import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wine, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || '登录失败,请检查邮箱和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-dark via-primary to-primary-light p-4">
      <div className="w-full max-w-md">
        <div className="card">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
              <Wine className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-display text-primary mb-2">红酒库存管理系统</h1>
            <p className="text-gray-600 dark:text-gray-400">专业的红酒资产管理平台</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="label">
                邮箱地址
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="请输入邮箱"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="label">
                密码
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="请输入密码"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                '登录中...'
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  登录
                </>
              )}
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>测试账户: admin@wine.com / admin123</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-white/80">
          <p>© 2026 红酒库存管理系统. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
