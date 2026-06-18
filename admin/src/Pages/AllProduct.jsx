import React, { useState, useEffect } from "react";
import {
  Table,
  Modal,
  Form,
  Input,
  Select,
  Button,
  message,
  Upload,
  Dropdown,
  Popconfirm,
  Divider,
  Progress,
} from "antd";
import axios from "../Components/Axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  UploadOutlined,
  DeleteOutlined,
  SearchOutlined,
  MoreOutlined,
  EyeOutlined,
  EditOutlined,
  CloseOutlined,
  FilterOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getMinPrice = (options) => {
  if (!options?.length) return null;
  return Math.min(...options.map((o) => o.salePrice || o.price || 0));
};

const getTotalStock = (options) =>
  options?.reduce((s, o) => s + (o.stock || 0), 0) || 0;

const StockBadge = ({ stock }) => {
  const color  = stock === 0 ? "#ef4444" : stock < 10 ? "#f59e0b" : "#10b981";
  const bg     = stock === 0 ? "#fee2e2" : stock < 10 ? "#fef3c7" : "#d1fae5";
  const label  = stock === 0 ? "Out of Stock" : stock < 10 ? "Low Stock" : "In Stock";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700,
      color, background: bg, border: `1px solid ${color}30`, whiteSpace: "nowrap",
    }}>
      {label} ({stock})
    </span>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AllProduct = () => {
  const [data, setData]               = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm]   = useState("");
  const [categoryFilter, setCategoryFilter] = useState(null);

  // Edit modal
  const [editingRecord, setEditingRecord]   = useState(null);
  const [isEditVisible, setIsEditVisible]   = useState(false);
  const [editForm]                          = Form.useForm();
  const [productProduct, setProductProduct] = useState({});
  const [productVariant, setProductVariant] = useState({});
  const [productOptions, setProductOptions] = useState([]);
  const [imagePreviews, setImagePreviews]   = useState([]);
  const [fileList, setFileList]             = useState([]);
  const [initialVideoUrl, setInitialVideoUrl] = useState("");

  // View Details modal
  const [viewRecord, setViewRecord]         = useState(null);
  const [isDetailVisible, setIsDetailVisible] = useState(false);

  // Lookup data
  const [categories, setCategories]         = useState([]);
  const [subCategories, setSubCategories]   = useState([]);
  const [childCategories, setChildCategories] = useState([]);
  const [selectedCategory, setSelectedCategory]     = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);

  // Bulk
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows]       = useState([]);

  // Sorting & pagination
  const [sortedInfo, setSortedInfo] = useState({ columnKey: "index", order: "ascend" });
  const [pageSize, setPageSize]     = useState(10);

  // ── Data fetching ────────────────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      const response = await axios.get("/varient");
      const formattedData = response.data.data.doc.map((variant, index) => ({
        ...variant,
        key: variant._id,
        index: index + 1,
        category:      variant?.category?.title || "N/A",
        subCategory:   variant?.subCategory?.title || "N/A",
        childCategory: variant?.childCategory?.title || "N/A",
        photo:         variant?.photo,
      }));
      const reversed = formattedData.reverse().map((item, idx) => ({ ...item, index: idx + 1 }));
      setData(reversed);
      applyFilters(reversed, searchTerm, categoryFilter);
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Failed to load products");
    }
  };

  const fetchCategories = async () => {
    try {
      const r = await axios.get("/category");
      setCategories(r.data.data.doc);
    } catch (e) { console.error(e); }
  };

  const fetchSubCategories = async () => {
    try {
      const r = await axios.get("/subCategory");
      setSubCategories(r.data.data.doc);
    } catch (e) { console.error(e); }
  };

  const fetchChildCategories = async () => {
    try {
      const r = await axios.get("/childCategory");
      setChildCategories(r.data.data.doc);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchData();
    fetchCategories();
    fetchSubCategories();
    fetchChildCategories();
  }, []);

  const filteredSubCategories  = subCategories.filter((s) => s.category === selectedCategory);
  const filteredChildCategories = childCategories.filter((c) => {
    const subId = c.subCategory?._id || c.subCategory;
    return subId === selectedSubCategory;
  });

  // ── Filter logic ─────────────────────────────────────────────────────────────
  const applyFilters = (source, search, cat) => {
    let result = source || data;
    const trimmed = (search || "").trim().toLowerCase();
    if (trimmed) {
      result = result.filter((item) => {
        const fields = [item?.product?.name, item?.category, item?.subCategory, item?.childCategory, item?.colorName];
        return fields.some((f) => f && f.toLowerCase().includes(trimmed));
      });
    }
    if (cat) {
      result = result.filter((item) => item.category === cat);
    }
    setFilteredData(result);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    applyFilters(data, value, categoryFilter);
  };

  const handleCategoryFilter = (value) => {
    setCategoryFilter(value || null);
    applyFilters(data, searchTerm, value || null);
  };

  // ── CRUD ─────────────────────────────────────────────────────────────────────
  const handleDelete = async (key) => {
    try {
      const variantToDelete = data.find((item) => item.key === key);
      const productId = variantToDelete?.product?._id;
      if (productId) {
        await axios.delete(`/varient/${key}`);
        await axios.delete(`/product/${productId}`);
        message.success("Product deleted successfully");
        fetchData();
      } else {
        message.error("Product ID not found for this variant");
      }
    } catch (error) {
      message.error("Failed to delete product");
    }
  };

  const handleBulkDelete = async () => {
    try {
      for (const row of selectedRows) {
        const productId = row?.product?._id;
        await axios.delete(`/varient/${row._id}`);
        if (productId) await axios.delete(`/product/${productId}`);
      }
      message.success(`${selectedRowKeys.length} products deleted`);
      setSelectedRowKeys([]);
      setSelectedRows([]);
      fetchData();
    } catch (error) {
      message.error("Failed to delete some products");
      fetchData();
    }
  };

  const handleEdit = async (record) => {
    try {
      const productResponse = await axios.get(`/product/${record.product._id}`);
      const product = productResponse.data.data.doc;
      const variantResponse = await axios.get(`/varient/${record._id}`);
      const variant = variantResponse.data.data.doc;

      setEditingRecord(record);
      setSelectedCategory(product.category?._id || product.category);
      setSelectedSubCategory(product.subCategory?._id || product.subCategory || null);

      editForm.setFieldsValue({
        title:        product.name,
        category:     product.category?._id || product.category,
        subCategory:  product.subCategory?._id || product.subCategory || null,
        childCategory: product.childCategory?._id || product.childCategory || null,
        description:  product.description,
        videoUrl:     product.photos.find((p) => p.includes("youtube.com")) || "",
        colorName:    variant.colorName,
        colorCode:    variant.colorCode,
        details:      variant.details,
      });

      setProductProduct(product);
      setProductVariant(variant);
      setImagePreviews(product.photos.filter((p) => !p.includes("youtube.com")));
      setInitialVideoUrl(product.photos.find((p) => p.includes("youtube.com")) || "");
      setProductOptions(variant.options || []);
      setFileList([]);
      setIsEditVisible(true);
    } catch (error) {
      message.error("Failed to fetch product data.");
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await editForm.validateFields();
      const formData = new FormData();

      formData.append("name", values.title);
      formData.append("category", values.category);
      if (values.subCategory)  formData.append("subCategory", values.subCategory);
      if (values.childCategory) formData.append("childCategory", values.childCategory);
      formData.append("description", values.description);
      imagePreviews.forEach((img) => formData.append("photos", img));
      fileList.forEach((file) => formData.append("photos", file.originFileObj));
      if (values.videoUrl) formData.append("photos", values.videoUrl);

      await axios.patch(`/varient/${productVariant._id}`, {
        colorName:    values.colorName,
        colorCode:    values.colorCode,
        details:      values.details,
        category:     values.category,
        subCategory:  values.subCategory || null,
        childCategory: values.childCategory || null,
      });

      const updatedOptions = productOptions.map((option, index) => ({
        price:        values.price?.[index] || option.price,
        stock:        values.quantity?.[index] || option.stock,
        sku:          values.sku?.[index] || option.sku,
        size:         values.size?.[index] || option.size,
        category:     values.category,
        subCategory:  values.subCategory || null,
        childCategory: values.childCategory || null,
      }));

      await Promise.all(
        updatedOptions.map((option, index) =>
          axios.patch(`/option/${productOptions[index]._id}`, option)
        )
      );

      await axios.patch(`/product/${productProduct._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success("Product updated successfully");
      setIsEditVisible(false);
      setEditingRecord(null);
      fetchData();
    } catch (error) {
      message.error("Failed to update product");
    }
  };

  const handleOptionChange = (index, field, value) => {
    setProductOptions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleDeletePreviewImage = (imageIndex) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== imageIndex));
  };

  // ── Row action dropdown ───────────────────────────────────────────────────────
  const getActionItems = (record) => [
    {
      key: "view",
      icon: <EyeOutlined style={{ color: "#3b82f6" }} />,
      label: <span style={{ color: "#1e3a5f" }}>View Details</span>,
      onClick: () => { setViewRecord(record); setIsDetailVisible(true); },
    },
    {
      key: "edit",
      icon: <EditOutlined style={{ color: "#10b981" }} />,
      label: <span style={{ color: "#1e3a5f" }}>Edit Product</span>,
      onClick: () => handleEdit(record),
    },
    { type: "divider" },
    {
      key: "delete",
      danger: true,
      icon: <DeleteOutlined />,
      label: (
        <Popconfirm
          title="Delete this product?"
          description="This deletes both the variant and its associated product."
          onConfirm={() => handleDelete(record._id)}
          okText="Delete"
          okButtonProps={{ danger: true }}
          cancelText="Cancel"
          onClick={(e) => e.stopPropagation()}
        >
          <span style={{ color: "#ef4444" }}>Delete</span>
        </Popconfirm>
      ),
    },
  ];

  // ── Table columns ─────────────────────────────────────────────────────────────
  const columns = [
    {
      title: "SR",
      key: "index",
      width: 56,
      sorter: (a, b) => a.index - b.index,
      sortOrder: sortedInfo.columnKey === "index" ? sortedInfo.order : null,
      render: (_, __, index) => (
        <span style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600 }}>{index + 1}</span>
      ),
    },
    {
      title: "Product",
      key: "title",
      width: 200,
      sorter: (a, b) => (a.product?.name || "").localeCompare(b.product?.name || ""),
      sortOrder: sortedInfo.columnKey === "title" ? sortedInfo.order : null,
      render: (_, record) => {
        const photos = record.product?.photos?.filter((p) => !p.includes("youtube.com"));
        const thumb  = photos?.[0];
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {thumb ? (
              <img src={thumb} alt="thumb" style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover", border: "1px solid #e2e8f0", flexShrink: 0 }} />
            ) : (
              <div style={{ width: 40, height: 40, borderRadius: 8, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>📦</div>
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 140 }}>
                {record.product?.name || "—"}
              </div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>{record.colorName || "—"}</div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Category",
      key: "category",
      dataIndex: "category",
      width: 120,
      sorter: (a, b) => (a.category || "").localeCompare(b.category || ""),
      sortOrder: sortedInfo.columnKey === "category" ? sortedInfo.order : null,
      render: (cat) => (
        <span style={{ fontSize: 12, background: "#f0f9ff", color: "#0369a1", padding: "2px 8px", borderRadius: 10, fontWeight: 600, whiteSpace: "nowrap" }}>
          {cat}
        </span>
      ),
    },
    {
      title: "Sub / Child",
      key: "subCategory",
      width: 130,
      sorter: (a, b) => (a.subCategory || "").localeCompare(b.subCategory || ""),
      sortOrder: sortedInfo.columnKey === "subCategory" ? sortedInfo.order : null,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: 12, color: "#475569", fontWeight: 500 }}>{record.subCategory !== "N/A" ? record.subCategory : "—"}</div>
          {record.childCategory !== "N/A" && (
            <div style={{ fontSize: 11, color: "#94a3b8" }}>{record.childCategory}</div>
          )}
        </div>
      ),
    },
    {
      title: "Stock",
      key: "stock",
      width: 120,
      sorter: (a, b) => getTotalStock(a.options) - getTotalStock(b.options),
      sortOrder: sortedInfo.columnKey === "stock" ? sortedInfo.order : null,
      render: (_, record) => <StockBadge stock={getTotalStock(record.options)} />,
    },
    {
      title: "Min Price",
      key: "price",
      width: 100,
      sorter: (a, b) => (getMinPrice(a.options) || 0) - (getMinPrice(b.options) || 0),
      sortOrder: sortedInfo.columnKey === "price" ? sortedInfo.order : null,
      render: (_, record) => {
        const price = getMinPrice(record.options);
        return price != null ? (
          <span style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>৳{Math.round(price).toLocaleString()}</span>
        ) : "—";
      },
    },
    {
      title: "Sizes",
      key: "sizes",
      width: 100,
      render: (_, record) => {
        const sizes = record.options?.map((o) => o.size).filter(Boolean);
        if (!sizes?.length) return "—";
        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            {sizes.map((s, i) => (
              <span key={i} style={{ fontSize: 10, background: "#f1f5f9", color: "#475569", padding: "1px 6px", borderRadius: 6, fontWeight: 600, border: "1px solid #e2e8f0" }}>
                {s}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 60,
      fixed: "right",
      render: (_, record) => (
        <Dropdown
          menu={{ items: getActionItems(record) }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Button
            type="text"
            icon={<MoreOutlined style={{ fontSize: 18 }} />}
            style={{
              width: 32, height: 32, display: "flex", alignItems: "center",
              justifyContent: "center", borderRadius: 8,
              background: "transparent", border: "1px solid #e2e8f0",
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </Dropdown>
      ),
    },
  ];

  // ── Row selection ─────────────────────────────────────────────────────────────
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys, rows) => { setSelectedRowKeys(keys); setSelectedRows(rows); },
    columnWidth: 44,
  };

  const handleTableChange = (pagination, filters, sorter) => setSortedInfo(sorter);

  // ── Category filter options ────────────────────────────────────────────────────
  const uniqueCategories = [...new Set(data.map((d) => d.category).filter((c) => c && c !== "N/A"))].map((c) => ({ label: c, value: c }));

  // ── Styles ────────────────────────────────────────────────────────────────────
  const pageStyle = {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f8faff 0%, #f1f5f9 100%)",
    padding: "28px 24px",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  };

  const cardStyle = {
    background: "#ffffff",
    borderRadius: 16,
    boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
    overflow: "hidden",
    border: "1px solid #f1f5f9",
  };

  const bulkBarStyle = {
    display: "flex", alignItems: "center", gap: 10,
    padding: "12px 20px",
    background: "linear-gradient(90deg, #1e3a5f 0%, #1e40af 100%)",
    flexWrap: "wrap",
  };

  const bulkBtnStyle = (variant) => {
    const base = { borderRadius: 8, fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 6, border: "none", cursor: "pointer", padding: "6px 14px", transition: "all 0.2s" };
    if (variant === "danger")  return { ...base, background: "#ef4444", color: "#fff" };
    return { ...base, background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" };
  };

  // Stats
  const totalStock   = data.reduce((s, r) => s + getTotalStock(r.options), 0);
  const outOfStock   = data.filter((r) => getTotalStock(r.options) === 0).length;
  const lowStock     = data.filter((r) => { const t = getTotalStock(r.options); return t > 0 && t < 10; }).length;
  const uniqueCats   = new Set(data.map((d) => d.category)).size;

  return (
    <div style={pageStyle}>
      {/* Page Header */}
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
          Product Catalogue
        </h1>
        <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: 14 }}>
          Manage all product variants, pricing, and stock
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "Total Products",  value: data.length,    color: "#6366f1", bg: "#eef2ff" },
          { label: "Total Stock",     value: totalStock,     color: "#10b981", bg: "#d1fae5" },
          { label: "Out of Stock",    value: outOfStock,     color: "#ef4444", bg: "#fee2e2" },
          { label: "Low Stock",       value: lowStock,       color: "#f59e0b", bg: "#fef3c7" },
          { label: "Categories",      value: uniqueCats,     color: "#3b82f6", bg: "#dbeafe" },
        ].map((stat) => (
          <div key={stat.label} style={{
            flex: "1 1 120px", background: "#fff", borderRadius: 12, padding: "12px 16px",
            border: `1px solid ${stat.color}25`, boxShadow: `0 2px 8px ${stat.color}10`,
            display: "flex", flexDirection: "column", gap: 2, minWidth: 110,
          }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: stat.color, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {stat.label}
            </span>
            <span style={{ fontSize: 24, fontWeight: 800, color: "#0f172a" }}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Main Card */}
      <div style={cardStyle}>
        {/* Toolbar */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 20px", borderBottom: "1px solid #f1f5f9", flexWrap: "wrap", background: "#fafbff" }}>
          {/* Search */}
          <div style={{ position: "relative", flex: "1 1 240px", maxWidth: 380 }}>
            <SearchOutlined style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 15, zIndex: 1 }} />
            <input
              type="text"
              placeholder="Search by name, category, color..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                width: "100%", padding: "9px 12px 9px 36px",
                borderRadius: 10, border: "1.5px solid #e2e8f0",
                fontSize: 13, outline: "none", background: "#fff",
                color: "#1e293b", boxSizing: "border-box", fontFamily: "inherit",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
              onBlur={(e)  => (e.target.style.borderColor = "#e2e8f0")}
            />
            {searchTerm && (
              <button onClick={() => handleSearch("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 0 }}>
                <CloseOutlined style={{ fontSize: 12 }} />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <Select
            allowClear
            placeholder={<span style={{ color: "#94a3b8" }}><FilterOutlined /> Filter by Category</span>}
            value={categoryFilter}
            onChange={handleCategoryFilter}
            style={{ width: 200 }}
            options={uniqueCategories}
          />

          <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "#94a3b8" }}>
              {(filteredData.length > 0 || searchTerm || categoryFilter ? filteredData : data).length} of {data.length} products
            </span>
            <Button type="primary" onClick={fetchData} style={{ borderRadius: 9, fontWeight: 600, background: "#1e3a5f", border: "none", height: 36 }}>
              Refresh
            </Button>
          </div>
        </div>

        {/* Bulk Action Bar */}
        {selectedRowKeys.length > 0 && (
          <div style={bulkBarStyle}>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 14, whiteSpace: "nowrap" }}>
              {selectedRowKeys.length} selected
            </span>
            <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.25)" }} />
            <Popconfirm
              title={`Delete ${selectedRowKeys.length} product(s)?`}
              description="This deletes both the variants and their associated products. Cannot be undone."
              onConfirm={handleBulkDelete}
              okText="Delete All"
              okButtonProps={{ danger: true }}
              cancelText="Cancel"
            >
              <button style={bulkBtnStyle("danger")}>
                <DeleteOutlined /> Delete Selected
              </button>
            </Popconfirm>
            <button style={{ ...bulkBtnStyle("default"), marginLeft: "auto" }} onClick={() => { setSelectedRowKeys([]); setSelectedRows([]); }}>
              <CloseOutlined /> Clear
            </button>
          </div>
        )}

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={filteredData.length > 0 || searchTerm || categoryFilter ? filteredData : data}
            rowKey={(r) => r._id}
            onChange={handleTableChange}
            pagination={{
              pageSize,
              showSizeChanger: true,
              pageSizeOptions: ["10", "25", "50", "100"],
              showTotal: (total, range) => (
                <span style={{ fontSize: 13, color: "#64748b" }}>
                  {range[0]}–{range[1]} of <strong>{total}</strong> products
                </span>
              ),
              onShowSizeChange: (_, size) => setPageSize(size),
              style: { padding: "12px 20px" },
            }}
            scroll={{ x: 900 }}
            size="middle"
            rowClassName={(_, index) => index % 2 === 0 ? "product-row-even" : "product-row-odd"}
          />
        </div>
      </div>

      {/* ─── View Details Modal ─────────────────────────────────────────────────── */}
      <Modal
        open={isDetailVisible}
        onCancel={() => setIsDetailVisible(false)}
        footer={null}
        width={780}
        title={null}
        styles={{ body: { padding: 0 } }}
        style={{ top: 40 }}
      >
        {viewRecord && <ProductDetailView
          record={viewRecord}
          onEdit={() => { setIsDetailVisible(false); handleEdit(viewRecord); }}
          onClose={() => setIsDetailVisible(false)}
        />}
      </Modal>

      {/* ─── Edit Modal ─────────────────────────────────────────────────────────── */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <EditOutlined style={{ color: "#10b981" }} />
            <span style={{ fontWeight: 700, fontSize: 16 }}>Edit Product</span>
          </div>
        }
        open={isEditVisible}
        onOk={handleModalOk}
        onCancel={() => { setEditingRecord(null); setIsEditVisible(false); }}
        width={680}
        style={{ top: 40 }}
        footer={[
          <Button key="cancel" onClick={() => { setEditingRecord(null); setIsEditVisible(false); }} style={{ borderRadius: 8 }}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleModalOk} style={{ borderRadius: 8, background: "#10b981", border: "none", fontWeight: 600 }}>
            Save Changes
          </Button>,
        ]}
      >
        <Form form={editForm} layout="vertical" style={{ marginTop: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Form.Item label="Title" name="title" style={{ margin: 0 }}>
              <Input style={{ borderRadius: 8 }} />
            </Form.Item>
            <Form.Item label="Category" name="category" style={{ margin: 0 }}>
              <Select onChange={(val) => { setSelectedCategory(val); setSelectedSubCategory(null); editForm.setFieldsValue({ subCategory: null, childCategory: null }); }} style={{ borderRadius: 8 }}>
                {categories.map((cat) => (
                  <Select.Option key={cat._id} value={cat._id}>{cat.title}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Sub Category" name="subCategory" style={{ margin: 0 }}>
              <Select onChange={(val) => { setSelectedSubCategory(val); editForm.setFieldsValue({ childCategory: null }); }} disabled={!selectedCategory}>
                {filteredSubCategories.map((sub) => (
                  <Select.Option key={sub._id} value={sub._id}>{sub.title}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Child Category" name="childCategory" style={{ margin: 0 }}>
              <Select disabled={!selectedSubCategory}>
                {filteredChildCategories.map((child) => (
                  <Select.Option key={child._id} value={child._id}>{child.title}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item label="Description" name="description" style={{ marginTop: 12 }}>
            <Input style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item label="Details" name="details" style={{ marginTop: 0 }}>
            <ReactQuill />
          </Form.Item>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Form.Item label="Color Name" name="colorName" style={{ margin: 0 }}>
              <Input style={{ borderRadius: 8 }} />
            </Form.Item>
            <Form.Item label="Color Code" name="colorCode" style={{ margin: 0 }}>
              <Input style={{ borderRadius: 8 }} />
            </Form.Item>
          </div>

          <Divider style={{ margin: "16px 0 8px" }}>Options</Divider>
          {productOptions.map((option, index) => (
            <div key={index} style={{ background: "#f8faff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 14px", marginBottom: 10 }}>
              <div style={{ fontWeight: 600, fontSize: 12, color: "#64748b", marginBottom: 8 }}>Option {index + 1} — Size: {option.size}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
                {[["Price", "price"], ["Quantity", "stock"], ["SKU", "sku"], ["Size", "size"]].map(([label, field]) => (
                  <Form.Item key={field} label={label} style={{ margin: 0 }}>
                    <Input
                      value={option[field]}
                      onChange={(e) => handleOptionChange(index, field, e.target.value)}
                      size="small"
                      style={{ borderRadius: 6 }}
                    />
                  </Form.Item>
                ))}
              </div>
            </div>
          ))}

          <Divider style={{ margin: "12px 0 8px" }}>Images</Divider>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
            {imagePreviews.map((image, index) => (
              <div key={index} style={{ position: "relative" }}>
                <img src={image} alt={`img-${index}`} style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: "1px solid #e2e8f0" }} />
                <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDeletePreviewImage(index)}
                  style={{ position: "absolute", top: -6, right: -6, width: 22, height: 22, padding: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }} />
              </div>
            ))}
          </div>
          <Form.Item label="Upload New Images">
            <Upload listType="picture" fileList={fileList} onChange={({ fileList }) => setFileList(fileList)} beforeUpload={() => false} multiple>
              <Button icon={<UploadOutlined />} style={{ borderRadius: 8 }}>Upload Images</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* Inline styles */}
      <style>{`
        .product-row-even td { background: #ffffff !important; }
        .product-row-odd  td { background: #fafbff !important; }
        .ant-table-thead > tr > th {
          background: #f8faff !important;
          font-weight: 700 !important;
          font-size: 12px !important;
          color: #475569 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.4px !important;
          border-bottom: 2px solid #e2e8f0 !important;
          white-space: nowrap !important;
        }
        .ant-table-tbody > tr > td {
          padding: 10px 12px !important;
          border-bottom: 1px solid #f1f5f9 !important;
          vertical-align: middle !important;
        }
        .ant-table-tbody > tr:hover > td { background: #f0f9ff !important; }
      `}</style>
    </div>
  );
};

// ─── ProductDetailView ────────────────────────────────────────────────────────
const ProductDetailView = ({ record, onEdit, onClose }) => {
  const photos = record.product?.photos?.filter((p) => !p.includes("youtube.com")) || [];
  const videos = record.product?.photos?.filter((p) => p.includes("youtube.com") || p.includes("youtu.be")) || [];
  const [activePhoto, setActivePhoto] = useState(0);

  const sectionHead = { fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 10 };
  const labelStyle  = { fontSize: 12, color: "#94a3b8", marginBottom: 2 };
  const valueStyle  = { fontSize: 13, color: "#1e293b", fontWeight: 500, marginBottom: 10 };
  const totalStock  = getTotalStock(record.options);
  const minPrice    = getMinPrice(record.options);

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)", padding: "24px 28px", borderRadius: "8px 8px 0 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginBottom: 4 }}>Product Details</div>
          <div style={{ color: "#fff", fontSize: 20, fontWeight: 800, letterSpacing: "-0.5px", maxWidth: 420 }}>
            {record.product?.name || "—"}
          </div>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 4, display: "flex", gap: 10 }}>
            <span>{record.category}</span>
            {record.subCategory !== "N/A" && <><span>›</span><span>{record.subCategory}</span></>}
            {record.childCategory !== "N/A" && <><span>›</span><span>{record.childCategory}</span></>}
          </div>
        </div>
        <StockBadge stock={totalStock} />
      </div>

      <div style={{ padding: "24px 28px" }}>
        <div style={{ display: "grid", gridTemplateColumns: photos.length ? "1fr 1fr" : "1fr", gap: 24, marginBottom: 24 }}>
          {/* Image Gallery */}
          {photos.length > 0 && (
            <div>
              <div style={sectionHead}>Gallery</div>
              <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e2e8f0", marginBottom: 8, background: "#f8faff", display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
                <img src={photos[activePhoto]} alt="main" style={{ maxWidth: "100%", maxHeight: 200, objectFit: "contain" }} />
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {photos.map((p, i) => (
                  <img key={i} src={p} alt={`thumb-${i}`} onClick={() => setActivePhoto(i)}
                    style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 7, border: `2px solid ${i === activePhoto ? "#3b82f6" : "#e2e8f0"}`, cursor: "pointer", transition: "border 0.15s" }} />
                ))}
              </div>
            </div>
          )}

          {/* Product Info */}
          <div style={{ background: "#f8faff", borderRadius: 12, padding: "16px 18px", border: "1px solid #e8f0fe" }}>
            <div style={sectionHead}>Variant Info</div>
            <div style={labelStyle}>Color</div>
            <div style={{ ...valueStyle, display: "flex", alignItems: "center", gap: 8 }}>
              {record.colorCode && (
                <span style={{ width: 16, height: 16, borderRadius: "50%", background: record.colorCode, border: "1px solid #e2e8f0", display: "inline-block" }} />
              )}
              {record.colorName || "—"}
            </div>
            <div style={labelStyle}>Min Price</div>
            <div style={{ ...valueStyle, fontSize: 18, fontWeight: 800, color: "#1e40af" }}>
              {minPrice != null ? `৳${Math.round(minPrice).toLocaleString()}` : "—"}
            </div>
            <div style={labelStyle}>Description</div>
            <div style={{ ...valueStyle, fontSize: 12, lineHeight: 1.6, color: "#475569" }}>
              {record.product?.description || "—"}
            </div>
          </div>
        </div>

        {/* Options Table */}
        {record.options?.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={sectionHead}>Stock & Pricing Options</div>
            <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f1f5f9" }}>
                    {["Size", "Stock", "Price", "Sale Price", "SKU", "Discount"].map((h) => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.4px", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {record.options.map((opt, idx) => (
                    <tr key={idx} style={{ borderTop: idx > 0 ? "1px solid #f1f5f9" : "none", background: idx % 2 === 0 ? "#fff" : "#fafbff" }}>
                      <td style={{ padding: "10px 14px", fontWeight: 700 }}>
                        <span style={{ background: "#e0e7ff", color: "#3730a3", padding: "2px 8px", borderRadius: 6, fontSize: 12, fontWeight: 700 }}>{opt.size || "—"}</span>
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <StockBadge stock={opt.stock || 0} />
                      </td>
                      <td style={{ padding: "10px 14px", color: "#64748b" }}>৳{(opt.price || 0).toLocaleString()}</td>
                      <td style={{ padding: "10px 14px", fontWeight: 700, color: "#10b981" }}>
                        {opt.salePrice ? `৳${opt.salePrice.toLocaleString()}` : "—"}
                      </td>
                      <td style={{ padding: "10px 14px", fontFamily: "monospace", fontSize: 12, color: "#94a3b8" }}>{opt.sku || "—"}</td>
                      <td style={{ padding: "10px 14px", color: opt.discountValue ? "#f59e0b" : "#94a3b8", fontWeight: opt.discountValue ? 700 : 400 }}>
                        {opt.discountValue ? `${opt.discountValue}${opt.discountType === "percent" ? "%" : " Tk"}` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Videos */}
        {videos.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={sectionHead}>Videos</div>
            <div style={{ display: "flex", gap: 10 }}>
              {videos.map((url, i) => {
                const videoId = url.split("v=")[1]?.split("&")[0];
                return (
                  <iframe key={i} width="180" height="100" src={`https://www.youtube.com/embed/${videoId}`}
                    frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen title={`Video ${i}`} style={{ borderRadius: 8 }} />
                );
              })}
            </div>
          </div>
        )}

        <Divider style={{ margin: "16px 0" }} />
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Button onClick={onClose} style={{ borderRadius: 9 }}>Close</Button>
          <Button type="primary" icon={<EditOutlined />} onClick={onEdit} style={{ borderRadius: 9, background: "#10b981", border: "none", fontWeight: 600 }}>
            Edit Product
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AllProduct;
