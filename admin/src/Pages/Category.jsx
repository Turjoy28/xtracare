import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Input,
  Row,
  Form,
  Popconfirm,
  Table,
  AutoComplete,
  Modal,
  message,
  Upload,
} from "antd";
import axios from "../Components/Axios";
import { format } from "date-fns";
import Dragger from "antd/es/upload/Dragger";
import { InboxOutlined } from "@ant-design/icons";

const AddCategory = () => {
  const [dataSource, setDataSource] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubCategoryModalVisible, setIsSubCategoryModalVisible] =
    useState(false);
  const [currentSubCategory, setCurrentSubCategory] = useState(null);
  const [newSubCategoryTitle, setNewSubCategoryTitle] = useState("");
  const [categorySuggestions, setCategorySuggestions] = useState([]);
  const [subCategorySuggestions, setSubCategorySuggestions] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [availableSubCategories, setAvailableSubCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [categoryExists, setCategoryExists] = useState(false); // new state
  const [selectedCategoryTitle, setSelectedCategoryTitle] = useState("");
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [updateImagePreviewUrls, setUpdateImagePreviewUrls] = useState([]);
  const [variantFileList, setVariantFileList] = useState([]);
  const [newCategoryTitle, setNewCategoryTitle] = useState("");
  const [currentCategory, setCurrentCategory] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);

  const [currentChildCategory, setCurrentChildCategory] = useState(null);
  const [newChildCategoryTitle, setNewChildCategoryTitle] = useState("");
  const [isChildCategoryModalVisible, setIsChildCategoryModalVisible] =
    useState(false);

  const [form] = Form.useForm(); // form instance for better control

  const [categoryFileList, setCategoryFileList] = useState([]); // For category image files
  const [imageError, setImageError] = useState(false);
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const categoryRes = await axios.get("/category");
      setAllCategories(categoryRes.data.data.doc || []);
      setFilteredCategories(categoryRes.data.data.doc || []);
      
      const subCategoryRes = await axios.get("/subCategory");
      const childCategoryRes = await axios.get("/childCategory");

      // console.log(childCategoryRes)


      const mergedData = categoryRes.data.data.doc.map((category, index) => {
        const subCategories = subCategoryRes.data.data.doc.filter(
          (sub) => sub.category === category._id
        );

        // For option B (Category-level): child categories aggregated per Category
        const childCategoriesForCategory = childCategoryRes.data.data.doc.filter(
          (child) => {
            const subId =
              child?.subCategory?._id ?? child?.subCategory;
            return (
              subId &&
              subCategories.some((sub) => sub._id === String(subId))
            );
          }
        );

        return {
          key: category._id,
          index: index + 1,
          category: category.title,

          subCategories: subCategories.map((sub) => ({
            key: sub._id,
            title: sub.title,
          })),
          subCategoryCount: subCategories.length,

          // Category-level child category display
          childCategories: childCategoriesForCategory.map((child) => ({
            key: child._id,
            title: child.title,
          })),
          childCategoriesCount: childCategoriesForCategory.length,

          date: format(category.updatedAt, "dd-MM-yyyy"),
          photos: category?.photos,
        };
      });

      setDataSource(mergedData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  const handleDelete = async (key) => {
    try {
      await axios.delete(`/category/${key}`);
      setDataSource(dataSource.filter((item) => item.key !== key));
    } catch (error) {
      fetchData();
      console.error("Failed to delete category:", error);
    }
  };

  const handleDeleteSubCategory = async (subCategoryId) => {
    try {
      await axios.delete(`/subCategory/${subCategoryId}`);
      fetchData();
      message.success("Subcategory deleted successfully");
    } catch (error) {
      console.error("Failed to delete subcategory:", error);
      message.error("Failed to delete subcategory");
    }
  };

  const categoryImageUploadProps = {
    fileList: categoryFileList,
    multiple: false,
    onRemove: () => {
      setCategoryFileList([]);
      setUpdateImagePreviewUrls([]); // Clear the preview since only one file is allowed
    },
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/"); // Validate file type
      if (!isImage) {
        message.error(`${file.name} is not an image file!`);
        return Upload.LIST_IGNORE;
      }
      // Update the file list and generate preview
      setCategoryFileList([file]); // Only one file is allowed, replace the existing
      previewCategoryImage(file); // Generate and set the preview
      return false; // Prevent automatic upload
    },
  };

  // update New Priview
  const previewCategoryImage = (file) => {
    const reader = new FileReader();
    setCurrentImage(file);
    reader.onload = (e) => {
      setUpdateImagePreviewUrls([e.target.result]); // Update preview (single file)
    };
    reader.readAsDataURL(file); // Read the file as Data URL
  };

  const handleSubCategoryEdit = (subCategory) => {
    setCurrentSubCategory(subCategory);
    setNewSubCategoryTitle(subCategory.title);
    setIsSubCategoryModalVisible(true);
  };

  const handleSubCategorySave = async () => {
    if (currentSubCategory) {
      try {
        await axios.patch(`/subCategory/${currentSubCategory.key}`, {
          title: newSubCategoryTitle,
        });
        setIsSubCategoryModalVisible(false);

        setCurrentSubCategory(null);
        fetchData();
        message.success("Subcategory updated successfully");
      } catch (error) {
        console.error("Failed to save subcategory changes:", error);
        message.error("Failed to update subcategory");
      }
    }
  };

  const handleCategoryEdit = (record) => {
    setCurrentCategory(record);
    setNewCategoryTitle(record.category || "");
    setUpdateImagePreviewUrls(record.photos || []);
    // setNewImageFile(null);
    setIsModalVisible(true);
  };

  const handleCategorySave = async () => {
    try {
      const formData = new FormData();

      // Append the category title as JSON
      if (currentCategory) {
        formData.append("title", newCategoryTitle);
      }
      if (currentImage?.file) {
        formData.append("photos", currentImage?.file);
      }
      await axios.patch(
        `/category/${currentCategory.key}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setIsModalVisible(false);
      message.success("Category updated successfully");
      fetchData();
    } catch (error) {
      console.error("Failed to update category:", error);
      message.error("Failed to update category");
    }
  };

  const onFinish = async (values) => {
    const { title: categoryTitle, subtitle: subCategoryTitle, childTitle } =
      values.category;

    if (childTitle) {
      if (!categoryExists) {
        return message.error("To create a Child Category, you must select an EXISTING Category.");
      }
      const subCategoryExists = availableSubCategories.some(sub => sub.title === subCategoryTitle);
      if (!subCategoryExists) {
        return message.error("To create a Child Category, you must select an EXISTING Subcategory.");
      }
    }

    const formData = new FormData();
    formData.append("title", categoryTitle);
    if (!categoryExists && variantFileList?.length <= 0) {
      setImageError(true);
      return;
    }

    variantFileList.forEach((file) => {
      formData.append("photos", file);
    });

    try {
      const existingCategoryRes = await axios.get("/category", {
        params: { title: categoryTitle },
      });

      let categoryId;
      if (existingCategoryRes.data.data.doc.length > 0) {
        categoryId = existingCategoryRes.data.data.doc[0]._id;
      } else {
        // Create a new category and get the ID

        const newCategoryRes = await axios.post("/category", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        categoryId = newCategoryRes.data.data.product._id;
      }

      // Add the subcategory associated with the category
      // If category + subCategory already exist, do NOT create again.
      const existingSubCategoryRes = await axios.get("/subCategory", {
        params: { title: subCategoryTitle, category: categoryId },
      });

      if (existingSubCategoryRes?.data?.data?.doc?.length > 0) {
        // Already exists -> skip creation
      } else {
        await axios.post("/subCategory", {
          title: subCategoryTitle,
          category: categoryId,
        });
      }

      // Create ChildCategory always via cascading backend endpoint
      await axios.post("/childCategory/cascading", {
        categoryTitle: categoryTitle,
        subCategoryTitle: subCategoryTitle,
        childCategoryTitle: values.category.childTitle,
      });

      fetchData();
      form.resetFields();
      message.success("Category, Subcategory and ChildCategory created successfully!");
    } catch (error) {
      const serverMessage = error.response?.data?.message || "Failed to add category and subcategory.";
      const validationErrors = error.response?.data?.validationErrors;

      if (validationErrors && validationErrors.length > 0) {
        const formErrors = validationErrors.map((err) => {
          let fieldName = [err.field];
          if (err.field === "title") fieldName = ["category", "title"];
          return {
            name: fieldName,
            errors: [err.message],
          };
        });
        form.setFields(formErrors);
        message.error("Please fix the highlighted errors in the form.");
      } else {
        message.error(serverMessage);
      }
    }
  };

  const handleDeleteChildCategory = async (childCategoryId) => {
    try {
      await axios.delete(`/childCategory/${childCategoryId}`);
      fetchData();
      message.success("Child category deleted successfully");
    } catch (error) {
      console.error("Failed to delete child category:", error);
      message.error("Failed to delete child category");
    }
  };

  const handleChildCategorySave = async () => {
    if (!currentChildCategory) return;

    try {
      await axios.patch(`/childCategory/${currentChildCategory.key}`, {
        title: newChildCategoryTitle,
      });
      setIsChildCategoryModalVisible(false);
      setCurrentChildCategory(null);
      setNewChildCategoryTitle("");
      fetchData();
      message.success("Child category updated successfully");
    } catch (error) {
      console.error("Failed to update child category:", error);
      message.error("Failed to update child category");
    }
  };

  const handleCategorySearch = (value) => {
    setSelectedCategoryTitle(value);
    
    if (!value) {
      setFilteredCategories(allCategories);
      setAvailableSubCategories([]);
      setSelectedCategoryId(null);
      setCategoryExists(false);
      
      form.setFieldsValue({
        icon: "",
        colorCode: { iconColor: "", bgColor: "" },
      });
      return;
    }

    const filtered = allCategories.filter((cat) => 
      cat.title.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCategories(filtered);

    const exactMatch = allCategories.find((cat) => cat.title.toLowerCase() === value.toLowerCase());
    if (exactMatch) {
      setCategoryExists(true);
      setSelectedCategoryId(exactMatch._id);
      fetchSubCategories(exactMatch._id);
    } else {
      setCategoryExists(false);
      setSelectedCategoryId(null);
      setAvailableSubCategories([]);
      
      form.setFieldsValue({
        icon: "",
        colorCode: { iconColor: "", bgColor: "" },
      });
    }
  };

  const handleCategorySelect = (value, option) => {
    setCategoryExists(true);
    setSelectedCategoryTitle(value);
    setSelectedCategoryId(option.key);
    fetchSubCategories(option.key);
  };

  const fetchSubCategories = async (categoryId) => {
    try {
      const res = await axios.get("/subCategory", { params: { category: categoryId } });
      setAvailableSubCategories(res.data.data.doc || []);
    } catch (error) {
      setAvailableSubCategories([]);
    }
  };

  const variantUploadProps = {
    fileList: variantFileList,
    multiple: true,
    onRemove: (file) => {
      const index = variantFileList.indexOf(file); // Get the index of the file
      if (index !== -1) {
        // Remove the file from the file list
        setVariantFileList((prevList) => {
          const newFileList = [...prevList];
          newFileList.splice(index, 1);
          return newFileList;
        });
        setImageError(false);
        // Remove the corresponding preview from imagePreviewUrls
        setImagePreviewUrls((prevPreviews) => {
          const newPreviews = [...prevPreviews];
          newPreviews.splice(index, 1); // Remove the preview at the same index
          return newPreviews;
        });
      }
    },
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error(`${file.name} is not an image file!`);
        return Upload.LIST_IGNORE;
      }
      // Add the file to the file list
      setVariantFileList((prevList) => [...prevList, file]);
      handleImagePreview({ originFileObj: file }); // Call preview handler for image preview
      return false;
    },
  };

  const handleImagePreview = (file) => {
    if (file && file.originFileObj) {
      // Check if the file is valid
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviewUrls((prev) => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file.originFileObj);
      setImageError(false);
    }
  };

  return (
    <>
      <h2 className="text-center font-semibold md:text-2xl text-xl py-10">
        Add Category
      </h2>

      <Row gutter={16}>
        <Col span={8}>
          <Card title="Add Category" className="text-center" bordered={false}>
            <Form
              form={form}
              name="form_item_path"
              layout="vertical"
              onFinish={onFinish}
            >
              {/* category */}
              <Form.Item
                name={["category", "title"]}
                label="Category"
                rules={[
                  { required: true, message: "Please input category title!" },
                ]}
              >
                <AutoComplete
                  onSearch={handleCategorySearch}
                  onSelect={handleCategorySelect}
                  onFocus={() => handleCategorySearch(selectedCategoryTitle || "")}
                  options={filteredCategories.map((cat) => ({
                    value: cat.title,
                    key: cat._id
                  }))}
                  placeholder="Enter category title"
                />
              </Form.Item>

              {/* sub category */}
              <Form.Item
                name={["category", "subtitle"]}
                label="Sub Category"
                rules={[
                  {
                    required: true,
                    message: "Please input subcategory title!",
                  },
                ]}
              >
                <AutoComplete
                  options={availableSubCategories.map((sub) => ({
                    value: sub.title,
                    key: sub._id
                  }))}
                  onFocus={() => {
                      if (!categoryExists) setAvailableSubCategories([]);
                  }}
                  placeholder="Enter subCategory title"
                  disabled={!selectedCategoryTitle}
                  filterOption={(inputValue, option) =>
                    option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                  }
                />
              </Form.Item>

              {/* childCategory */}
              <Form.Item
                name={["category", "childTitle"]}
                label="Child Category"
              >
                <Input placeholder="Enter childCategory title" />
              </Form.Item>

              {/* <h1>Product image</h1> */}

              {!categoryExists && (
                <>
                  <Dragger
                    {...variantUploadProps}
                    onChange={handleImagePreview}
                  >
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">
                      Click or drag category Image to this area to upload
                    </p>
                    <p className="ant-upload-hint">
                      Support for a single image upload.
                    </p>
                    <p className="ant-upload-hint">
                      image size must have width: 330px height: 440px
                    </p>
                  </Dragger>
                  {imageError && (
                    <p className="text-red-500 text-center mt-2">
                      Image upload is required.
                    </p>
                  )}
                  <div className="flex gap-x-5 justify-center">
                    {/* Image preview here */}
                    {imagePreviewUrls.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt="Preview"
                        className="w-[150px] h-[150px] object-cover rounded-md shadow-lg"
                      />
                    ))}
                  </div>
                </>
              )}

              <Button className="mt-4" type="primary" htmlType="submit">
                Submit
              </Button>
            </Form>
          </Card>
        </Col>

        <Col span={16}>
          <Card title="All Categories" bordered={false}>
            <Table
              bordered
              dataSource={dataSource}
              className="whitespace-nowrap"
              rowClassName={() => "whitespace-nowrap"}
              scroll={{ x: 1200 }}
              columns={[
                {
                  title: "SL",
                  dataIndex: "index",
                  width: "5%",
                },
                {
                  title: "Category Name",
                  dataIndex: "category",
                  width: "20%",
                },
                {
                  title: "SubCategory Names",
                  dataIndex: "subCategories",
                  width: "30%",
                  render: (subCategories) =>
                    subCategories.length > 0
                      ? subCategories.map((sub) => (
                          <div key={sub.key}>
                            {sub.title}
                            <Button
                              type="link"
                              onClick={() => handleSubCategoryEdit(sub)}
                              style={{ marginRight: 8 }}
                            >
                              Edit
                            </Button>
                            <Popconfirm
                              title="Sure to delete?"
                              onConfirm={() => handleDeleteSubCategory(sub.key)}
                            >
                              <Button type="link" danger>
                                Delete
                              </Button>
                            </Popconfirm>
                          </div>
                        ))
                      : "No SubCategory",
                },
                {
                  title: "Category Image",
                  dataIndex: "photos",
                  width: "10%",
                  render: (photos) =>
                    photos && photos.length > 0 ? (
                      <img
                        src={photos[0]} // Display the first image in the array
                        alt="Category"
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                          borderRadius: "4px", // Optional: adds a rounded corner
                        }}
                      />
                    ) : (
                      "No Image"
                    ),
                },

                {
                  title: "SubCategory Count",
                  dataIndex: "subCategoryCount",
                  width: "10%",
                },
                {
                  title: "ChildCategory Count",
                  dataIndex: "childCategoriesCount",
                  width: "10%",
                },
                {
                  title: "Child Category Names",
                  dataIndex: "childCategories",
                  width: "20%",
                  render: (childCategories) =>
                    childCategories && childCategories.length > 0
                      ? childCategories.map((child) => (
                          <div key={child.key}>
                            {child.title}
                            <Button
                              type="link"
                              onClick={() => {
                                setCurrentChildCategory(child);
                                setNewChildCategoryTitle(child.title);
                                setIsChildCategoryModalVisible(true);
                              }}
                              style={{ marginRight: 8 }}
                            >
                              Edit
                            </Button>
                            <Popconfirm
                              title="Sure to delete?"
                              onConfirm={() => handleDeleteChildCategory(child.key)}
                            >
                              <Button type="link" danger>
                                Delete
                              </Button>
                            </Popconfirm>
                          </div>
                        ))
                      : "No ChildCategory",
                },
                {
                  title: "Date",
                  dataIndex: "date",
                },
                {
                  title: "Operation",
                  dataIndex: "operation",
                  width: "15%",
                  render: (_, record) =>
                    dataSource.length >= 1 ? (
                      <>
                        <Button
                          type="link"
                          onClick={() => handleCategoryEdit(record)}
                          style={{ marginRight: 8 }}
                        >
                          Edit
                        </Button>
                        <Popconfirm
                          title="Sure to delete?"
                          onConfirm={() => handleDelete(record.key)}
                        >
                          <Button type="link" danger>
                            Delete
                          </Button>
                        </Popconfirm>
                      </>
                    ) : null,
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title="Edit SubCategory"
        visible={isSubCategoryModalVisible}
        onOk={handleSubCategorySave}
        onCancel={() => setIsSubCategoryModalVisible(false)}
        okText="Save"
        cancelText="Cancel"
      >
        <Input
          value={newSubCategoryTitle}
          onChange={(e) => setNewSubCategoryTitle(e.target.value)}
        />
      </Modal>

      <Modal
        title="Edit Child Category"
        visible={isChildCategoryModalVisible}
        onOk={handleChildCategorySave}
        onCancel={() => setIsChildCategoryModalVisible(false)}
        okText="Save"
        cancelText="Cancel"
      >
        <Input
          value={newChildCategoryTitle}
          onChange={(e) => setNewChildCategoryTitle(e.target.value)}
        />
      </Modal>

      <Modal
        title="Edit Category "
        visible={isModalVisible}
        onOk={handleCategorySave}
        onCancel={() => setIsModalVisible(false)}
      >
        <div>
          <p>Enter Category : </p>
          <Input
            className="mb-2"
            value={newCategoryTitle}
            onChange={(e) => setNewCategoryTitle(e.target.value)}
          />
        </div>

        <>
          <p>Upload New Category Image:</p>
          <Dragger
            {...categoryImageUploadProps}
            onChange={previewCategoryImage}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag category Image to this area to upload
            </p>
            <p className="ant-upload-hint">
              Support for a single image upload.
            </p>
            <p className="ant-upload-hint">
              image size must have width: 330px height: 440px
            </p>
          </Dragger>

          <div className="flex gap-x-5 justify-center">
            {/* Image preview here */}
            {updateImagePreviewUrls.map((url, index) => (
              <img
                // onChange={setNewCategoryImage(e.target.value)}
                key={index}
                src={url}
                alt="Preview"
                className="w-[150px] h-[150px] object-cover rounded-md shadow-lg"
              />
            ))}
          </div>
        </>
      </Modal>
    </>
  );
};

export default AddCategory;
