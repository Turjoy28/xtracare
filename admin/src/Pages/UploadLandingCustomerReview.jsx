import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Select,
  Space,
  Table,
  Upload,
  message,
} from "antd";
import React, { useState, useEffect } from "react";
import axios from "../Components/Axios";
import { UploadOutlined } from "@ant-design/icons";

const UploadlandingCustomerReview = () => {
  const [brandForm] = Form.useForm();
  const [landingCustomerReviews, setlandingCustomerReviews] = useState([]);
  const [fileList, setFileList] = useState([]);
  const fetchlandingCustomerReviews = async () => {
    try {
      const response = await axios.get("/landingCustomerReview");

      setlandingCustomerReviews(response.data.data.doc);
    } catch (error) {
      console.error("Error fetching landingCustomerReviews:", error);
    }
  };

  useEffect(() => {
    fetchlandingCustomerReviews();
  }, []);

  const handleBrandSubmit = async (values) => {
    if (fileList?.length === 0) {
      message.error("Please Add a landing Customer Review image!");
      return;
    }
    try {
      const formData = new FormData();
      // formData.append("title", values.title);
      // formData.append("subTitle", values.subTitle);
      formData.append("link", values.link);
      formData.append("landingCustomerReviewType", values.landingCustomerReviewType);
      if (fileList.length > 0) {
        formData.append("photo", fileList[0]);
      }

      const response = await axios.post("/landingCustomerReview", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      message.success(response.data.message);
      fetchlandingCustomerReviews();
      brandForm.resetFields();
      setFileList([]);
    } catch (error) {
      message.error("Failed to add landingCustomerReview");
      console.error("Error adding landingCustomerReview:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/landingCustomerReview/${id}`);
      message.success("landingCustomerReview deleted successfully");
      fetchlandingCustomerReviews();
    } catch (error) {
      message.error("Failed to delete landingCustomerReview");
      console.error("Error deleting landingCustomerReview:", error);
    }
  };

  const columns = [
    {
      title: "Photo",
      dataIndex: "photo",
      key: "photo",
      render: (text) => (
        <img src={text} alt="landingCustomerReview" style={{ width: 50, height: 50 }} />
      ),
    },

    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          {/* <a>Edit</a> */}
          <Button onClick={() => handleDelete(record._id)}>Delete</Button>
        </Space>
      ),
    },
  ];

  const uploadProps = {
    fileList,
    onRemove: (file) => {
      setFileList((prevList) => {
        const index = prevList.indexOf(file);
        const newFileList = prevList.slice();
        newFileList.splice(index, 1);
        return newFileList;
      });
    },
    beforeUpload: (file) => {
      setFileList([file]);
      return false;
    },
  };



  return (
    <>
      <h2 className="text-center font-semibold md:text-2xl text-xl py-10 ">
        Add landing CustomerReview
      </h2>
      <Row gutter={16}>
        <Col span={8}>
          <Card title="Add landing CustomerReview" bordered={false}>
            <Form
              form={brandForm}
              onFinish={handleBrandSubmit}
              layout="vertical"
            >


              <Form.Item label="Upload landing CustomerReview Image">
                <Upload {...uploadProps}>
                  <Button icon={<UploadOutlined />}>Upload landing CustomerReview Image</Button>
                </Upload>
              </Form.Item>
              <br />
              <Button type="primary" htmlType="submit">
                Add landing CustomerReview
              </Button>
            </Form>
          </Card>
        </Col>
        <Col span={16}>
          <Card title="All landing CustomerReviews" bordered={false}>
            <Table columns={columns} dataSource={landingCustomerReviews} rowKey="_id" />
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default UploadlandingCustomerReview;
