import { useEffect, useState } from 'react';
import { AlertCircle, TrendingUp, Wine as WineIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import type { Wine } from '../types';
import StockTransactionModal from '../components/StockTransactionModal';
import { useToast } from '../components/Toast';
import { useTheme } from '../contexts/ThemeContext';

export default function AlertsPage() {
  const { theme } = useTheme();
  const [wines, setWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedWine, setSelectedWine] = useState<Wine | null>(null);
  const { showToast } = useToast();

  const textPrimary = theme === 'dark' ? '#FFFFFF' : '#111827';
  const textSecondary = theme === 'dark' ? '#9CA3AF' : '#6B7280';

  useEffect(() => {
    loadWines();
  }, []);

  const loadWines = async () => {
    try {
      setLoading(true);
      const response = await api.get('/wines/low-stock');
      setWines(response.data.items || response.data || []);
    } catch (error) {
      console.error('Failed to load low stock wines:', error);
      showToast('error', '加载预警列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleStockIn = async (data: { wine_id: number; quantity: number; reason?: string }) => {
    try {
      await api.post('/inventory/in', data);
      showToast('success', '入库成功');
      loadWines();
    } catch (error: any) {
      showToast('error', error.response?.data?.detail || '入库失败');
      throw error;
    }
  };

  const openStockInModal = (wine: Wine) => {
    setSelectedWine(wine);
    setShowModal(true);
  };

  const getAlertLevel = (wine: Wine) => {
    if (wine.current_stock === 0) {
      return {
        level: 'critical',
        label: '缺货',
        color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-200 dark:border-red-800',
        icon: 'text-red-600 dark:text-red-400',
      };
    }
    const ratio = wine.current_stock / wine.low_stock_threshold;
    if (ratio <= 0.5) {
      return {
        level: 'high',
        label: '严重不足',
        color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 border-orange-200 dark:border-orange-800',
        icon: 'text-orange-600 dark:text-orange-400',
      };
    }
    return {
      level: 'warning',
      label: '库存偏低',
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
      icon: 'text-yellow-600 dark:text-yellow-400',
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p style={{ color: textSecondary }}>加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-semibold" style={{ color: textPrimary }}>
          库存预警
        </h1>
        <p className="mt-1" style={{ color: textSecondary }}>查看低库存和缺货预警</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: textSecondary }}>缺货</p>
              <p className="text-2xl font-display font-semibold" style={{ color: textPrimary }}>
                {wines.filter((w) => w.current_stock === 0).length}
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="card border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: textSecondary }}>严重不足</p>
              <p className="text-2xl font-display font-semibold" style={{ color: textPrimary }}>
                {wines.filter((w) => w.current_stock > 0 && w.current_stock <= w.low_stock_threshold * 0.5).length}
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        <div className="card border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: textSecondary }}>库存偏低</p>
              <p className="text-2xl font-display font-semibold" style={{ color: textPrimary }}>
                {wines.filter((w) => w.current_stock > w.low_stock_threshold * 0.5 && w.current_stock <= w.low_stock_threshold).length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      {wines.length === 0 ? (
        <div className="card text-center py-12">
          <WineIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2" style={{ color: textPrimary }}>无库存预警</h3>
          <p style={{ color: textSecondary }}>所有红酒库存充足</p>
          <Link to="/wines" className="btn-primary inline-block mt-4">
            查看红酒列表
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {wines.map((wine) => {
            const alert = getAlertLevel(wine);
            return (
              <div key={wine.id} className={`card border-l-4 ${alert.color}`}>
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 ${alert.icon}`}>
                    <AlertCircle className="w-6 h-6" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium" style={{ color: textPrimary }}>
                          {wine.name}
                        </h3>
                        <div className="mt-1 text-sm space-y-1" style={{ color: textSecondary }}>
                          <p>
                            <span className="font-medium">年份:</span> {wine.vintage_year} |{' '}
                            <span className="font-medium">产区:</span> {wine.region}
                          </p>
                          {wine.grape_variety && (
                            <p>
                              <span className="font-medium">葡萄品种:</span> {wine.grape_variety}
                            </p>
                          )}
                          {wine.storage_location && (
                            <p>
                              <span className="font-medium">存放位置:</span> {wine.storage_location}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${alert.color}`}>
                          {alert.label}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-6">
                      <div>
                        <p className="text-sm" style={{ color: textSecondary }}>当前库存</p>
                        <p className="text-2xl font-semibold" style={{ color: textPrimary }}>
                          {wine.current_stock}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm" style={{ color: textSecondary }}>预警阈值</p>
                        <p className="text-lg" style={{ color: textPrimary }}>
                          {wine.low_stock_threshold}
                        </p>
                      </div>
                      {wine.price && (
                        <div>
                          <p className="text-sm" style={{ color: textSecondary }}>单价</p>
                          <p className="text-lg" style={{ color: textPrimary }}>
                            ¥{wine.price.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => openStockInModal(wine)}
                        className="btn-primary flex items-center gap-2"
                      >
                        <TrendingUp className="w-4 h-4" />
                        立即入库
                      </button>
                      <Link to="/wines" className="btn-secondary">
                        查看详情
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stock In Modal */}
      <StockTransactionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleStockIn}
        wine={selectedWine}
        type="in"
      />
    </div>
  );
}
