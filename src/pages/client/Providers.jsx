import React, { useState, useMemo, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Avatar,
  Tag,
  Typography,
  Modal,
  Card,
  Input,
  Rate,
  Spin,
  Row,
  Col,
} from "antd";
import { Eye, Search, MapPin } from "lucide-react";
import ClientLayout from "../../components/ClientLayout";
import { useClient } from "../../context/client/ClientContext";

const { Title, Paragraph } = Typography;

const ClientProviders = () => {
  const { providers, loading, fetchProviders } = useClient();
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [providerModalVisible, setProviderModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchProviders(); // fetch all providers once
  }, []);

  // Filter providers locally based on single search input
  const filteredProviders = useMemo(() => {
    if (!searchQuery) return providers;

    const q = searchQuery.toLowerCase();
    return providers.filter((p) => {
      const name = p.businessName?.toLowerCase() || "";
      const fullName = `${p.user?.firstName || ""} ${
        p.user?.lastName || ""
      }`.toLowerCase();
      const category = p.category?.toLowerCase() || "";
      const location = p.location?.toLowerCase() || "";
      const price = p.basePrice?.toString() || "";
      const rating = p.rating?.toString() || "";

      return (
        name.includes(q) ||
        fullName.includes(q) ||
        category.includes(q) ||
        location.includes(q) ||
        price.includes(q) ||
        rating.includes(q)
      );
    });
  }, [providers, searchQuery]);

  const handleViewProvider = (provider) => {
    setSelectedProvider(provider);
    setProviderModalVisible(true);
  };

  const columns = [
    {
      title: "Provider",
      key: "provider",
      render: (_, record) => (
        <div className="flex items-center">
          <Avatar
            size={48}
            src={record.user?.profileImage}
            style={{ backgroundColor: "#3B82F6", marginRight: 12 }}
          >
            {record.businessName?.[0] || record.user?.firstName?.[0] || "P"}
          </Avatar>
          <div>
            <div className="text-white font-medium">{record.businessName}</div>
            <div className="text-gray-400 text-sm">
              {record.user?.firstName} {record.user?.lastName}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (category) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: "Rating",
      key: "rating",
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Rate disabled value={record.rating} />
          <span className="text-gray-400 text-sm">
            ({record.reviews} reviews)
          </span>
        </div>
      ),
    },
    {
      title: "Base Price",
      dataIndex: "basePrice",
      key: "basePrice",
      render: (price) => (
        <span className="text-white font-semibold">
          ${price ? price.toLocaleString() : "Contact for pricing"}
        </span>
      ),
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      render: (location) => (
        <span className="text-gray-300">{location || "N/A"}</span>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => (
        <Tag color={record.user?.isActive ? "green" : "red"}>
          {record.user?.isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<Eye size={14} />}
            onClick={() => handleViewProvider(record)}
          >
            View Details
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <ClientLayout>
      <div className="p-6">
        <Title level={2} className="text-white">
          Service Providers
        </Title>
        <Paragraph className="text-gray-400 mb-6">
          Browse and discover service providers for your events.
        </Paragraph>

        {/* Single Search Input */}
        <Card className="glow-border mb-6">
          <Row>
            <Col xs={24} sm={12} md={8}>
              <Input
                placeholder="Search by name, category, location, price, rating..."
                prefix={<Search size={16} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Col>
          </Row>
        </Card>

        {/* Providers Table */}
        <Card className="glow-border">
          {loading && !providers.length ? (
            <div className="flex justify-center py-8">
              <Spin size="large" />
            </div>
          ) : (
            <Table
              dataSource={filteredProviders}
              columns={columns}
              rowKey="_id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} providers`,
              }}
              className="bg-transparent"
              scroll={{ x: 1000 }}
            />
          )}
        </Card>

        {/* Provider Details Modal */}
        <Modal
          title="Provider Details"
          open={providerModalVisible}
          onCancel={() => {
            setProviderModalVisible(false);
            setSelectedProvider(null);
          }}
          footer={null}
          width={800}
          bodyStyle={{
            backgroundColor: "#1F2937",
            color: "#F9FAFB",
            padding: "24px",
          }}
          style={{ borderRadius: "12px" }}
        >
          {selectedProvider && (
            <div className="space-y-6 text-gray-100">
              {/* Header Section */}
              <div className="flex items-center gap-4 pb-4 border-b border-gray-700">
                <Avatar
                  size={80}
                  src={selectedProvider.user?.profileImage}
                  style={{ backgroundColor: "#2563EB", color: "#F9FAFB" }}
                >
                  {selectedProvider.businessName?.[0] || "P"}
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-100 mb-1">
                    {selectedProvider.businessName}
                  </h3>
                  <p className="text-gray-300 mb-2">
                    {selectedProvider.user?.firstName}{" "}
                    {selectedProvider.user?.lastName}
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Rate
                        disabled
                        value={selectedProvider.rating}
                        size="small"
                      />
                      <span className="text-sm text-gray-400">
                        ({selectedProvider.reviews} reviews)
                      </span>
                    </div>
                    <Tag color="blue">{selectedProvider.category}</Tag>
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Base Price
                  </label>
                  <p className="text-gray-100 font-semibold">
                    $
                    {selectedProvider.basePrice?.toLocaleString() ||
                      "Contact for pricing"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Location
                  </label>
                  <p className="text-gray-100 flex items-center gap-1">
                    <MapPin size={14} />
                    {selectedProvider.location || "N/A"}
                  </p>
                </div>
              </div>

              {/* Description */}
              {selectedProvider.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Description
                  </label>
                  <p className="text-gray-100 bg-gray-800 p-3 rounded">
                    {selectedProvider.description}
                  </p>
                </div>
              )}

              {/* Services */}
              {selectedProvider.services?.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Services Offered
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedProvider.services.map((service, index) => (
                      <Tag key={index} color="green">
                        {service}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}

              {/* Portfolio */}
              {selectedProvider.portfolio?.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Portfolio
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedProvider.portfolio
                      .slice(0, 6)
                      .map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Portfolio ${index + 1}`}
                          className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-80"
                          onClick={() => window.open(image, "_blank")}
                        />
                      ))}
                  </div>
                </div>
              )}

              {/* Website */}
              {selectedProvider.website && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Website
                  </label>
                  <a
                    href={selectedProvider.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    {selectedProvider.website}
                  </a>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </ClientLayout>
  );
};

export default ClientProviders;
