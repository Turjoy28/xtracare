import React, { useState, useEffect } from "react";
import {
  Space,
  Popconfirm,
  Table,
  Modal,
  Form,
  Input,
  Select,
  Button,
  message,
  Upload,
  Checkbox,
} from "antd";
import axios from "../Components/Axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";

const AddBundle = () => {
  const [data, setData] = useState([]);
  const [editingRecord, setEditingRecord] = useState(null);
  const [bundleForm] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [productProduct, setProductProduct] = useState({});
  const [productVariant, setProductVariant] = useState({});
  const [productOptions, setProductOptions] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [bundle, setBundle] = useState([]);
  const [bundleModal, setBundleModal] = useState(false);

  const showBundleModal = () => setBundleModal(true);
  const handleBundleCancel = () => setBundleModal(false);

  const bundleColumns = [
    {
      title: "Bundle Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Sub Category",
      dataIndex: "subCategory",
      key: "subCategory",
    },
    {
      title: "Total Price",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (totalPrice) => `${totalPrice} TK`,
    },
    {
      title: "Bundle Price",
      dataIndex: "price",
      key: "price",
      render: (price) => `${price} TK`,
    },
    {
      title: "Products",
      dataIndex: "bundleProducts",
      key: "bundleProducts",
      render: (products) => (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {products?.map((product, index) => (
            <span
              key={index}
              style={{
                backgroundColor: "#E2E8F0",
                padding: "5px 10px",
                borderRadius: "5px",
                fontSize: "12px",
                whiteSpace: "nowrap",
              }}
            >
              {product.name}
            </span>
          ))}
        </div>
      ),
    },
    {
      title: "Images",
      dataIndex: "photos",
      key: "photos",
      render: (photos) => (
        <div style={{ display: "flex", gap: "8px" }}>
          {photos?.map((photo, index) => (
            <img
              key={index}
              src={photo}
              alt={`Bundle Image ${index + 1}`}
              style={{ width: "50px", height: "50px", objectFit: "cover" }}
            />
          ))}
        </div>
      ),
    },
    {
      title: "Actions",
      key: "action",
      fixed: "right",
      width: "10%",
      render: (_, record) => (
        <div className="flex flex-col gap-2">
          <Popconfirm
            title="Are you sure to delete this bundle?"
            onConfirm={() => deleteBundle(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <button type="danger" className="bg-red-500 text-white w-24 py-1">
              Delete
            </button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const deleteBundle = async (bundleId) => {
    try {
      // Call the API to delete the bundle
      axios.delete(`product/bundle/${bundleId}`);

      // Remove the deleted bundle from the state
      setBundle((prevBundles) =>
        prevBundles.filter((bundle) => bundle._id !== bundleId)
      );

      message.success("Bundle Deleted successfully");
    } catch (error) {
      console.error("Failed to delete bundle", error);
      message.error("Failed to delete bundle");
    }
  };

  const [searchTerm, setSearchTerm] = useState("");
  const fetchData = async () => {
    try {
      const response = await axios.get("/product");
      const realProducts = response.data.data.allProduct
        .filter((product) => !product.isBundle && product.variants.length > 0)
        .map((variant, index) => ({
          ...variant,
          key: variant?._id,
          index: index + 1,
          name: variant?.name,
          category: variant?.category?.title || "N/A",
          subCategory: variant?.subCategory?.title || "N/A",
          photo: variant?.photo,
        }));
      const reversedData = realProducts.reverse();
      setData(reversedData);
      setFilteredData(reversedData);

      const bundlePackages = response.data.data.allProduct
        .filter((product) => product.isBundle)
        .map((variant, index) => ({
          ...variant,
          key: variant?._id,
          index: index + 1,
          name: variant?.name,
          category: variant?.category?.title || "N/A",
          subCategory: variant?.subCategory?.title || "N/A",
          photo: variant?.photo,
        }));
      setBundle(bundlePackages);

      // setData(realProducts.reverse());
      // setFilteredData(realProducts.reverse());
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/category");
      setCategories(response.data.data.doc);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchSubCategories = async () => {
    try {
      const response = await axios.get("/subCategory");
      setSubCategories(response.data.data.doc);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchCategories();
    fetchSubCategories();
  }, []);

  // const handleDelete = async (key) => {
  //   try {
  //     await axios.delete(`/varient/${key}`);
  //     message.success("Variant deleted successfully");
  //     setData((prevData) => prevData.filter((item) => item.key !== key));
  //   } catch (error) {
  //     message.error("Failed to delete variant");
  //   }
  // };
  const handleDelete = async (key) => {
    try {
      // Fetch the product associated with the variant using the key
      const variantToDelete = data.find((item) => item.key === key);
      const productId = variantToDelete?.product?._id;

      if (productId) {
        // Proceed to delete the variant by its ID
        await axios.delete(`/varient/${key}`);

        // Then delete the product associated with the variant
        await axios.delete(`/product/${productId}`);

        message.success("Variant and associated product deleted successfully");

        // Remove the variant from the list
        setData((prevData) => prevData.filter((item) => item.key !== key));
        fetchData();
      } else {
        message.error("Product ID not found for this variant");
      }
    } catch (error) {
      console.error("Failed to delete variant", error);
      message.error("Failed to delete variant and product");
    }
  };

  const handleSearch = () => {
    const trimmedSearchTerm = searchTerm.trim().toLowerCase();

    if (trimmedSearchTerm === "") {
      setFilteredData(data); // Reset to original data if search term is empty
      return;
    }

    const filtered = data.filter((item) => {
      const titleMatch = item?.product?.name
        ?.toLowerCase()
        .includes(trimmedSearchTerm);
      const categoryMatch = item.category
        ?.toLowerCase()
        .includes(trimmedSearchTerm);
      const subCategoryMatch = item.subCategory
        ?.toLowerCase()
        .includes(trimmedSearchTerm);
      return titleMatch || categoryMatch || subCategoryMatch;
    });

    setFilteredData(filtered);
  };

  const handleDeletePreviewImage = (imageIndex) => {
    setImagePreviews((prevImages) =>
      prevImages.filter((_, index) => index !== imageIndex)
    );
  };

  const handleModalOk = async () => {
    try {
      const values = await bundleForm.validateFields();
      const formData = new FormData();

      formData.append("name", values.title);
      formData.append("category", values.category);
      formData.append("subCategory", values.subCategory);
      formData.append("description", values.description);
      formData.append("price", values.price);
      formData.append("totalPrice", values.totalPrice);
      formData.append("isBundle", true);

      imagePreviews.forEach((image) => {
        formData.append("photos", image);
      });

      fileList.forEach((file) => {
        formData.append("photos", file.originFileObj);
      });

      selectedData.forEach((product) => {
        formData.append("bundleProducts", product.key);
      });

      const response = await axios.post(`/product/bundle`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const productId = response.data.data.product._id;
      const variantIds = [];

      // Create variants

      const variantResponse = await axios.post("/varient", {
        // name: values.variantTitle,

        // totalPrice: values.variantTotalPrice,
        product: productId,
        category: values.category,
        subCategory: values.subCategory,
        brand: values.brand,
      });
console.log("values ", values)
      await axios.post("/option", {
        stock: values.stock,
        product: productId,
        price: values.price,
        variant: [variantResponse.data.data.variant._id], // Link to the correct variant ID
        category: values.category,
        subCategory: values.subCategory,
        brand: values.brand,
        freeShipping: values.freeShipping,
      });
      console.log("variantResponse", variantResponse);

      if (
        response.status === 200 ||
        response.status === 201 ||
        response.data?.success
      ) {
        message.success("Bundle created successfully");
        setIsModalVisible(false);
        fetchData();
        bundleForm.resetFields();
      } else {
        message.error(response.data?.message || "Failed to create bundle");
      }
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      message.error("Failed to create bundle");
    }
  };

  const handleModalCancel = () => {
    setEditingRecord(null);
    setIsModalVisible(false);
  };

  const handleImageUpload = ({ fileList }) => {
    setFileList(fileList);
  };
  const renderImagesVideos = (photos) => {
    return photos?.map((url, index) => {
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        const videoId = url.split("v=")[1]?.split("&")[0];
        const embedUrl = `https://www.youtube.com/embed/${videoId}`;

        return (
          <div key={index} style={{ marginBottom: "8px" }}>
            <iframe
              width="50"
              height="50"
              src={embedUrl}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={`YouTube Video ${index}`}
            ></iframe>
          </div>
        );
      } else {
        return (
          <img
            key={index}
            src={url}
            alt={`Image ${index + 1}`}
            style={{
              width: "50px",
              height: "50px",
              objectFit: "cover",
              marginBottom: "8px",
              cursor: "pointer",
            }}
          />
        );
      }
    });
  };

  const columns = [
    {
      title: "",
      dataIndex: "select",
      key: "select",
      fixed: "left",
      width: "5%",
      render: (_, record) => (
        <Checkbox onChange={(e) => handleSelect(record, e.target.checked)} />
      ),
    },
    {
      title: "#SL",
      dataIndex: "index",
      key: "index",
      fixed: "left",
      width: "7%",
      render: (index) => (index !== undefined ? index : "N/A"),
    },
    {
      width: "8%",
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (category) => category || "N/A",
    },
    {
      width: "8%",
      title: "Sub Category",
      dataIndex: "subCategory",
      key: "subCategory",
      render: (subCategory) => subCategory || "N/A",
    },
    {
      width: "20%",
      title: "Title",
      dataIndex: "name",
      key: "title",
      render: (name) => name || "N/A",
    },
    {
      width: "10%",
      title: "Images/Video",
      dataIndex: ["photos"],
      key: "photos",
      render: (photos) =>
        photos && photos.length > 0 ? renderImagesVideos(photos) : "N/A",
    },
    {
      width: "10%",
      title: "Stocks",
      dataIndex: "variants",
      key: "optionSizes",
      render: (variants) =>
        variants && variants.length > 0 ? (
          <>
            {variants.map((variant, index) =>
              variant.options && variant.options.length > 0 ? (
                variant.options.map((option, optionIndex) => (
                  <div key={`${index}-${optionIndex}`}>
                    {option.stock || "N/A"}
                  </div>
                ))
              ) : (
                <div key={index}>N/A</div>
              )
            )}
          </>
        ) : (
          "N/A"
        ),
    },
    {
      width: "10%",
      title: "Color Name",
      dataIndex: "variants",
      key: "variantColorName",
      render: (variants) =>
        variants && variants.length > 0 ? (
          <>
            {variants.map((variant, index) => (
              <div key={index}>
                <span>{variant.colorName || "N/A"}</span>
              </div>
            ))}
          </>
        ) : (
          "N/A"
        ),
    },
    {
      width: "10%",
      title: "Available Sizes",
      dataIndex: "variants",
      key: "optionSizes",
      render: (variants) =>
        variants && variants.length > 0 ? (
          <>
            {variants.map((variant, index) =>
              variant.options && variant.options.length > 0 ? (
                variant.options.map((option, optionIndex) => (
                  <div key={`${index}-${optionIndex}`}>
                    {option.size || "N/A"}
                  </div>
                ))
              ) : (
                <div key={index}>N/A</div>
              )
            )}
          </>
        ) : (
          "N/A"
        ),
    },
    {
      title: "Price",
      dataIndex: "variants",
      key: "price",
      render: (variants) =>
        variants && variants.length > 0 ? (
          <>
            {variants.map((variant, index) =>
              variant.options && variant.options.length > 0 ? (
                variant.options.map((option, optionIndex) => (
                  <div key={`${index}-${optionIndex}`}>
                    Price: {option.price ? `${option.price} TK` : "N/A"} | Size:
                    ({option.size || "N/A"})
                  </div>
                ))
              ) : (
                <div key={index}>N/A</div>
              )
            )}
          </>
        ) : (
          "N/A"
        ),
    },
  ];

  // Function to handle row selection
  const handleSelect = (record, checked) => {
    setSelectedItems((prevSelectedItems) => {
      const newSelectedItems = new Set(prevSelectedItems);
      if (checked) {
        newSelectedItems.add(record.key);
      } else {
        newSelectedItems.delete(record.key);
      }
      return newSelectedItems;
    });
  };

  const selectedData = data.filter((item) => selectedItems.has(item.key));

  return (
    <div>
      <div
        className="flex justify-between items-center px-5"
        style={{ marginBottom: 16, marginTop: 10 }}
      >
        <div className="flex space-x-3">
          <Input
            placeholder="Search by Product Title, Category or SubCategory Name"
            value={searchTerm}
            onChange={(e) => {
              const value = e.target.value;
              setSearchTerm(value);
              handleSearch();
              if (value.trim() === "") {
                setFilteredData(data);
              }
            }}
            style={{ width: 400 }}
          />
          <Button type="primary" onClick={handleSearch}>
            Search
          </Button>
        </div>
        <div>
          <div className="flex items-center mt-2 space-x-2">
            <Button
              className="hover:bg-white bg-blue-500 text-white font-semibold"
              onClick={showBundleModal}
            >
              All Bundles
            </Button>
            <Button
              onClick={() => setIsModalVisible(true)}
              className="hover:bg-white bg-green-500 text-white font-bold"
              disabled={selectedItems.size === 0} // Disable if no items are selected
            >
              {selectedItems.size === 0
                ? "Select At Least One"
                : "Make Bundle Offer"}
            </Button>
          </div>
        </div>
      </div>
      <Table columns={columns} dataSource={filteredData} scroll={{ x: 1300 }} />
      <Modal
        title="Create Bundle"
        visible={isModalVisible}
        onCancel={handleModalCancel}
        width={1000}
        footer={null}
      >
        <Form form={bundleForm} layout="vertical">
          <div className="flex space-x-5">
            <div className="flex-1">
              <Form.Item
                label="Bundle Title"
                name="title"
                rules={[
                  {
                    required: true,
                    message: "Please provide Bundle Title!",
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Category"
                name="category"
                rules={[
                  {
                    required: true,
                    message: "Please provide category!",
                  },
                ]}
              >
                <Select>
                  {categories.map((cat) => (
                    <Select.Option key={cat._id} value={cat._id}>
                      {cat.title}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label="Sub Category"
                name="subCategory"
                rules={[
                  {
                    required: true,
                    message: "Please provide sub Category!",
                  },
                ]}
              >
                <Select>
                  {subCategories.map((sub) => (
                    <Select.Option key={sub._id} value={sub._id}>
                      {sub.title}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label="Description"
                name="description"
                rules={[
                  {
                    required: true,
                    message: "Please provide description!",
                  },
                ]}
              >
                <ReactQuill className="w-[450px]" />
              </Form.Item>
              <Form.Item
                label="Product Total Price"
                name="totalPrice"
                rules={[
                  {
                    required: true,
                    message: "Please provide Total Price!",
                  },
                ]}
              >
                <Input type="number" />
              </Form.Item>
              <Form.Item
                label="Product Bundle Price"
                name="price"
                rules={[
                  {
                    required: true,
                    message: "Please provide Bundle Price!",
                  },
                ]}
              >
                <Input type="number" />
              </Form.Item>
              <Form.Item
                label="Stock (ইংরেজি নাম্বারে দিবেন যেমনঃ 10)"
                name="stock"
                rules={[
                  {
                    required: true,
                    message: "Please provide stock!",
                  },
                ]}
              >
                <Input type="number" />
              </Form.Item>
              <Form.Item name="freeShipping" valuePropName="checked">
                <Checkbox>Free Shipping</Checkbox>
              </Form.Item>
              <Form.Item label="Upload New Images">
                <Upload
                  listType="picture"
                  fileList={fileList}
                  onChange={handleImageUpload}
                  beforeUpload={() => false}
                  multiple
                >
                  <Button icon={<UploadOutlined />}>Upload</Button>
                </Upload>
              </Form.Item>

              <div style={{ marginTop: 16 }}>
                <Button
                  type="primary"
                  onClick={handleModalOk}
                  style={{ marginRight: 8 }}
                >
                  Submit
                </Button>
                <Button onClick={handleModalCancel}>Cancel</Button>
              </div>
            </div>
            <div className="flex-1">
              <div>
                <h1 className="text-xl font-bold mb-3">
                  {selectedData.length} Selected Items
                </h1>
                {selectedData.map((item) => (
                  <div
                    key={item.key}
                    className="border-b border-black mb-5 pb-1 capitalize"
                  >
                    <p className="font-semibold text-base">{item.name}</p>
                    <p>
                      <span className="font-semibold">Category:</span>{" "}
                      {item.category}
                    </p>
                    <p>
                      <span className="font-semibold">Sub Category:</span>{" "}
                      {item.subCategory}
                    </p>
                    <div>
                      <h4 className="my-1 font-semibold">Images/Video</h4>
                      <div className="flex space-x-2">
                        {renderImagesVideos(item.photos)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Form>
      </Modal>
      <Modal
        title="All Bundles"
        visible={bundleModal}
        onCancel={handleBundleCancel}
        footer={null}
        width={1200}
      >
        <Table
          dataSource={bundle}
          columns={bundleColumns}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Modal>
      ;
    </div>
  );
};

export default AddBundle;
