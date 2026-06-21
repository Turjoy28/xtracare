import { useState, useEffect } from "react";
import {
  Table,
  Button,
  message,
  Modal,
  Form,
  Input,
  Select,
  Dropdown,
  Popconfirm,
  Divider,
  Progress,
} from "antd";
import {
  SearchOutlined,
  MoreOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PrinterOutlined,
  CarOutlined,
  FilterOutlined,
  CloseOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CheckSquareOutlined,
  StopOutlined,
} from "@ant-design/icons";
import axios from "../Components/Axios";

import logoImage from "../assets/logos/main-logo.png";
import qrImg from "../assets/logos/qrcode.png";
import signImage from "../assets/logos/sign.png";

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending: { color: "#f59e0b", bg: "#fef3c7", label: "Pending", icon: <ClockCircleOutlined /> },
  approved: { color: "#3b82f6", bg: "#dbeafe", label: "Approved", icon: <CheckCircleOutlined /> },
  shipped: { color: "#8b5cf6", bg: "#ede9fe", label: "Shipped", icon: <CarOutlined /> },
  delivered: { color: "#10b981", bg: "#d1fae5", label: "Delivered", icon: <CheckSquareOutlined /> },
  canceled: { color: "#ef4444", bg: "#fee2e2", label: "Canceled", icon: <StopOutlined /> },
};

const STATUS_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Canceled", value: "canceled" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const calcGrandTotal = (record) => {
  const isFreeShipping = record.products?.every(
    (p) => p.option?.freeShipping === true
  );
  const shippingCost = isFreeShipping ? 0 : (record.shippingCost || 0);
  const bundleDiscount = Math.round(record.bundleOffer || 0);
  return Math.round((record.totalCost || 0) - bundleDiscount);
};

const calcSubTotal = (record) =>
  record.products?.reduce((sum, product) => {
    const unitPrice = product?.product?.isBundle
      ? product?.product?.price
      : product?.option?.salePrice || product?.option?.price || 0;
    return sum + unitPrice * (product.quantity || 1);
  }, 0) || 0;

const getDeliveryCharge = (record) => {
  const isFreeShipping = record.products?.every(
    (p) => p.option?.freeShipping === true
  );
  return isFreeShipping ? 0 : (record.shippingCost || 0);
};

function numberToWords(num) {
  const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "Ten", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  if (num === 0) return "Zero";
  if (num < 10) return units[num];
  if (num >= 10 && num < 20) return teens[num - 10];
  if (num >= 20 && num < 100) return (tens[Math.floor(num / 10)] + " " + units[num % 10]).trim();
  if (num >= 100 && num < 1000) return (units[Math.floor(num / 100)] + " Hundred " + numberToWords(num % 100)).trim();
  if (num >= 1000 && num < 100000) return (numberToWords(Math.floor(num / 1000)) + " Thousand " + numberToWords(num % 1000)).trim();
  if (num >= 100000 && num < 10000000) return (numberToWords(Math.floor(num / 100000)) + " Lakh " + numberToWords(num % 100000)).trim();
  return "Number too large";
}

