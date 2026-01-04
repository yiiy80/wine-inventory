import React from "react";
import { FileX, Package, AlertCircle, Search } from "lucide-react";

export type EmptyStateIcon = "file" | "package" | "alert" | "search";

interface EmptyStateProps {
  icon?: EmptyStateIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = "file",
  title,
  description,
  action,
  className = "",
}) => {
  const getIcon = () => {
    const iconClass =
      "w-12 h-12 text-text-secondary-light dark:text-text-secondary-dark mb-4";

    switch (icon) {
      case "file":
        return <FileX className={iconClass} />;
      case "package":
        return <Package className={iconClass} />;
      case "alert":
        return <AlertCircle className={iconClass} />;
      case "search":
        return <Search className={iconClass} />;
      default:
        return <FileX className={iconClass} />;
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
    >
      {getIcon()}

      <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-6 max-w-md">
          {description}
        </p>
      )}

      {action && <div className="flex justify-center">{action}</div>}
    </div>
  );
};

export default EmptyState;
