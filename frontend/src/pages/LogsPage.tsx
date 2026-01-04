import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  RefreshCw,
  User,
  Activity,
  Database,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Clock,
  Globe,
} from "lucide-react";
import { logAPI, userAPI } from "../services/api";
import { OperationLog, LogListResponse, User as UserType } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import Pagination from "../components/ui/Pagination";
import Select from "../components/ui/Select";
import toast from "react-hot-toast";

const LogsPage: React.FC = () => {
  const [logs, setLogs] = useState<OperationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 筛选和分页状态
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<number | "">("");
  const [actionType, setActionType] = useState("");
  const [entityType, setEntityType] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [pageSize] = useState(20);

  // 排序状态
  const [sortConfig, setSortConfig] = useState<{
    field: string;
    order: "asc" | "desc";
  }>({ field: "created_at", order: "desc" });

  // 选项数据
  const [users, setUsers] = useState<UserType[]>([]);
  const [actionTypes, setActionTypes] = useState<string[]>([]);
  const [entityTypes, setEntityTypes] = useState<string[]>([]);

  const loadLogs = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      else setRefreshing(true);

      const params = {
        page: currentPage,
        page_size: pageSize,
        search: searchTerm || undefined,
        user_id: selectedUser || undefined,
        action_type: actionType || undefined,
        entity_type: entityType || undefined,
        date_range: dateRange || undefined,
        sort_field: sortConfig.field,
        sort_order: sortConfig.order,
      };

      const response: LogListResponse = await logAPI.getLogs(params);
      setLogs(response.items);
      setTotalPages(response.total_pages);
      setTotalLogs(response.total);
    } catch (error: any) {
      toast.error("加载操作日志失败");
      console.error("Load logs error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadFilterOptions = async () => {
    try {
      // 加载用户列表（用于筛选）
      const usersResponse = await userAPI.getUsers({ page_size: 1000 });
      setUsers(usersResponse.items);

      // 这里可以从API获取操作类型和实体类型选项
      // 暂时使用静态数据
      setActionTypes([
        "CREATE",
        "UPDATE",
        "DELETE",
        "LOGIN",
        "LOGOUT",
        "EXPORT",
        "IMPORT",
        "STOCK_IN",
        "STOCK_OUT",
      ]);
      setEntityTypes(["wine", "user", "transaction", "system"]);
    } catch (error) {
      console.error("Load filter options error:", error);
    }
  };

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    loadLogs();
  }, [
    currentPage,
    searchTerm,
    selectedUser,
    actionType,
    entityType,
    dateRange,
    sortConfig,
  ]);

  const handleRefresh = () => {
    loadLogs(false);
  };

  const handleSort = (field: string) => {
    setSortConfig((prev) => ({
      field,
      order: prev.field === field && prev.order === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1); // 重置到第一页
  };

  const getSortIcon = (field: string) => {
    if (sortConfig.field !== field) {
      return <ArrowUpDown className="w-4 h-4 opacity-50" />;
    }
    return sortConfig.order === "asc" ? (
      <ArrowUp className="w-4 h-4" />
    ) : (
      <ArrowDown className="w-4 h-4" />
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedUser("");
    setActionType("");
    setEntityType("");
    setDateRange("");
    setCurrentPage(1);
  };

  const getActionTypeBadgeVariant = (actionType: string) => {
    switch (actionType.toLowerCase()) {
      case "create":
        return "success";
      case "update":
        return "info";
      case "delete":
        return "error";
      case "login":
        return "success";
      case "logout":
        return "secondary";
      case "export":
        return "info";
      case "import":
        return "success";
      case "stock_in":
        return "success";
      case "stock_out":
        return "warning";
      default:
        return "default";
    }
  };

  const getActionTypeLabel = (actionType: string) => {
    const labels: { [key: string]: string } = {
      CREATE: "创建",
      UPDATE: "更新",
      DELETE: "删除",
      LOGIN: "登录",
      LOGOUT: "登出",
      EXPORT: "导出",
      IMPORT: "导入",
      STOCK_IN: "入库",
      STOCK_OUT: "出库",
    };
    return labels[actionType] || actionType;
  };

  const getEntityTypeLabel = (entityType: string) => {
    const labels: { [key: string]: string } = {
      wine: "红酒",
      user: "用户",
      transaction: "交易",
      system: "系统",
    };
    return labels[entityType] || entityType;
  };

  const userOptions = users.map((user) => ({
    value: user.id,
    label: user.name || user.email,
  }));

  const actionTypeOptions = actionTypes.map((type) => ({
    value: type,
    label: getActionTypeLabel(type),
  }));

  const entityTypeOptions = entityTypes.map((type) => ({
    value: type,
    label: getEntityTypeLabel(type),
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary-light dark:text-text-primary-dark">
            操作日志
          </h1>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">
            查看系统操作记录和审计日志
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={handleRefresh}
          loading={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw
            className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
          />
          刷新日志
        </Button>
      </div>

      {/* 筛选区域 */}
      <Card>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* 搜索框 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary-light dark:text-text-secondary-dark" />
              <input
                type="text"
                placeholder="搜索日志内容..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-surface-light dark:bg-surface-dark text-text-primary-light dark:text-text-primary-dark placeholder-text-secondary-light dark:placeholder-text-secondary-dark focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              />
            </div>

            {/* 用户筛选 */}
            <Select
              value={selectedUser}
              onChange={(value) => setSelectedUser(value as number | "")}
              placeholder="选择用户"
              options={[{ value: "", label: "所有用户" }, ...userOptions]}
            />

            {/* 操作类型筛选 */}
            <Select
              value={actionType}
              onChange={(value) => setActionType(value as string)}
              placeholder="选择操作"
              options={[{ value: "", label: "所有操作" }, ...actionTypeOptions]}
            />

            {/* 实体类型筛选 */}
            <Select
              value={entityType}
              onChange={(value) => setEntityType(value as string)}
              placeholder="选择实体"
              options={[{ value: "", label: "所有实体" }, ...entityTypeOptions]}
            />

            {/* 日期筛选 */}
            <input
              type="date"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-surface-light dark:bg-surface-dark text-text-primary-light dark:text-text-primary-dark focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              placeholder="选择日期"
            />

            {/* 清除筛选 */}
            <Button
              variant="outline"
              onClick={clearFilters}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              清除筛选
            </Button>
          </div>
        </Card.Content>
      </Card>

      {/* 日志列表 */}
      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <Card.Title>操作日志 ({totalLogs})</Card.Title>
            <div className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              共 {totalLogs} 条记录
            </div>
          </div>
        </Card.Header>
        <Card.Content>
          {logs.length === 0 ? (
            <EmptyState
              icon="file"
              title="暂无操作日志"
              description="系统中还没有任何操作记录"
            />
          ) : (
            <>
              {/* 桌面端表格 */}
              <div className="hidden lg:block">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-border-light dark:border-border-dark">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-text-secondary-light dark:text-text-secondary-dark">
                          操作信息
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-text-secondary-light dark:text-text-secondary-dark">
                          操作类型
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-text-secondary-light dark:text-text-secondary-dark">
                          实体类型
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-text-secondary-light dark:text-text-secondary-dark">
                          操作详情
                        </th>
                        <th
                          className="text-left py-3 px-4 font-medium text-text-secondary-light dark:text-text-secondary-dark cursor-pointer hover:bg-surface-dark dark:hover:bg-surface-light transition-colors"
                          onClick={() => handleSort("created_at")}
                        >
                          <div className="flex items-center gap-2">
                            操作时间
                            {getSortIcon("created_at")}
                          </div>
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-text-secondary-light dark:text-text-secondary-dark">
                          IP地址
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light dark:divide-border-dark">
                      {logs.map((log) => (
                        <tr
                          key={log.id}
                          className="hover:bg-surface-dark dark:hover:bg-surface-light transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <Activity className="w-8 h-8 text-text-secondary-light dark:text-text-secondary-dark" />
                              <div>
                                <div className="flex items-center gap-2">
                                  <div className="font-medium text-text-primary-light dark:text-text-primary-dark">
                                    {log.user_name || "未知用户"}
                                  </div>
                                  {log.user_id && (
                                    <div className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                      ID: {log.user_id}
                                    </div>
                                  )}
                                </div>
                                <div className="text-sm text-text-secondary-light dark:text-text-secondary-dark flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {log.user_name || "系统"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge
                              variant={getActionTypeBadgeVariant(
                                log.action_type
                              )}
                            >
                              {getActionTypeLabel(log.action_type)}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center text-sm">
                              <Database className="w-4 h-4 mr-1 text-text-secondary-light dark:text-text-secondary-dark" />
                              {getEntityTypeLabel(log.entity_type || "")}
                              {log.entity_id && (
                                <span className="ml-1 text-text-secondary-light dark:text-text-secondary-dark">
                                  #{log.entity_id}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="max-w-xs">
                              <span className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
                                {log.details || "无详情"}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center text-sm">
                              <Clock className="w-4 h-4 mr-1 text-text-secondary-light dark:text-text-secondary-dark" />
                              {new Date(log.created_at).toLocaleString("zh-CN")}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center text-sm">
                              <Globe className="w-4 h-4 mr-1 text-text-secondary-light dark:text-text-secondary-dark" />
                              {log.ip_address || "未知"}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 移动端卡片 */}
              <div className="lg:hidden space-y-3">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="border border-border-light dark:border-border-dark rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3 flex-1">
                        <Activity className="w-8 h-8 text-text-secondary-light dark:text-text-secondary-dark" />
                        <div className="flex-1">
                          <h3 className="font-medium text-text-primary-light dark:text-text-primary-dark">
                            {log.user_name || "未知用户"}
                          </h3>
                          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {getActionTypeLabel(log.action_type)}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={getActionTypeBadgeVariant(log.action_type)}
                      >
                        {getActionTypeLabel(log.action_type)}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-text-secondary-light dark:text-text-secondary-dark">
                          实体类型:
                        </span>
                        <span>
                          {getEntityTypeLabel(log.entity_type || "")}
                          {log.entity_id && ` #${log.entity_id}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary-light dark:text-text-secondary-dark">
                          操作时间:
                        </span>
                        <span>
                          {new Date(log.created_at).toLocaleString("zh-CN")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary-light dark:text-text-secondary-dark">
                          IP地址:
                        </span>
                        <span>{log.ip_address || "未知"}</span>
                      </div>
                      {log.details && (
                        <div>
                          <span className="text-text-secondary-light dark:text-text-secondary-dark">
                            操作详情:
                          </span>
                          <p className="mt-1 text-text-primary-light dark:text-text-primary-dark">
                            {log.details}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    showInfo
                    totalItems={totalLogs}
                    itemsPerPage={pageSize}
                  />
                </div>
              )}
            </>
          )}
        </Card.Content>
      </Card>
    </div>
  );
};

export default LogsPage;
