import React, { useState, useRef, useEffect, forwardRef } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  value?: string | number;
  onChange?: (value: string | number) => void;
}

const Select = forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      options,
      placeholder = "请选择",
      label,
      error,
      helperText,
      fullWidth = true,
      value,
      onChange,
      disabled,
      className = "",
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((option) => option.value === value);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          selectRef.current &&
          !selectRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (option: SelectOption) => {
      if (option.disabled) return;

      onChange?.(option.value);
      setIsOpen(false);
    };

    const selectClasses = `
      relative ${fullWidth ? "w-full" : ""}
    `.trim();

    const buttonClasses = `
      w-full flex items-center justify-between
      px-3 py-2 text-left
      bg-surface-light dark:bg-surface-dark
      border rounded-lg transition-colors duration-200
      text-text-primary-light dark:text-text-primary-dark
      focus:ring-2 focus:ring-primary focus:border-transparent
      disabled:opacity-50 disabled:cursor-not-allowed
      ${
        error
          ? "border-error focus:ring-error"
          : "border-border-light dark:border-border-dark"
      }
      ${className}
    `.trim();

    const dropdownClasses = `
      absolute top-full left-0 right-0 z-50 mt-1
      bg-surface-light dark:bg-surface-dark
      border border-border-light dark:border-border-dark
      rounded-lg shadow-lg
      max-h-60 overflow-auto
      animate-in fade-in slide-in-from-top-2
    `.trim();

    return (
      <div className={selectClasses}>
        {label && (
          <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
            {label}
          </label>
        )}

        <div ref={selectRef} className="relative">
          <button
            ref={ref}
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={buttonClasses}
            {...props}
          >
            <span
              className={
                selectedOption
                  ? ""
                  : "text-text-secondary-light dark:text-text-secondary-dark"
              }
            >
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isOpen ? "transform rotate-180" : ""
              }`}
            />
          </button>

          {isOpen && (
            <div className={dropdownClasses}>
              {options.length === 0 ? (
                <div className="px-3 py-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  无选项
                </div>
              ) : (
                options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option)}
                    disabled={option.disabled}
                    className={`
                      w-full flex items-center justify-between px-3 py-2 text-left
                      hover:bg-surface-dark dark:hover:bg-surface-light
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-colors duration-150
                      ${
                        option.value === value
                          ? "bg-primary/10 text-primary"
                          : "text-text-primary-light dark:text-text-primary-dark"
                      }
                    `}
                  >
                    <span className={option.disabled ? "opacity-50" : ""}>
                      {option.label}
                    </span>
                    {option.value === value && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

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

Select.displayName = "Select";

export default Select;
