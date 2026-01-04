import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save, X } from "lucide-react";
import { wineAPI } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Textarea from "../components/ui/Textarea";
import toast from "react-hot-toast";

const WineFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id && id !== "new";

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    vintage_year: new Date().getFullYear(),
    region: "",
    grape_variety: "",
    price: "",
    supplier: "",
    storage_location: "",
    current_stock: 0,
    low_stock_threshold: 10,
    notes: "",
    image_url: "",
  });

  // 加载现有红酒数据（编辑模式）
  useEffect(() => {
    if (isEditing) {
      loadWineData();
    }
  }, [id]);

  const loadWineData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const wineData = await wineAPI.getWine(parseInt(id));
      setFormData({
        name: wineData.name,
        vintage_year: wineData.vintage_year,
        region: wineData.region,
        grape_variety: wineData.grape_variety || "",
        price: wineData.price?.toString() || "",
        supplier: wineData.supplier || "",
        storage_location: wineData.storage_location || "",
        current_stock: wineData.current_stock,
        low_stock_threshold: wineData.low_stock_threshold,
        notes: wineData.notes || "",
        image_url: wineData.image_url || "",
      });
    } catch (error: any) {
      toast.error("加载红酒数据失败");
      navigate("/wines");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "vintage_year" ||
        name === "current_stock" ||
        name === "low_stock_threshold"
          ? parseInt(value) || 0
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 表单验证
    if (!formData.name.trim()) {
      toast.error("请输入红酒名称");
      return;
    }

    if (!formData.region.trim()) {
      toast.error("请输入产区");
      return;
    }

    if (
      formData.vintage_year < 1800 ||
      formData.vintage_year > new Date().getFullYear() + 1
    ) {
      toast.error("请输入有效的年份");
      return;
    }

    try {
      setSaving(true);

      const submitData = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : undefined,
      };

      if (isEditing && id) {
        await wineAPI.updateWine(parseInt(id), submitData);
        toast.success("红酒更新成功");
      } else {
        await wineAPI.createWine(submitData);
        toast.success("红酒创建成功");
      }

      navigate("/wines");
    } catch (error: any) {
      toast.error(
        error.response?.data?.detail || `${isEditing ? "更新" : "创建"}失败`
      );
    } finally {
      setSaving(false);
    }
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
              {isEditing ? "编辑红酒" : "添加红酒"}
            </h1>
            <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">
              {isEditing ? "修改红酒信息" : "添加新的红酒到库存"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to="/wines" className="btn btn-secondary">
            <X className="w-4 h-4 mr-2" />
            取消
          </Link>
          <Button
            type="submit"
            form="wine-form"
            loading={saving}
            className="btn btn-primary"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "保存中..." : "保存"}
          </Button>
        </div>
      </div>

      {/* 表单 */}
      <Card>
        <Card.Content>
          <form id="wine-form" onSubmit={handleSubmit} className="space-y-6">
            {/* 基本信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="红酒名称 *"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="请输入红酒名称"
                required
              />

              <Input
                label="年份 *"
                name="vintage_year"
                type="number"
                value={formData.vintage_year}
                onChange={handleInputChange}
                placeholder="请输入年份"
                min="1800"
                max={new Date().getFullYear() + 1}
                required
              />

              <Input
                label="产区 *"
                name="region"
                value={formData.region}
                onChange={handleInputChange}
                placeholder="请输入产区"
                required
              />

              <Input
                label="葡萄品种"
                name="grape_variety"
                value={formData.grape_variety}
                onChange={handleInputChange}
                placeholder="请输入葡萄品种"
              />

              <Input
                label="价格 (¥)"
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="请输入价格"
              />

              <Input
                label="供应商"
                name="supplier"
                value={formData.supplier}
                onChange={handleInputChange}
                placeholder="请输入供应商"
              />

              <Input
                label="存储位置"
                name="storage_location"
                value={formData.storage_location}
                onChange={handleInputChange}
                placeholder="请输入存储位置"
              />

              <Input
                label="图片URL"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                placeholder="请输入图片URL"
              />
            </div>

            {/* 库存信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="当前库存"
                name="current_stock"
                type="number"
                value={formData.current_stock}
                onChange={handleInputChange}
                placeholder="请输入当前库存数量"
                min="0"
              />

              <Input
                label="库存预警阈值"
                name="low_stock_threshold"
                type="number"
                value={formData.low_stock_threshold}
                onChange={handleInputChange}
                placeholder="请输入预警阈值"
                min="0"
              />
            </div>

            {/* 备注 */}
            <Textarea
              label="备注"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="请输入备注信息"
              rows={4}
            />

            {/* 图片预览 */}
            {formData.image_url && (
              <div className="flex justify-center">
                <div className="relative">
                  <img
                    src={formData.image_url}
                    alt="红酒图片预览"
                    className="w-32 h-32 object-cover rounded-lg shadow-sm"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                </div>
              </div>
            )}
          </form>
        </Card.Content>
      </Card>
    </div>
  );
};

export default WineFormPage;
