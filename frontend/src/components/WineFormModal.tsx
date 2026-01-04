import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import { useToast } from "../contexts/ToastContext";
import { Wine } from "../types";

interface WineFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (wine: Partial<Wine>) => Promise<void>;
  initialData?: Partial<Wine>;
  isLoading?: boolean;
}

const WineFormModal: React.FC<WineFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<Partial<Wine>>({
    name: "",
    vintage_year: new Date().getFullYear(),
    region: "",
    grape_variety: "",
    price: undefined,
    supplier: "",
    storage_location: "",
    current_stock: 0,
    low_stock_threshold: 10,
    notes: "",
    image_url: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: "",
        vintage_year: new Date().getFullYear(),
        region: "",
        grape_variety: "",
        price: undefined,
        supplier: "",
        storage_location: "",
        current_stock: 0,
        low_stock_threshold: 10,
        notes: "",
        image_url: "",
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = "红酒名称不能为空";
    }

    if (!formData.region?.trim()) {
      newErrors.region = "产区不能为空";
    }

    if (
      !formData.vintage_year ||
      formData.vintage_year < 1800 ||
      formData.vintage_year > new Date().getFullYear() + 1
    ) {
      newErrors.vintage_year = "请输入有效的年份";
    }

    if (formData.price !== undefined && formData.price < 0) {
      newErrors.price = "价格不能为负数";
    }

    if (formData.current_stock !== undefined && formData.current_stock < 0) {
      newErrors.current_stock = "库存数量不能为负数";
    }

    if (
      formData.low_stock_threshold !== undefined &&
      formData.low_stock_threshold < 0
    ) {
      newErrors.low_stock_threshold = "低库存阈值不能为负数";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast("error", "请检查表单中的错误");
      return;
    }

    try {
      await onSubmit(formData);
      showToast("success", `${initialData?.id ? "更新" : "添加"}红酒成功`);
      onClose();
    } catch (error) {
      showToast("error", `${initialData?.id ? "更新" : "添加"}红酒失败`);
    }
  };

  const handleChange = (field: keyof Wine, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // 清除该字段的错误
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const isEdit = !!initialData?.id;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "编辑红酒" : "添加红酒"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 基本信息 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
              基本信息
            </h3>

            {/* 红酒名称 */}
            <div>
              <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
                红酒名称 <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) => handleChange("name", e.target.value)}
                className={`
                  w-full px-3 py-2 rounded-lg border
                  bg-surface-light dark:bg-surface-dark
                  text-text-primary-light dark:text-text-primary-dark
                  placeholder-text-secondary-light dark:placeholder-text-secondary-dark
                  focus:ring-2 focus:ring-primary focus:border-transparent
                  transition-colors duration-200
                  ${
                    errors.name
                      ? "border-error"
                      : "border-border-light dark:border-border-dark"
                  }
                `}
                placeholder="请输入红酒名称"
                disabled={isLoading}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-error">{errors.name}</p>
              )}
            </div>

            {/* 年份 */}
            <div>
              <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
                年份 <span className="text-error">*</span>
              </label>
              <input
                type="number"
                value={formData.vintage_year || ""}
                onChange={(e) =>
                  handleChange("vintage_year", parseInt(e.target.value) || 0)
                }
                min="1800"
                max={new Date().getFullYear() + 1}
                className={`
                  w-full px-3 py-2 rounded-lg border
                  bg-surface-light dark:bg-surface-dark
                  text-text-primary-light dark:text-text-primary-dark
                  placeholder-text-secondary-light dark:placeholder-text-secondary-dark
                  focus:ring-2 focus:ring-primary focus:border-transparent
                  transition-colors duration-200
                  ${
                    errors.vintage_year
                      ? "border-error"
                      : "border-border-light dark:border-border-dark"
                  }
                `}
                placeholder="请输入年份"
                disabled={isLoading}
              />
              {errors.vintage_year && (
                <p className="mt-1 text-sm text-error">{errors.vintage_year}</p>
              )}
            </div>

            {/* 产区 */}
            <div>
              <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
                产区 <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={formData.region || ""}
                onChange={(e) => handleChange("region", e.target.value)}
                className={`
                  w-full px-3 py-2 rounded-lg border
                  bg-surface-light dark:bg-surface-dark
                  text-text-primary-light dark:text-text-primary-dark
                  placeholder-text-secondary-light dark:placeholder-text-secondary-dark
                  focus:ring-2 focus:ring-primary focus:border-transparent
                  transition-colors duration-200
                  ${
                    errors.region
                      ? "border-error"
                      : "border-border-light dark:border-border-dark"
                  }
                `}
                placeholder="请输入产区"
                disabled={isLoading}
              />
              {errors.region && (
                <p className="mt-1 text-sm text-error">{errors.region}</p>
              )}
            </div>

            {/* 葡萄品种 */}
            <div>
              <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
                葡萄品种
              </label>
              <input
                type="text"
                value={formData.grape_variety || ""}
                onChange={(e) => handleChange("grape_variety", e.target.value)}
                className="
                  w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark
                  bg-surface-light dark:bg-surface-dark
                  text-text-primary-light dark:text-text-primary-dark
                  placeholder-text-secondary-light dark:placeholder-text-secondary-dark
                  focus:ring-2 focus:ring-primary focus:border-transparent
                  transition-colors duration-200
                "
                placeholder="请输入葡萄品种"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* 库存和商业信息 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
              库存和商业信息
            </h3>

            {/* 价格 */}
            <div>
              <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
                价格 (元)
              </label>
              <input
                type="number"
                value={formData.price || ""}
                onChange={(e) =>
                  handleChange("price", parseFloat(e.target.value) || undefined)
                }
                min="0"
                step="0.01"
                className={`
                  w-full px-3 py-2 rounded-lg border
                  bg-surface-light dark:bg-surface-dark
                  text-text-primary-light dark:text-text-primary-dark
                  placeholder-text-secondary-light dark:placeholder-text-secondary-dark
                  focus:ring-2 focus:ring-primary focus:border-transparent
                  transition-colors duration-200
                  ${
                    errors.price
                      ? "border-error"
                      : "border-border-light dark:border-border-dark"
                  }
                `}
                placeholder="请输入价格"
                disabled={isLoading}
              />
              {errors.price && (
                <p className="mt-1 text-sm text-error">{errors.price}</p>
              )}
            </div>

            {/* 供应商 */}
            <div>
              <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
                供应商
              </label>
              <input
                type="text"
                value={formData.supplier || ""}
                onChange={(e) => handleChange("supplier", e.target.value)}
                className="
                  w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark
                  bg-surface-light dark:bg-surface-dark
                  text-text-primary-light dark:text-text-primary-dark
                  placeholder-text-secondary-light dark:placeholder-text-secondary-dark
                  focus:ring-2 focus:ring-primary focus:border-transparent
                  transition-colors duration-200
                "
                placeholder="请输入供应商"
                disabled={isLoading}
              />
            </div>

            {/* 存放位置 */}
            <div>
              <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
                存放位置
              </label>
              <input
                type="text"
                value={formData.storage_location || ""}
                onChange={(e) =>
                  handleChange("storage_location", e.target.value)
                }
                className="
                  w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark
                  bg-surface-light dark:bg-surface-dark
                  text-text-primary-light dark:text-text-primary-dark
                  placeholder-text-secondary-light dark:placeholder-text-secondary-dark
                  focus:ring-2 focus:ring-primary focus:border-transparent
                  transition-colors duration-200
                "
                placeholder="请输入存放位置"
                disabled={isLoading}
              />
            </div>

            {/* 当前库存 */}
            <div>
              <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
                当前库存
              </label>
              <input
                type="number"
                value={formData.current_stock || 0}
                onChange={(e) =>
                  handleChange("current_stock", parseInt(e.target.value) || 0)
                }
                min="0"
                className={`
                  w-full px-3 py-2 rounded-lg border
                  bg-surface-light dark:bg-surface-dark
                  text-text-primary-light dark:text-text-primary-dark
                  placeholder-text-secondary-light dark:placeholder-text-secondary-dark
                  focus:ring-2 focus:ring-primary focus:border-transparent
                  transition-colors duration-200
                  ${
                    errors.current_stock
                      ? "border-error"
                      : "border-border-light dark:border-border-dark"
                  }
                `}
                placeholder="请输入当前库存"
                disabled={isLoading}
              />
              {errors.current_stock && (
                <p className="mt-1 text-sm text-error">
                  {errors.current_stock}
                </p>
              )}
            </div>

            {/* 低库存阈值 */}
            <div>
              <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
                低库存阈值
              </label>
              <input
                type="number"
                value={formData.low_stock_threshold || 10}
                onChange={(e) =>
                  handleChange(
                    "low_stock_threshold",
                    parseInt(e.target.value) || 10
                  )
                }
                min="0"
                className={`
                  w-full px-3 py-2 rounded-lg border
                  bg-surface-light dark:bg-surface-dark
                  text-text-primary-light dark:text-text-primary-dark
                  placeholder-text-secondary-light dark:placeholder-text-secondary-dark
                  focus:ring-2 focus:ring-primary focus:border-transparent
                  transition-colors duration-200
                  ${
                    errors.low_stock_threshold
                      ? "border-error"
                      : "border-border-light dark:border-border-dark"
                  }
                `}
                placeholder="请输入低库存阈值"
                disabled={isLoading}
              />
              {errors.low_stock_threshold && (
                <p className="mt-1 text-sm text-error">
                  {errors.low_stock_threshold}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 备注 */}
        <div>
          <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
            备注
          </label>
          <textarea
            value={formData.notes || ""}
            onChange={(e) => handleChange("notes", e.target.value)}
            rows={3}
            className="
              w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark
              bg-surface-light dark:bg-surface-dark
              text-text-primary-light dark:text-text-primary-dark
              placeholder-text-secondary-light dark:placeholder-text-secondary-dark
              focus:ring-2 focus:ring-primary focus:border-transparent
              transition-colors duration-200
              resize-none
            "
            placeholder="请输入备注信息"
            disabled={isLoading}
          />
        </div>

        {/* 图片URL */}
        <div>
          <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
            图片URL
          </label>
          <input
            type="url"
            value={formData.image_url || ""}
            onChange={(e) => handleChange("image_url", e.target.value)}
            className="
              w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark
              bg-surface-light dark:bg-surface-dark
              text-text-primary-light dark:text-text-primary-dark
              placeholder-text-secondary-light dark:placeholder-text-secondary-dark
              focus:ring-2 focus:ring-primary focus:border-transparent
              transition-colors duration-200
            "
            placeholder="请输入图片URL"
            disabled={isLoading}
          />
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border-light dark:border-border-dark">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="
              px-4 py-2 rounded-lg border border-border-light dark:border-border-dark
              bg-surface-light dark:bg-surface-dark
              text-text-secondary-light dark:text-text-secondary-dark
              hover:bg-surface-dark dark:hover:bg-surface-light
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-200
            "
          >
            取消
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="
              px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white font-medium
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-200
              flex items-center gap-2
            "
          >
            {isLoading && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {isEdit ? "更新" : "添加"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default WineFormModal;
