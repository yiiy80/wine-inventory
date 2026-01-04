import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Wine, Package, DollarSign, AlertCircle } from "lucide-react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import api from "../services/api";
import { useTheme } from "../contexts/ThemeContext";

interface DashboardStats {
  total_wines: number;
  total_stock: number;
  total_value: number;
  low_stock_count: number;
}

interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

export default function DashboardPage() {
  const { theme } = useTheme();
  const [stats, setStats] = useState<DashboardStats>({
    total_wines: 0,
    total_stock: 0,
    total_value: 0,
    low_stock_count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [trendData, setTrendData] = useState<ChartData[]>([]);
  const [regionData, setRegionData] = useState<ChartData[]>([]);

  // Chart colors - using CSS custom properties that work with dark mode
  const chartTextColor = "rgb(107 114 128 / var(--tw-text-opacity))"; // Will be overridden by CSS
  const chartGridColor = "rgb(229 231 235 / var(--tw-border-opacity))"; // Will be overridden by CSS
  const chartAxisColor = "rgb(107 114 128 / var(--tw-text-opacity))"; // Will be overridden by CSS

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, trendsRes, distributionRes] = await Promise.all([
        api.get("/dashboard/summary"),
        api.get("/dashboard/trends"),
        api.get("/dashboard/distribution"),
      ]);

      setStats(statsRes.data);
      setTrendData(trendsRes.data.trends || []);
      setRegionData(distributionRes.data.by_region || []);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      icon: Wine,
      label: "红酒品类",
      value: stats.total_wines,
      color: "bg-primary",
      iconColor: "text-primary",
    },
    {
      icon: Package,
      label: "总库存量",
      value: stats.total_stock,
      color: "bg-blue-600",
      iconColor: "text-blue-600",
    },
    {
      icon: DollarSign,
      label: "库存总价值",
      value: `¥${stats.total_value.toLocaleString()}`,
      color: "bg-green-600",
      iconColor: "text-green-600",
    },
    {
      icon: AlertCircle,
      label: "低库存预警",
      value: stats.low_stock_count,
      color: "bg-red-600",
      iconColor: "text-red-600",
    },
  ];

  const COLORS = ["#722F37", "#8B3A42", "#C9A227", "#1E4D2B", "#5A252C"];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-semibold text-content-primary">
            仪表盘
          </h1>
          <p className="mt-1 text-content-secondary">库存概览与数据分析</p>
        </div>
        <button onClick={loadDashboardData} className="btn-secondary text-sm">
          刷新数据
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm mb-1 text-content-secondary">
                    {card.label}
                  </p>
                  <p className="text-2xl md:text-3xl font-display font-semibold text-content-primary">
                    {card.value}
                  </p>
                </div>
                <div className={`p-3 ${card.color} rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <div className="card">
          <h3 className="text-lg font-display font-semibold mb-6 text-content-primary">
            库存趋势
          </h3>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                <XAxis
                  dataKey="name"
                  stroke={chartAxisColor}
                  style={{ fill: chartTextColor }}
                />
                <YAxis
                  stroke={chartAxisColor}
                  style={{ fill: chartTextColor }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === "dark" ? "#2D2420" : "#fff",
                    border: `1px solid ${chartGridColor}`,
                    borderRadius: "8px",
                    color: theme === "dark" ? "#F3F4F6" : "#111827",
                  }}
                />
                <Legend wrapperStyle={{ color: chartTextColor }} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#722F37"
                  strokeWidth={2}
                  name="库存量"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div
              className="flex items-center justify-center h-64"
              style={{ color: chartTextColor }}
            >
              暂无数据
            </div>
          )}
        </div>

        {/* Region Distribution */}
        <div className="card">
          <h3 className="text-lg font-display font-semibold mb-6 text-content-primary">
            产区分布
          </h3>
          {regionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={regionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: any) => {
                    const name = props.name || "";
                    const percent = props.percent || 0;
                    const RADIAN = Math.PI / 180;
                    const radius = props.outerRadius + 30;
                    const x =
                      props.cx + radius * Math.cos(-props.midAngle * RADIAN);
                    const y =
                      props.cy + radius * Math.sin(-props.midAngle * RADIAN);
                    return (
                      <text
                        x={x}
                        y={y}
                        fill={chartTextColor}
                        textAnchor={x > props.cx ? "start" : "end"}
                        dominantBaseline="central"
                      >
                        {`${name} ${(percent * 100).toFixed(0)}%`}
                      </text>
                    );
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {regionData.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === "dark" ? "#2D2420" : "#fff",
                    border: `1px solid ${chartGridColor}`,
                    borderRadius: "8px",
                    color: theme === "dark" ? "#F3F4F6" : "#111827",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div
              className="flex items-center justify-center h-64"
              style={{ color: chartTextColor }}
            >
              暂无数据
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-display font-semibold mb-4 text-content-primary">
          快速操作
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/wines" className="btn-primary text-center">
            查看红酒列表
          </Link>
          <Link to="/inventory" className="btn-secondary text-center">
            出入库管理
          </Link>
          <Link to="/alerts" className="btn-secondary text-center">
            查看预警
          </Link>
          <Link to="/reports" className="btn-secondary text-center">
            生成报表
          </Link>
        </div>
      </div>
    </div>
  );
}
