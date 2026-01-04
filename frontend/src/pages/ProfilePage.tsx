import React from "react";

const ProfilePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-text-primary-light dark:text-text-primary-dark">
          个人设置
        </h1>
        <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">
          管理您的个人资料和账户设置
        </p>
      </div>
      <div className="card">
        <div className="card-content">
          <div className="text-center py-12">
            <p className="text-text-secondary-light dark:text-text-secondary-dark">
              个人设置页面开发中...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
