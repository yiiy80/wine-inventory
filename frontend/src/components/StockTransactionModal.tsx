import { useState, useEffect } from 'react';
import type { Wine } from '../types';
import Modal from './Modal';

interface StockTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { wine_id: number; quantity: number; reason?: string }) => Promise<void>;
  wine: Wine | null;
  type: 'in' | 'out';
}

export default function StockTransactionModal({
  isOpen,
  onClose,
  onSubmit,
  wine,
  type,
}: StockTransactionModalProps) {
  const [quantity, setQuantity] = useState(0);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setQuantity(0);
      setReason('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (quantity <= 0) {
      setError('数量必须大于0');
      return;
    }

    if (type === 'out' && wine && quantity > wine.current_stock) {
      setError(`出库数量不能超过当前库存 (${wine.current_stock})`);
      return;
    }

    if (!wine) {
      setError('未选择红酒');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        wine_id: wine.id,
        quantity,
        reason: reason.trim() || undefined,
      });
      onClose();
    } catch (err) {
      console.error('Transaction failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const title = type === 'in' ? '入库' : '出库';
  const action = type === 'in' ? '入库' : '出库';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      {wine && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 红酒信息 */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">{wine.name}</h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-300">
              <div>
                <span className="text-gray-500 dark:text-gray-400">年份:</span> {wine.vintage_year}
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">产区:</span> {wine.region}
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">当前库存:</span>{' '}
                <span className="font-medium">{wine.current_stock}</span>
              </div>
              {wine.price && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">价格:</span> ¥{wine.price}
                </div>
              )}
            </div>
          </div>

          {/* 数量 */}
          <div>
            <label className="label">
              {action}数量 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              className="input-field"
              min="1"
              placeholder="请输入数量"
              autoFocus
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>

          {/* 原因/备注 */}
          <div>
            <label className="label">原因/备注</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="input-field"
              rows={3}
              placeholder={`请输入${action}原因...`}
            />
          </div>

          {/* 预览 */}
          {quantity > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                {type === 'in' && (
                  <>
                    {action}后库存: <span className="font-medium">{wine.current_stock + quantity}</span>
                  </>
                )}
                {type === 'out' && (
                  <>
                    {action}后库存: <span className="font-medium">{wine.current_stock - quantity}</span>
                    {wine.current_stock - quantity <= wine.low_stock_threshold && (
                      <span className="ml-2 text-yellow-600 dark:text-yellow-400">⚠️ 将触发低库存预警</span>
                    )}
                  </>
                )}
              </p>
            </div>
          )}

          {/* 按钮 */}
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
              取消
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? '处理中...' : `确认${action}`}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
