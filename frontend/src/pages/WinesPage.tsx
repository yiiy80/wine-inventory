import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Package,
  DollarSign,
  Calendar,
  MapPin,
  Grape,
} from "lucide-react";
import { wineAPI } from "../services/api";
import { WineListResponse } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";

// 临时定义Wine类型
interface Wine {
  id: number;
  name: string;
  vintage_year: number;
  region: string;
  grape_variety?: string;
  price?: number;
  supplier?: string;
  storage_location?: string;
  current_stock: number;
  low_stock_threshold: number;
  notes?: string;
  image_url?: string;
  created_by?: number;
  created_at: string;
  updated_at: string;
}

const WinesPage: React.FC = () => {
  const [wines, setWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedVariety, setSelectedVariety] = useState("");
  const [stockStatus, setStockStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalWines, setTotalWines] = useState(0);
  const [pageSize] = useState(10);

  // 筛选选项
  const [regions, setRegions] = useState<string[]>([]);
  const [varieties, setVarieties] = useState<string[]>([]);

  const loadWines = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        page_size: pageSize,
        search: searchTerm || undefined,
        region: selectedRegion || undefined,
        grape_variety: selectedVariety || undefined,
        stock_status: stockStatus || undefined,
      };

      const response: WineListResponse = await wineAPI.getWines(params);
      setWines(response.items);
      setTotalPages(response.total_pages);
      setTotalWines(response.total);
    } catch (error: any) {
      toast.error("加载红酒列表失败");
      console.error("Load wines error:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadFilterOptions = async () => {
    try {
      const [regionsData, varietiesData] = await Promise.all([
        wineAPI.getRegions(),
        wineAPI.getVarieties(),
      ]);
      setRegions(regionsData);
      setVarieties(varietiesData);
    } catch (error) {
      console.error("Load filter options error:", error);
    }
  };

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    loadWines();
  }, [currentPage, searchTerm, selectedRegion, selectedVariety, stockStatus]);

  const handleDeleteWine = async (wineId: number, wineName: string) => {
    if (!confirm(`确定要删除红酒"${wineName}"吗？此操作不可撤销。`)) {
      return;
    }

    try {
      await wineAPI.deleteWine(wineId);
      toast.success("红酒删除成功");
      loadWines(); // 重新加载列表
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "删除失败");
    }
  };

  const getStockStatus = (wine: Wine) => {
    if (wine.current_stock === 0) {
      return { status: "out", label: "缺货", color: "text-red-600 bg-red-50" };
    } else if (wine.current_stock <= wine.low_stock_threshold) {
      return {
        status: "low",
        label: "低库存",
        color: "text-yellow-600 bg-yellow-50",
      };
    } else {
      return {
        status: "normal",
        label: "正常",
        color: "text-green-600 bg-green-50",
      };
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedRegion("");
    setSelectedVariety("");
    setStockStatus("");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary-light dark:text-text-primary-dark">
            红酒管理
          </h1>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">
            管理您的红酒库存信息
          </p>
        </div>
        <Link
          to="/wines/new"
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>添加红酒</span>
        </Link>
      </div>

      {/* 搜索和筛选 */}
      <div className="card">
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* 搜索框 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary-light dark:text-text-secondary-dark" />
              <input
                type="text"
                placeholder="搜索红酒名称..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>

            {/* 产区筛选 */}
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="input"
            >
              <option value="">所有产区</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>

            {/* 葡萄品种筛选 */}
            <select
              value={selectedVariety}
              onChange={(e) => setSelectedVariety(e.target.value)}
              className="input"
            >
              <option value="">所有品种</option>
              {varieties.map((variety) => (
                <option key={variety} value={variety}>
                  {variety}
                </option>
              ))}
            </select>

            {/* 库存状态筛选 */}
            <select
              value={stockStatus}
              onChange={(e) => setStockStatus(e.target.value)}
              className="input"
            >
              <option value="">所有状态</option>
              <option value="normal">正常</option>
              <option value="low">低库存</option>
              <option value="out">缺货</option>
            </select>

            {/* 清除筛选 */}
            <button
              onClick={clearFilters}
              className="btn btn-secondary flex items-center justify-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>清除</span>
            </button>
          </div>
        </div>
      </div>

      {/* 红酒列表 */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
            红酒列表 ({totalWines})
          </h3>
        </div>
        <div className="card-content">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : wines.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-text-secondary-light dark:text-text-secondary-dark" />
              <h3 className="mt-2 text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                暂无红酒
              </h3>
              <p className="mt-1 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                开始添加您的第一瓶红酒吧
              </p>
            </div>
          ) : (
            <>
              {/* 桌面端表格 */}
              <div className="hidden lg:block">
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>红酒信息</th>
                        <th>产区</th>
                        <th>年份</th>
                        <th>库存</th>
                        <th>价格</th>
                        <th>状态</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wines.map((wine) => {
                        const stockStatus = getStockStatus(wine);
                        return (
                          <tr key={wine.id}>
                            <td>
                              <div className="flex items-center space-x-3">
                                {wine.image_url && (
                                  <img
                                    src={wine.image_url}
                                    alt={wine.name}
                                    className="h-10 w-10 rounded object-cover"
                                  />
                                )}
                                <div>
                                  <div className="font-medium text-text-primary-light dark:text-text-primary-dark">
                                    {wine.name}
                                  </div>
                                  <div className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                    {wine.grape_variety && (
                                      <span className="flex items-center">
                                        <Grape className="h-3 w-3 mr-1" />
                                        {wine.grape_variety}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="flex items-center text-sm">
                                <MapPin className="h-4 w-4 mr-1 text-text-secondary-light dark:text-text-secondary-dark" />
                                {wine.region}
                              </div>
                            </td>
                            <td>
                              <div className="flex items-center text-sm">
                                <Calendar className="h-4 w-4 mr-1 text-text-secondary-light dark:text-text-secondary-dark" />
                                {wine.vintage_year}
                              </div>
                            </td>
                            <td>
                              <div className="flex items-center text-sm">
                                <Package className="h-4 w-4 mr-1 text-text-secondary-light dark:text-text-secondary-dark" />
                                {wine.current_stock}
                              </div>
                            </td>
                            <td>
                              <div className="flex items-center text-sm">
                                <DollarSign className="h-4 w-4 mr-1 text-text-secondary-light dark:text-text-secondary-dark" />
                                ¥{wine.price?.toLocaleString() || "未设置"}
                              </div>
                            </td>
                            <td>
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${stockStatus.color}`}
                              >
                                {stockStatus.label}
                              </span>
                            </td>
                            <td>
                              <div className="flex items-center space-x-2">
                                <Link
                                  to={`/wines/${wine.id}`}
                                  className="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-600 p-1 rounded"
                                  title="查看详情"
                                >
                                  <Eye className="h-4 w-4" />
                                </Link>
                                <Link
                                  to={`/wines/${wine.id}/edit`}
                                  className="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-600 p-1 rounded"
                                  title="编辑"
                                >
                                  <Edit className="h-4 w-4" />
                                </Link>
                                <button
                                  onClick={() =>
                                    handleDeleteWine(wine.id, wine.name)
                                  }
                                  className="text-red-600 hover:text-red-800 p-1 rounded"
                                  title="删除"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
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
              <div className="lg:hidden space-y-4">
                {wines.map((wine) => {
                  const stockStatus = getStockStatus(wine);
                  return (
                    <div
                      key={wine.id}
                      className="border border-border-light dark:border-border-dark rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            {wine.image_url && (
                              <img
                                src={wine.image_url}
                                alt={wine.name}
                                className="h-12 w-12 rounded object-cover"
                              />
                            )}
                            <div>
                              <h3 className="font-medium text-text-primary-light dark:text-text-primary-dark">
                                {wine.name}
                              </h3>
                              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                {wine.region} • {wine.vintage_year}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                            <div className="flex items-center">
                              <Package className="h-4 w-4 mr-1 text-text-secondary-light dark:text-text-secondary-dark" />
                              库存: {wine.current_stock}
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1 text-text-secondary-light dark:text-text-secondary-dark" />
                              ¥{wine.price?.toLocaleString() || "未设置"}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${stockStatus.color}`}
                            >
                              {stockStatus.label}
                            </span>
                            <div className="flex items-center space-x-2">
                              <Link
                                to={`/wines/${wine.id}`}
                                className="text-primary-600 hover:text-primary-700 p-2 rounded"
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                              <Link
                                to={`/wines/${wine.id}/edit`}
                                className="text-primary-600 hover:text-primary-700 p-2 rounded"
                              >
                                <Edit className="h-4 w-4" />
                              </Link>
                              <button
                                onClick={() =>
                                  handleDeleteWine(wine.id, wine.name)
                                }
                                className="text-red-600 hover:text-red-700 p-2 rounded"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                    显示第 {(currentPage - 1) * pageSize + 1} 到{" "}
                    {Math.min(currentPage * pageSize, totalWines)} 条， 共{" "}
                    {totalWines} 条记录
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      className="btn btn-secondary"
                    >
                      上一页
                    </button>
                    <span className="text-sm text-text-primary-light dark:text-text-primary-dark">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="btn btn-secondary"
                    >
                      下一页
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WinesPage;