// ─── StatusBadge component ────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { color: "#6b7280", bg: "#f3f4f6", label: status, icon: null };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
      color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}30`,
      whiteSpace: "nowrap",
    }}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const Order = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);

  // Edit modal
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [form] = Form.useForm();

  // View Details modal
  const [viewOrder, setViewOrder] = useState(null);
  const [isDetailVisible, setIsDetailVisible] = useState(false);

  // Bulk selection
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [bulkStatus, setBulkStatus] = useState(null);

  // Sorting & pagination
  const [sortedInfo, setSortedInfo] = useState({ columnKey: "createdAt", order: "descend" });
  const [pageSize, setPageSize] = useState(10);

  // Steadfast progress
  const [shipProgress, setShipProgress] = useState(null); // {done, total, failed}

  // ── Data fetching ────────────────────────────────────────────────────────────
  const fetchOrders = async () => {
    try {
      const response = await axios.get("/order");
      const orders = response.data.data.doc;
      setData(orders);
      applyFilters(orders, searchTerm, statusFilter);
    } catch (error) {
      console.error("Error fetching orders:", error);
      message.error("Failed to load orders");
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const applyFilters = (source, search, status) => {
    let result = source || data;
    const trimmed = (search || "").trim().toLowerCase();
    if (trimmed) {
      result = result.filter((order) => {
        const idMatch = order._id.slice(-6).toLowerCase().includes(trimmed);
        const phoneMatch = (order.phone || "").toLowerCase().includes(trimmed);
        const nameMatch = (order.name || "").toLowerCase().includes(trimmed);
        return idMatch || phoneMatch || nameMatch;
      });
    }
    if (status) {
      result = result.filter((order) => order.orderStatus === status);
    }
    setFilteredData(result);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    applyFilters(data, value, statusFilter);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value || null);
    applyFilters(data, searchTerm, value || null);
  };

  // ── CRUD handlers ────────────────────────────────────────────────────────────
  const handleEdit = (record) => {
    setCurrentOrder(record);
    form.setFieldsValue({
      ...record,
      colorName: record.products?.[0]?.option?.variant?.colorName || "",
    });
    setIsEditModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/order/${id}`);
      message.success("Order deleted successfully");
      fetchOrders();
    } catch (error) {
      message.error("Failed to delete order");
    }
  };

  const handleUpdate = async (values) => {
    try {
      const updatedProducts = currentOrder.products.map((product) => ({
        ...product,
        option: {
          ...product.option,
          variant: { ...product.option?.variant, colorName: values.colorName },
        },
      }));
      await axios.patch(`/order/${currentOrder?._id}`, { ...values, products: updatedProducts });
      message.success("Order updated successfully");
      setIsEditModalVisible(false);
      fetchOrders();
    } catch (error) {
      message.error("Failed to update order");
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.patch(`/order/${orderId}`, { orderStatus: newStatus });
      message.success("Order status updated");
      fetchOrders();
    } catch (error) {
      message.error("Failed to update order status");
    }
  };

  // ── Steadfast shipping ───────────────────────────────────────────────────────
  const handleShipSteadfast = async (order) => {
    try {
      const response = await axios.post(`/order/ship-steadfast/${order._id}`);
      if (response?.status === 200 || response?.data?.status === "success") {
        message.success(`Order #${order._id.slice(-6)} shipped via Steadfast`);
        fetchOrders();
      }
    } catch (error) {
      const errMsg = error?.response?.data?.message || "Error placing order with Steadfast";
      message.error(errMsg);
    }
  };

  const handleBulkShipSteadfast = async () => {
    if (!selectedRows.length) return;
    const total = selectedRows.length;
    let done = 0, failed = 0;
    setShipProgress({ done: 0, total, failed: 0 });

    for (const order of selectedRows) {
      try {
        await axios.post(`/order/ship-steadfast/${order._id}`);
        done++;
        setShipProgress({ done, total, failed });
      } catch (error) {
        failed++;
        done++;
        setShipProgress({ done, total, failed });
        console.error(`Failed to ship order ${order._id.slice(-6)}:`, error?.response?.data?.message || error.message);
      }
    }

    const succeeded = total - failed;
    if (failed === 0) {
      message.success(`All ${total} orders shipped via Steadfast successfully!`);
    } else {
      message.warning(`${succeeded} shipped successfully, ${failed} failed. Check console for details.`);
    }
    setSelectedRowKeys([]);
    setSelectedRows([]);
    setShipProgress(null);
    fetchOrders();
  };

  // ── Bulk actions ─────────────────────────────────────────────────────────────
  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedRowKeys.map((id) => axios.delete(`/order/${id}`)));
      message.success(`${selectedRowKeys.length} orders deleted`);
      setSelectedRowKeys([]);
      setSelectedRows([]);
      fetchOrders();
    } catch (error) {
      message.error("Failed to delete some orders");
      fetchOrders();
    }
  };

  const handleBulkStatusChange = async () => {
    if (!bulkStatus) { message.warning("Select a status first"); return; }
    try {
      await Promise.all(
        selectedRowKeys.map((id) => axios.patch(`/order/${id}`, { orderStatus: bulkStatus }))
      );
      message.success(`${selectedRowKeys.length} orders updated to "${bulkStatus}"`);
      setSelectedRowKeys([]);
      setSelectedRows([]);
      setBulkStatus(null);
      fetchOrders();
    } catch (error) {
      message.error("Failed to update some orders");
      fetchOrders();
    }
  };

  // ── Invoice printing ─────────────────────────────────────────────────────────
  const handlePrintInvoice = async (order) => {
    const response = await axios.get(`/order/${order._id}`);
    const anOrder = response?.data?.data?.doc;
    const isFreeShipping = anOrder.products.every((p) => p.option?.freeShipping === true);
    const deliveryCharge = isFreeShipping ? 0 : anOrder.shippingCost;

    const productsWithTotalPrice = anOrder.products.map((product) => {
      const unitPrice = product?.product?.isBundle
        ? product?.product?.price
        : product?.option?.salePrice || product?.option?.price || 0;
      return { ...product, totalPrice: Math.round(unitPrice * product.quantity) };
    });

    const subTotal = productsWithTotalPrice.reduce((sum, p) => sum + p.totalPrice, 0);
    const bundleOffer = Math.round(anOrder?.bundleOffer || 0);
    const grandTotal = subTotal + deliveryCharge - bundleOffer;
    const grandTotalInWords = numberToWords(grandTotal);

    const invoiceContent = `
    <html><head><title>Invoice</title><style>
    @page{size:auto;margin:0;}
    @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}header,footer{display:none;visibility:hidden;}}
    body{font-family:Arial,sans-serif;margin:40px;color:#333;}
    header,footer{display:none;visibility:hidden;}
    .header{display:flex;justify-content:space-between;align-items:center;margin-bottom:30px;}
    .header .logo{font-size:2rem;font-weight:bold;}
    .products-details{font-size:12px;}
    .header .invoice-title{font-size:1.2rem;font-weight:bold;color:#EC081D;}
    .billing-section{display:flex;justify-content:space-between;margin-bottom:10px;}
    .billing-info p,.order-info p{margin:5px 0;font-size:12px;}
    table{width:100%;border-collapse:collapse;margin-bottom:20px;font-size:12px;}
    th,td{border:1px solid #ccc;padding:5px;text-align:left;}
    th{background-color:#f9f9f9;}
    .summary{text-align:right;}.summary p{margin:5px 0;font-size:12px;}
    .total{font-size:1.2rem;font-weight:bold;}
    .thank-you{margin-top:50px;font-size:12px;}
    .signature-section{display:flex;justify-content:space-between;align-items:center;margin-top:50px;}
    .signature-box{width:45%;text-align:center;padding-top:10px;border-top:1px solid #000;font-weight:bold;}
    .sellerSig{font-weight:bold;}
    </style></head><body>
    <div class="header"><div class="logo"><img src="${logoImage}" alt="Logo" style="height:80px;"/></div><div class="invoice-title">INVOICE</div></div>
    <div class="billing-section"><div class="billing-info"><p><strong><b>COMPANY:</b></strong></p><p>Extracare BD</p><p>+8801718674140</p><p>rpcworldbd@gmail.com</p></div></div>
    <div class="billing-section"><div class="billing-info"><p><strong>BILL TO:</strong></p><p>${anOrder.name}</p><p>${anOrder.phone}</p><p>${anOrder.email}</p><p>${anOrder.streetAddress}</p></div>
    <div class="order-info"><p><strong>Invoice No.:</strong> ${anOrder._id.slice(-6)}</p><p><strong>Date:</strong> ${new Date(anOrder.createdAt).toLocaleDateString()}</p></div></div>
    <table><thead><tr><th>Products</th><th>Quantity</th><th>Unit Price</th><th>Total Price</th></tr></thead><tbody>
    ${productsWithTotalPrice.map((product) => `<tr class="products-details">
    <td class="billing-info"><p>${product?.product?.isBundle ? product?.product?.name || "N/A" : product?.option?.product?.name || "N/A"}</p>
    <p>Size: ${product?.option?.size || "N/A"}</p><p>Color: ${product?.option?.variant?.colorName || "N/A"}</p></td>
    <td>${product?.quantity || "N/A"}</td>
    <td>${product?.product?.isBundle ? product?.product?.price : product.option?.salePrice || product.option?.price || 0} Tk</td>
    <td>${product.totalPrice} Tk</td></tr>`).join("")}
    </tbody><tfoot class="products-details">
    <tr><th scope="row" colspan="3"><strong>Delivery Charge:</strong></th><td><strong>${deliveryCharge === 0 ? "Free Shipping" : `${deliveryCharge} TK`}</strong></td></tr>
    <tr><th scope="row" colspan="3"><strong>Bundle Offer:</strong></th><td><strong>${bundleOffer} TK</strong></td></tr>
    <tr><th scope="row" colspan="3"><strong>Grand Total:</strong></th><td><strong>${grandTotal} TK</strong></td></tr>
    </tfoot></table>
    <p style="font-size:12px">I<em>n Words: ${grandTotalInWords} Taka Only</em></p>
    <p style="font-size:12px"><i>Thank you for shopping with us!</i></p>
    <div class="signature-section"><div><img src="${signImage}" alt="Sign" style="height:60px;"/><br/><span class="sellerSig">Seller's Signature</span><br/>(auto generated Signature)</div>
    <div class="signature-box">Customer's Signature</div></div>
    <div class="qrlogo"><p>More Shopping, SCAN ME!</p><img src="${qrImg}" alt="QR" style="height:200px;"/><br/><span style="font-size:14px;margin-left:30px;">www.xtracarebd.com</span></div>
    </body></html>`;

    const iframe = document.createElement("iframe");
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow.document;
    doc.open(); doc.write(invoiceContent); doc.close();
    iframe.contentWindow.onafterprint = () => document.body.removeChild(iframe);
    iframe.onload = () => { iframe.contentWindow.focus(); iframe.contentWindow.print(); };
  };

  // ── Row action dropdown items ─────────────────────────────────────────────
  const getActionItems = (record) => [
    {
      key: "view",
      icon: <EyeOutlined style={{ color: "#3b82f6" }} />,
      label: <span style={{ color: "#1e3a5f" }}>View Details</span>,
      onClick: () => { setViewOrder(record); setIsDetailVisible(true); },
    },
    {
      key: "edit",
      icon: <EditOutlined style={{ color: "#10b981" }} />,
      label: <span style={{ color: "#1e3a5f" }}>Edit Order</span>,
      onClick: () => handleEdit(record),
    },
    {
      key: "print",
      icon: <PrinterOutlined style={{ color: "#6b7280" }} />,
      label: <span style={{ color: "#1e3a5f" }}>Print Invoice</span>,
      onClick: () => handlePrintInvoice(record),
    },
    { type: "divider" },
    {
      key: "ship",
      icon: <CarOutlined style={{ color: "#8b5cf6" }} />,
      label: <span style={{ color: "#1e3a5f" }}>Ship via Steadfast</span>,
      onClick: () => handleShipSteadfast(record),
      disabled: record.orderStatus === "shipped" || record.orderStatus === "delivered",
    },
    { type: "divider" },
    {
      key: "delete",
      danger: true,
      icon: <DeleteOutlined />,
      label: (
        <Popconfirm
          title="Delete this order?"
          description="This action cannot be undone."
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

  // ── Table columns ────────────────────────────────────────────────────────────
  const columns = [
    {
      title: "SR",
      width: 52,
      render: (_, __, index) => (
        <span style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600 }}>
          {index + 1}
        </span>
      ),
    },
    {
      title: "Order ID",
      key: "_id",
      dataIndex: "_id",
      width: 90,
      sorter: (a, b) => a._id.localeCompare(b._id),
      sortOrder: sortedInfo.columnKey === "_id" ? sortedInfo.order : null,
      render: (text) => (
        <span style={{
          fontFamily: "monospace", fontWeight: 700, fontSize: 13,
          color: "#1e40af", background: "#eff6ff", padding: "2px 7px",
          borderRadius: 6, border: "1px solid #bfdbfe",
        }}>
          #{text.slice(-6)}
        </span>
      ),
    },
    {
      title: "Date",
      key: "createdAt",
      dataIndex: "createdAt",
      width: 95,
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      sortOrder: sortedInfo.columnKey === "createdAt" ? sortedInfo.order : null,
      render: (text) => (
        <span style={{ fontSize: 12, color: "#64748b", whiteSpace: "nowrap" }}>
          {new Date(text).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })}
        </span>
      ),
    },
    {
      title: "Customer",
      width: 160,
      render: (_, record) => (
        <div style={{ lineHeight: 1.35 }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 150 }}>
            {record.name || "—"}
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>{record.phone || "—"}</div>
        </div>
      ),
    },
    {
      title: "Products",
      width: 180,
      render: (_, record) => {
        const count = record.products?.length || 0;
        const firstName = record.products?.[0]?.product?.isBundle
          ? record.products?.[0]?.product?.name
          : record.products?.[0]?.option?.product?.name;
        return (
          <div>
            <div style={{ fontSize: 12, color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 170, fontWeight: 500 }}>
              {firstName || "—"}
            </div>
            {count > 1 && (
              <span style={{ fontSize: 11, color: "#94a3b8" }}>+{count - 1} more item{count - 1 > 1 ? "s" : ""}</span>
            )}
          </div>
        );
      },
    },
    {
      title: "Qty",
      key: "qty",
      width: 52,
      sorter: (a, b) => {
        const qa = a.products?.reduce((s, p) => s + (p.quantity || 0), 0) || 0;
        const qb = b.products?.reduce((s, p) => s + (p.quantity || 0), 0) || 0;
        return qa - qb;
      },
      sortOrder: sortedInfo.columnKey === "qty" ? sortedInfo.order : null,
      render: (_, record) => {
        const qty = record.products?.reduce((s, p) => s + (p.quantity || 0), 0) || 0;
        return <span style={{ fontWeight: 600, color: "#475569", fontSize: 13 }}>{qty}</span>;
      },
    },
    {
      title: "Grand Total",
      key: "grandTotal",
      width: 120,
      sorter: (a, b) => calcGrandTotal(a) - calcGrandTotal(b),
      sortOrder: sortedInfo.columnKey === "grandTotal" ? sortedInfo.order : null,
      render: (_, record) => (
        <span style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>
          ৳{calcGrandTotal(record).toLocaleString()}
        </span>
      ),
    },
    {
      title: "Status",
      key: "orderStatus",
      dataIndex: "orderStatus",
      width: 140,
      filters: STATUS_OPTIONS.map((s) => ({ text: s.label, value: s.value })),
      onFilter: (value, record) => record.orderStatus === value,
      sorter: (a, b) => (a.orderStatus || "").localeCompare(b.orderStatus || ""),
      sortOrder: sortedInfo.columnKey === "orderStatus" ? sortedInfo.order : null,
      render: (_, record) => (
        <Select
          size="small"
          value={record.orderStatus}
          onChange={(value) => handleStatusChange(record._id, value)}
          style={{ width: 128 }}
          options={STATUS_OPTIONS}
          optionRender={(option) => (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {STATUS_CONFIG[option.value]?.icon}
              {option.label}
            </div>
          )}
        />
      ),
    },
    {
      title: "Actions",
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

  // ── Row selection config ──────────────────────────────────────────────────────
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys, rows) => {
      setSelectedRowKeys(keys);
      setSelectedRows(rows);
    },
    columnWidth: 44,
  };

  // ── Handle table change (sorting) ─────────────────────────────────────────────
  const handleTableChange = (pagination, filters, sorter) => {
    setSortedInfo(sorter);
  };

  // ─── Styles ───────────────────────────────────────────────────────────────────
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

  const toolbarStyle = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "18px 20px",
    borderBottom: "1px solid #f1f5f9",
    flexWrap: "wrap",
    background: "#fafbff",
  };

  const bulkBarStyle = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 20px",
    background: "linear-gradient(90deg, #1e3a5f 0%, #1e40af 100%)",
    flexWrap: "wrap",
    transition: "all 0.3s ease",
  };

  const bulkBtnStyle = (variant) => {
    const base = {
      borderRadius: 8, fontWeight: 600, fontSize: 13,
      display: "flex", alignItems: "center", gap: 6,
      border: "none", cursor: "pointer", padding: "6px 14px",
      transition: "all 0.2s",
    };
    if (variant === "danger") return { ...base, background: "#ef4444", color: "#fff" };
    if (variant === "purple") return { ...base, background: "#8b5cf6", color: "#fff" };
    if (variant === "success") return { ...base, background: "#10b981", color: "#fff" };
    return { ...base, background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" };
  };

  return (
    <div style={pageStyle}>
      {/* Page Header */}
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
          Order Management
        </h1>
        <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: 14 }}>
          Manage, track, and ship all customer orders
        </p>
      </div>

      {/* Summary Stats */}
      <div style={{ display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
          const count = data.filter((o) => o.orderStatus === key).length;
          return (
            <div key={key} style={{
              flex: "1 1 120px", background: "#fff", borderRadius: 12, padding: "12px 16px",
              border: `1px solid ${cfg.color}25`,
              boxShadow: `0 2px 8px ${cfg.color}10`,
              display: "flex", flexDirection: "column", gap: 2,
              minWidth: 110,
            }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: cfg.color, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {cfg.label}
              </span>
              <span style={{ fontSize: 24, fontWeight: 800, color: "#0f172a" }}>{count}</span>
            </div>
          );
        })}
        <div style={{
          flex: "1 1 120px", background: "#fff", borderRadius: 12, padding: "12px 16px",
          border: "1px solid #6366f120", boxShadow: "0 2px 8px #6366f110",
          display: "flex", flexDirection: "column", gap: 2, minWidth: 110,
        }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total</span>
          <span style={{ fontSize: 24, fontWeight: 800, color: "#0f172a" }}>{data.length}</span>
        </div>
      </div>

      {/* Main Card */}
      <div style={cardStyle}>
        {/* Toolbar */}
        <div style={toolbarStyle}>
          {/* Search */}
          <div style={{ position: "relative", flex: "1 1 240px", maxWidth: 360 }}>
            <SearchOutlined style={{
              position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
              color: "#94a3b8", fontSize: 15, zIndex: 1,
            }} />
            <input
              type="text"
              placeholder="Search by ID, phone, or name..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                width: "100%", padding: "9px 12px 9px 36px",
                borderRadius: 10, border: "1.5px solid #e2e8f0",
                fontSize: 13, outline: "none", background: "#fff",
                color: "#1e293b", boxSizing: "border-box",
                transition: "border-color 0.2s",
                fontFamily: "inherit",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
              onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
            />
            {searchTerm && (
              <button
                onClick={() => handleSearch("")}
                style={{
                  position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 0,
                }}
              >
                <CloseOutlined style={{ fontSize: 12 }} />
              </button>
            )}
          </div>

          {/* Status filter */}
          <Select
            allowClear
            placeholder={<span style={{ color: "#94a3b8" }}><FilterOutlined /> Filter by Status</span>}
            value={statusFilter}
            onChange={handleStatusFilterChange}
            style={{ width: 200 }}
            options={STATUS_OPTIONS}
          />

          <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "#94a3b8" }}>
              {filteredData.length} of {data.length} orders
            </span>
            <Button
              type="primary"
              onClick={fetchOrders}
              style={{
                borderRadius: 9, fontWeight: 600, background: "#1e3a5f",
                border: "none", height: 36,
              }}
            >
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

            {/* Change Status */}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Select
                placeholder="Set status..."
                value={bulkStatus}
                onChange={setBulkStatus}
                style={{ width: 150, borderRadius: 8 }}
                options={STATUS_OPTIONS}
                size="small"
              />
              <button style={bulkBtnStyle("success")} onClick={handleBulkStatusChange}>
                <CheckCircleOutlined /> Apply Status
              </button>
            </div>

            <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.25)" }} />

            {/* Ship to Steadfast */}
            <Popconfirm
              title={`Ship ${selectedRowKeys.length} order(s) via Steadfast?`}
              description="This will place all selected orders with Steadfast courier and mark them as Shipped."
              onConfirm={handleBulkShipSteadfast}
              okText="Ship All"
              cancelText="Cancel"
              overlayStyle={{ maxWidth: 340 }}
            >
              <button style={bulkBtnStyle("purple")}>
                <CarOutlined /> Ship to Steadfast
              </button>
            </Popconfirm>

            {/* Delete */}
            <Popconfirm
              title={`Delete ${selectedRowKeys.length} order(s)?`}
              description="This action cannot be undone."
              onConfirm={handleBulkDelete}
              okText="Delete All"
              okButtonProps={{ danger: true }}
              cancelText="Cancel"
            >
              <button style={bulkBtnStyle("danger")}>
                <DeleteOutlined /> Delete
              </button>
            </Popconfirm>

            <button
              style={{ ...bulkBtnStyle("default"), marginLeft: "auto" }}
              onClick={() => { setSelectedRowKeys([]); setSelectedRows([]); }}
            >
              <CloseOutlined /> Clear
            </button>
          </div>
        )}

        {/* Steadfast Progress */}
        {shipProgress && (
          <div style={{ padding: "12px 20px", background: "#f0fdf4", borderBottom: "1px solid #bbf7d0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#166534" }}>
                Shipping orders via Steadfast... {shipProgress.done}/{shipProgress.total}
                {shipProgress.failed > 0 && <span style={{ color: "#dc2626" }}> ({shipProgress.failed} failed)</span>}
              </span>
            </div>
            <Progress
              percent={Math.round((shipProgress.done / shipProgress.total) * 100)}
              size="small"
              status={shipProgress.done === shipProgress.total ? (shipProgress.failed > 0 ? "exception" : "success") : "active"}
            />
          </div>
        )}

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={filteredData.length > 0 || searchTerm || statusFilter ? filteredData : data}
            rowKey={(record) => record._id}
            onChange={handleTableChange}
            pagination={{
              pageSize,
              showSizeChanger: true,
              pageSizeOptions: ["10", "25", "50", "100"],
              showTotal: (total, range) => (
                <span style={{ fontSize: 13, color: "#64748b" }}>
                  {range[0]}–{range[1]} of <strong>{total}</strong> orders
                </span>
              ),
              onShowSizeChange: (_, size) => setPageSize(size),
              style: { padding: "12px 20px" },
            }}
            scroll={{ x: 900 }}
            size="middle"
            rowClassName={(record, index) =>
              index % 2 === 0 ? "order-row-even" : "order-row-odd"
            }
            onRow={(record) => ({
              style: { cursor: "default" },
            })}
            style={{ "--ant-table-header-bg": "#f8faff" }}
          />
        </div>
      </div>

      {/* ─── View Details Modal ─────────────────────────────────────────────────── */}
      <Modal
        open={isDetailVisible}
        onCancel={() => setIsDetailVisible(false)}
        footer={null}
        width={860}
        title={null}
        styles={{ body: { padding: 0 } }}
        style={{ top: 40 }}
      >
        {viewOrder && <OrderDetailView
          order={viewOrder}
          onEdit={() => { setIsDetailVisible(false); handleEdit(viewOrder); }}
          onPrint={() => handlePrintInvoice(viewOrder)}
          onShip={() => { setIsDetailVisible(false); handleShipSteadfast(viewOrder); }}
          onStatusChange={(id, status) => { handleStatusChange(id, status); setViewOrder((o) => ({ ...o, orderStatus: status })); }}
          onClose={() => setIsDetailVisible(false)}
        />}
      </Modal>

      {/* ─── Edit Modal ─────────────────────────────────────────────────────────── */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <EditOutlined style={{ color: "#10b981" }} />
            <span style={{ fontWeight: 700, fontSize: 16 }}>Edit Order #{currentOrder?._id?.slice(-6)}</span>
          </div>
        }
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
        width={520}
        style={{ top: 60 }}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdate} style={{ marginTop: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Form.Item label="Name" name="name" style={{ margin: 0 }}>
              <Input placeholder="Customer name" style={{ borderRadius: 8 }} />
            </Form.Item>
            <Form.Item label="Phone" name="phone" style={{ margin: 0 }}>
              <Input placeholder="Phone number" style={{ borderRadius: 8 }} />
            </Form.Item>
          </div>
          <Form.Item label="Email" name="email" style={{ marginTop: 12 }}>
            <Input placeholder="Email address" style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item label="Street Address" name="streetAddress" style={{ marginTop: 0 }}>
            <Input placeholder="Delivery address" style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item label="Total Cost (override)" name="totalCost" style={{ marginTop: 0 }}>
            <Input type="number" placeholder="Amount in BDT" style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Button onClick={() => setIsEditModalVisible(false)} style={{ borderRadius: 8 }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" style={{ borderRadius: 8, background: "#10b981", border: "none", fontWeight: 600 }}>
                Save Changes
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Inline styles */}
      <style>{`
        .order-row-even td { background: #ffffff !important; }
        .order-row-odd  td { background: #fafbff !important; }
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
        .ant-table-tbody > tr:hover > td {
          background: #f0f9ff !important;
        }
        .ant-table-column-sorter { color: #94a3b8 !important; }
        .ant-table-column-sort { background: #eff6ff !important; }
        .ant-pagination { padding: 12px 20px !important; }
        .ant-table-wrapper .ant-table {
          border-radius: 0 !important;
        }
      `}</style>
    </div>
  );
};

