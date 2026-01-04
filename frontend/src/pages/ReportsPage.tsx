
import { BarChart3 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function ReportsPage() {
  const { theme } = useTheme();
  const textPrimary = theme === 'dark' ? '#FFFFFF' : '#111827';
  const textSecondary = theme === 'dark' ? '#9CA3AF' : '#6B7280';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-semibold" style={{ color: textPrimary }}>
          数据报表
        </h1>
        <p className="mt-1" style={{ color: textSecondary }}>查看和导出报表数据</p>
      </div>
      <div className="card text-center py-12">
        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p style={{ color: textSecondary }}>数据报表功能开发中...</p>
      </div>
    </div>
  );
}
