import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  type = 'danger',
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const iconColors = {
    danger: 'text-red-600 dark:text-red-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    info: 'text-blue-600 dark:text-blue-400',
  };

  const buttonClasses = {
    danger: 'btn-danger',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium',
    info: 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 ${iconColors[type]}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <p className="text-gray-700 dark:text-gray-300">{message}</p>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button onClick={onClose} className="btn-secondary">
            {cancelText}
          </button>
          <button onClick={handleConfirm} className={buttonClasses[type]}>
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