// ─── OrderDetailView sub-component ───────────────────────────────────────────
const OrderDetailView = ({ order, onEdit, onPrint, onShip, onStatusChange, onClose }) => {
  const subTotal = calcSubTotal(order);
  const deliveryCharge = getDeliveryCharge(order);
  const bundleDiscount = Math.round(order.bundleOffer || 0);
  const grandTotal = calcGrandTotal(order);

  const sectionHead = { fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 10 };
  const labelStyle = { fontSize: 12, color: "#94a3b8", marginBottom: 2 };
  const valueStyle = { fontSize: 13, color: "#1e293b", fontWeight: 500, marginBottom: 10 };

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Modal Header */}
      <div style={{
        background: "linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)",
        padding: "24px 28px",
        borderRadius: "8px 8px 0 0",
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
      }}>
        <div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginBottom: 4 }}>Order Details</div>
          <div style={{ color: "#fff", fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px" }}>
            Order #{order._id.slice(-6)}
          </div>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 2 }}>
            Placed on {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          <StatusBadge status={order.orderStatus} />
          {order.courier && (
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.1)", padding: "2px 8px", borderRadius: 10 }}>
              {order.courier}
            </span>
          )}
        </div>
      </div>

      <div style={{ padding: "24px 28px" }}>
        {/* Customer + Order Info */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
          {/* Customer */}
          <div style={{ background: "#f8faff", borderRadius: 12, padding: "16px 18px", border: "1px solid #e8f0fe" }}>
            <div style={sectionHead}>Customer Information</div>
            <div style={labelStyle}>Full Name</div>
            <div style={valueStyle}>{order.name || "—"}</div>
            <div style={labelStyle}>Phone</div>
            <div style={valueStyle}>{order.phone || "—"}</div>
            <div style={labelStyle}>Email</div>
            <div style={{ ...valueStyle, wordBreak: "break-word" }}>{order.email || "—"}</div>
            <div style={labelStyle}>Delivery Address</div>
            <div style={valueStyle}>{order.streetAddress || "—"}</div>
            {order.notes && (
              <>
                <div style={labelStyle}>Order Notes</div>
                <div style={{ ...valueStyle, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "6px 10px" }}>
                  {order.notes}
                </div>
              </>
            )}
          </div>

          {/* Order metadata */}
          <div style={{ background: "#f8faff", borderRadius: 12, padding: "16px 18px", border: "1px solid #e8f0fe" }}>
            <div style={sectionHead}>Order Metadata</div>
            <div style={labelStyle}>Order ID</div>
            <div style={{ ...valueStyle, fontFamily: "monospace" }}>{order._id}</div>
            <div style={labelStyle}>Short ID</div>
            <div style={{ ...valueStyle, fontFamily: "monospace", fontWeight: 700, color: "#1e40af" }}>#{order._id.slice(-6)}</div>
            <div style={labelStyle}>Order Date</div>
            <div style={valueStyle}>{new Date(order.createdAt).toLocaleString()}</div>
            <div style={labelStyle}>Courier</div>
            <div style={valueStyle}>{order.courier || "Not assigned"}</div>
            <div style={labelStyle}>Update Status</div>
            <Select
              value={order.orderStatus}
              onChange={(val) => onStatusChange(order._id, val)}
              style={{ width: "100%", marginTop: 2 }}
              options={STATUS_OPTIONS}
            />
          </div>
        </div>

        {/* Products Table */}
        <div style={{ marginBottom: 20 }}>
          <div style={sectionHead}>Products Ordered</div>
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f1f5f9" }}>
                  {["Product", "Size", "Color", "Qty", "Unit Price", "Total"].map((h) => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.4px", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {order.products?.map((product, idx) => {
                  const isBundle = product?.product?.isBundle;
                  const name = isBundle ? product?.product?.name : product?.option?.product?.name;
                  const unitPrice = isBundle ? product?.product?.price : product?.option?.salePrice || product?.option?.price || 0;
                  const total = Math.round(unitPrice * (product.quantity || 1));
                  return (
                    <tr key={idx} style={{ borderTop: idx > 0 ? "1px solid #f1f5f9" : "none", background: idx % 2 === 0 ? "#fff" : "#fafbff" }}>
                      <td style={{ padding: "10px 14px", fontWeight: 600, color: "#1e293b" }}>
                        {name || "—"}
                        {isBundle && <span style={{ marginLeft: 6, fontSize: 10, background: "#dbeafe", color: "#1e40af", padding: "1px 6px", borderRadius: 10, fontWeight: 700 }}>Bundle</span>}
                      </td>
                      <td style={{ padding: "10px 14px", color: "#64748b" }}>{product?.option?.size || "—"}</td>
                      <td style={{ padding: "10px 14px", color: "#64748b" }}>
                        {product?.option?.variant?.colorName || "—"}
                      </td>
                      <td style={{ padding: "10px 14px", fontWeight: 700, color: "#475569" }}>{product.quantity || 1}</td>
                      <td style={{ padding: "10px 14px", color: "#475569" }}>৳{Math.round(unitPrice).toLocaleString()}</td>
                      <td style={{ padding: "10px 14px", fontWeight: 700, color: "#0f172a" }}>৳{total.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Summary */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div style={{ background: "#f8faff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px 22px", minWidth: 260 }}>
            <div style={{ ...sectionHead, marginBottom: 12 }}>Order Summary</div>
            {[
              { label: "Subtotal", value: `৳${Math.round(subTotal).toLocaleString()}` },
              { label: "Delivery Charge", value: deliveryCharge === 0 ? "Free Shipping" : `৳${deliveryCharge.toLocaleString()}` },
              ...(bundleDiscount > 0 ? [{ label: "Bundle Discount", value: `-৳${bundleDiscount.toLocaleString()}`, color: "#10b981" }] : []),
            ].map((row) => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: row.color || "#64748b", marginBottom: 6 }}>
                <span>{row.label}</span>
                <span style={{ fontWeight: 500 }}>{row.value}</span>
              </div>
            ))}
            <div style={{ borderTop: "2px solid #e2e8f0", marginTop: 10, paddingTop: 10, display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 800, fontSize: 15, color: "#0f172a" }}>Grand Total</span>
              <span style={{ fontWeight: 800, fontSize: 18, color: "#1e40af" }}>৳{grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <Divider style={{ margin: "20px 0" }} />
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <Button onClick={onClose} style={{ borderRadius: 9 }}>Close</Button>
          <Button icon={<PrinterOutlined />} onClick={onPrint} style={{ borderRadius: 9, borderColor: "#6b7280", color: "#374151", fontWeight: 600 }}>
            Print Invoice
          </Button>
          <Button
            icon={<CarOutlined />}
            onClick={onShip}
            disabled={order.orderStatus === "shipped" || order.orderStatus === "delivered"}
            style={{
              borderRadius: 9, background: "#8b5cf6", border: "none",
              color: "#fff", fontWeight: 600,
              opacity: (order.orderStatus === "shipped" || order.orderStatus === "delivered") ? 0.5 : 1,
            }}
          >
            Ship via Steadfast
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={onEdit}
            style={{ borderRadius: 9, background: "#10b981", border: "none", fontWeight: 600 }}
          >
            Edit Order
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Order;
