import React from "react";

export type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "secondary";
export type BadgeSize = "sm" | "md";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  size = "md",
  className = "",
}) => {
  const baseClasses = "inline-flex items-center font-medium rounded-full";

  const variantClasses = {
    default:
      "bg-surface-dark dark:bg-surface-light text-text-primary-light dark:text-text-primary-dark",
    success: "bg-accent/10 text-accent border border-accent/20",
    warning: "bg-warning/10 text-warning border border-warning/20",
    error: "bg-error/10 text-error border border-error/20",
    info: "bg-info/10 text-info border border-info/20",
    secondary: "bg-secondary/10 text-secondary border border-secondary/20",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
  };

  const classes =
    `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim();

  return <span className={classes}>{children}</span>;
};

export default Badge;
