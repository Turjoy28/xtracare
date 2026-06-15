import React, { useState, useEffect } from "react"
import { Space, Table, Modal, Form, Input, Button, message } from "antd"
import axios from "../Components/Axios"

const AddLifeStyleOrder = () => {
  const [reviews, setReviews] = useState([])
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const fetchData = async () => {
    try {
      const response = await axios.get("/life-style/order")
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
      await axios.delete(`/life-style/order/${id}`)
      message.success("Order deleted successfully")
      fetchData()
    } catch (error) {
      message.error("Failed to delete Order")
    }
  }

  const handleAdd = async (values) => {
    try {
      setLoading(true)
      await axios.post("/life-style/order", values)
      message.success("Order added successfully")
      setAddModalVisible(false)
      form.resetFields()
      fetchData()
    } catch (error) {
      message.error("Failed to add Order")
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
        <h2 className="text-xl font-semibold">Lifestyle Orders</h2>
        <Button type="primary" onClick={() => setAddModalVisible(true)}>
          Add Order
        </Button>
      </div>

      <Table columns={columns} dataSource={reviews} rowKey="_id" />

      <Modal
        title="Add Order"
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

export default AddLifeStyleOrder
