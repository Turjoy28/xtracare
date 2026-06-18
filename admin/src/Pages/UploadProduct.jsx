import React, { useState, useEffect } from "react";
import {
  Input,
  Select,
  Form,
  Button,
  message,
  Upload,
  Checkbox,
  Divider,
  Tooltip,
} from "antd";
import {
  InboxOutlined,
  LoadingOutlined,
  PlusOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  TagOutlined,
  AppstoreOutlined,
  PictureOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import axios from "../Components/Axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const { Dragger } = Upload;

// ─── Style constants ───────────────────────────────────────────────────────────
const S = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f8faff 0%, #f1f5f9 100%)",
    padding: "32px 24px 60px",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  card: {
    background: "#fff",
    borderRadius: 16,
    border: "1px solid #e8f0fe",
    boxShadow: "0 2px 12px rgba(30,58,95,0.07)",
    padding: "28px 32px",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
    marginBottom: 18,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
    marginBottom: 4,
    display: "block",
  },
  hint: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 2,
  },
  input: { borderRadius: 9, height: 38, fontSize: 13 },
  select: { borderRadius: 9, height: 38 },
  variantCard: {
    background: "#f8faff",
    border: "1px solid #e0e7ff",
    borderRadius: 14,
    padding: "20px 22px",
    marginBottom: 16,
    position: "relative",
  },
  optionCard: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    padding: "14px 16px",
    marginBottom: 10,
    position: "relative",
  },
  addBtn: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "8px 16px", borderRadius: 9,
    border: "1.5px dashed #a5b4fc",
    background: "#f0f4ff", color: "#4f46e5",
    cursor: "pointer", fontWeight: 600, fontSize: 13,
    transition: "all 0.2s", width: "100%",
    justifyContent: "center", marginTop: 8,
  },
  removeBtn: {
    position: "absolute", top: 12, right: 14,
    background: "#fee2e2", border: "none",
    color: "#ef4444", borderRadius: 8,
    width: 28, height: 28, display: "flex",
    alignItems: "center", justifyContent: "center",
    cursor: "pointer", fontSize: 14, flexShrink: 0,
  },
};

// ─── Section Header component ─────────────────────────────────────────────────
const SectionHeader = ({ icon, title, subtitle }) => (
  <div style={{ marginBottom: 22 }}>
    <div style={S.sectionTitle}>
      {icon}
      {title}
    </div>
    {subtitle && <p style={{ fontSize: 12, color: "#94a3b8", margin: "-10px 0 16px" }}>{subtitle}</p>}
    <div style={{ height: 2, background: "linear-gradient(90deg, #6366f1 0%, #a5b4fc 60%, transparent 100%)", borderRadius: 2 }} />
  </div>
);

