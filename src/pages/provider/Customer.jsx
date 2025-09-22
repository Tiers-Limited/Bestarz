import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  Typography,
  Table,
  Button,
  Input,
  Space,
  Avatar,
  Tag,
  Tabs,
  Timeline,
  Modal,
  Form,
  Rate,
  message,
  Spin,
} from "antd";
import {
  Search,
  MessageCircle,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Star,
  Plus,
  Eye,
  MapPin,
  Users,
  Clock,
  Download,
} from "lucide-react";
import * as XLSX from 'xlsx';
import ProviderLayout from "../../components/ProviderLayout";
import { useCustomer } from "../../context/provider/CustomerContext";

const { Title, Paragraph } = Typography;

const ProviderCustomers = () => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeTab, setActiveTab] = useState("all");
  
  const {
    customersData,
    loading,
    fetchCustomers,
    getTransformedCustomers,
    getCustomersByStatus,
    getCustomerStats,
  } = useCustomer();

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers({ page: currentPage, limit: pageSize });
  }, []);

  // Filtered customers based on search term
  const filteredCustomers = useMemo(() => {
    const allCustomers = getTransformedCustomers();
    if (!searchTerm.trim()) return allCustomers;

    return allCustomers.filter((customer) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        customer.name?.toLowerCase().includes(searchLower) ||
        customer.email?.toLowerCase().includes(searchLower) ||
        customer.phone?.toLowerCase().includes(searchLower)
      );
    });
  }, [getTransformedCustomers(), searchTerm]);

  // Get filtered customers by status and search
  const getFilteredCustomersByStatus = (status) => {
    const statusCustomers = getCustomersByStatus(status);
    if (!searchTerm.trim()) return statusCustomers;

    const searchLower = searchTerm.toLowerCase();
    return statusCustomers.filter((customer) =>
      customer.name?.toLowerCase().includes(searchLower) ||
      customer.email?.toLowerCase().includes(searchLower) ||
      customer.phone?.toLowerCase().includes(searchLower)
    );
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle pagination
  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  // Handle view customer details
  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
  };

  // Export customers to Excel
  const handleExportList = () => {
    try {
      let dataToExport = [];
      
      // Get current tab's data
      switch (activeTab) {
        case "active":
          dataToExport = getFilteredCustomersByStatus("active");
          break;
        case "new":
          dataToExport = getFilteredCustomersByStatus("new");
          break;
        default:
          dataToExport = filteredCustomers;
      }

      if (dataToExport.length === 0) {
        message.warning("No customers to export");
        return;
      }

      // Prepare data for export
      const exportData = dataToExport.map((customer) => ({
        Name: customer.name,
        Email: customer.email,
        Phone: customer.phone,
        "Total Bookings": customer.totalBookings,
        "Total Spent": customer.totalSpent,
        "Last Booking": customer.lastBooking 
          ? new Date(customer.lastBooking).toLocaleDateString()
          : "No bookings yet",
        Status: customer.status,
        "Join Date": customer.joinDate 
          ? new Date(customer.joinDate).toLocaleDateString()
          : "",
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Auto-size columns
      const colWidths = Object.keys(exportData[0] || {}).map(key => ({
        wch: Math.max(key.length, 15)
      }));
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Customers");

      // Generate filename with current date
      const filename = `customers_${activeTab}_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Write file
      XLSX.writeFile(wb, filename);
      
      message.success(`Exported ${dataToExport.length} customers successfully!`);
    } catch (error) {
      console.error("Export error:", error);
      message.error("Failed to export customers list");
    }
  };

  const stats = getCustomerStats();

  const columns = [
    {
      title: "Customer",
      key: "customer",
      render: (_, record) => (
        <div className="flex items-center">
          <Avatar 
            src={record.profileImage}
            style={{ backgroundColor: "#3B82F6", marginRight: 12 }}
          >
            {record.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </Avatar>
          <div>
            <div className="text-white font-semibold">{record.name}</div>
            <div className="text-gray-400 text-sm">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Contact",
      key: "contact",
      render: (_, record) => (
        <div>
          <div className="text-gray-300 text-sm">{record.phone}</div>
          <div className="text-gray-400 text-xs">
            {record.joinDate && `Customer since ${new Date(record.joinDate).toLocaleDateString()}`}
          </div>
        </div>
      ),
    },
    {
      title: "Bookings",
      dataIndex: "totalBookings",
      key: "bookings",
      render: (bookings) => (
        <div className="text-center">
          <div className="text-white font-semibold">{bookings}</div>
          <div className="text-gray-400 text-xs">total</div>
        </div>
      ),
    },
    {
      title: "Revenue",
      dataIndex: "totalSpent",
      key: "revenue",
      render: (amount) => (
        <div className="text-center">
          <div className="text-green-400 font-bold">${amount}</div>
          <div className="text-gray-400 text-xs">lifetime</div>
        </div>
      ),
    },
    {
      title: "Last Booking",
      dataIndex: "lastBooking",
      key: "lastBooking",
      render: (date) => (
        <div className="text-center">
          {date ? (
            <>
              <div className="text-white text-sm">
                {new Date(date).toLocaleDateString()}
              </div>
              <div className="text-gray-400 text-xs">
                {Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24))} days ago
              </div>
            </>
          ) : (
            <div className="text-gray-400 text-sm">No bookings yet</div>
          )}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const config = {
          active: { color: "green", text: "Active" },
          new: { color: "blue", text: "New Customer" },
          inactive: { color: "gray", text: "Inactive" },
        };
        const { color, text } = config[status] || config.active;
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<Eye size={14} />}
            onClick={() => handleViewCustomer(record)}
            className="hover-lift"
          >
            View
          </Button>
          <Button
            size="small"
            icon={<MessageCircle size={14} />}
            className="hover-lift"
          >
            Message
          </Button>
        </Space>
      ),
    },
  ];

  const tabItems = [
    {
      key: "all",
      label: `All Customers (${filteredCustomers.length})`,
      children: (
        <Table
          dataSource={filteredCustomers}
          columns={columns}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredCustomers.length,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} customers`,
          }}
          onChange={handleTableChange}
          loading={loading}
          scroll={{ x: 800 }}
        />
      ),
    },
    {
      key: "active",
      label: `Active (${getFilteredCustomersByStatus('active').length})`,
      children: (
        <Table
          dataSource={getFilteredCustomersByStatus('active')}
          columns={columns}
          pagination={{ 
            pageSize: 10,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} active customers`,
          }}
          loading={loading}
          scroll={{ x: 800 }}
        />
      ),
    },
    {
      key: "new",
      label: `New (${getFilteredCustomersByStatus('new').length})`,
      children: (
        <Table
          dataSource={getFilteredCustomersByStatus('new')}
          columns={columns}
          pagination={{ 
            pageSize: 10,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} new customers`,
          }}
          loading={loading}
          scroll={{ x: 800 }}
        />
      ),
    },
  ];

  return (
    <ProviderLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Title level={2} className="text-white mb-2">
              Customer Management
            </Title>
            <Paragraph className="text-gray-400">
              Manage your client relationships, track booking history, and build
              lasting connections
            </Paragraph>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="glow-border text-center">
            <div className="text-2xl font-bold text-blue-400">{stats.total}</div>
            <div className="text-gray-400">Total Customers</div>
          </Card>
          <Card className="glow-border text-center">
            <div className="text-2xl font-bold text-green-400">{stats.active}</div>
            <div className="text-gray-400">Active Customers</div>
          </Card>
          <Card className="glow-border text-center">
            <div className="text-2xl font-bold text-yellow-400">${stats.totalRevenue}</div>
            <div className="text-gray-400">Total Revenue</div>
          </Card>
          <Card className="glow-border text-center">
            <div className="text-2xl font-bold text-purple-400">${stats.averageSpent}</div>
            <div className="text-gray-400">Avg. per Customer</div>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6 glow-border">
          <div className="flex items-center justify-between">
            <Input.Search
              size="large"
              prefix={<Search size={16} />}
              placeholder="Search customers by name, email, or phone..."
              className="max-w-md"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              onSearch={handleSearch}
              allowClear
            />
            <Space>
              <Button 
                className="hover-lift" 
                icon={<Download size={16} />}
                onClick={handleExportList}
                disabled={filteredCustomers.length === 0}
              >
                Export List
              </Button>
            </Space>
          </div>
          {searchTerm && (
            <div className="mt-3">
              <Tag color="blue" closable onClose={() => handleSearch("")}>
                Searching: "{searchTerm}"
              </Tag>
              <span className="text-gray-400 ml-2">
                {filteredCustomers.length} result{filteredCustomers.length !== 1 ? 's' : ''} found
              </span>
            </div>
          )}
        </Card>

        {/* Customer List */}
        <Card title="Customer Database" className="glow-border">
          <Tabs 
            items={tabItems} 
            onChange={setActiveTab}
            activeKey={activeTab}
          />
        </Card>

        {/* Customer Detail Modal */}
        <Modal
          title={
            selectedCustomer
              ? `${selectedCustomer.name} - Customer Details`
              : ""
          }
          open={!!selectedCustomer}
          onCancel={() => setSelectedCustomer(null)}
          footer={null}
          width={900}
        >
          {selectedCustomer && (
            <div>
              <div className="flex items-center mb-6">
                <Avatar
                  size={64}
                  src={selectedCustomer.profileImage}
                  style={{ backgroundColor: "#3B82F6", marginRight: 16 }}
                >
                  {selectedCustomer.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </Avatar>
                <div className="flex-1">
                  <Title level={4} className="text-white mb-1">
                    {selectedCustomer.name}
                  </Title>
                  <Space size="large" className="mb-2">
                    <span className="text-gray-400 flex items-center">
                      <Mail size={14} className="mr-1" />
                      {selectedCustomer.email}
                    </span>
                    <span className="text-gray-400 flex items-center">
                      <Phone size={14} className="mr-1" />
                      {selectedCustomer.phone}
                    </span>
                  </Space>
                  <div className="flex items-center space-x-4">
                    <div className="trust-badge flex items-center gap-1">
                      <DollarSign size={14} />
                      <span>{selectedCustomer.totalSpent} total</span>
                    </div>
                    <div className="trust-badge flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{selectedCustomer.totalBookings} bookings</span>
                    </div>
                    <Tag color={
                      selectedCustomer.status === 'active' ? 'green' :
                      selectedCustomer.status === 'new' ? 'blue' : 'gray'
                    }>
                      {selectedCustomer.status}
                    </Tag>
                  </div>
                </div>
              </div>

              <Tabs
                items={[
                  {
                    key: "timeline",
                    label: "Booking History",
                    children: selectedCustomer.timeline?.length > 0 ? (
                      <Timeline
                        items={selectedCustomer.timeline.map((item, index) => ({
                          dot:
                            item.status === "completed" ? (
                              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                            ) : item.status === "pending" ? (
                              <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                            ) : item.status === "confirmed" ? (
                              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                            ) : (
                              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                            ),
                          children: (
                            <div key={index}>
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <Title level={5} className="text-white mb-1">
                                    {item.event}
                                  </Title>
                                  <div className="text-gray-400 text-sm mb-2">
                                    {item.date} {item.eventTime && `at ${item.eventTime}`}
                                  </div>
                                  {item.location && (
                                    <div className="text-gray-400 text-xs flex items-center mb-1">
                                      <MapPin size={12} className="mr-1" />
                                      {item.location.address}, {item.location.city}
                                    </div>
                                  )}
                                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                                    {item.guests && (
                                      <span className="flex items-center">
                                        <Users size={12} className="mr-1" />
                                        {item.guests} guests
                                      </span>
                                    )}
                                    {item.duration && (
                                      <span className="flex items-center">
                                        <Clock size={12} className="mr-1" />
                                        {item.duration}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-green-400 font-bold">
                                    {item.amount}
                                  </div>
                                  <Tag
                                    color={
                                      item.status === "completed"
                                        ? "green"
                                        : item.status === "pending"
                                        ? "orange"
                                        : item.status === "confirmed"
                                        ? "blue"
                                        : "default"
                                    }
                                  >
                                    {item.status}
                                  </Tag>
                                  {item.paymentStatus && (
                                    <div className="mt-1">
                                      <Tag
                                        size="small"
                                        color={item.paymentStatus === "paid" ? "green" : "orange"}
                                      >
                                        {item.paymentStatus}
                                      </Tag>
                                    </div>
                                  )}
                                </div>
                              </div>
                              {item.notes && (
                                <div className="bg-gray-800 p-3 rounded text-gray-300 text-sm">
                                  "{item.notes}"
                                </div>
                              )}
                            </div>
                          ),
                        }))}
                      />
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        No booking history available
                      </div>
                    ),
                  },
                ]}
              />
            </div>
          )}
        </Modal>
      </div>
    </ProviderLayout>
  );
};

export default ProviderCustomers;