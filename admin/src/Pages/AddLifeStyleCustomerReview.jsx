import React, { useState, useEffect } from "react"
import { Space, Table, Modal, Form, Input, Button, message } from "antd"
import axios from "../Components/Axios"

const AddLifeStyleCustomerReview = () => {
  const [reviews, setReviews] = useState([])
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const fetchData = async () => {
    try {
      const response = await axios.get("/life-style/customer-review")
      setReviews(response?.data?.data?.doc || [])
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/life-style/customer-review/${id}`)
      message.success("Customer Review deleted successfully")
      fetchData()
    } catch (error) {
      message.error("Failed to delete Customer Review")
    }
  }

  const handleAdd = async (values) => {
    try {
      setLoading(true)
      await axios.post("/life-style/customer-review", values)
      message.success("Customer Review added successfully")
      setAddModalVisible(false)
      form.resetFields()
      fetchData()
    } catch (error) {
      message.error("Failed to add Customer Review")
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: "#SL",
      dataIndex: "index",
      key: "index",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button danger onClick={() => handleDelete(record._id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div className="p-5">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">Lifestyle Customer Reviews</h2>
        <Button type="primary" onClick={() => setAddModalVisible(true)}>
          Add Customer Review
        </Button>
      </div>

      <Table columns={columns} dataSource={reviews} rowKey="_id" />

      <Modal
        title="Add Customer Review"
        visible={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAdd}>
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Please enter a title" }]}
          >
            <Input placeholder="Enter title" />
          </Form.Item>
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Please enter a description" }]}
          >
            <Input.TextArea rows={4} placeholder="Enter description" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Add
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default AddLifeStyleCustomerReview
