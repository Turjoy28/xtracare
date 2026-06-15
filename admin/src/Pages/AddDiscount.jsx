import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Space,
  Button,
  message,
  Select,
  Col,
  InputNumber,
  Form,
  Input,
} from "antd";
import axios from "../Components/Axios"; // Adjust the import path as needed

const { Option } = Select;

const AddDiscount = () => {
  const [form] = Form.useForm();
  const [brandData, setBrandData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [subCategoryData, setSubCategoryData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [variantData, setVariantData] = useState([]);
  const [optionData, setOptionData] = useState([]);
  const [quantityData, setQuantityData] = useState([]); // Local state for quantity data
  const [selectedType, setSelectedType] = useState("brand"); // Default to "brand"
  const [tableData, setTableData] = useState([]);
  const [maxDiscountValue, setMaxDiscountValue] = useState(undefined);

  useEffect(() => {
    // Fetch all data on initial load
    fetchBrands();
    fetchCategories();
    fetchSubCategories();
    fetchProducts();
    fetchVariants();
    fetchOptions();
  }, []);

  useEffect(() => {
    // Update table data based on the selected type
    fetchTableData();
  }, [
    selectedType,
    brandData,
    categoryData,
    subCategoryData,
    productData,
    variantData,
    optionData,
    quantityData, // Include quantityData in dependencies
  ]);

  useEffect(() => {
    if (selectedType === "quantity") {
      fetchQuantityDiscounts();
    } else {
      fetchTableData();
    }
  }, [selectedType]);

  useEffect(() => {
    form.setFieldsValue({
      discountType: "amount",
      discountValue: undefined,
      minQuantity: undefined,
    });
  }, [form]);

  const fetchBrands = async () => {
    try {
      const response = await axios.get("/brand");
      setBrandData(response.data.data.doc);
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/category");
      setCategoryData(response.data.data.doc);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchSubCategories = async () => {
    try {
      const response = await axios.get("/subCategory");
      setSubCategoryData(response.data.data.doc);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get("/product");
      setProductData(
        response?.data?.data?.allProduct.filter(
          (item) => item.isBundle === false
        )
      );
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchVariants = async () => {
    try {
      const response = await axios.get("/varient");
      setVariantData(response.data.data.doc);
    } catch (error) {
      console.error("Error fetching variants:", error);
    }
  };

  const fetchOptions = async () => {
    try {
      const response = await axios.get("/option");
      setOptionData(response.data.data.doc);
    } catch (error) {
      console.error("Error fetching options:", error);
    }
  };

  const fetchQuantityDiscounts = async () => {
    try {
      const response = await axios.get("/discount/apply");
      setQuantityData(response.data.data);
    } catch (error) {
      console.error("Error fetching quantity discounts:", error);
      message.error("Failed to fetch quantity discounts");
    }
  };

  const fetchTableData = () => {
    switch (selectedType) {
      case "brand":
        setTableData(
          brandData.map((item) => ({
            ...item,
            name: item.name || item.title,
            Type: "brand",
          }))
        );
        break;
      case "category":
        setTableData(
          categoryData.map((item) => ({
            ...item,
            name: item.title,
            Type: "category",
          }))
        );
        break;
      case "subCategory":
        setTableData(
          subCategoryData.map((item) => ({
            ...item,
            name: item.title,
            Type: "subCategory",
          }))
        );
        break;
      case "product":
        setTableData(
          productData.map((item) => ({
            ...item,
            name: item.name,
            Type: "product",
          }))
        );
        break;
      case "variant":
        setTableData(
          variantData.map((item) => ({
            ...item,
            name: item.colorName,
            Type: "variant",
          }))
        );
        break;
      case "option":
        setTableData(
          optionData.map((item) => ({
            ...item,
            name: item.sku,
            Type: "option",
          }))
        );
        break;
      case "quantity":
        setTableData(quantityData); // Use local quantity data
        break;
      default:
        break;
    }
  };

  const handleUpdateDiscount = async (record) => {
    try {
      const payload = {
        type: selectedType,
        id: record._id,
        discountType: record.discountType,
        discountValue: record.discountValue,
      };

      if (selectedType === "quantity") {
        payload.minQuantity = record.minQuantity;
      }

      await axios.put("/discount/apply", payload);

      message.success(
        selectedType === "quantity"
          ? "Quantity discount updated successfully"
          : "Discount updated successfully"
      );

      form.resetFields(); // Reset the form after updating
    } catch (error) {
      message.error("Failed to update discount");
      console.error("Error updating discount:", error);
    }
  };

  const handleRemoveQuantityDiscount = async (record) => {
    try {
      await axios.delete("/discount/apply", {
        data: { id: record._id },
      });
      setQuantityData(quantityData.filter((item) => item._id !== record._id));

      message.success("Quantity discount removed successfully.");
    } catch (error) {
      console.error("Error removing quantity discount:", error);
      message.error("Failed to remove quantity discount.");
    }
  };

  const handleSelectChange = (value, record, key) => {
    const newData = tableData.map((item) => {
      if (item._id === record._id) {
        return { ...item, [key]: value };
      }
      return item;
    });
    setTableData(newData);
  };

  const handleQuantityChange = (value, record, key) => {
    const newData = quantityData.map((item) => {
      if (item._id === record._id) {
        return { ...item, [key]: value };
      }
      return item;
    });
    setQuantityData(newData);
  };

  const addQuantityDiscount = async (values) => {
    const minQuantity =
      quantityData.length > 0
        ? Math.max(...quantityData.map((item) => item.totalQuantity)) + 1
        : 1;

    if (quantityData.some((item) => item.totalQuantity === minQuantity)) {
      message.error("Quantity number already exists.");
      return;
    }

    try {
      const response = await axios.post("/discount/apply", {
        discountType: values.discountType,
        discountValue: values.discountValue,
        minQuantity: values.minQuantity,
      });

      setQuantityData((prev) => [...prev, response.data.data]);
      message.success("Quantity discount added successfully.");
      form.resetFields(); // This should reset the form
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to add discount.");
    }
  };

  const columns = [
    {
      title: selectedType === "quantity" ? "Quantity" : "Name/Title",
      key: "nameOrTitle",
      render: (text, record) => (
        <span>
          {selectedType === "quantity" ? record.minQuantity : record.name}
        </span>
      ),
    },
    {
      title: "Discount Type",
      dataIndex: "discountType",
      key: "discountType",
      render: (value, record) => {
        if (selectedType === "quantity") {
          return <span className="capitalize">{value || "-"}</span>;
        }

        return (
          <Select
            style={{ width: "100%" }}
            value={value}
            onChange={(val) => handleSelectChange(val, record, "discountType")}
            options={[
              { label: "Amount", value: "amount" },
              { label: "Percent", value: "percent" },
              { label: "None", value: "none" },
            ]}
          />
        );
      },
    },
    {
      title: "Discount Value",
      dataIndex: "discountValue",
      key: "discountValue",
      render: (value, record) => {
        if (selectedType === "quantity") {
          return <span>{value || "-"}</span>;
        }

        return (
          <InputNumber
            style={{ width: "100%" }}
            min={0}
            max={record.discountType === "percent" ? 100 : undefined} // Limit max if type is "percent"
            value={value}
            onChange={(val) => handleSelectChange(val, record, "discountValue")}
          />
        );
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          {selectedType !== "quantity" && (
            <Button onClick={() => handleUpdateDiscount(record)}>
              Update Discount
            </Button>
          )}
          {selectedType === "quantity" && (
            <Button danger onClick={() => handleRemoveQuantityDiscount(record)}>
              Remove
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const handleValuesChange = (changedValues, allValues) => {
    if (changedValues.discountType) {
      setMaxDiscountValue(
        changedValues.discountType === "percent" ? 100 : undefined
      );
    }
  };

  return (
    <>
      <h2 className="text-center font-semibold md:text-2xl text-xl py-10">
        ADD Discount
      </h2>
      <div className="flex justify-center flex-col items-center">
        <Col span={16}>
          <Card
            title={`Apply Discount in`}
            bordered={false}
            extra={
              <>
                <Select
                  style={{ width: "200px", margin: "0px 10px" }}
                  value={selectedType}
                  onChange={(value) => setSelectedType(value)}
                >
                  <Option value="brand">Brand</Option>
                  <Option value="category">Category</Option>
                  <Option value="subCategory">Sub-Category</Option>
                  <Option value="product">Product</Option>
                  <Option value="variant">Variant</Option>
                  <Option value="option">Option</Option>
                  <Option value="quantity">Quantity</Option>
                </Select>
              </>
            }
          >
            {selectedType === "quantity" && (
              <Form
                form={form}
                onValuesChange={handleValuesChange} // Track changes
                onFinish={addQuantityDiscount}
                className="mb-5"
              >
                <Form.Item
                  label="Quantity"
                  name="minQuantity"
                  rules={[
                    { required: true, message: "Please input the quantity!" },
                  ]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    placeholder="Enter quantity"
                  />
                </Form.Item>

                <Form.Item
                  label="Discount Type"
                  name="discountType"
                  initialValue="amount"
                  rules={[
                    {
                      required: true,
                      message: "Please select a discount type!",
                    },
                  ]}
                >
                  <Select defaultValue="amount">
                    <Option value="amount">Amount</Option>
                    <Option value="percent">Percent</Option>
                    <Option value="none">None</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Discount Value"
                  name="discountValue"
                  rules={[
                    {
                      required: true,
                      message: "Please input the discount value!",
                    },
                  ]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    max={maxDiscountValue}
                    placeholder="Enter discount value"
                  />
                </Form.Item>

                <Button type="primary" htmlType="submit">
                  Add Quantity Discount
                </Button>
              </Form>
            )}

            <Table
              dataSource={tableData}
              columns={columns}
              rowKey="_id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Col>
      </div>
    </>
  );
};

export default AddDiscount;
