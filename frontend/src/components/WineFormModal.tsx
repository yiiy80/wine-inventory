import { useState, useEffect } from 'react';
import type { Wine } from '../types';
import Modal from './Modal';

interface WineFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Wine>) => Promise<void>;
  wine?: Wine | null;
}

export default function WineFormModal({ isOpen, onClose, onSubmit, wine }: WineFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    vintage_year: new Date().getFullYear(),
    region: '',
    grape_variety: '',
    price: '',
    supplier: '',
    storage_location: '',
    current_stock: 0,
    low_stock_threshold: 10,
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (wine) {
      setFormData({
        name: wine.name,
        vintage_year: wine.vintage_year,
        region: wine.region,
        grape_variety: wine.grape_variety || '',
        price: wine.price?.toString() || '',
        supplier: wine.supplier || '',
        storage_location: wine.storage_location || '',
        current_stock: wine.current_stock,
        low_stock_threshold: wine.low_stock_threshold,
        notes: wine.notes || '',
      });
    } else {
      setFormData({
        name: '',
        vintage_year: new Date().getFullYear(),
        region: '',
        grape_variety: '',
        price: '',
        supplier: '',
        storage_location: '',
        current_stock: 0,
        low_stock_threshold: 10,
        notes: '',
      });
    }
    setErrors({});
  }, [wine, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '请输入红酒名称';
    }
    if (!formData.vintage_year || formData.vintage_year < 1900 || formData.vintage_year > new Date().getFullYear() + 1) {
      newErrors.vintage_year = '请输入有效的年份';
    }
    if (!formData.region.trim()) {
      newErrors.region = '请输入产区';
    }
    if (formData.current_stock < 0) {
      newErrors.current_stock = '库存数量不能为负数';
    }
    if (formData.low_stock_threshold < 0) {
      newErrors.low_stock_threshold = '预警阈值不能为负数';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const submitData: any = {
        name: formData.name.trim(),
        vintage_year: formData.vintage_year,
        region: formData.region.trim(),
        current_stock: formData.current_stock,
        low_stock_threshold: formData.low_stock_threshold,
      };

      if (formData.grape_variety.trim()) {
        submitData.grape_variety = formData.grape_variety.trim();
      }
      if (formData.price) {
        submitData.price = parseFloat(formData.price);
      }
      if (formData.supplier.trim()) {
        submitData.supplier = formData.supplier.trim();
      }
      if (formData.storage_location.trim()) {
        submitData.storage_location = formData.storage_location.trim();
      }
      if (formData.notes.trim()) {
        submitData.notes = formData.notes.trim();
      }

      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Failed to submit wine:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={wine ? '编辑红酒' : '添加红酒'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 名称 */}
          <div>
            <label className="label">
              红酒名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="例如: 拉菲古堡"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* 年份 */}
          <div>
            <label className="label">
              年份 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.vintage_year}
              onChange={(e) => setFormData({ ...formData, vintage_year: parseInt(e.target.value) || new Date().getFullYear() })}
              className="input-field"
              min="1900"
              max={new Date().getFullYear() + 1}
            />
            {errors.vintage_year && <p className="text-red-500 text-sm mt-1">{errors.vintage_year}</p>}
          </div>

          {/* 产区 */}
          <div>
            <label className="label">
              产区 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              className="input-field"
              placeholder="例如: 波尔多"
            />
            {errors.region && <p className="text-red-500 text-sm mt-1">{errors.region}</p>}
          </div>

          {/* 葡萄品种 */}
          <div>
            <label className="label">葡萄品种</label>
            <input
              type="text"
              value={formData.grape_variety}
              onChange={(e) => setFormData({ ...formData, grape_variety: e.target.value })}
              className="input-field"
              placeholder="例如: 赤霞珠"
            />
          </div>

          {/* 价格 */}
          <div>
            <label className="label">价格 (¥)</label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="input-field"
              placeholder="0.00"
            />
          </div>

          {/* 供应商 */}
          <div>
            <label className="label">供应商</label>
            <input
              type="text"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              className="input-field"
              placeholder="例如: 某某酒庄"
            />
          </div>

          {/* 存放位置 */}
          <div>
            <label className="label">存放位置</label>
            <input
              type="text"
              value={formData.storage_location}
              onChange={(e) => setFormData({ ...formData, storage_location: e.target.value })}
              className="input-field"
              placeholder="例如: A区1号架"
            />
          </div>

          {/* 当前库存 */}
          <div>
            <label className="label">当前库存</label>
            <input
              type="number"
              value={formData.current_stock}
              onChange={(e) => setFormData({ ...formData, current_stock: parseInt(e.target.value) || 0 })}
              className="input-field"
              min="0"
            />
            {errors.current_stock && <p className="text-red-500 text-sm mt-1">{errors.current_stock}</p>}
          </div>

          {/* 低库存阈值 */}
          <div>
            <label className="label">低库存预警阈值</label>
            <input
              type="number"
              value={formData.low_stock_threshold}
              onChange={(e) => setFormData({ ...formData, low_stock_threshold: parseInt(e.target.value) || 0 })}
              className="input-field"
              min="0"
            />
            {errors.low_stock_threshold && <p className="text-red-500 text-sm mt-1">{errors.low_stock_threshold}</p>}
          </div>
        </div>

        {/* 备注 */}
        <div>
          <label className="label">备注</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="input-field"
            rows={3}
            placeholder="输入备注信息..."
          />
        </div>

        {/* 按钮 */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            disabled={loading}
          >
            取消
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? '保存中...' : wine ? '保存修改' : '添加红酒'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
