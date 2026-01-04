import { useEffect, useState } from "react";
import { Plus, Search, Wine as WineIcon, Edit, Trash2 } from "lucide-react";
import api from "../services/api";
import type { Wine } from "../types";
import WineFormModal from "../components/WineFormModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../components/Toast";

export default function WinesPage() {
  const [wines, setWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedWine, setSelectedWine] = useState<Wine | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadWines();
  }, []);

  const loadWines = async () => {
    try {
      setLoading(true);
      const response = await api.get("/wines");
      setWines(response.data.items || response.data || []);
    } catch (error) {
      console.error("Failed to load wines:", error);
      showToast("error", "加载红酒列表失败");
    } finally {
      setLoading(false);
    }
  };

  const handleAddWine = async (data: Partial<Wine>) => {
    try {
      await api.post("/wines", data);
      showToast("success", "红酒添加成功");
      loadWines();
    } catch (error: any) {
      showToast("error", error.response?.data?.detail || "添加红酒失败");
      throw error;
    }
  };

  const handleEditWine = async (data: Partial<Wine>) => {
    if (!selectedWine) return;
    try {
      await api.put(`/wines/${selectedWine.id}`, data);
      showToast("success", "红酒信息已更新");
      loadWines();
    } catch (error: any) {
      showToast("error", error.response?.data?.detail || "更新红酒失败");
      throw error;
    }
  };

  const handleDeleteWine = async () => {
    if (!selectedWine) return;
    try {
      await api.delete(`/wines/${selectedWine.id}`);
      showToast("success", "红酒已删除");
      loadWines();
    } catch (error: any) {
      showToast("error", error.response?.data?.detail || "删除红酒失败");
    }
  };

  const openAddModal = () => {
    setSelectedWine(null);
    setShowFormModal(true);
  };

  const openEditModal = (wine: Wine) => {
    setSelectedWine(wine);
    setShowFormModal(true);
  };

  const openDeleteDialog = (wine: Wine) => {
    setSelectedWine(wine);
    setShowDeleteDialog(true);
  };

  const filteredWines = wines.filter(
    (wine) =>
      wine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wine.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatus = (wine: Wine) => {
    if (wine.current_stock === 0) {
      return {
        label: "缺货",
        color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      };
    }
    if (wine.current_stock <= wine.low_stock_threshold) {
      return {
        label: "低库存",
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      };
    }
    return {
      label: "正常",
      color:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-content-secondary">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-semibold text-content-primary">
            红酒管理
          </h1>
          <p className="mt-1 text-content-secondary">管理您的红酒库存</p>
        </div>
        <button
          onClick={openAddModal}
          className="btn-primary flex items-center gap-2 justify-center"
        >
          <Plus className="w-5 h-5" />
          添加红酒
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索红酒名称或产区..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Wine List */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-content-secondary">
                  名称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-content-secondary">
                  年份
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-content-secondary">
                  产区
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-content-secondary">
                  当前库存
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-content-secondary">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-content-secondary">
                  价格
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-content-secondary">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredWines.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <WineIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-content-secondary">
                      {searchTerm
                        ? "未找到匹配的红酒"
                        : "暂无红酒数据,请添加新红酒"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredWines.map((wine) => {
                  const status = getStockStatus(wine);
                  return (
                    <tr
                      key={wine.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-content-primary">
                          {wine.name}
                        </div>
                        {wine.grape_variety && (
                          <div className="text-sm text-content-secondary">
                            {wine.grape_variety}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-content-primary">
                        {wine.vintage_year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-content-primary">
                        {wine.region}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-content-primary">
                        {wine.current_stock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-content-primary">
                        {wine.price ? `¥${wine.price.toLocaleString()}` : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(wine)}
                            className="text-primary hover:text-primary-dark p-1"
                            title="编辑"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteDialog(wine)}
                            className="text-red-600 hover:text-red-700 p-1"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Wine Form Modal */}
      <WineFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSubmit={selectedWine ? handleEditWine : handleAddWine}
        wine={selectedWine}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteWine}
        title="删除红酒"
        message={`确定要删除 "${selectedWine?.name}" 吗？此操作无法撤销。`}
        confirmText="删除"
        type="danger"
      />
    </div>
  );
}
