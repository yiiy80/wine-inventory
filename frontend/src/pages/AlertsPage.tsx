import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Package, RefreshCw, Eye, Plus } from "lucide-react";
import { wineAPI } from "../services/api";
import { Wine } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import StockTransactionModal from "../components/StockTransactionModal";
import { useToast } from "../contexts/ToastContext";
import toast from "react-hot-toast";

const AlertsPage: React.FC = () => {
  const [lowStockWines, setLowStockWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alertStats, setAlertStats] = useState({
    low_stock: 0,
    out_of_stock: 0,
    critical: 0,
  });

  const [selectedWine, setSelectedWine] = useState<Wine | null>(null);
  const [showStockModal, setShowStockModal] = useState(false);

  const { showToast } = useToast();

  const loadAlerts = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      else setRefreshing(true);

      const lowStockResponse = await wineAPI.getLowStockWines();

      setLowStockWines(lowStockResponse);

      // 计算预警统计
      const stats = {
        low_stock: lowStockResponse.filter(
          (wine) =>
            wine.current_stock > 0 &&
            wine.current_stock <= wine.low_stock_threshold
        ).length,
        out_of_stock: lowStockResponse.filter(
          (wine) => wine.current_stock === 0
        ).length,
        critical: lowStockResponse.filter(
          (wine) =>
            wine.current_stock > 0 &&
            wine.current_stock <= wine.low_stock_threshold * 0.5
        ).length,
      };
      setAlertStats(stats);
    } catch (error: any) {
      toast.error("加载预警数据失败");
      console.error("Load alerts error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleRefresh = () => {
    loadAlerts(false);
  };

  const handleQuickStockIn = (wine: Wine) => {
    setSelectedWine(wine);
    setShowStockModal(true);
  };

  const handleStockTransaction = async (_data: {
    wineId: number;
    type: "in" | "out";
    quantity: number;
    reason: string;
  }) => {
    // 这里可以调用出入库API
    showToast("success", "库存操作成功");
    loadAlerts(false); // 重新加载数据
  };

  const getAlertSeverity = (wine: Wine) => {
    if (wine.current_stock === 0) {
      return { level: "critical", label: "缺货", color: "error" as const };
    } else if (wine.current_stock <= wine.low_stock_threshold * 0.5) {
      return { level: "critical", label: "严重不足", color: "error" as const };
    } else {
      return { level: "warning", label: "库存偏低", color: "warning" as const };
    }
  };

  const getStockPercentage = (wine: Wine) => {
    return Math.min((wine.current_stock / wine.low_stock_threshold) * 100, 100);
  };

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
            库存预警
          </h1>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">
            监控低库存红酒，及时补货
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
          刷新数据
        </Button>
      </div>

      {/* 预警统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-warning">
          <Card.Content className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
                  库存偏低
                </p>
                <p className="text-2xl font-bold text-warning">
                  {alertStats.low_stock}
                </p>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
                  需要关注
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-warning opacity-75" />
            </div>
          </Card.Content>
        </Card>

        <Card className="border-l-4 border-l-error">
          <Card.Content className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
                  严重不足
                </p>
                <p className="text-2xl font-bold text-error">
                  {alertStats.critical}
                </p>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
                  紧急补货
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-error opacity-75" />
            </div>
          </Card.Content>
        </Card>

        <Card className="border-l-4 border-l-error">
          <Card.Content className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
                  缺货
                </p>
                <p className="text-2xl font-bold text-error">
                  {alertStats.out_of_stock}
                </p>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
                  已无库存
                </p>
              </div>
              <Package className="w-8 h-8 text-error opacity-75" />
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* 预警列表 */}
      <Card>
        <Card.Header>
          <Card.Title>预警红酒列表</Card.Title>
        </Card.Header>
        <Card.Content>
          {lowStockWines.length === 0 ? (
            <EmptyState
              icon="alert"
              title="暂无库存预警"
              description="所有红酒库存都处于正常水平"
            />
          ) : (
            <div className="space-y-4">
              {/* 桌面端表格 */}
              <div className="hidden lg:block">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-border-light dark:border-border-dark">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-text-secondary-light dark:text-text-secondary-dark">
                          红酒信息
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-text-secondary-light dark:text-text-secondary-dark">
                          库存状态
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-text-secondary-light dark:text-text-secondary-dark">
                          当前库存
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-text-secondary-light dark:text-text-secondary-dark">
                          预警阈值
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-text-secondary-light dark:text-text-secondary-dark">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light dark:divide-border-dark">
                      {lowStockWines.map((wine) => {
                        const alertInfo = getAlertSeverity(wine);
                        const stockPercentage = getStockPercentage(wine);

                        return (
                          <tr
                            key={wine.id}
                            className="hover:bg-surface-dark dark:hover:bg-surface-light"
                          >
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-3">
                                {wine.image_url && (
                                  <img
                                    src={wine.image_url}
                                    alt={wine.name}
                                    className="w-10 h-10 rounded object-cover"
                                  />
                                )}
                                <div>
                                  <div className="font-medium text-text-primary-light dark:text-text-primary-dark">
                                    {wine.name}
                                  </div>
                                  <div className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                    {wine.region} • {wine.vintage_year}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <Badge variant={alertInfo.color}>
                                {alertInfo.label}
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">
                                  {wine.current_stock}
                                </span>
                                <div className="flex-1 min-w-20 bg-surface-dark dark:bg-surface-light rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      stockPercentage > 50
                                        ? "bg-warning"
                                        : stockPercentage > 0
                                        ? "bg-error"
                                        : "bg-error"
                                    }`}
                                    style={{
                                      width: `${Math.max(stockPercentage, 5)}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-text-secondary-light dark:text-text-secondary-dark">
                                {wine.low_stock_threshold}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-2">
                                <Link
                                  to={`/wines/${wine.id}`}
                                  className="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-600 p-2 rounded-lg hover:bg-surface-dark dark:hover:bg-surface-light transition-colors"
                                  title="查看详情"
                                >
                                  <Eye className="w-4 h-4" />
                                </Link>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleQuickStockIn(wine)}
                                  className="flex items-center gap-1"
                                >
                                  <Plus className="w-4 h-4" />
                                  入库
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 移动端卡片 */}
              <div className="lg:hidden space-y-3">
                {lowStockWines.map((wine) => {
                  const alertInfo = getAlertSeverity(wine);
                  const stockPercentage = getStockPercentage(wine);

                  return (
                    <div
                      key={wine.id}
                      className="border border-border-light dark:border-border-dark rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3 flex-1">
                          {wine.image_url && (
                            <img
                              src={wine.image_url}
                              alt={wine.name}
                              className="w-12 h-12 rounded object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="font-medium text-text-primary-light dark:text-text-primary-dark">
                              {wine.name}
                            </h3>
                            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                              {wine.region} • {wine.vintage_year}
                            </p>
                          </div>
                        </div>
                        <Badge variant={alertInfo.color}>
                          {alertInfo.label}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                            当前库存
                          </span>
                          <span className="font-medium">
                            {wine.current_stock}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                            预警阈值
                          </span>
                          <span className="text-text-secondary-light dark:text-text-secondary-dark">
                            {wine.low_stock_threshold}
                          </span>
                        </div>

                        <div className="w-full bg-surface-dark dark:bg-surface-light rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              stockPercentage > 50
                                ? "bg-warning"
                                : stockPercentage > 0
                                ? "bg-error"
                                : "bg-error"
                            }`}
                            style={{
                              width: `${Math.max(stockPercentage, 5)}%`,
                            }}
                          />
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Link to={`/wines/${wine.id}`} className="flex-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                            >
                              查看详情
                            </Button>
                          </Link>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleQuickStockIn(wine)}
                            className="flex-1"
                          >
                            立即入库
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card.Content>
      </Card>

      {/* 出入库模态框 */}
      <StockTransactionModal
        isOpen={showStockModal}
        onClose={() => setShowStockModal(false)}
        onSubmit={handleStockTransaction}
        wine={selectedWine}
      />
    </div>
  );
};

export default AlertsPage;
