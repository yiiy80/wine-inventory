import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Minus,
  Search,
  Filter,
  RefreshCw,
  Package,
  Eye,
  Calendar,
  User,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { inventoryAPI, wineAPI } from "../services/api";
import { InventoryTransaction, Wine, TransactionListResponse } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import Pagination from "../components/ui/Pagination";
import Select from "../components/ui/Select";
import StockTransactionModal from "../components/StockTransactionModal";
import { useToast } from "../contexts/ToastContext";
import toast from "react-hot-toast";

const InventoryPage: React.FC = () => {
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 筛选和分页状态
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWine, setSelectedWine] = useState<number | "">("");
  const [transactionType, setTransactionType] = useState<"in" | "out" | "">("");
  const [dateRange, setDateRange] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [pageSize] = useState(20);

  // 排序状态
  const [sortConfig, setSortConfig] = useState<{
    field: string;
    order: "asc" | "desc";
  }>({ field: "created_at", order: "desc" });

  // 选项数据
  const [wines, setWines] = useState<Wine[]>([]);

  // 出入库模态框状态
  const [showStockModal, setShowStockModal] = useState(false);

  const { showToast } = useToast();

  const loadTransactions = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      else setRefreshing(true);

      const params = {
        page: currentPage,
        page_size: pageSize,
        search: searchTerm || undefined,
        wine_id: selectedWine || undefined,
        transaction_type: transactionType || undefined,
        date_range: dateRange || undefined,
        sort_field: sortConfig.field,
        sort_order: sortConfig.order,
      };

      const response: TransactionListResponse =
        await inventoryAPI.getTransactions(params);
      setTransactions(response.items);
      setTotalPages(response.total_pages);
      setTotalTransactions(response.total);
    } catch (error: any) {
      toast.error("加载出入库记录失败");
      console.error("Load transactions error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadWines = async () => {
    try {
      const response = await wineAPI.getWines({ page_size: 1000 }); // 获取所有红酒用于筛选
      setWines(response.items);
    } catch (error) {
      console.error("Load wines error:", error);
    }
  };

  useEffect(() => {
    loadWines();
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [
    currentPage,
    searchTerm,
    selectedWine,
    transactionType,
    dateRange,
    sortConfig,
  ]);

  const handleRefresh = () => {
    loadTransactions(false);
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

  const handleQuickTransaction = () => {
    setShowStockModal(true);
    // 这里可以设置默认的红酒选择，或者让用户在模态框中选择
  };

  const handleStockTransaction = async (_data: {
    wineId: number;
    type: "in" | "out";
    quantity: number;
    reason: string;
  }) => {
    // 这里可以调用出入库API
    showToast("success", "库存操作成功");
    loadTransactions(false); // 重新加载数据
  };

  const getTransactionBadgeVariant = (type: string) => {
    return type === "in" ? "success" : "error";
  };

  const getTransactionTypeLabel = (type: string) => {
    return type === "in" ? "入库" : "出库";
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedWine("");
    setTransactionType("");
    setDateRange("");
    setCurrentPage(1);
  };

  const wineOptions = wines.map((wine) => ({
    value: wine.id,
    label: wine.name,
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
            出入库管理
          </h1>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">
            管理红酒的出入库记录和库存操作
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={handleRefresh}
            loading={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            刷新
          </Button>
          <Button
            variant="primary"
            onClick={handleQuickTransaction}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            入库
          </Button>
          <Button
            variant="danger"
            onClick={handleQuickTransaction}
            className="flex items-center gap-2"
          >
            <Minus className="w-4 h-4" />
            出库
          </Button>
        </div>
      </div>

      {/* 筛选区域 */}
      <Card>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* 搜索框 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary-light dark:text-text-secondary-dark" />
              <input
                type="text"
                placeholder="搜索红酒名称..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-surface-light dark:bg-surface-dark text-text-primary-light dark:text-text-primary-dark placeholder-text-secondary-light dark:placeholder-text-secondary-dark focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              />
            </div>

            {/* 红酒筛选 */}
            <Select
              value={selectedWine}
              onChange={(value) => setSelectedWine(value as number | "")}
              placeholder="选择红酒"
              options={[{ value: "", label: "所有红酒" }, ...wineOptions]}
            />

            {/* 事务类型筛选 */}
            <Select
              value={transactionType}
              onChange={(value) =>
                setTransactionType(value as "in" | "out" | "")
              }
              placeholder="选择类型"
              options={[
                { value: "", label: "所有类型" },
                { value: "in", label: "入库" },
                { value: "out", label: "出库" },
              ]}
            />

            {/* 日期范围筛选 */}
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

      {/* 出入库记录列表 */}
      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <Card.Title>出入库记录 ({totalTransactions})</Card.Title>
            <div className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              共 {totalTransactions} 条记录
            </div>
          </div>
        </Card.Header>
        <Card.Content>
          {transactions.length === 0 ? (
            <EmptyState
              icon="package"
              title="暂无出入库记录"
              description="还没有进行任何出入库操作"
            />
          ) : (
            <>
              {/* 桌面端表格 */}
              <div className="hidden lg:block">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-border-light dark:border-border-dark">
                      <tr>
                        <th
                          className="text-left py-3 px-4 font-medium text-text-secondary-light dark:text-text-secondary-dark cursor-pointer hover:bg-surface-dark dark:hover:bg-surface-light transition-colors"
                          onClick={() => handleSort("wine_name")}
                        >
                          <div className="flex items-center gap-2">
                            红酒信息
                            {getSortIcon("wine_name")}
                          </div>
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-text-secondary-light dark:text-text-secondary-dark">
                          操作类型
                        </th>
                        <th
                          className="text-left py-3 px-4 font-medium text-text-secondary-light dark:text-text-secondary-dark cursor-pointer hover:bg-surface-dark dark:hover:bg-surface-light transition-colors"
                          onClick={() => handleSort("quantity")}
                        >
                          <div className="flex items-center gap-2">
                            数量
                            {getSortIcon("quantity")}
                          </div>
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-text-secondary-light dark:text-text-secondary-dark">
                          操作原因
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
                          操作人
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-text-secondary-light dark:text-text-secondary-dark">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light dark:divide-border-dark">
                      {transactions.map((transaction) => (
                        <tr
                          key={transaction.id}
                          className="hover:bg-surface-dark dark:hover:bg-surface-light transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <Package className="w-8 h-8 text-text-secondary-light dark:text-text-secondary-dark" />
                              <div>
                                <div className="font-medium text-text-primary-light dark:text-text-primary-dark">
                                  {transaction.wine_name || "未知红酒"}
                                </div>
                                <div className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                  ID: {transaction.wine_id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge
                              variant={getTransactionBadgeVariant(
                                transaction.transaction_type
                              )}
                            >
                              {getTransactionTypeLabel(
                                transaction.transaction_type
                              )}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`font-medium ${
                                transaction.transaction_type === "in"
                                  ? "text-success"
                                  : "text-error"
                              }`}
                            >
                              {transaction.transaction_type === "in"
                                ? "+"
                                : "-"}
                              {transaction.quantity}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-text-secondary-light dark:text-text-secondary-dark">
                              {transaction.reason || "无"}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center text-sm">
                              <Calendar className="w-4 h-4 mr-1 text-text-secondary-light dark:text-text-secondary-dark" />
                              {new Date(transaction.created_at).toLocaleString(
                                "zh-CN"
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center text-sm">
                              <User className="w-4 h-4 mr-1 text-text-secondary-light dark:text-text-secondary-dark" />
                              {transaction.performer_name || "系统"}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Link
                              to={`/wines/${transaction.wine_id}`}
                              className="text-primary-600 hover:text-primary-700 p-2 rounded-lg hover:bg-surface-dark dark:hover:bg-surface-light transition-colors"
                              title="查看红酒详情"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 移动端卡片 */}
              <div className="lg:hidden space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="border border-border-light dark:border-border-dark rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3 flex-1">
                        <Package className="w-8 h-8 text-text-secondary-light dark:text-text-secondary-dark" />
                        <div className="flex-1">
                          <h3 className="font-medium text-text-primary-light dark:text-text-primary-dark">
                            {transaction.wine_name || "未知红酒"}
                          </h3>
                          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                            ID: {transaction.wine_id}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={getTransactionBadgeVariant(
                          transaction.transaction_type
                        )}
                      >
                        {getTransactionTypeLabel(transaction.transaction_type)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-text-secondary-light dark:text-text-secondary-dark">
                          数量:
                        </span>
                        <span
                          className={`ml-2 font-medium ${
                            transaction.transaction_type === "in"
                              ? "text-success"
                              : "text-error"
                          }`}
                        >
                          {transaction.transaction_type === "in" ? "+" : "-"}
                          {transaction.quantity}
                        </span>
                      </div>
                      <div>
                        <span className="text-text-secondary-light dark:text-text-secondary-dark">
                          操作人:
                        </span>
                        <span className="ml-2">
                          {transaction.performer_name || "系统"}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-text-secondary-light dark:text-text-secondary-dark">
                          操作时间:
                        </span>
                        <span className="ml-2">
                          {new Date(transaction.created_at).toLocaleString(
                            "zh-CN"
                          )}
                        </span>
                      </div>
                      {transaction.reason && (
                        <div className="col-span-2">
                          <span className="text-text-secondary-light dark:text-text-secondary-dark">
                            操作原因:
                          </span>
                          <span className="ml-2">{transaction.reason}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-border-light dark:border-border-dark">
                      <Link
                        to={`/wines/${transaction.wine_id}`}
                        className="w-full"
                      >
                        <Button variant="outline" size="sm" className="w-full">
                          查看红酒详情
                        </Button>
                      </Link>
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
                    totalItems={totalTransactions}
                    itemsPerPage={pageSize}
                  />
                </div>
              )}
            </>
          )}
        </Card.Content>
      </Card>

      {/* 出入库模态框 */}
      <StockTransactionModal
        isOpen={showStockModal}
        onClose={() => setShowStockModal(false)}
        onSubmit={handleStockTransaction}
        wine={null}
      />
    </div>
  );
};

export default InventoryPage;
