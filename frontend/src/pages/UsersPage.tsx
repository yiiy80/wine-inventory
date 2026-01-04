import React from "react";

const UsersPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-text-primary-light dark:text-text-primary-dark">
          用户管理
        </h1>
        <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">
          管理系统用户账户
        </p>
      </div>
      <div className="card">
        <div className="card-content">
          <div className="text-center py-12">
            <p className="text-text-secondary-light dark:text-text-secondary-dark">
              用户管理页面开发中...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
