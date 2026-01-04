import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Package,
  DollarSign,
  Calendar,
  MapPin,
  Grape,
  Warehouse,
  TrendingUp,
  RefreshCw,
  Plus,
  Minus,
  Trash2,
} from "lucide-react";
import { wineAPI, inventoryAPI } from "../services/api";
import { Wine, InventoryTransaction } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import StockTransactionModal from "../components/StockTransactionModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../contexts/ToastContext";
import toast from "react-hot-toast";

const WineDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [wine, setWine] = useState<Wine | null>(null);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 模态框状态
  const [showStockModal, setShowStockModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // 统计数据
  const [stats, setStats] = useState({
    totalIn: 0,
    totalOut: 0,
    currentStock: 0,
    lastTransaction: null as InventoryTransaction | null,
  });

  const loadWineDetail = async (showLoading = true) => {
    if (!id) return;

    try {
      if (showLoading) setLoading(true);
      else setRefreshing(true);

      // 加载红酒详情
      const wineData = await wineAPI.getWine(parseInt(id));
      setWine(wineData);

      // 加载出入库记录
      const transactionsData = await inventoryAPI.getTransactions({
        wine_id: parseInt(id),
        page_size: 50, // 最近50条记录
      });
      setTransactions(transactionsData.items);

      // 计算统计数据
      const totalIn = transactionsData.items
        .filter((t) => t.transaction_type === "in")
        .reduce((sum, t) => sum + t.quantity, 0);

      const totalOut = transactionsData.items
        .filter((t) => t.transaction_type === "out")
        .reduce((sum, t) => sum + t.quantity, 0);

      const lastTransaction =
        transactionsData.items.length > 0 ? transactionsData.items[0] : null;

      setStats({
        totalIn,
        totalOut,
        currentStock: wineData.current_stock,
        lastTransaction,
      });
    } catch (error: any) {
      toast.error("加载红酒详情失败");
      console.error("Load wine detail error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadWineDetail();
  }, [id]);

  const handleRefresh = () => {
    loadWineDetail(false);
  };

  const handleQuickStockIn = () => {
    setShowStockModal(true);
  };

  const handleQuickStockOut = () => {
    setShowStockModal(true);
  };

  const handleStockTransaction = async (_data: {
    wineId: number;
    type: "in" | "out";
    quantity: number;
    reason: string;
  }) => {
    showToast("success", "库存操作成功");
    loadWineDetail(false); // 重新加载数据
  };

  const handleDeleteWine = async () => {
    if (!wine) return;

    try {
      await wineAPI.deleteWine(wine.id);
      toast.success("红酒删除成功");
      navigate("/wines");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "删除失败");
    }
  };

  const getStockStatus = (wine: Wine) => {
    if (wine.current_stock === 0) {
      return { status: "缺货", color: "error" as const };
    } else if (wine.current_stock <= wine.low_stock_threshold) {
      return { status: "库存偏低", color: "warning" as const };
    } else {
      return { status: "库存正常", color: "success" as const };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("zh-CN");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!wine) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary-light dark:text-text-secondary-dark">
          红酒不存在或已被删除
        </p>
        <Link to="/wines" className="btn btn-primary mt-4">
          返回红酒列表
        </Link>
      </div>
    );
  }

  const stockStatus = getStockStatus(wine);

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/wines"
            className="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-600 p-2 rounded-lg hover:bg-surface-dark dark:hover:bg-surface-light transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold text-text-primary-light dark:text-text-primary-dark">
              {wine.name}
            </h1>
            <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">
              红酒详情 • ID: {wine.id}
            </p>
          </div>
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
            onClick={() => navigate(`/wines/${wine.id}/edit`)}
            className="flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            编辑
          </Button>
          <Button
            variant="danger"
            onClick={() => setShowDeleteDialog(true)}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            删除
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 红酒信息 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 基本信息卡片 */}
          <Card>
            <Card.Header>
              <Card.Title>基本信息</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 红酒图片 */}
                <div className="flex justify-center">
                  {wine.image_url ? (
                    <img
                      src={wine.image_url}
                      alt={wine.name}
                      className="w-full max-w-sm h-64 object-cover rounded-lg shadow-sm"
                    />
                  ) : (
                    <div className="w-full max-w-sm h-64 bg-surface-dark dark:bg-surface-light rounded-lg flex items-center justify-center">
                      <Package className="w-16 h-16 text-text-secondary-light dark:text-text-secondary-dark" />
                    </div>
                  )}
                </div>

                {/* 详细信息 */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-text-secondary-light dark:text-text-secondary-dark" />
                      <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        年份
                      </span>
                    </div>
                    <span className="font-medium">{wine.vintage_year}</span>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-text-secondary-light dark:text-text-secondary-dark" />
                      <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        产区
                      </span>
                    </div>
                    <span className="font-medium">{wine.region}</span>

                    {wine.grape_variety && (
                      <>
                        <div className="flex items-center gap-2">
                          <Grape className="w-4 h-4 text-text-secondary-light dark:text-text-secondary-dark" />
                          <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                            葡萄品种
                          </span>
                        </div>
                        <span className="font-medium">
                          {wine.grape_variety}
                        </span>
                      </>
                    )}

                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-text-secondary-light dark:text-text-secondary-dark" />
                      <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        价格
                      </span>
                    </div>
                    <span className="font-medium">
                      ¥{wine.price?.toLocaleString() || "未设置"}
                    </span>

                    <div className="flex items-center gap-2">
                      <Warehouse className="w-4 h-4 text-text-secondary-light dark:text-text-secondary-dark" />
                      <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        存储位置
                      </span>
                    </div>
                    <span className="font-medium">
                      {wine.storage_location || "未设置"}
                    </span>
                  </div>

                  {wine.supplier && (
                    <div>
                      <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        供应商:
                      </span>
                      <span className="ml-2 font-medium">{wine.supplier}</span>
                    </div>
                  )}

                  {wine.notes && (
                    <div>
                      <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        备注:
                      </span>
                      <p className="mt-1 text-sm text-text-primary-light dark:text-text-primary-dark">
                        {wine.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card.Content>
          </Card>

          {/* 出入库记录 */}
          <Card>
            <Card.Header>
              <Card.Title>出入库记录</Card.Title>
            </Card.Header>
            <Card.Content>
              {transactions.length === 0 ? (
                <EmptyState
                  icon="package"
                  title="暂无出入库记录"
                  description="这瓶红酒还没有进行过出入库操作"
                />
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 10).map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 bg-surface-dark dark:bg-surface-light rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            transaction.transaction_type === "in"
                              ? "bg-success/10"
                              : "bg-error/10"
                          }`}
                        >
                          {transaction.transaction_type === "in" ? (
                            <Plus className="w-4 h-4 text-success" />
                          ) : (
                            <Minus className="w-4 h-4 text-error" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {transaction.transaction_type === "in"
                              ? "入库"
                              : "出库"}{" "}
                            {transaction.quantity} 瓶
                          </p>
                          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                            {formatDate(transaction.created_at)}
                            {transaction.performer_name &&
                              ` • ${transaction.performer_name}`}
                          </p>
                        </div>
                      </div>
                      {transaction.reason && (
                        <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark max-w-32 truncate">
                          {transaction.reason}
                        </span>
                      )}
                    </div>
                  ))}

                  {transactions.length > 10 && (
                    <div className="text-center pt-2">
                      <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        显示最近10条记录，共{transactions.length}条
                      </span>
                    </div>
                  )}
                </div>
              )}
            </Card.Content>
          </Card>
        </div>

        {/* 侧边栏 */}
        <div className="space-y-6">
          {/* 库存状态 */}
          <Card>
            <Card.Header>
              <Card.Title className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                库存状态
              </Card.Title>
            </Card.Header>
            <Card.Content className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark mb-1">
                  {wine.current_stock}
                </div>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  当前库存
                </p>
              </div>

              <Badge
                variant={stockStatus.color}
                className="w-full justify-center"
              >
                {stockStatus.status}
              </Badge>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary-light dark:text-text-secondary-dark">
                    预警阈值
                  </span>
                  <span>{wine.low_stock_threshold}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary-light dark:text-text-secondary-dark">
                    累计入库
                  </span>
                  <span className="text-success">+{stats.totalIn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary-light dark:text-text-secondary-dark">
                    累计出库
                  </span>
                  <span className="text-error">-{stats.totalOut}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleQuickStockIn}
                  className="flex-1"
                >
                  入库
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleQuickStockOut}
                  className="flex-1"
                >
                  出库
                </Button>
              </div>
            </Card.Content>
          </Card>

          {/* 最新操作 */}
          {stats.lastTransaction && (
            <Card>
              <Card.Header>
                <Card.Title className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  最新操作
                </Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="text-center">
                  <div
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium mb-2 ${
                      stats.lastTransaction.transaction_type === "in"
                        ? "bg-success/10 text-success"
                        : "bg-error/10 text-error"
                    }`}
                  >
                    {stats.lastTransaction.transaction_type === "in" ? (
                      <Plus className="w-3 h-3" />
                    ) : (
                      <Minus className="w-3 h-3" />
                    )}
                    {stats.lastTransaction.transaction_type === "in"
                      ? "入库"
                      : "出库"}{" "}
                    {stats.lastTransaction.quantity} 瓶
                  </div>
                  <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                    {formatDate(stats.lastTransaction.created_at)}
                  </p>
                  {stats.lastTransaction.reason && (
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
                      {stats.lastTransaction.reason}
                    </p>
                  )}
                </div>
              </Card.Content>
            </Card>
          )}

          {/* 系统信息 */}
          <Card>
            <Card.Header>
              <Card.Title>系统信息</Card.Title>
            </Card.Header>
            <Card.Content className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary-light dark:text-text-secondary-dark">
                  创建时间
                </span>
                <span>{formatDate(wine.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary-light dark:text-text-secondary-dark">
                  最后更新
                </span>
                <span>{formatDate(wine.updated_at)}</span>
              </div>
              {wine.created_by && (
                <div className="flex justify-between">
                  <span className="text-text-secondary-light dark:text-text-secondary-dark">
                    创建者ID
                  </span>
                  <span>{wine.created_by}</span>
                </div>
              )}
            </Card.Content>
          </Card>
        </div>
      </div>

      {/* 出入库模态框 */}
      <StockTransactionModal
        isOpen={showStockModal}
        onClose={() => setShowStockModal(false)}
        onSubmit={handleStockTransaction}
        wine={wine}
      />

      {/* 删除确认对话框 */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteWine}
        title="删除红酒"
        message={`确定要删除红酒"${wine.name}"吗？此操作不可撤销。`}
        type="danger"
        confirmText="删除"
      />
    </div>
  );
};

export default WineDetailPage;
