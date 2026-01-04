
import { Settings } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function SettingsPage() {
  const { theme } = useTheme();
  const textPrimary = theme === 'dark' ? '#FFFFFF' : '#111827';
  const textSecondary = theme === 'dark' ? '#9CA3AF' : '#6B7280';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-semibold" style={{ color: textPrimary }}>
          系统设置
        </h1>
        <p className="mt-1" style={{ color: textSecondary }}>配置系统参数</p>
      </div>
      <div className="card text-center py-12">
        <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p style={{ color: textSecondary }}>系统设置功能开发中...</p>
      </div>
    </div>
  );
}
