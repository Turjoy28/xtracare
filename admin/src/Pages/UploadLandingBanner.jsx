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

const UploadlandingBanner = () => {
  const [brandForm] = Form.useForm();
  const [landingBanners, setlandingBanners] = useState([]);
  const [fileList, setFileList] = useState([]);
  const fetchlandingBanners = async () => {
    try {
      const response = await axios.get("/landingBanner");

      setlandingBanners(response.data.data.doc);
    } catch (error) {
      console.error("Error fetching landingBanners:", error);
    }
  };

  useEffect(() => {
    fetchlandingBanners();
  }, []);

  const handleBrandSubmit = async (values) => {
    if (fileList?.length === 0) {
      message.error("Please Add a landing banner image!");
      return;
    }
    try {
      const formData = new FormData();
      // formData.append("title", values.title);
      // formData.append("subTitle", values.subTitle);
      formData.append("link", values.link);
      formData.append("landingBannerType", values.landingBannerType);
      if (fileList.length > 0) {
        formData.append("photo", fileList[0]);
      }

      const response = await axios.post("/landingBanner", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      message.success(response.data.message);
      fetchlandingBanners();
      brandForm.resetFields();
      setFileList([]);
    } catch (error) {
      message.error("Failed to add landingBanner");
      console.error("Error adding landingBanner:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/landingBanner/${id}`);
      message.success("landingBanner deleted successfully");
      fetchlandingBanners();
    } catch (error) {
      message.error("Failed to delete landingBanner");
      console.error("Error deleting landingBanner:", error);
    }
  };

  const columns = [
    {
      title: "Photo",
      dataIndex: "photo",
      key: "photo",
      render: (text) => (
        <img src={text} alt="landingBanner" style={{ width: 50, height: 50 }} />
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
        Add landing Banner
      </h2>
      <Row gutter={16}>
        <Col span={8}>
          <Card title="Add landing Banner" bordered={false}>
            <Form
              form={brandForm}
              onFinish={handleBrandSubmit}
              layout="vertical"
            >
              

              <Form.Item label="Upload landing Banner Image">
                <Upload {...uploadProps}>
                  <Button icon={<UploadOutlined />}>Upload landing Banner Image</Button>
                </Upload>
              </Form.Item>
              <br />
              <Button type="primary" htmlType="submit">
                Add landing Banner
              </Button>
            </Form>
          </Card>
        </Col>
        <Col span={16}>
          <Card title="All landing Banners" bordered={false}>
            <Table columns={columns} dataSource={landingBanners} rowKey="_id" />
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default UploadlandingBanner;
