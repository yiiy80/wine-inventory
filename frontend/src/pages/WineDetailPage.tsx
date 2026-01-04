import React from "react";
import { useParams } from "react-router-dom";

const WineDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary-light dark:text-text-primary-dark">
            红酒详情
          </h1>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">
            红酒ID: {id}
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-content">
          <div className="text-center py-12">
            <p className="text-text-secondary-light dark:text-text-secondary-dark">
              红酒详情页面开发中...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WineDetailPage;
