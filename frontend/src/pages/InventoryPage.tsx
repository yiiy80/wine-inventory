import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Search, Calendar } from 'lucide-react';
import api from '../services/api';
import type { InventoryTransaction, Wine } from '../types';
import StockTransactionModal from '../components/StockTransactionModal';
import { useToast } from '../components/Toast';
import { useTheme } from '../contexts/ThemeContext';

export default function InventoryPage() {
  const { theme } = useTheme();
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [wines, setWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedWine, setSelectedWine] = useState<Wine | null>(null);
  const [transactionType, setTransactionType] = useState<'in' | 'out'>('in');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'in' | 'out'>('all');
  const { showToast } = useToast();

  const textPrimary = theme === 'dark' ? '#FFFFFF' : '#111827';
  const textSecondary = theme === 'dark' ? '#9CA3AF' : '#6B7280';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [transactionsRes, winesRes] = await Promise.all([
        api.get('/inventory'),
        api.get('/wines'),
      ]);
      setTransactions(transactionsRes.data.items || transactionsRes.data || []);
      setWines(winesRes.data.items || winesRes.data || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      showToast('error', '加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleStockIn = async (data: { wine_id: number; quantity: number; reason?: string }) => {
    try {
      await api.post('/inventory/in', data);
      showToast('success', '入库成功');
      loadData();
    } catch (error: any) {
      showToast('error', error.response?.data?.detail || '入库失败');
      throw error;
    }
  };

  const handleStockOut = async (data: { wine_id: number; quantity: number; reason?: string }) => {
    try {
      await api.post('/inventory/out', data);
      showToast('success', '出库成功');
      loadData();
    } catch (error: any) {
      showToast('error', error.response?.data?.detail || '出库失败');
      throw error;
    }
  };

  const openModal = (wine: Wine, type: 'in' | 'out') => {
    setSelectedWine(wine);
    setTransactionType(type);
    setShowModal(true);
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesType = typeFilter === 'all' || transaction.transaction_type === typeFilter;
    const wine = wines.find((w) => w.id === transaction.wine_id);
    const matchesSearch =
      !searchTerm || wine?.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

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
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-semibold" style={{ color: textPrimary }}>
          出入库管理
        </h1>
        <p className="mt-1" style={{ color: textSecondary }}>管理库存变动记录</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <label className="label">选择红酒进行操作</label>
          <select
            onChange={(e) => {
              const wine = wines.find((w) => w.id === parseInt(e.target.value));
              if (wine) setSelectedWine(wine);
            }}
            className="input-field"
          >
            <option value="">-- 请选择红酒 --</option>
            {wines.map((wine) => (
              <option key={wine.id} value={wine.id}>
                {wine.name} ({wine.vintage_year}) - 库存: {wine.current_stock}
              </option>
            ))}
          </select>
        </div>
        <div className="card flex items-end">
          <button
            onClick={() => selectedWine && openModal(selectedWine, 'in')}
            disabled={!selectedWine}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <TrendingUp className="w-5 h-5" />
            入库
          </button>
        </div>
        <div className="card flex items-end">
          <button
            onClick={() => selectedWine && openModal(selectedWine, 'out')}
            disabled={!selectedWine}
            className="btn-secondary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <TrendingDown className="w-5 h-5" />
            出库
          </button>
        </div>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索红酒名称..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'in', 'out'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  typeFilter === type
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {type === 'all' ? '全部' : type === 'in' ? '入库' : '出库'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: textSecondary }}>
                  时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: textSecondary }}>
                  红酒
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: textSecondary }}>
                  类型
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: textSecondary }}>
                  数量
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: textSecondary }}>
                  原因
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p style={{ color: textSecondary }}>暂无出入库记录</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => {
                  const wine = wines.find((w) => w.id === transaction.wine_id);
                  const isStockIn = transaction.transaction_type === 'in';
                  return (
                    <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: textPrimary }}>
                        {new Date(transaction.created_at).toLocaleString('zh-CN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium" style={{ color: textPrimary }}>
                          {wine?.name}
                        </div>
                        {wine && (
                          <div className="text-sm" style={{ color: textSecondary }}>
                            {wine.vintage_year} - {wine.region}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            isStockIn
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          }`}
                        >
                          {isStockIn ? '入库' : '出库'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`font-medium ${
                            isStockIn
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {isStockIn ? '+' : '-'}
                          {transaction.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: textSecondary }}>
                        {transaction.reason || '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <StockTransactionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={transactionType === 'in' ? handleStockIn : handleStockOut}
        wine={selectedWine}
        type={transactionType}
      />
    </div>
  );
}
