import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Avatar,
  Tag,
  Typography,
  message,
  Modal,
  Image,
  Input,
  Select,
  Spin,
  Card,
  Row,
  Col,
  Statistic,
  Descriptions,
  Rate
} from "antd";
import { Eye, CheckCircle, Shield, Users, Activity, Ban } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import { useAdmin } from "../../context/admin/AdminContext";

const { Title, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

const AdminProviders = () => {
  const { loading, providers, fetchProviders,disableUser, blockUser, restoreUser } =
    useAdmin();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalProviders, setTotalProviders] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    disabled: 0,
    blocked: 0,
    pending: 0,
  });

  // Modal state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);

  useEffect(() => {
    loadProviders();
  }, [currentPage, pageSize, searchText, selectedStatus, selectedCategory]);

  const loadProviders = async () => {
    const params = { page: currentPage, limit: pageSize };
    if (searchText) params.search = searchText;
    if (selectedStatus) params.status = selectedStatus;
    if (selectedCategory) params.category = selectedCategory;

    const result = await fetchProviders(params);

    if (result.success && result.data.pagination) {
      setTotalProviders(result.data.pagination.total);

      const allProviders = result.data.providers;

      const activeCount = allProviders.filter((p) => p.user?.isActive).length;
      const disabledCount = allProviders.filter(
        (p) => p.user && !p.user.isActive
      ).length;
      const blockedCount = allProviders.filter(
        (p) => p.user?.status === "blocked"
      ).length;
      const pendingCount = allProviders.filter(
        (p) => p.user?.status === "pending"
      ).length;

      setStats({
        total: result.data.pagination.total,
        active: activeCount,
        disabled: disabledCount,
        blocked: blockedCount,
        pending: pendingCount,
      });
    }
  };

  const handleView = (provider) => {
    setSelectedProvider(provider);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedProvider(null);
  };

  const handleBlock = async (provider) => {
    Modal.confirm({
      title: (
        <span className="text-white">
          Block {provider.businessName}?
        </span>
      ),
      content: (
        <span className="text-white">
          This provider will be blocked permanently.
        </span>
      ),
      okType: "danger",
      className: "custom-dark-modal",
      okButtonProps: { className: "dark-ok-btn" },
      cancelButtonProps: { className: "dark-cancel-btn" },
      onOk: async () => {
        const res = await blockUser(provider.user?._id);
        if (res.success) {
          message.success(`${provider.businessName} blocked successfully`);
          loadProviders();
        }
      },
    });
  };
  
  const handleDisable = async (provider) => {
    Modal.confirm({
      title: (
        <span className="text-white">
          Disable {provider.businessName}?
        </span>
      ),
      content: (
        <span className="text-white">
          This provider will be temporarily suspended.
        </span>
      ),
      okType: "warning",
      className: "custom-dark-modal",
      okButtonProps: { className: "dark-ok-btn" },
      cancelButtonProps: { className: "dark-cancel-btn" },
      onOk: async () => {
        const res = await disableUser(provider.user?._id);
        if (res.success) {
          message.success(`${provider.businessName} disabled successfully`);
          loadProviders();
        }
      },
    });
  };
  
  const handleRestore = async (provider) => {
    const res = await restoreUser(provider.user?._id);
    if (res.success) {
      message.success(`${provider.businessName} restored successfully`);
      loadProviders();
    }
  };

  const columns = [
    {
      title: "Provider",
      key: "provider",
      render: (_, record) => (
        <div className="flex items-center">
          <Avatar src={record.user?.profileImage} style={{ marginRight: 12 }}>
            {record.businessName[0]}
          </Avatar>
          <div>
            <div className="text-white">{record.businessName}</div>
            <div className="text-gray-400 text-sm">{record.user?.email}</div>
          </div>
        </div>
      ),
    },
    { title: "Category", dataIndex: "category", key: "category" },
    {
      title: "Status",
      key: "status",
      render: (record) => {
        const status =
          record.user?.status ||
          (record.user?.isActive ? "active" : "disabled");

        const config = {
          active: {
            color: "green",
            label: "Active",
            icon: <CheckCircle size={14} />,
          },
          disabled: { color: "orange", label: "Disabled" },
          blocked: {
            color: "volcano",
            label: "Blocked",
            icon: <Shield size={14} />,
          },
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
      render: (_, record) => {
        const userStatus =
          record.user?.status ||
          (record.user?.isActive ? "active" : "disabled");

        return (
          <Space>
            <Button
              size="small"
              icon={<Eye size={14} />}
              onClick={() => handleView(record)}
            >
              View
            </Button>

            {userStatus === "active" && (
              <>
                {/* <Button size="small" danger onClick={() => handleBlock(record)}>
                  Block
                </Button> */}
                <Button size="small" onClick={() => handleDisable(record)}>
                  Disable
                </Button>
              </>
            )}

            {(userStatus === "disabled" || userStatus === "blocked") && (
              <Button
                size="small"
                type="primary"
                onClick={() => handleRestore(record)}
              >
                Restore
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  const renderProviderModal = () => (
    <Modal
      open={isModalVisible} // AntD v5 uses 'open'
      onCancel={handleCloseModal}
      footer={null}
      title="Provider Details"
      centered
      width={750}
    >
      {selectedProvider && (
        <div>
          <Descriptions
            column={1}
            bordered
            size="middle"
            labelStyle={{ fontWeight: 600, width: 180 }}
          >
            {/* Basic Info */}
            <Descriptions.Item label="Business Name">
              {selectedProvider.businessName}
            </Descriptions.Item>
            <Descriptions.Item label="Category">
              {selectedProvider.category}
            </Descriptions.Item>
            <Descriptions.Item label="Description">
              {selectedProvider.description || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Location">
              {selectedProvider.location || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Website">
              {selectedProvider.website || "N/A"}
            </Descriptions.Item>
  
            {/* User Info */}
            <Descriptions.Item label="Email">
              {selectedProvider.user?.email || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Name">
              {selectedProvider.user
                ? `${selectedProvider.user.firstName} ${selectedProvider.user.lastName}`
                : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Phone">
              {selectedProvider.user?.phone || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={selectedProvider.user?.isActive ? "green" : "red"}>
                {selectedProvider.user?.isActive ? "Active" : "Inactive"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Subscription Plan">
              {selectedProvider.user?.subscriptionPlan || "None"}
            </Descriptions.Item>
            <Descriptions.Item label="Subscription Status">
              {selectedProvider.user?.subscriptionStatus || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Join Date">
              {selectedProvider.user
                ? new Date(selectedProvider.user.createdAt).toLocaleDateString()
                : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Last Login">
              {selectedProvider.user?.lastLogin
                ? new Date(selectedProvider.user.lastLogin).toLocaleDateString()
                : "Never"}
            </Descriptions.Item>
  
            {/* Services & Ratings */}
            <Descriptions.Item label="Services">
              {selectedProvider.services?.length
                ? selectedProvider.services.join(", ")
                : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Base Price">
              ${selectedProvider.basePrice || 0}
            </Descriptions.Item>
            <Descriptions.Item label="Rating">
              <Rate
                disabled
                allowHalf
                defaultValue={selectedProvider.rating || 0}
              />{" "}
              ({selectedProvider.reviews || 0} reviews)
            </Descriptions.Item>
            <Descriptions.Item label="Availability">
              {selectedProvider.availability?.length
                ? selectedProvider.availability.join(", ")
                : "N/A"}
            </Descriptions.Item>
  
            {/* Portfolio Images */}
            {selectedProvider.portfolio?.length > 0 && (
              <Descriptions.Item label="Portfolio">
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {selectedProvider.portfolio.map((img, idx) => (
                    <Image
                      key={idx}
                      src={img}
                      width={100}
                      height={100}
                      style={{ objectFit: "cover", borderRadius: 4 }}
                    />
                  ))}
                </div>
              </Descriptions.Item>
            )}
  
            {/* Rate Cards */}
            {selectedProvider.rateCards?.length > 0 && (
              <Descriptions.Item label="Rate Cards">
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {selectedProvider.rateCards.map((card) => (
                    <div
                      key={card.id}
                      style={{
                        border: "1px solid #f0f0f0",
                        padding: "8px",
                        borderRadius: 4,
                      }}
                    >
                      <b>Service:</b> {card.service} <br />
                      <b>Price:</b> ${card.basePrice} <br />
                      <b>Duration:</b> {card.duration} <br />
                      <b>Includes:</b>{" "}
                      {card.includes?.length ? card.includes.join(", ") : "N/A"}
                    </div>
                  ))}
                </div>
              </Descriptions.Item>
            )}
          </Descriptions>
        </div>
      )}
    </Modal>
  );

  return (
    <AdminLayout>
      <div className="p-6">
        <Title level={2} className="text-white">
          Providers
        </Title>
        <Paragraph className="text-gray-400">
          Manage all service providers on the platform.
        </Paragraph>

        {/* Stats Row */}
        <Row gutter={16} className="mb-6">
          <Col span={8}>
            <Card className="glow-border">
              <Statistic
                title="Total Providers"
                value={stats.total}
                prefix={<Users size={20} />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card className="glow-border">
              <Statistic
                title="Active"
                value={stats.active}
                prefix={<CheckCircle size={20} />}
                valueStyle={{ color: "green" }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card className="glow-border">
              <Statistic
                title="Disabled"
                value={stats.disabled}
                prefix={<Activity size={20} />}
                valueStyle={{ color: "red" }}
              />
            </Card>
          </Col>
          {/* <Col span={6}>
            <Card className="glow-border">
              <Statistic
                title="Blocked"
                value={stats.blocked}
                prefix={<Ban size={20} />}
                valueStyle={{ color: "volcano" }}
              />
            </Card>
          </Col> */}
        </Row>

        {/* Filters */}
        <Space className="mb-4">
          <Search
            placeholder="Search providers..."
            onSearch={(value) => {
              setSearchText(value);
              setCurrentPage(1);
            }}
            allowClear
            style={{ width: 200 }}
          />
          <Select
            placeholder="Filter by status"
            onChange={(value) => {
              setSelectedStatus(value);
              setCurrentPage(1);
            }}
            allowClear
            style={{ width: 160 }}
          >
            <Option value="active">Active</Option>
            <Option value="disabled">Disabled</Option>
            {/* <Option value="blocked">Blocked</Option> */}
            <Option value="pending">Pending</Option>
          </Select>
          <Select
            placeholder="Filter by category"
            onChange={(value) => {
              setSelectedCategory(value);
              setCurrentPage(1);
            }}
            allowClear
            style={{ width: 180 }}
          >
            <Option value="catering">Catering</Option>
            <Option value="photography">Photography</Option>
            <Option value="dj & music">DJ & Music</Option>
          </Select>
        </Space>

        {/* Providers Table */}
        <Card className="glow-border">
          <Table
            dataSource={providers}
            columns={columns}
            rowKey="_id"
            loading={loading}
            pagination={{
              current: currentPage,
              pageSize,
              total: totalProviders,
              showSizeChanger: true,
              showQuickJumper: true,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} providers`,
            }}
            className="bg-transparent"
            scroll={{ x: 1000 }}
            locale={{ emptyText: loading ? <Spin /> : "No providers found" }}
          />
        </Card>

        {/* Modal */}
        {renderProviderModal()}
      </div>
    </AdminLayout>
  );
};

export default AdminProviders;
