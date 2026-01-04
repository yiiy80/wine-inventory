import React, { useEffect, useState } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  Wine,
  Package,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  RefreshCw,
} from "lucide-react";
import { dashboardAPI } from "../services/api";
import { DashboardSummary, StockTrend, StockDistribution } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";

const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [trends, setTrends] = useState<StockTrend[]>([]);
  const [distribution, setDistribution] = useState<StockDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      else setRefreshing(true);

      const [summaryData, trendsData, distributionData] = await Promise.all([
        dashboardAPI.getSummary(),
        dashboardAPI.getTrends({ days: 30 }),
        dashboardAPI.getDistribution(),
      ]);

      setSummary(summaryData);
      setTrends(trendsData);
      setDistribution(distributionData);
    } catch (error: any) {
      toast.error("加载仪表盘数据失败");
      console.error("Dashboard data loading error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRefresh = () => {
    loadDashboardData(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // 统计卡片数据
  const statsCards = [
    {
      title: "总红酒数量",
      value: summary?.total_wines || 0,
      icon: Wine,
      color: "text-primary-600",
      bgColor: "bg-primary-50 dark:bg-primary-900/20",
    },
    {
      title: "总库存数量",
      value: summary?.total_stock || 0,
      icon: Package,
      color: "text-secondary-600",
      bgColor: "bg-secondary-50 dark:bg-secondary-900/20",
    },
    {
      title: "库存总价值",
      value: `¥${(summary?.total_value || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "text-accent-600",
      bgColor: "bg-accent-50 dark:bg-accent-900/20",
    },
    {
      title: "低库存预警",
      value: summary?.low_stock_count || 0,
      icon: AlertTriangle,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
  ];

  // 图表颜色
  const COLORS = ["#722F37", "#C9A227", "#1E4D2B", "#8B5555", "#A16207"];

  return (
    <div className="space-y-4 max-h-screen overflow-y-auto">
      {/* 页面标题和刷新按钮 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary-light dark:text-text-primary-dark">
            仪表盘
          </h1>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">
            红酒库存管理概览
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn btn-secondary flex items-center space-x-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          <span>{refreshing ? "刷新中..." : "刷新数据"}</span>
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card, index) => (
          <div key={index} className="card">
            <div className="flex items-center p-4">
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
                  {card.title}
                </p>
                <p className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
                  {card.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 库存趋势图 */}
        <div className="card">
          <div className="card-header py-3">
            <h3 className="text-base font-semibold text-text-primary-light dark:text-text-primary-dark">
              库存趋势 (30天)
            </h3>
          </div>
          <div className="card-content py-3">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border-light dark:stroke-border-dark"
                  />
                  <XAxis
                    dataKey="date"
                    className="text-text-secondary-light dark:text-text-secondary-dark text-xs"
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis
                    className="text-text-secondary-light dark:text-text-secondary-dark text-xs"
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-surface-light)",
                      border: "1px solid var(--color-border-light)",
                      borderRadius: "6px",
                      fontSize: "12px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="stock_in"
                    stroke="#722F37"
                    strokeWidth={2}
                    name="入库"
                  />
                  <Line
                    type="monotone"
                    dataKey="stock_out"
                    stroke="#C9A227"
                    strokeWidth={2}
                    name="出库"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 库存分布图 */}
        <div className="card">
          <div className="card-header py-3">
            <h3 className="text-base font-semibold text-text-primary-light dark:text-text-primary-dark">
              库存分布 (按产区)
            </h3>
          </div>
          <div className="card-content py-3">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {distribution.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* 快速操作和系统状态 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 快速操作 */}
        <div className="card">
          <div className="card-header py-3">
            <h3 className="text-base font-semibold text-text-primary-light dark:text-text-primary-dark">
              快速操作
            </h3>
          </div>
          <div className="card-content py-3">
            <div className="grid grid-cols-1 gap-3">
              <button className="btn btn-primary flex items-center justify-center space-x-2 py-3">
                <Wine className="h-4 w-4" />
                <span>添加红酒</span>
              </button>
              <button className="btn btn-secondary flex items-center justify-center space-x-2 py-3">
                <Package className="h-4 w-4" />
                <span>记录入库</span>
              </button>
              <button className="btn btn-ghost flex items-center justify-center space-x-2 py-3">
                <TrendingUp className="h-4 w-4" />
                <span>查看报表</span>
              </button>
            </div>
          </div>
        </div>

        {/* 系统状态 */}
        <div className="card">
          <div className="card-header py-3">
            <h3 className="text-base font-semibold text-text-primary-light dark:text-text-primary-dark">
              系统状态
            </h3>
          </div>
          <div className="card-content py-3">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-background-light dark:bg-background-dark rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-success rounded-full"></div>
                  <span className="text-sm text-text-primary-light dark:text-text-primary-dark">
                    后端服务正常
                  </span>
                </div>
                <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                  {new Date().toLocaleTimeString("zh-CN")}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-background-light dark:bg-background-dark rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-success rounded-full"></div>
                  <span className="text-sm text-text-primary-light dark:text-text-primary-dark">
                    数据库连接正常
                  </span>
                </div>
                <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                  {new Date().toLocaleTimeString("zh-CN")}
                </span>
              </div>

              {summary && summary.low_stock_count > 0 && (
                <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    <span className="text-sm text-text-primary-light dark:text-text-primary-dark">
                      {summary.low_stock_count} 种红酒库存不足
                    </span>
                  </div>
                  <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                    需要关注
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
