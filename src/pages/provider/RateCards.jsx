// ProviderRateCards.js
import React, { useState } from "react";
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
} from "antd";
import { Plus, Edit, Trash2 } from "lucide-react";
import ProviderLayout from "../../components/ProviderLayout";

const { Title, Paragraph } = Typography;

const ProviderRateCards = () => {
  const [rateCardVisible, setRateCardVisible] = useState(false);
  const [rateCards, setRateCards] = useState([
    {
      key: "1",
      service: "Wedding DJ",
      basePrice: 1200,
      duration: "6 hours",
      includes: ["Sound system", "Microphones", "Basic lighting"],
      addOns: [
        { name: "Extra hour", price: 150 },
        { name: "Premium lighting", price: 300 },
      ],
    },
    {
      key: "2",
      service: "Corporate Event",
      basePrice: 800,
      duration: "4 hours",
      includes: ["Sound system", "Background music"],
      addOns: [{ name: "Extra hour", price: 100 }],
    },
  ]);

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
        <span className="text-green-400 font-bold">${price}</span>
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
      render: () => (
        <Space size="small">
          <Button size="small" icon={<Edit size={14} />}>
            Edit
          </Button>
          <Button size="small" danger icon={<Trash2 size={14} />}>
            Delete
          </Button>
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
            >
              Add Rate Card
            </Button>
          }
        >
          <Table
            dataSource={rateCards}
            columns={rateCardColumns}
            pagination={false}
            scroll={{ x: 800 }}
          />
        </Card>

        {/* Modal for Creating Rate Card */}
        <Modal
          title="Create Rate Card"
          open={rateCardVisible}
          onCancel={() => setRateCardVisible(false)}
          footer={null}
          width={600}
        >
          <Form layout="vertical">
            <Form.Item name="service" label="Service Type" required>
              <Input size="large" placeholder="e.g., Wedding DJ" />
            </Form.Item>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item name="basePrice" label="Base Price" required>
                  <InputNumber
                    size="large"
                    style={{ width: "100%" }}
                    prefix="$"
                    placeholder="Base price"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="duration" label="Duration" required>
                  <Input size="large" placeholder="e.g., 6 hours" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="includes" label="What's Included">
              <Select
                mode="tags"
                size="large"
                placeholder="Add included items"
              />
            </Form.Item>
            <div className="text-center mt-6">
              <Space>
                <Button onClick={() => setRateCardVisible(false)}>Cancel</Button>
                <Button type="primary" className="glow-button">
                  Create Rate Card
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
