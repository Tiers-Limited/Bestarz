// ProviderRateCards.js
import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Button,
  Space,
  Table,
  Tag,
  Row,
  Col,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Popconfirm,
  Spin,
} from "antd";
import { Plus, Edit, Trash2 } from "lucide-react";
import ProviderLayout from "../../components/ProviderLayout";
import { useServiceRate } from "../../context/provider/ServiceRateContext";

const { Title, Paragraph } = Typography;

const ProviderRateCards = () => {
  const {
    rateCards,
    loading,
    fetchRateCards,
    createRateCard,
    updateRateCard,
    deleteRateCard,
  } = useServiceRate();

  const [rateCardVisible, setRateCardVisible] = useState(false);
  const [editingRateCard, setEditingRateCard] = useState(null);
  const [form] = Form.useForm();

  // Load rate cards on component mount
  useEffect(() => {
    fetchRateCards();
  }, []);

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      const rateCardData = {
        service: values.service,
        basePrice: values.basePrice,
        duration: values.duration,
        includes: values.includes || [],
      };

      let result;
      if (editingRateCard) {
        // Update existing rate card
        result = await updateRateCard(editingRateCard.id, rateCardData);
      } else {
        // Create new rate card
        result = await createRateCard(rateCardData);
      }

      if (result.success) {
        handleModalClose();
      }
    } catch (error) {
      console.error('Error submitting rate card:', error);
    }
  };

  // Handle edit button click
  const handleEdit = (rateCard) => {
    setEditingRateCard(rateCard);
    form.setFieldsValue({
      service: rateCard.service,
      basePrice: rateCard.basePrice,
      duration: rateCard.duration,
      includes: rateCard.includes,
    });
    setRateCardVisible(true);
  };

  // Handle delete
  const handleDelete = async (rateCardId) => {
    await deleteRateCard(rateCardId);
  };

  // Close modal and reset form
  const handleModalClose = () => {
    setRateCardVisible(false);
    setEditingRateCard(null);
    form.resetFields();
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (amount == null || isNaN(amount)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const rateCardColumns = [
    {
      title: "Service Type",
      dataIndex: "service",
      key: "service",
      render: (text) => <span className="text-white font-semibold">{text}</span>,
    },
    {
      title: "Base Price",
      dataIndex: "basePrice",
      key: "basePrice",
      render: (price) => (
        <span className="text-green-400 font-bold">{formatCurrency(price)}</span>
      ),
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      render: (duration) => <span className="text-gray-300">{duration}</span>,
    },
    {
      title: "Includes",
      dataIndex: "includes",
      key: "includes",
      render: (includes) => (
        <div>
          {includes.slice(0, 2).map((item, index) => (
            <Tag key={index} color="blue" className="mb-1 text-xs">
              {item}
            </Tag>
          ))}
          {includes.length > 2 && (
            <Tag color="default" className="text-xs">
              +{includes.length - 2} more
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Button 
            size="small" 
            icon={<Edit size={14} />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Rate Card"
            description="Are you sure you want to delete this rate card?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button size="small" danger icon={<Trash2 size={14} />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <ProviderLayout>
      <div className="p-6">
        <Title level={2} className="text-white mb-2">
          Service Rate Cards
        </Title>
        <Paragraph className="text-gray-400 mb-6">
          Manage pricing for your services. Clear rate cards help clients book
          faster and increase trust.
        </Paragraph>

        <Card
          className="glow-border"
          extra={
            <Button
              type="primary"
              icon={<Plus size={16} />}
              onClick={() => setRateCardVisible(true)}
              className="glow-button"
              loading={loading}
            >
              Add Rate Card
            </Button>
          }
        >
          <Spin spinning={loading}>
            <Table
              dataSource={rateCards}
              columns={rateCardColumns}
              pagination={false}
              scroll={{ x: 800 }}
              rowKey="_id"
              locale={{
                emptyText: 'No rate cards found. Create your first rate card to get started!'
              }}
            />
          </Spin>
        </Card>

        {/* Modal for Creating/Editing Rate Card */}
        <Modal
          title={editingRateCard ? "Edit Rate Card" : "Create Rate Card"}
          open={rateCardVisible}
          onCancel={handleModalClose}
          footer={null}
          width={600}
        >
          <Form 
            form={form}
            layout="vertical" 
            onFinish={handleSubmit}
            autoComplete="off"
          >
            <Form.Item 
              name="service" 
              label="Service Type" 
              rules={[
                { required: true, message: 'Please enter the service type' }
              ]}
            >
              <Input 
                size="large" 
                placeholder="e.g., Wedding DJ, Corporate Catering" 
              />
            </Form.Item>

            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item 
                  name="basePrice" 
                  label="Base Price" 
                  rules={[
                    { required: true, message: 'Please enter the base price' },
                    { type: 'number', min: 0, message: 'Price must be greater than 0' }
                  ]}
                >
                  <InputNumber
                    size="large"
                    style={{ width: "100%" }}
                    prefix="$"
                    placeholder="Base price"
                    min={0}
                    step={0.01}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item 
                  name="duration" 
                  label="Duration" 
                  rules={[
                    { required: true, message: 'Please enter the duration' }
                  ]}
                >
                  <Input 
                    size="large" 
                    placeholder="e.g., 6 hours, 4-8 hours" 
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item 
              name="includes" 
              label="What's Included"
              tooltip="Add items that are included in the base price"
            >
              <Select
                mode="tags"
                size="large"
                placeholder="Add included items (press Enter to add each item)"
                style={{ width: '100%' }}
                tokenSeparators={[',']}
              />
            </Form.Item>

            <div className="text-center mt-6">
              <Space>
                <Button onClick={handleModalClose}>
                  Cancel
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  className="glow-button"
                  loading={loading}
                >
                  {editingRateCard ? 'Update Rate Card' : 'Create Rate Card'}
                </Button>
              </Space>
            </div>
          </Form>
        </Modal>
      </div>
    </ProviderLayout>
  );
};

export default ProviderRateCards;