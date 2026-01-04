import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const Card: React.FC<CardProps> = ({
  children,
  className = "",
  hover = false,
  padding = "md",
}) => {
  const paddingClasses = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  const baseClasses =
    "bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg shadow-sm";

  const hoverClasses = hover
    ? "hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    : "";

  const classes =
    `${baseClasses} ${paddingClasses[padding]} ${hoverClasses} ${className}`.trim();

  return <div className={classes}>{children}</div>;
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = "",
}) => {
  return (
    <div
      className={`mb-4 pb-3 border-b border-border-light dark:border-border-dark ${className}`}
    >
      {children}
    </div>
  );
};

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

const CardTitle: React.FC<CardTitleProps> = ({ children, className = "" }) => {
  return (
    <h3
      className={`text-lg font-semibold text-text-primary-light dark:text-text-primary-dark ${className}`}
    >
      {children}
    </h3>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

const CardContent: React.FC<CardContentProps> = ({
  children,
  className = "",
}) => {
  return <div className={className}>{children}</div>;
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = "",
}) => {
  return (
    <div
      className={`mt-4 pt-3 border-t border-border-light dark:border-border-dark ${className}`}
    >
      {children}
    </div>
  );
};

// Export components
export default Object.assign(Card, {
  Header: CardHeader,
  Title: CardTitle,
  Content: CardContent,
  Footer: CardFooter,
});
