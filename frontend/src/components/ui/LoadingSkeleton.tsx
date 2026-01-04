import React from "react";

interface LoadingSkeletonProps {
  className?: string;
  variant?: "text" | "rectangular" | "circular";
  width?: string | number;
  height?: string | number;
  lines?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className = "",
  variant = "rectangular",
  width,
  height,
  lines = 1,
}) => {
  const baseClasses =
    "animate-pulse bg-surface-dark dark:bg-surface-light rounded";

  const getVariantClasses = () => {
    switch (variant) {
      case "text":
        return "h-4";
      case "circular":
        return "rounded-full";
      case "rectangular":
      default:
        return "";
    }
  };

  const getSizeClasses = () => {
    const classes = [];

    if (width) {
      classes.push(typeof width === "number" ? `w-${width}` : `w-[${width}]`);
    }

    if (height) {
      classes.push(
        typeof height === "number" ? `h-${height}` : `h-[${height}]`
      );
    }

    return classes.join(" ");
  };

  if (lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${getVariantClasses()} ${getSizeClasses()}`}
            style={{
              width: !width
                ? index === lines - 1
                  ? "60%"
                  : "100%"
                : undefined,
              height: height || "1rem",
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${getVariantClasses()} ${getSizeClasses()} ${className}`}
      style={{
        width: width || "100%",
        height: height || (variant === "text" ? "1rem" : "2rem"),
      }}
    />
  );
};

// 预定义的骨架屏组件
const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 1,
  className = "",
}) => <LoadingSkeleton variant="text" lines={lines} className={className} />;

const SkeletonCard: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`space-y-3 p-4 ${className}`}>
    <LoadingSkeleton variant="rectangular" height="1.5rem" width="60%" />
    <LoadingSkeleton variant="rectangular" height="1rem" width="100%" />
    <LoadingSkeleton variant="rectangular" height="1rem" width="80%" />
  </div>
);

const SkeletonTable: React.FC<{
  rows?: number;
  cols?: number;
  className?: string;
}> = ({ rows = 5, cols = 4, className = "" }) => (
  <div className={`space-y-3 ${className}`}>
    {/* Table header */}
    <div className="flex space-x-4">
      {Array.from({ length: cols }).map((_, colIndex) => (
        <LoadingSkeleton
          key={`header-${colIndex}`}
          variant="rectangular"
          height="2rem"
          className="flex-1"
        />
      ))}
    </div>

    {/* Table rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={`row-${rowIndex}`} className="flex space-x-4">
        {Array.from({ length: cols }).map((_, colIndex) => (
          <LoadingSkeleton
            key={`cell-${rowIndex}-${colIndex}`}
            variant="rectangular"
            height="2.5rem"
            className="flex-1"
          />
        ))}
      </div>
    ))}
  </div>
);

export default Object.assign(LoadingSkeleton, {
  Text: SkeletonText,
  Card: SkeletonCard,
  Table: SkeletonTable,
});