// ─── Field wrapper ────────────────────────────────────────────────────────────
const Field = ({ label, hint, required, children, style }) => (
  <div style={{ marginBottom: 16, ...style }}>
    <label style={S.label}>
      {label}
      {required && <span style={{ color: "#ef4444", marginLeft: 3 }}>*</span>}
    </label>
    {children}
    {hint && <div style={S.hint}>{hint}</div>}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const UploadProduct = () => {
  const [productForm] = Form.useForm();
  const [variantFileList, setVariantFileList] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [variants, setVariants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [childCategories, setChildCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);

  // ── Data fetching ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetch = async () => {
      try {
        const [catRes, subRes, childRes, brandRes] = await Promise.all([
          axios.get("/category"),
          axios.get("/subCategory"),
          axios.get("/childCategory"),
          axios.get("/brand"),
        ]);
        setCategories(catRes.data.data.doc);
        setSubCategories(subRes.data.data.doc);
        setChildCategories(childRes.data.data.doc);
        setBrands(brandRes.data.data.doc);
      } catch (e) { console.error(e); }
    };
    fetch();
  }, []);

  const filteredSubCategories  = subCategories.filter((s) => s.category === selectedCategory);
  const filteredChildCategories = childCategories.filter((c) => {
    const subId = c.subCategory?._id || c.subCategory;
    return subId === selectedSubCategory;
  });

  // ── Image handling ────────────────────────────────────────────────────────────
  const handleImagePreview = (file) => {
    if (file?.originFileObj) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreviewUrls((prev) => [...prev, e.target.result]);
      reader.readAsDataURL(file.originFileObj);
    }
  };

  const variantUploadProps = {
    fileList: variantFileList,
    multiple: true,
    onRemove: (file) => {
      const index = variantFileList.indexOf(file);
      if (index !== -1) {
        setVariantFileList((prev) => { const n = [...prev]; n.splice(index, 1); return n; });
        setImagePreviewUrls((prev) => { const n = [...prev]; n.splice(index, 1); return n; });
      }
    },
    beforeUpload: (file) => {
      if (!file.type.startsWith("image/")) {
        message.error(`${file.name} is not an image file!`);
        return Upload.LIST_IGNORE;
      }
      setVariantFileList((prev) => [...prev, file]);
      handleImagePreview({ originFileObj: file });
      return false;
    },
  };

  // ── Variant management ────────────────────────────────────────────────────────
  const handleAddVariant = () => {
    setVariants((prev) => [...prev, {
      colorName: "", colorCode: "", details: "",
      options: [{ sku: "", size: "", price: "", stock: "" }],
    }]);
  };

  const handleRemoveVariant = (idx) => {
    setVariants((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddOption = (variantIndex) => {
    setVariants((prev) => {
      const next = [...prev];
      next[variantIndex].options.push({ sku: "", size: "", price: "", stock: "" });
      return next;
    });
  };

  const handleRemoveOption = (variantIndex, optionIndex) => {
    setVariants((prev) => {
      const next = [...prev];
      next[variantIndex].options = next[variantIndex].options.filter((_, i) => i !== optionIndex);
      return next;
    });
  };

  const updateVariant = (variantIndex, field, value) => {
    setVariants((prev) => {
      const next = [...prev];
      next[variantIndex][field] = value;
      return next;
    });
  };

  const updateOption = (variantIndex, optionIndex, field, value) => {
    setVariants((prev) => {
      const next = [...prev];
      next[variantIndex].options[optionIndex][field] = value;
      return next;
    });
  };

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleVariantSubmit = async (values) => {
    if (variantFileList.length === 0) { message.error("Please upload at least one product image!"); return; }
    if (variants.length === 0) { message.error("At least one variant (color) is required."); return; }

    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("category", values.category);
    formData.append("subCategory", values.subCategory);
    if (values.childCategory) formData.append("childCategory", values.childCategory);
    if (values.brand) formData.append("brand", values.brand);
    formData.append("description", values.description || "");
    if (values.videoUrl) formData.append("videoUrl", values.videoUrl);
    variantFileList.forEach((file) => formData.append("photos", file));

    setLoading(true);
    try {
      const response  = await axios.post("/product", formData, { headers: { "Content-Type": "multipart/form-data" } });
      const productId = response.data.data.product._id;

      for (const variant of variants) {
        const variantResponse = await axios.post("/varient", {
          colorName: variant.colorName, colorCode: variant.colorCode,
          details: variant.details, product: productId,
          category: values.category, subCategory: values.subCategory,
          childCategory: values.childCategory, brand: values.brand,
        });

        for (const option of variant.options) {
          await axios.post("/option", {
            ...option, product: productId,
            variant: variantResponse.data.data.variant._id,
            category: values.category, subCategory: values.subCategory,
            childCategory: values.childCategory, brand: values.brand || null,
            freeShipping: values.freeShipping,
          });
        }
      }

      message.success("Product uploaded successfully! 🎉");
      productForm.resetFields();
      setVariantFileList([]);
      setVariants([]);
      setImagePreviewUrls([]);
      setSelectedCategory(null);
      setSelectedSubCategory(null);
    } catch (error) {
      const serverMessage = error.response?.data?.message || error.message || "";
      if (serverMessage.includes("Name already exist")) {
        message.error("এই নামের প্রোডাক্ট ইতিমধ্যে আছে! দয়া করে অন্য একটি নাম ব্যবহার করুন।");
      } else if (serverMessage.includes("Too many files")) {
        message.error("Maximum 10 images allowed.");
      } else if (serverMessage.includes("Color code length")) {
        message.error("Color code must be 6 characters with # (example: #000000)");
      } else {
        message.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      {/* Page Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
          Upload New Product
        </h1>
        <p style={{ margin: "5px 0 0", color: "#94a3b8", fontSize: 14 }}>
          Fill in all product details carefully. Fields marked <span style={{ color: "#ef4444" }}>*</span> are required.
        </p>
      </div>

      <Form form={productForm} onFinish={handleVariantSubmit} layout="vertical">

        {/* ── Section 1: Basic Info ────────────────────────────────────────────── */}
        <div style={S.card}>
          <SectionHeader icon={<TagOutlined style={{ color: "#6366f1" }} />} title="Basic Information" subtitle="Product name, description and categorisation" />

          {/* Product Title */}
          <Form.Item
            name="name"
            label={<span style={S.label}>Product Title <span style={{ color: "#ef4444" }}>*</span></span>}
            rules={[{ required: true, message: "Please enter the product title!" }]}
            style={{ marginBottom: 16 }}
          >
            <Input
              placeholder="e.g. Men's Premium Cotton T-Shirt"
              style={S.input}
              suffix={
                <Tooltip title="Each product must have a unique title">
                  <InfoCircleOutlined style={{ color: "#94a3b8" }} />
                </Tooltip>
              }
            />
          </Form.Item>
          <div style={S.hint} className="mb-4">প্রত্যেক প্রোডাক্টের Title আলাদা হতে হবে — each product title must be unique.</div>

          {/* Description */}
          <Form.Item
            name="description"
            label={<span style={S.label}>Product Description</span>}
            style={{ marginBottom: 16 }}
          >
            <Input.TextArea
              rows={3}
              placeholder="Short summary of the product — shown in search results and product cards."
              style={{ borderRadius: 9, fontSize: 13, resize: "vertical" }}
            />
          </Form.Item>

          {/* Categories row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 6 }}>
            <Form.Item
              name="category"
              label={<span style={S.label}>Category <span style={{ color: "#ef4444" }}>*</span></span>}
              rules={[{ required: true, message: "Please select a category!" }]}
              style={{ margin: 0 }}
            >
              <Select
                placeholder="Select category"
                style={{ borderRadius: 9 }}
                options={categories.map((c) => ({ label: c.title, value: c._id }))}
                onChange={(val) => {
                  setSelectedCategory(val);
                  setSelectedSubCategory(null);
                  productForm.setFieldsValue({ subCategory: undefined, childCategory: undefined });
                }}
              />
            </Form.Item>

            <Form.Item
              name="subCategory"
              label={<span style={S.label}>Sub Category <span style={{ color: "#ef4444" }}>*</span></span>}
              rules={[{ required: true, message: "Please select a sub-category!" }]}
              style={{ margin: 0 }}
            >
              <Select
                placeholder={selectedCategory ? "Select sub-category" : "Select category first"}
                disabled={!selectedCategory}
                style={{ borderRadius: 9 }}
                options={filteredSubCategories.map((s) => ({ label: s.title, value: s._id }))}
                onChange={(val) => {
                  setSelectedSubCategory(val);
                  productForm.setFieldsValue({ childCategory: undefined });
                }}
              />
            </Form.Item>

            <Form.Item
              name="childCategory"
              label={<span style={S.label}>Child Category</span>}
              style={{ margin: 0 }}
            >
              <Select
                placeholder={selectedSubCategory ? "Select child category" : "Select sub-category first"}
                disabled={!selectedSubCategory}
                style={{ borderRadius: 9 }}
                options={filteredChildCategories.map((c) => ({ label: c.title, value: c._id }))}
              />
            </Form.Item>
          </div>

          {/* Brand + Free Shipping row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 14, marginTop: 16, alignItems: "flex-end" }}>
            <Form.Item
              name="brand"
              label={<span style={S.label}>Brand</span>}
              style={{ margin: 0 }}
            >
              <Select
                placeholder="Select brand (optional)"
                style={{ borderRadius: 9 }}
                allowClear
                options={brands.map((b) => ({ label: b.title, value: b._id }))}
              />
            </Form.Item>

            <Form.Item name="freeShipping" valuePropName="checked" style={{ margin: 0 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 18px",
                background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 10,
                cursor: "pointer", height: 38,
              }}>
                <Checkbox style={{ margin: 0 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: "#15803d" }}>🚚 Free Shipping</span>
                </Checkbox>
              </div>
            </Form.Item>
          </div>
        </div>

        {/* ── Section 2: Product Images ────────────────────────────────────────── */}
        <div style={S.card}>
          <SectionHeader icon={<PictureOutlined style={{ color: "#0ea5e9" }} />} title="Product Images" subtitle="Upload high-quality images with consistent aspect ratios (max 10 images)" />

          <Dragger
            {...variantUploadProps}
            style={{
              borderRadius: 12, border: "2px dashed #a5b4fc",
              background: "linear-gradient(135deg, #f0f4ff 0%, #fafbff 100%)",
            }}
          >
            <p style={{ fontSize: 36, margin: "12px 0 4px", color: "#6366f1" }}>📸</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", margin: "0 0 4px" }}>
              Click or drag images here to upload
            </p>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
              JPEG, PNG, WEBP — max 10 images — all images must have the same aspect ratio
            </p>
          </Dragger>

          {/* Image Previews */}
          {imagePreviewUrls.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 10 }}>
                Preview ({imagePreviewUrls.length} image{imagePreviewUrls.length > 1 ? "s" : ""})
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} style={{ position: "relative" }}>
                    <img src={url} alt={`Preview ${index + 1}`}
                      style={{ width: 90, height: 90, objectFit: "cover", borderRadius: 10, border: "2px solid #e2e8f0" }} />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index));
                        setVariantFileList((prev) => prev.filter((_, i) => i !== index));
                      }}
                      style={{ position: "absolute", top: -6, right: -6, background: "#ef4444", border: "none", color: "#fff", borderRadius: "50%", width: 20, height: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, padding: 0 }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Section 3: Variants ──────────────────────────────────────────────── */}
        <div style={S.card}>
          <SectionHeader
            icon={<AppstoreOutlined style={{ color: "#8b5cf6" }} />}
            title="Color Variants & Size Options"
            subtitle="Each variant represents a unique color. Add sizes, prices, and stock per color."
          />

          {variants.length === 0 && (
            <div style={{
              textAlign: "center", padding: "30px 20px", background: "#f8faff",
              borderRadius: 12, border: "2px dashed #e0e7ff", marginBottom: 14,
            }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🎨</div>
              <div style={{ fontWeight: 700, color: "#6366f1", fontSize: 14, marginBottom: 4 }}>No variants added yet</div>
              <div style={{ color: "#94a3b8", fontSize: 12 }}>Click the button below to add your first color variant</div>
            </div>
          )}

          {/* Variant List */}
          {variants.map((variant, variantIndex) => (
            <div key={variantIndex} style={S.variantCard}>
              {/* Variant header */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                {variant.colorCode && (
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: variant.colorCode, border: "2px solid #e2e8f0", flexShrink: 0 }} />
                )}
                <span style={{ fontWeight: 700, fontSize: 14, color: "#1e3a5f" }}>
                  Variant {variantIndex + 1}{variant.colorName ? ` — ${variant.colorName}` : ""}
                </span>
                <button type="button" onClick={() => handleRemoveVariant(variantIndex)} style={{ ...S.removeBtn, position: "relative", top: "auto", right: "auto", marginLeft: "auto" }}>
                  <DeleteOutlined />
                </button>
              </div>

              {/* Color fields */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <Field label="Color Name" hint="e.g. Midnight Blue, Crimson Red">
                  <Input
                    value={variant.colorName}
                    onChange={(e) => updateVariant(variantIndex, "colorName", e.target.value)}
                    placeholder="Color name"
                    style={S.input}
                  />
                </Field>

                <Field label="Color Code" hint="6-character hex code with # (e.g. #1a3c8f)">
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <Input
                      value={variant.colorCode}
                      onChange={(e) => updateVariant(variantIndex, "colorCode", e.target.value)}
                      placeholder="#000000"
                      style={{ ...S.input, flex: 1 }}
                    />
                    {variant.colorCode && /^#[0-9a-fA-F]{6}$/.test(variant.colorCode) && (
                      <div style={{ width: 38, height: 38, borderRadius: 8, background: variant.colorCode, border: "2px solid #e2e8f0", flexShrink: 0 }} />
                    )}
                  </div>
                  <div style={S.hint}>বাংলা: # সহ ৬ ক্যারেকটার দিন (উদাহরণ: #012f02)</div>
                </Field>
              </div>

              {/* Details (Rich Text) */}
              <Field
                label="Variant Details"
                hint="Rich text for additional details about this color variant (care instructions, material, etc.)"
              >
                <div style={{ border: "1px solid #e2e8f0", borderRadius: 9, overflow: "hidden" }}>
                  <ReactQuill
                    value={variant.details}
                    onChange={(content) => updateVariant(variantIndex, "details", content)}
                    style={{ background: "#fff" }}
                    modules={{
                      toolbar: [
                        ["bold", "italic", "underline"],
                        [{ list: "ordered" }, { list: "bullet" }],
                        ["clean"],
                      ],
                    }}
                  />
                </div>
              </Field>

              {/* Options */}
              <div style={{ marginTop: 4 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  📐 Size Options
                </div>

                {variant.options.map((option, optionIndex) => (
                  <div key={optionIndex} style={S.optionCard}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#6366f1" }}>
                        Option {optionIndex + 1}{option.size ? ` — Size: ${option.size}` : ""}
                      </span>
                      {variant.options.length > 1 && (
                        <button type="button" onClick={() => handleRemoveOption(variantIndex, optionIndex)}
                          style={{ background: "#fee2e2", border: "none", color: "#ef4444", borderRadius: 6, width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 12, padding: 0 }}>
                          <DeleteOutlined />
                        </button>
                      )}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
                      <Field label="Size" hint="Text or number (e.g. M, L, 42)">
                        <Input
                          value={option.size}
                          onChange={(e) => updateOption(variantIndex, optionIndex, "size", e.target.value)}
                          placeholder="M / L / 42"
                          style={{ ...S.input, height: 34 }}
                        />
                      </Field>
                      <Field label={<span>Price (৳) <span style={{ color: "#ef4444" }}>*</span></span>} hint="ইংরেজি নাম্বারে দিন">
                        <Input
                          type="number"
                          value={option.price}
                          onChange={(e) => updateOption(variantIndex, optionIndex, "price", e.target.value)}
                          placeholder="550"
                          style={{ ...S.input, height: 34 }}
                          prefix={<span style={{ color: "#94a3b8", fontSize: 12 }}>৳</span>}
                        />
                      </Field>
                      <Field label={<span>Stock <span style={{ color: "#ef4444" }}>*</span></span>} hint="ইংরেজি নাম্বারে দিন">
                        <Input
                          type="number"
                          value={option.stock}
                          onChange={(e) => updateOption(variantIndex, optionIndex, "stock", e.target.value)}
                          placeholder="10"
                          style={{ ...S.input, height: 34 }}
                        />
                      </Field>
                      <Field label="SKU" hint="Optional unique code">
                        <Input
                          value={option.sku}
                          onChange={(e) => updateOption(variantIndex, optionIndex, "sku", e.target.value)}
                          placeholder="SKU-001"
                          style={{ ...S.input, height: 34 }}
                        />
                      </Field>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  style={S.addBtn}
                  onClick={() => handleAddOption(variantIndex)}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#e0e7ff"; e.currentTarget.style.borderColor = "#6366f1"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#f0f4ff"; e.currentTarget.style.borderColor = "#a5b4fc"; }}
                >
                  <PlusOutlined /> Add Another Size Option
                </button>
              </div>
            </div>
          ))}

          {/* Add Variant Button */}
          <button
            type="button"
            style={{
              ...S.addBtn,
              background: "linear-gradient(135deg, #f0f4ff 0%, #ede9fe 100%)",
              border: "1.5px dashed #8b5cf6",
              color: "#7c3aed", padding: "12px 20px",
            }}
            onClick={handleAddVariant}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#ede9fe"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "linear-gradient(135deg, #f0f4ff 0%, #ede9fe 100%)"; }}
          >
            <PlusOutlined style={{ fontSize: 16 }} />
            <span style={{ fontSize: 14 }}>Add Color Variant</span>
          </button>
        </div>

        {/* ── Submit ───────────────────────────────────────────────────────────── */}
        <div style={{
          ...S.card,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 28px", background: "linear-gradient(135deg, #f0f4ff 0%, #fafbff 100%)",
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#1e3a5f" }}>Ready to publish?</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
              Make sure all required fields are filled and at least one image and one variant are added.
            </div>
          </div>
          <Form.Item style={{ margin: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              disabled={loading}
              style={{
                background: loading ? "#94a3b8" : "linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)",
                border: "none", borderRadius: 11, height: 46, padding: "0 32px",
                fontSize: 15, fontWeight: 700,
                boxShadow: loading ? "none" : "0 4px 14px rgba(30,64,175,0.35)",
                display: "flex", alignItems: "center", gap: 8,
              }}
            >
              {loading ? (
                <><LoadingOutlined /> Uploading...</>
              ) : (
                <><ShoppingOutlined /> Upload Product</>
              )}
            </Button>
          </Form.Item>
        </div>
      </Form>

      {/* Global ReactQuill override */}
      <style>{`
        .ql-toolbar { border: none !important; border-bottom: 1px solid #e2e8f0 !important; background: #f8faff !important; }
        .ql-container { border: none !important; font-size: 13px !important; }
        .ql-editor { min-height: 80px !important; }
        .ant-form-item-label > label { font-weight: 600 !important; color: #374151 !important; font-size: 13px !important; }
      `}</style>
    </div>
  );
};

export default UploadProduct;
