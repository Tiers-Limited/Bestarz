import React, { useState, useEffect } from "react";
import { 
  Table, 
  Button, 
  Space, 
  Avatar, 
  Typography, 
  message, 
  Modal, 
  Tag,
  Input,
  Select,
  Row,
  Col,
  Card,
  Spin,
  Descriptions
} from "antd";

import { 
  Eye, 
  Ban, 
  CheckCircle, 
  Search,
  UserCheck,
  AlertTriangle,
  Shield
} from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import { useAdmin } from "../../context/admin/AdminContext";
import { useNavigate } from "react-router-dom";

const { Title, Paragraph } = Typography;
const { Option } = Select;

const AdminClients = () => {
  const navigate = useNavigate();
  const {
    loading,
    clients,
    fetchClients,
    blockUser,
    disableUser,
    restoreUser,
  } = useAdmin();

  const [searchText, setSearchText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalClients, setTotalClients] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    loadClients();
  }, [currentPage, pageSize, selectedStatus, searchText]);

  const loadClients = async () => {
    const params = {
      page: currentPage,
      limit: pageSize,
    };

    if (searchText) params.search = searchText;
    if (selectedStatus) params.status = selectedStatus;

    const result = await fetchClients(params);
    if (result.success && result.data.pagination) {
      setTotalClients(result.data.pagination.total);
    }
  };


  const handleView = (client) => {
    setSelectedClient(client);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedClient(null);
  };

  const getClientStatus = (client) => {
    if (!client.isActive) return 'disabled';
    return 'active';
  };

  const handleDisable = (client) => {
    Modal.confirm({
      title: `Disable ${client.firstName} ${client.lastName}?`,
      content: `This will temporarily disable ${client.firstName} ${client.lastName}'s account. They won't be able to make new bookings.`,
      okText: "Disable Client",
      okType: "danger",
      onOk: async () => {
        try {
          const result = await disableUser(
            client._id,
            "Temporarily disabled by admin"
          );
          
          if (result.success) {
            message.success(`${client.firstName} ${client.lastName} has been disabled successfully`);
            await loadClients();
          } else {
            message.error(result.error || "Failed to disable client");
          }
        } catch (error) {

          console.log(error)
          message.error("An error occurred while disabling the client");
        }
      }
    });
  };

  const handleBlock = (client) => {
    Modal.confirm({
      title: `Block ${client.firstName} ${client.lastName}?`,
      content: `This will immediately block ${client.firstName} ${client.lastName} from accessing their account. This action is for security threats.`,
      okText: "Block Client",
      okType: "danger",
      onOk: async () => {
        try {
          const result = await blockUser(
            client._id,
            "Blocked by admin - security concern"
          );
          
          if (result.success) {
            message.success(`${client.firstName} ${client.lastName} has been blocked successfully`);
            await loadClients();
          } else {
            message.error(result.error || "Failed to block client");
          }
        } catch (error) {

          console.log(error)
          message.error("An error occurred while blocking the client");
        }
      }
    });
  };

  const handleRestore = (client) => {
    Modal.confirm({
      title: <span className="text-white">{`Restore ${client.firstName} ${client.lastName}?`}</span>,
      content: (
        <span className="text-white">
          {`This will restore ${client.firstName} ${client.lastName}'s account and allow them to make bookings again.`}
        </span>
      ),
      okText: "Restore Client",
      onOk: async () => {
        try {
          const result = await restoreUser(
            client._id,
            "Account restored by admin"
          );
          
          if (result.success) {
            message.success(`${client.firstName} ${client.lastName} has been restored successfully`);
            await loadClients();
          } else {
            message.error(result.error || "Failed to restore client");
          }
        } catch (error) {
          message.error("An error occurred while restoring the client");
        }
      }
    });
  };

  const getActionButtons = (client) => {
    const status = getClientStatus(client);
    
    if (status === "active") {
      return (
        <Space>
          <Button 
            size="small" 
            icon={<Eye size={14} />}
            onClick={() => handleView(client)} 
          >
            View
          </Button>
          <Button
            size="small"
            onClick={() => handleDisable(client)}
          >
            Disable
          </Button>
          <Button
            size="small"
            danger
            onClick={() => handleBlock(client)}
          >
            Block
          </Button>
        </Space>
      );
    } else {
      return (
        <Space>
          <Button 
            size="small" 
            icon={<Eye size={14} />}
            onClick={() => handleView(client)}
          >
            View
          </Button>
          <Button
            size="small"
            type="primary"
            onClick={() => handleRestore(client)}
          >
            Restore
          </Button>
        </Space>
      );
    }
  };

  const columns = [
    {
      title: "Client",
      key: "client",
      render: (_, record) => (
        <div className="flex items-center">
          <Avatar 
            style={{ backgroundColor: "#F59E0B", marginRight: 12 }}
            src={record.profileImage}
          >
            {`${record.firstName?.[0] || ''}${record.lastName?.[0] || ''}`}
          </Avatar>
          <div>
            <div className="text-white font-medium">
              {record.firstName} {record.lastName}
            </div>
            <div className="text-gray-400 text-sm">{record.email}</div>
            <div className="text-gray-500 text-xs">
              {record.phone || 'No phone number'}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Join Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => (
        <span className="text-gray-300 whitespace-nowrap">
          {new Date(date).toLocaleDateString()}
        </span>
      ),
    },
    {
      title: "Last Login",
      dataIndex: "lastLogin",
      key: "lastLogin",
      render: (date) => (
        <span className="text-gray-300 whitespace-nowrap">
          {date ? new Date(date).toLocaleDateString() : 'Never'}
        </span>
      ),
    },
    {
      title: "Subscription",
      key: "subscription",
      render: (_, record) => (
        <div>
          <div className="text-gray-300">
            {record.subscriptionPlan || 'None'}
          </div>
          {record.subscriptionStatus && (
            <Tag 
              color={record.subscriptionStatus === 'active' ? 'green' : 'orange'}
              size="small"
            >
              {record.subscriptionStatus}
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => {
        const status = getClientStatus(record);
        const config = {
          active: { color: "green", label: "Active", icon: <CheckCircle size={14} /> },
          disabled: { color: "red", label: "Disabled", icon: <Ban size={14} /> },
          blocked: { color: "volcano", label: "Blocked", icon: <Shield size={14} /> },
        };
        const { color, label, icon } = config[status] || config.active;

        return (
          <Tag color={color} className="flex items-center gap-1">
            {icon}
            <span>{label}</span>
          </Tag>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => getActionButtons(record),
    },
  ];


  const renderClientModal = () => (
    <Modal
      visible={isModalVisible}
      onCancel={handleCloseModal}
      footer={null}
      title="Client Details"
      centered
      width={600}
    >
      {selectedClient && (
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Name">
            {selectedClient.firstName} {selectedClient.lastName}
          </Descriptions.Item>
          <Descriptions.Item label="Email">{selectedClient.email}</Descriptions.Item>
          <Descriptions.Item label="Phone">{selectedClient.phone || "N/A"}</Descriptions.Item>
          <Descriptions.Item label="Status">
            {getClientStatus(selectedClient)}
          </Descriptions.Item>
          <Descriptions.Item label="Subscription Plan">
            {selectedClient.subscriptionPlan}
          </Descriptions.Item>
          <Descriptions.Item label="Subscription Status">
            {selectedClient.subscriptionStatus}
          </Descriptions.Item>
          <Descriptions.Item label="Join Date">
            {new Date(selectedClient.createdAt).toLocaleDateString()}
          </Descriptions.Item>
          <Descriptions.Item label="Last Login">
            {selectedClient.lastLogin
              ? new Date(selectedClient.lastLogin).toLocaleDateString()
              : "Never"}
          </Descriptions.Item>
          <Descriptions.Item label="Profile Image">
            <Avatar
              size={64}
              src={selectedClient.profileImage}
              style={{ border: "1px solid #ddd" }}
            >
              {`${selectedClient.firstName?.[0] || ""}${selectedClient.lastName?.[0] || ""}`}
            </Avatar>
          </Descriptions.Item>
        </Descriptions>
      )}
    </Modal>
  );

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Title level={2} className="text-white mb-2">
              Clients Management
            </Title>
            <Paragraph className="text-gray-400">
              Manage all clients on the platform
            </Paragraph>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6 glow-border">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={8}>
              <Input
                placeholder="Search clients..."
                prefix={<Search size={16} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                placeholder="Filter by status"
                value={selectedStatus}
                onChange={setSelectedStatus}
                allowClear
                style={{ width: '100%' }}
              >
                <Option value="active">Active</Option>
                <Option value="disabled">Disabled</Option>
                <Option value="blocked">Blocked</Option>
              </Select>
            </Col>
          </Row>
        </Card>

        {/* Stats Cards */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} md={6}>
            <Card className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {clients.filter(c => getClientStatus(c) === 'active').length}
              </div>
              <div className="text-gray-400">Active Clients</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="text-center">
              <div className="text-2xl font-bold text-red-500">
                {clients.filter(c => getClientStatus(c) === 'disabled').length}
              </div>
              <div className="text-gray-400">Disabled</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="text-center">
              <div className="text-2xl font-bold text-purple-500">
                {clients.filter(c => c.subscriptionPlan && c.subscriptionPlan !== 'none').length}
              </div>
              <div className="text-gray-400">Subscribers</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {totalClients}
              </div>
              <div className="text-gray-400">Total Clients</div>
            </Card>
          </Col>
        </Row>

        {/* Clients Table */}
        <Card className="glow-border">
          <Table
            dataSource={clients}
            columns={columns}
            rowKey="_id"
            loading={loading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalClients,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} clients`,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
            }}
            className="bg-transparent"
            scroll={{ x: 1000 }}
            locale={{
              emptyText: loading ? <Spin /> : 'No clients found'
            }}
          />
        </Card>
      </div>


      {renderClientModal()}
    </AdminLayout>
  );
};

export default AdminClients;