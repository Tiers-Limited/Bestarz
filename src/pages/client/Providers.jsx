import React, { useState } from "react";
import { Table, Button, Space, Avatar, Tag, Typography, message, Modal } from "antd";
import { Eye, CheckCircle, Ban, Shield } from "lucide-react";
import ClientLayout from "../../components/ClientLayout";

const { Title, Paragraph } = Typography;

const ClientProviders = () => {
  const [providers, setProviders] = useState([
    {
      key: "1",
      name: "DJ Master",
      email: "djmaster@example.com",
      category: "DJ & Music",
      status: "active",
    },
    {
      key: "2",
      name: "Elite Catering",
      email: "info@elitecatering.com",
      category: "Catering",
      status: "pending",
    },
    {
      key: "3",
      name: "Perfect Photos",
      email: "contact@perfectphotos.com",
      category: "Photography",
      status: "disabled",
    },
  ]);

  const handleBlock = (record) => {
    Modal.confirm({
      title: `Block ${record.name}?`,
      content: "This provider will be blocked from the platform.",
      okType: "danger",
      onOk: () => {
        setProviders(providers.map((p) =>
          p.key === record.key ? { ...p, status: "blocked" } : p
        ));
        message.success(`${record.name} blocked successfully`);
      }
    });
  };

  const columns = [
    {
      title: "Provider",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div className="flex items-center">
          <Avatar style={{ backgroundColor: "#3B82F6", marginRight: 12 }}>
            {text[0]}
          </Avatar>
          <div>
            <div className="text-white">{text}</div>
            <div className="text-gray-400 text-sm">{record.email}</div>
          </div>
        </div>
      ),
    },
    { title: "Category", dataIndex: "category", key: "category" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const config = {
          active: { color: "green", label: "Active", icon: <CheckCircle size={14} /> },
          pending: { color: "orange", label: "Pending" },
          disabled: { color: "red", label: "Disabled" },
          blocked: { color: "volcano", label: "Blocked", icon: <Shield size={14} /> },
        };
        const { color, label, icon } = config[status] || {};
        return (
          <Tag color={color} className="flex items-center gap-1">
            {icon} {label}
          </Tag>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<Eye size={14} />}>View</Button>
          <Button size="small" onClick={() => handleBlock(record)} danger>
            Block
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <ClientLayout>
      <div className="p-6">
        <Title level={2} className="text-white">Providers</Title>
        <Paragraph className="text-gray-400">
          Manage all service providers on the platform.
        </Paragraph>
        <Table
          dataSource={providers}
          columns={columns}
          rowKey="key"
          pagination={{ pageSize: 5 }}
          className="bg-transparent mt-4"
        />
      </div>
    </ClientLayout>
  );
};

export default ClientProviders;
