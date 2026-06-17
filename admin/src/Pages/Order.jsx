import { useState, useEffect } from "react";
import {
  Space,
  Table,
  Button,
  message,
  Modal,
  Form,
  Input,
  Select,
} from "antd";
import axios from "../Components/Axios";

import logoImage from "../assets/logos/main-logo.png";
import qrImg from "../assets/logos/qrcode.png";

const Order = () => {
  const [data, setData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentOrder, setCurrentOrder] = useState(null);
  const [form] = Form.useForm();

  const fetchOrders = async () => {
    try {
      const response = await axios.get("/order");
      const orders = response.data.data.doc;

      setData(orders);
      setFilteredData(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const calculateDeliveryCharge = (shippingCost, isFreeShipping) => {
    if (isFreeShipping) return 0;
    return shippingCost;
  };

  const handleSearch = () => {
    const trimmedSearchTerm = searchTerm.trim();

    const filtered = data?.filter((order) => {
      const orderIdMatch = order?._id
        .slice(-6)
        ?.toLowerCase()
        .includes(trimmedSearchTerm?.toLowerCase());
      const phoneMatch = order.phone
        ?.toLowerCase()
        .includes(trimmedSearchTerm.toLowerCase());
      return orderIdMatch || phoneMatch;
    });

    setFilteredData(filtered);
  };

  const handleEdit = (record) => {
    setCurrentOrder(record);
    form.setFieldsValue({
      ...record,
      colorName: record.products?.[0]?.option?.variant?.colorName || "",
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/order/${id}`);
      message.success("Order deleted successfully");
      fetchOrders();
    } catch (error) {
      message.error("Failed to delete order");
      console.error("Error deleting order:", error);
    }
  };

  const handleUpdate = async (values) => {
    try {
      const updatedProducts = currentOrder.products.map((product) => {
        return {
          ...product,
          option: {
            ...product.option,
            variant: {
              ...product.option.variant,
              colorName: values.colorName,
            },
          },
        };
      });

      await axios.patch(`/order/${currentOrder?._id}`, {
        ...values,
        products: updatedProducts,
      });

      message.success("Order updated successfully");
      setIsModalVisible(false);
      fetchOrders();
    } catch (error) {
      message.error("Failed to update order");
      console.error("Error updating order:", error);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.patch(`/order/${orderId}`, { orderStatus: newStatus });
      message.success("Order status updated successfully");
      fetchOrders();
    } catch (error) {
      message.error("Failed to update order status");
      console.error("Error updating order status:", error);
    }
  };

  const handleCourierChange = async (order, courier) => {
    if (courier === "Steadfast") {
      try {
        const { name, phone, streetAddress, totalCost } = order;
        const invoice = `${order._id.slice(-6)}`;

        const payload = {
          invoice,
          recipient_name: name,
          recipient_phone: phone,
          recipient_address: `${streetAddress}`,
          cod_amount: totalCost,
        };

        const response = await axios.post(
          "https://portal.packzy.com/api/v1/create_order",
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              "Api-Key": "mstshryvc9q8bkrz3iu431uuvo2c39tv",
              "Secret-Key": "iksacduggxpserl2x9nh6str",
            },
          }
        );

        if (response?.data?.status === 200) {
          return message.success("Order placed with Steadfast successfully");
        }
        if (response?.data?.status === 400) {
          return message.error(response?.data?.errors.invoice);
        }
      } catch (error) {
        message.error("Error placing order with Steadfast");
        console.error("Error placing Steadfast order:", error);
      }
    }
  };

  function numberToWords(num) {
    const units = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
    ];
    const teens = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = [
      "",
      "Ten",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    if (num === 0) return "Zero";
    if (num < 10) return units[num];
    if (num >= 10 && num < 20) return teens[num - 10];
    if (num >= 20 && num < 100)
      return tens[Math.floor(num / 10)] + " " + units[num % 10];
    if (num >= 100 && num < 1000)
      return (
        units[Math.floor(num / 100)] +
        " Hundred " +
        numberToWords(num % 100)
      ).trim();
    if (num >= 1000 && num < 100000)
      return (
        numberToWords(Math.floor(num / 1000)) +
        " Thousand " +
        numberToWords(num % 1000)
      ).trim();
    if (num >= 100000 && num < 10000000)
      return (
        numberToWords(Math.floor(num / 100000)) +
        " Lakh " +
        numberToWords(num % 100000)
      ).trim();
    return "Number too large";
  }

  const handlePrintInvoice = async (order) => {
    const response = await axios.get(`/order/${order._id}`);
    const anOrder = response?.data?.data?.doc;

    const isFreeShipping = anOrder.products.every(
      (product) => product.option?.freeShipping === true
    );
    const iframe = document.createElement("iframe");
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow.document;
    const deliveryCharge = isFreeShipping ? 0 : anOrder.shippingCost;

    // Calculate total price for each product
    const productsWithTotalPrice = anOrder.products.map((product) => {
      const unitPrice = product?.product?.isBundle
        ? product?.product?.price
        : product?.option?.salePrice || product?.option?.price || 0;
      const totalPrice = Math.round(unitPrice * product.quantity);
      return { ...product, totalPrice };
    });

    // Calculate   total
    const subTotal = productsWithTotalPrice.reduce(
      (sum, product) => sum + product.totalPrice,
      0
    );

    const bundleOffer = Math.round(anOrder?.bundleOffer);

    const grandTotal = subTotal + deliveryCharge - bundleOffer;

    const grandTotalInWords = numberToWords(grandTotal);

    const invoiceContent = `
    <html>
      <head>
        <title>Invoice</title>
        <style>
         @page {
            size: auto;
            margin: 0;
          }
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            header, footer {
              display: none;
              visibility: hidden;
            }
          }
          body {
            font-family: Arial, sans-serif;
            margin: 40px;
            color: #333;
          }

          header, footer {
            display: none;
            visibility: hidden;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
          }
          .header .logo {
            font-size: 2rem;
            font-weight: bold;
          }
          .products-details {
            font-size: 12px;
          }
          .header .invoice-title {
            font-size: 1.2rem;
            font-weight: bold;
            color:#EC081D;
          }
          .billing-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
          }
          .billing-info p, .order-info p {
            margin: 5px 0;
            font-size: 12px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 12px;
          }
          th, td {
            border: 1px solid #ccc;
            padding: 5px;
            text-align: left;
          }
          th {
            background-color: #f9f9f9;
          }
          .summary {
            text-align: right;
          }
          .summary p {
            margin: 5px 0;
           font-size: 12px;
          }
          .total {
            font-size: 1.2rem;
            font-weight: bold;
          }
          .thank-you {
          margin-top: 50px;
           font-size: 12px;
          }
          .company-info {
            margin-bottom: 20px;
            font-size: 1rem;
          }
          .invoice-details {
            margin-top: 50px;
            font-size: 12px;
            text-align: center;
            font-weight: bold;
          }

          .signature-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 50px;
          }

          .signature-box {
            width: 45%;
            text-align: center;
            padding-top: 10px;
            border-top: 1px solid #000;
            font-weight: bold;
          }
          .sellerSig{
          font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">
            <img src="${logoImage}" alt="Company Logo" style="height: 80px;" />
          </div>
          <div class="invoice-title">INVOICE</div>
        </div>

        <div class="billing-section">
          <div class="billing-info">
            <p><strong><b>COMPANY:</b></strong></p>
            <p>RPC World BD</p>
            <p>+8801718674140</p>
            <p>rpcworldbd@gmail.com</p>
          </div>
        </div>

        <div class="billing-section">
          <div class="billing-info">
            <p><strong>BILL TO:</strong></p>
            <p>${anOrder.name}</p>
            <p>${anOrder.phone}</p>
            <p>${anOrder.email}</p>
            <p>${anOrder.streetAddress}</p>
          </div>
          <div class="order-info">
            <p><strong>Invoice No.:</strong> ${anOrder._id.slice(-6)}</p>
            <p><strong>Date:</strong> ${new Date(
      anOrder.createdAt
    ).toLocaleDateString()}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Products</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total Price</th>
            </tr>
          </thead>
          <tbody>
            ${productsWithTotalPrice
        .map(
          (product) => `
              <tr class="products-details">
                <td class="billing-info">
                  <p>${product?.product?.isBundle
              ? product?.product?.name || "N/A"
              : product?.option?.product?.name || "N/A"
            }</p>
                  <p>Size: ${product?.option?.size || "N/A"}</p>
                  <p>Color: ${product?.option?.variant?.colorName || "N/A"}</p>
                </td>
                <td>${product?.quantity || "N/A"}</td>
                <td>${product?.product?.isBundle
              ? product?.product?.price
              : product.option?.salePrice || product.option?.price || 0
            } Tk</td>
                  <td>${product.totalPrice} Tk</td>
              </tr>
            `
        )
        .join("")}
          </tbody>
          <tfoot class="products-details">
            <tr>
              <th scope="row" colspan="3"><strong>Delivery Charge:</strong></th>
              <td><strong>${deliveryCharge === 0 ? "Free Shipping" : `${deliveryCharge} TK`
      }</strong></td>
            </tr>
            <tr>
              <th scope="row" colspan="3"><strong>Bundle Offer:</strong></th>
              <td><strong>${bundleOffer} TK</strong></td>
            </tr>
            <tr>
              <th scope="row" colspan="3"><strong>Grand Total:</strong></th>
              <td><strong>${grandTotal} TK</strong></td>
            </tr>
           
          </tfoot>
        </table>

        <p style="font-size:12px">I<em>n Words:  ${grandTotalInWords} Taka Only</em> </p>
        <p style="font-size:12px"><i>Thank you for shopping with us!</i></p>
        

       <div class="signature-section">
        <div class="">
         <span class="sellerSig">Seller's Signature</span> <br />
          (auto generated Signature) 
        </div>
        <div class="signature-box">
          Customer's Signature
        </div>
      </div>
      
        <div class="qrlogo">
        <p>More Shopping, SCAN ME!</p>
          <img src="${qrImg}" alt="QR" style="height: 100px;" />
        </div>
      </body>
    </html>
  `;

    doc.open();
    doc.write(invoiceContent);
    doc.close();

    iframe.contentWindow.onafterprint = () => {
      document.body.removeChild(iframe);
    };

    iframe.onload = () => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    };
  };

  const columns = [
    {
      title: "SR",
      dataIndex: "index",
      key: "sr",
      render: (text, record, index) => <a>{index + 1}</a>,
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: "Order ID",
      dataIndex: "_id",
      key: "_id",
      render: (text) => {
        let paddedText = String(text);
        return paddedText.slice(-6).padStart(6, "0");
      },
    },

    {
      title: "Product Name",
      dataIndex: "products",
      key: "productName",
      render: (products) => (
        <ul>
          {products && products.length > 0
            ? products.map((product, index) => (
              <li
                key={index}
                className={`my-2 p-2 ${index !== products.length - 1 ? "border-b" : ""
                  }`}
              >
                {product?.product?.isBundle ? (
                  <a>{product?.product?.name || "N/A"}</a>
                ) : (
                  <a>{product?.option?.product?.name || "N/A"}</a>
                )}
              </li>
            ))
            : "N/A"}
        </ul>
      ),
    },

    {
      title: "Price",
      dataIndex: "products",
      key: "products",
      render: (text, record) => {
        return (
          <ul>
            {record.products.map((product, index) => {
              const price = product?.product?.isBundle
                ? product?.product?.price
                : product?.option?.salePrice || product?.option?.price;

              return (
                <li
                  key={index}
                  className={`my-2 p-2 ${index !== record.products.length - 1 ? "border-b" : ""
                    }`}
                >
                  {Math.round(price)} Taka
                </li>
              );
            })}
          </ul>
        );
      },
    },
    // {
    //   title: "Total Price",
    //   dataIndex: "totalCost",
    //   key: "totalCost",
    //   render: (text, record) => {
    //     const isFreeShipping = record.products.every(
    //       (product) => product.option?.freeShipping === true
    //     );
    //     const shippingCost = calculateDeliveryCharge(
    //       record.shippingCost,
    //       isFreeShipping
    //     );

    //     const priceAfterShipping = Math.round(record.totalCost - shippingCost);

    //     return `${priceAfterShipping} Taka`;
    //   },
    // },
    {
      title: "Total Price",
      dataIndex: "totalCost",
      key: "totalCost",
      render: (text, record) => {
        // Calculate the total cost
        const totalCost = record.products.reduce((sum, product) => {
          const unitPrice = product?.product?.isBundle
            ? product?.product?.price
            : product?.option?.salePrice || product?.option?.price || 0;
          return sum + unitPrice * product.quantity;
        }, 0);

        const grandTotal = totalCost;

        return `${Math.round(grandTotal)} Taka`;
      },
    },
    {
      title: "Delivery Charge",
      key: "deliveryCharge",
      render: (text, record) => {
        const deliveryCharge = calculateDeliveryCharge(
          record.shippingCost,
          (record.isFreeShipping = record.products.every(
            (product) => product.option?.freeShipping === true
          ))
        );

        return deliveryCharge === 0
          ? "Free Shipping"
          : `${deliveryCharge} Taka`;
      },
    },
    {
      title: "Bundle Discount",
      key: "bundleDiscount",
      dataIndex: "bundleOffer",
    },
    // {
    //   title: "Grand Total",
    //   dataIndex: "totalCost",
    //   key: "totalCost",
    //   render: (text, record) => {
    //     const GrnadTotal = Math.round(record.totalCost);

    //     return `${GrnadTotal} Taka`;
    //   },
    // },
    {
      title: "Grand Cost",
      dataIndex: "totalCost",
      key: "totalCost",
      render: (text, record) => {
        const isFreeShipping = record.products.every(
          (product) => product.option?.freeShipping === true
        );
        console.log("totalCost", record.totalCost);
        // console.log("isFreeShipping",isFreeShipping)
        const bundleDiscount = Math.round(record.bundleOffer || 0);
        console.log("----bundleDiscount----", bundleDiscount);


        const deliveryCharge = calculateDeliveryCharge(
          record.shippingCost,
          isFreeShipping
        );

        console.log("----deliveryCharge----", deliveryCharge);


        // totalCost
        // console.log("deliveryCharge",deliveryCharge)

        // Calculate the total cost
        // const totalCost = record.products.reduce((sum, product) => {
        //   const unitPrice = product?.product?.isBundle
        //     ? product?.product?.price
        //     : product?.option?.salePrice || product?.option?.price || 0;
        //   return sum + unitPrice * product.quantity;
        // }, 0);

        // console.log("totalCost",totalCost)

        const grandTotal = record.totalCost - bundleDiscount;

        console.log("----grandTotal----", grandTotal);
        console.log("----record.totalCost----", record.totalCost);
        console.log("-----deliveryCharge-----", deliveryCharge);
        console.log("------bundleDiscount-----", bundleDiscount);

        return `${Math.round(grandTotal)} Taka`;
      },
    },

    {
      title: "Quantity",
      dataIndex: "products",
      key: "quantity",
      render: (products) => {
        const totalQuantity = products
          ? products.reduce((sum, product) => sum + (product?.quantity || 0), 0)
          : 0;

        return totalQuantity > 0 ? totalQuantity : "N/A";
      },
    },
    {
      title: "Color Name",
      dataIndex: "products",
      key: "colorName",
      render: (products) => (
        <div>
          {products && products.length > 0
            ? products.map((product, index) => (
              <div
                key={index}
                className={`my-2 p-2 ${index !== products.length - 1 ? "border-b" : ""
                  }`}
              >
                {product?.option?.variant?.colorName || "N/A"}
              </div>
            ))
            : "N/A"}
        </div>
      ),
    },
    {
      title: "Size",
      dataIndex: "products",
      key: "size",
      render: (products) => (
        <ul>
          {products && products.length > 0
            ? products.map((product, index) => (
              <li
                className={`my-2 p-2 ${index !== products.length - 1 ? "border-b" : ""
                  }`}
                key={index}
              >
                {product?.option?.size || "N/A"}
              </li>
            ))
            : "N/A"}
        </ul>
      ),
    },
    {
      title: "Information",
      dataIndex: "information",
      key: "information",
      render: (text, record) => (
        <div>
          <p>Name: {record.name}</p>
          <p>Phone: {record.phone}</p>
          <p>Email: {record.email}</p>
          {/* <p>City: {record.city.cityName}</p> */}
          <p>Address: {`${record.streetAddress}`}</p>
          <p>Note: {`${record?.notes}`}</p>
        </div>
      ),
    },
    {
      width: "10%",
      title: "Status",
      dataIndex: "orderStatus",
      key: "orderStatus",
      render: (_, record) => (
        <Select
          className="w-[100%]"
          value={record.orderStatus} // Show current status
          onChange={(value) => handleStatusChange(record._id, value)}
          options={[
            { label: "Pending", value: "pending" },
            { label: "Approved", value: "approved" },
            { label: "Shipped", value: "shipped" },
            { label: "Delivered", value: "delivered" },
            { label: "Canceled", value: "canceled" },
          ]}
        />
      ),
    },
    {
      width: "15%",
      title: "Courier Service",
      dataIndex: "courier",
      key: "courier",
      render: (text, record) => (
        <Select
          className="w-[100%]"
          value={record.courier || "Select Courier"} // Show selected courier
          onChange={(value) => handleCourierChange(record, value)}
          options={[
            { label: "Steadfast", value: "Steadfast" },
            // { label: "pathao", value: "pathao" },
          ]}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <div className="flex flex-col gap-2">
          <button
            className="bg-green-500 text-white w-24 py-1"
            type="primary"
            onClick={() => handleEdit(record)}
          >
            Edit
          </button>
          <button
            className="bg-red-500 text-white w-24 py-1"
            type="primary"
            onClick={() => handleDelete(record._id)}
          >
            Delete
          </button>
          <button
            className="bg-blue-900 text-white w-24 py-1"
            type="primary"
            onClick={() => handlePrintInvoice(record)}
          >
            Print Invoice
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search by Order ID or Phone"
          value={searchTerm}
          onChange={(e) => {
            const value = e.target.value;
            setSearchTerm(value);
            if (value.trim() === "") {
              setFilteredData([]);
              fetchOrders();
              return;
            }
          }}
          style={{ width: 300 }}
        />
        <Button type="primary" onClick={handleSearch}>
          Search
        </Button>
      </Space>

      {/* Table displaying data */}
      <Table
        columns={columns}
        dataSource={filteredData || data} // Use filteredData if available, otherwise fallback to all data
        rowKey={(record) => record._id}
        pagination={{ pageSize: 10 }}
      />

      {/* Modal for editing order */}
      <Modal
        title="Edit Order"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdate}
          initialValues={currentOrder}
        >
          <Form.Item label="Name" name="name">
            <Input />
          </Form.Item>
          <Form.Item label="Phone" name="phone">
            <Input />
          </Form.Item>
          <Form.Item label="Email" name="email">
            <Input />
          </Form.Item>
          <Form.Item label="Address" name="streetAddress">
            <Input />
          </Form.Item>
          <Form.Item label="Update Price" name="totalCost">
            <Input />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Update
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Order;
