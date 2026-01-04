import React, { forwardRef } from "react";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = true,
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const textareaId =
      id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    const textareaClasses = `
      px-3 py-2 rounded-lg border transition-colors duration-200 resize-none
      bg-surface-light dark:bg-surface-dark
      text-text-primary-light dark:text-text-primary-dark
      placeholder-text-secondary-light dark:placeholder-text-secondary-dark
      focus:ring-2 focus:ring-primary focus:border-transparent
      disabled:opacity-50 disabled:cursor-not-allowed
      ${
        error
          ? "border-error focus:ring-error"
          : "border-border-light dark:border-border-dark"
      }
      ${fullWidth ? "w-full" : ""}
      ${className}
    `.trim();

    return (
      <div className={fullWidth ? "w-full" : ""}>
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          className={textareaClasses}
          {...props}
        />

        {error && <p className="mt-1 text-sm text-error">{error}</p>}

        {helperText && !error && (
          <p className="mt-1 text-sm text-text-secondary-light dark:text-text-secondary-dark">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;
