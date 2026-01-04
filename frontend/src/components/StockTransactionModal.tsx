import React, { useState, useEffect } from "react";
import { Plus, Minus } from "lucide-react";
import Modal from "./Modal";
import { useToast } from "../contexts/ToastContext";
import { Wine } from "../types";

export type TransactionType = "in" | "out";

interface StockTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    wineId: number;
    type: TransactionType;
    quantity: number;
    reason: string;
  }) => Promise<void>;
  wine: Wine | null;
  isLoading?: boolean;
}

const StockTransactionModal: React.FC<StockTransactionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  wine,
  isLoading = false,
}) => {
  const { showToast } = useToast();
  const [transactionType, setTransactionType] = useState<TransactionType>("in");
  const [quantity, setQuantity] = useState<number>(0);
  const [reason, setReason] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setTransactionType("in");
      setQuantity(0);
      setReason("");
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (quantity <= 0) {
      newErrors.quantity = "数量必须大于0";
    }

    if (transactionType === "out" && wine && quantity > wine.current_stock) {
      newErrors.quantity = `出库数量不能超过当前库存 (${wine.current_stock})`;
    }

    if (!reason.trim()) {
      newErrors.reason = "请填写操作原因";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!wine) {
      showToast("error", "未选择红酒");
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit({
        wineId: wine.id,
        type: transactionType,
        quantity,
        reason: reason.trim(),
      });

      const actionText = transactionType === "in" ? "入库" : "出库";
      showToast("success", `${actionText}操作成功`);
      onClose();
    } catch (error) {
      const actionText = transactionType === "in" ? "入库" : "出库";
      showToast("error", `${actionText}操作失败`);
    }
  };

  const handleQuantityChange = (value: number) => {
    setQuantity(Math.max(0, value));
    if (errors.quantity) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.quantity;
        return newErrors;
      });
    }
  };

  const getProjectedStock = (): number => {
    if (!wine) return 0;
    return transactionType === "in"
      ? wine.current_stock + quantity
      : wine.current_stock - quantity;
  };

  const getStockChangeText = (): string => {
    if (quantity === 0) return "";
    const sign = transactionType === "in" ? "+" : "-";
    return `${sign}${quantity}`;
  };

  if (!wine) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${transactionType === "in" ? "入库" : "出库"}操作`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 红酒信息展示 */}
        <div className="bg-surface-dark dark:bg-surface-light rounded-lg p-4">
          <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-3">
            红酒信息
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-text-secondary-light dark:text-text-secondary-dark">
                名称:
              </span>
              <span className="ml-2 font-medium text-text-primary-light dark:text-text-primary-dark">
                {wine.name}
              </span>
            </div>
            <div>
              <span className="text-text-secondary-light dark:text-text-secondary-dark">
                年份:
              </span>
              <span className="ml-2 font-medium text-text-primary-light dark:text-text-primary-dark">
                {wine.vintage_year}
              </span>
            </div>
            <div>
              <span className="text-text-secondary-light dark:text-text-secondary-dark">
                产区:
              </span>
              <span className="ml-2 font-medium text-text-primary-light dark:text-text-primary-dark">
                {wine.region}
              </span>
            </div>
            <div>
              <span className="text-text-secondary-light dark:text-text-secondary-dark">
                当前库存:
              </span>
              <span className="ml-2 font-medium text-text-primary-light dark:text-text-primary-dark">
                {wine.current_stock}
              </span>
            </div>
          </div>
        </div>

        {/* 操作类型选择 */}
        <div>
          <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-3">
            操作类型
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setTransactionType("in");
                setErrors({});
              }}
              className={`
                flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all duration-200
                ${
                  transactionType === "in"
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border-light dark:border-border-dark text-text-secondary-light dark:text-text-secondary-dark hover:border-accent/50"
                }
              `}
              disabled={isLoading}
            >
              <Plus size={20} />
              入库
            </button>

            <button
              type="button"
              onClick={() => {
                setTransactionType("out");
                setErrors({});
              }}
              className={`
                flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all duration-200
                ${
                  transactionType === "out"
                    ? "border-error bg-error/10 text-error"
                    : "border-border-light dark:border-border-dark text-text-secondary-light dark:text-text-secondary-dark hover:border-error/50"
                }
              `}
              disabled={isLoading}
            >
              <Minus size={20} />
              出库
            </button>
          </div>
        </div>

        {/* 数量输入 */}
        <div>
          <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
            数量 <span className="text-error">*</span>
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) =>
              handleQuantityChange(parseInt(e.target.value) || 0)
            }
            min="1"
            className={`
              w-full px-3 py-2 rounded-lg border
              bg-surface-light dark:bg-surface-dark
              text-text-primary-light dark:text-text-primary-dark
              placeholder-text-secondary-light dark:placeholder-text-secondary-dark
              focus:ring-2 focus:ring-primary focus:border-transparent
              transition-colors duration-200
              ${
                errors.quantity
                  ? "border-error"
                  : "border-border-light dark:border-border-dark"
              }
            `}
            placeholder="请输入数量"
            disabled={isLoading}
          />
          {errors.quantity && (
            <p className="mt-1 text-sm text-error">{errors.quantity}</p>
          )}
        </div>

        {/* 库存变化预览 */}
        {quantity > 0 && (
          <div className="bg-surface-dark dark:bg-surface-light rounded-lg p-4">
            <h4 className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              库存变化预览
            </h4>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary-light dark:text-text-secondary-dark">
                当前库存:
              </span>
              <span className="font-medium text-text-primary-light dark:text-text-primary-dark">
                {wine.current_stock}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-text-secondary-light dark:text-text-secondary-dark">
                操作数量:
              </span>
              <span
                className={`font-medium ${
                  transactionType === "in" ? "text-accent" : "text-error"
                }`}
              >
                {getStockChangeText()}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1 pt-2 border-t border-border-light dark:border-border-dark">
              <span className="text-text-secondary-light dark:text-text-secondary-dark">
                操作后库存:
              </span>
              <span
                className={`font-semibold ${
                  getProjectedStock() < wine.low_stock_threshold
                    ? "text-error"
                    : getProjectedStock() === 0
                    ? "text-warning"
                    : "text-accent"
                }`}
              >
                {getProjectedStock()}
              </span>
            </div>

            {/* 库存状态警告 */}
            {getProjectedStock() === 0 && (
              <div className="mt-2 p-2 bg-error/10 border border-error/20 rounded-md">
                <p className="text-xs text-error">
                  ⚠️ 操作后库存将为0，请谨慎操作
                </p>
              </div>
            )}

            {getProjectedStock() < wine.low_stock_threshold &&
              getProjectedStock() > 0 && (
                <div className="mt-2 p-2 bg-warning/10 border border-warning/20 rounded-md">
                  <p className="text-xs text-warning">
                    ⚠️ 操作后库存将低于阈值 ({wine.low_stock_threshold})
                  </p>
                </div>
              )}
          </div>
        )}

        {/* 操作原因 */}
        <div>
          <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
            操作原因 <span className="text-error">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (errors.reason) {
                setErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors.reason;
                  return newErrors;
                });
              }
            }}
            rows={3}
            className={`
              w-full px-3 py-2 rounded-lg border
              bg-surface-light dark:bg-surface-dark
              text-text-primary-light dark:text-text-primary-dark
              placeholder-text-secondary-light dark:placeholder-text-secondary-dark
              focus:ring-2 focus:ring-primary focus:border-transparent
              transition-colors duration-200 resize-none
              ${
                errors.reason
                  ? "border-error"
                  : "border-border-light dark:border-border-dark"
              }
            `}
            placeholder="请填写操作原因"
            disabled={isLoading}
          />
          {errors.reason && (
            <p className="mt-1 text-sm text-error">{errors.reason}</p>
          )}
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
            className={`
              px-4 py-2 rounded-lg text-white font-medium
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-200
              flex items-center gap-2
              ${
                transactionType === "in"
                  ? "bg-accent hover:bg-accent/90"
                  : "bg-error hover:bg-error/90"
              }
            `}
          >
            {isLoading && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            <span>{transactionType === "in" ? "确认入库" : "确认出库"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default StockTransactionModal;
