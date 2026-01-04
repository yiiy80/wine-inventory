import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastProps extends ToastMessage {
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose(id), 300); // Wait for fade out animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, id, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300);
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-accent" />;
      case "error":
        return <XCircle className="w-5 h-5 text-error" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-warning" />;
      case "info":
        return <Info className="w-5 h-5 text-info" />;
      default:
        return <Info className="w-5 h-5 text-info" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case "success":
        return "border-accent";
      case "error":
        return "border-error";
      case "warning":
        return "border-warning";
      case "info":
        return "border-info";
      default:
        return "border-info";
    }
  };

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg border-l-4
        bg-surface-light dark:bg-surface-dark
        border-border-light dark:border-border-dark
        shadow-lg
        transition-all duration-300 ease-out
        ${
          isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"
        }
        ${getBorderColor()}
      `}
      role="alert"
    >
      <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>

      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark mb-1">
            {title}
          </h4>
        )}
        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
          {message}
        </p>
      </div>

      <button
        onClick={handleClose}
        className="
          flex-shrink-0 p-1 rounded-md
          text-text-secondary-light dark:text-text-secondary-dark
          hover:bg-surface-dark dark:hover:bg-surface-light
          hover:text-text-primary-light dark:hover:text-text-primary-dark
          transition-colors duration-200
        "
        aria-label="关闭通知"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
