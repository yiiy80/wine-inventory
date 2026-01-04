import React from "react";
import { AlertTriangle, AlertCircle, Info, CheckCircle } from "lucide-react";
import Modal from "./Modal";

export type ConfirmDialogType = "danger" | "warning" | "info" | "success";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: ConfirmDialogType;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "warning",
  confirmText = "确认",
  cancelText = "取消",
  isLoading = false,
}) => {
  const getIcon = () => {
    switch (type) {
      case "danger":
        return <AlertTriangle className="w-6 h-6 text-error" />;
      case "warning":
        return <AlertCircle className="w-6 h-6 text-warning" />;
      case "info":
        return <Info className="w-6 h-6 text-info" />;
      case "success":
        return <CheckCircle className="w-6 h-6 text-accent" />;
      default:
        return <AlertCircle className="w-6 h-6 text-warning" />;
    }
  };

  const getConfirmButtonStyle = () => {
    switch (type) {
      case "danger":
        return "bg-error hover:bg-error/90 text-white";
      case "warning":
        return "bg-warning hover:bg-warning/90 text-white";
      case "info":
        return "bg-info hover:bg-info/90 text-white";
      case "success":
        return "bg-accent hover:bg-accent/90 text-white";
      default:
        return "bg-warning hover:bg-warning/90 text-white";
    }
  };

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="sm"
      showCloseButton={!isLoading}
    >
      <div className="text-center">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-surface-dark dark:bg-surface-light">
            {getIcon()}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
          {title}
        </h3>

        {/* Message */}
        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-6">
          {message}
        </p>

        {/* Buttons */}
        <div className="flex gap-3 justify-center">
          <button
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
            {cancelText}
          </button>

          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`
              px-4 py-2 rounded-lg text-white font-medium
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-200
              ${getConfirmButtonStyle()}
              ${isLoading ? "cursor-wait" : ""}
            `}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                处理中...
              </div>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
