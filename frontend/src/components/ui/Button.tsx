import React from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "outline";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  className = "",
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary:
      "bg-primary hover:bg-primary-dark text-white focus:ring-primary shadow-sm",
    secondary:
      "bg-secondary hover:bg-secondary-dark text-white focus:ring-secondary shadow-sm",
    ghost:
      "bg-transparent hover:bg-surface-dark dark:hover:bg-surface-light text-text-primary-light dark:text-text-primary-dark focus:ring-primary",
    danger: "bg-error hover:bg-error/90 text-white focus:ring-error shadow-sm",
    outline:
      "border border-border-light dark:border-border-dark bg-transparent hover:bg-surface-dark dark:hover:bg-surface-light text-text-primary-light dark:text-text-primary-dark focus:ring-primary",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2",
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};

export default Button;
