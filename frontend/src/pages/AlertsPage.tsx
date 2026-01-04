import React from "react";

const AlertsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-text-primary-light dark:text-text-primary-dark">
          库存预警
        </h1>
        <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">
          监控低库存红酒
        </p>
      </div>
      <div className="card">
        <div className="card-content">
          <div className="text-center py-12">
            <p className="text-text-secondary-light dark:text-text-secondary-dark">
              库存预警页面开发中...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertsPage;
