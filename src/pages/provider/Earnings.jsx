import React, { useState, useEffect, useMemo } from "react";
import { 
  Card, 
  Table, 
  Statistic, 
  Row, 
  Col, 
  Typography, 
  Tag, 
  Avatar, 
  Space,
  Button,
  Input,
  Select,
  message,
  Tabs
} from "antd";
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Download,
  Search,
  Filter,
  MapPin,
  User,
  CreditCard,
  Clock
} from "lucide-react";
import * as XLSX from 'xlsx';
import ProviderLayout from "../../components/ProviderLayout";
import { useEarnings } from "../../context/provider/EarningsContext";

const { Title } = Typography;
const { Option } = Select;

const ProviderEarnings = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const {
    earningsData,
    loading,
    fetchEarnings,
    getTransformedPayments,
    getPaymentsByStatus,
    getFormattedStats,
    getCalculatedStats,
  } = useEarnings();

  // Fetch earnings on component mount
  useEffect(() => {
    fetchEarnings({ page: currentPage, limit: pageSize });
  }, []);

  // Filtered payments based on search term
  const filteredPayments = useMemo(() => {
    const allPayments = getTransformedPayments();
    if (!searchTerm.trim()) return allPayments;

    return allPayments.filter((payment) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        payment.clientName?.toLowerCase().includes(searchLower) ||
        payment.clientEmail?.toLowerCase().includes(searchLower) ||
        payment.service?.toLowerCase().includes(searchLower) ||
        payment.eventType?.toLowerCase().includes(searchLower) ||
        payment.serviceCategory?.toLowerCase().includes(searchLower)
      );
    });
  }, [getTransformedPayments(), searchTerm]);

  // Get filtered payments by status and search
  const getFilteredPaymentsByStatus = (status) => {
    const statusPayments = getPaymentsByStatus(status);
    if (!searchTerm.trim()) return statusPayments;

    const searchLower = searchTerm.toLowerCase();
    return statusPayments.filter((payment) =>
      payment.clientName?.toLowerCase().includes(searchLower) ||
      payment.clientEmail?.toLowerCase().includes(searchLower) ||
      payment.service?.toLowerCase().includes(searchLower) ||
      payment.eventType?.toLowerCase().includes(searchLower) ||
      payment.serviceCategory?.toLowerCase().includes(searchLower)
    );
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Handle pagination
  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  // Handle status filter change
  const handleStatusFilter = async (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
    await fetchEarnings({
      page: 1,
      limit: pageSize,
      status: status,
      search: searchTerm,
    });
  };

  // Export earnings to Excel
  const handleExportEarnings = () => {
    try {
      let dataToExport = [];
      
      // Get current tab's data
      switch (activeTab) {
        case "completed":
          dataToExport = getFilteredPaymentsByStatus("completed").concat(getFilteredPaymentsByStatus("complete"));
          break;
        case "pending":
          dataToExport = getFilteredPaymentsByStatus("pending");
          break;
        default:
          dataToExport = filteredPayments;
      }

      if (dataToExport.length === 0) {
        message.warning("No earnings data to export");
        return;
      }

      // Prepare data for export
      const exportData = dataToExport.map((payment) => ({
        Date: payment.date,
        "Client Name": payment.clientName,
        "Client Email": payment.clientEmail,
        "Event Type": payment.eventType,
        "Service Category": payment.serviceCategory,
        "Amount": payment.amount,
        "Currency": payment.currency,
        "Status": payment.status,
        "Payment Method": payment.paymentMethod,
        "Event Date": payment.eventDate || "",
        "Location": payment.location ,
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
      XLSX.utils.book_append_sheet(wb, ws, "Earnings");

      // Generate filename with current date
      const filename = `earnings_${activeTab}_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Write file
      XLSX.writeFile(wb, filename);
      
      message.success(`Exported ${dataToExport.length} earnings records successfully!`);
    } catch (error) {
      console.error("Export error:", error);
      message.error("Failed to export earnings data");
    }
  };

  const stats = getFormattedStats();
  const calculatedStats = getCalculatedStats();

  const columns = [
    {
      title: "Client",
      key: "client",
      render: (_, record) => (
        <div className="flex items-center">
          <Avatar 
            src={record.clientImage}
            style={{ backgroundColor: "#3B82F6", marginRight: 12 }}
          >
            {record.clientName
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </Avatar>
          <div>
            <div className="text-white font-semibold">{record.clientName}</div>
            <div className="text-gray-400 text-sm">{record.clientEmail}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Service Details",
      key: "service",
      render: (_, record) => (
        <div>
          <div className="text-white font-medium">{record.eventType}</div>
          <div className="text-gray-400 text-sm">{record.serviceCategory}</div>
          {record.eventDate && (
            <div className="text-gray-500 text-xs flex items-center mt-1">
              <Calendar size={12} className="mr-1" />
              Event: {record.eventDate}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Amount",
      key: "amount",
      render: (_, record) => (
        <div className="text-center">
          <div className="text-green-400 font-bold text-lg">
            ${record.amount?.toLocaleString()}
          </div>
          <div className="text-gray-400 text-xs">{record.currency}</div>
        </div>
      ),
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: "Date",
      key: "date",
      render: (_, record) => (
        <div className="text-center">
          <div className="text-white text-sm">{record.date}</div>
          <div className="text-gray-400 text-xs">
            {Math.floor((new Date() - new Date(record.createdAt)) / (1000 * 60 * 60 * 24))} days ago
          </div>
        </div>
      ),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => {
        const getStatusConfig = (status) => {
          switch (status) {
            case 'completed':
            case 'complete':
              return { color: 'green', text: 'Completed' };
            case 'pending':
              return { color: 'orange', text: 'Pending' };
            case 'failed':
              return { color: 'red', text: 'Failed' };
            default:
              return { color: 'default', text: status };
          }
        };
        
        const config = getStatusConfig(record.status);
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "Payment Method",
      key: "paymentMethod",
      render: (_, record) => (
        <div className="flex items-center text-gray-300">
          <CreditCard size={14} className="mr-1" />
          <span className="capitalize">{record.paymentMethod}</span>
        </div>
      ),
    },
    {
      title: "Location",
      key: "location",
      render: (_, record) => (
        record.location ? (
          <div className="text-gray-300 text-sm">
            <div className="flex items-center">
              <MapPin size={12} className="mr-1" />
              <span>{record.location}</span>
            </div>
          </div>
        ) : (
          <span className="text-gray-500 text-sm">Not specified</span>
        )
      ),
    },
  ];

  const completedPayments = getFilteredPaymentsByStatus("completed").concat(getFilteredPaymentsByStatus("complete"));
  const pendingPayments = getFilteredPaymentsByStatus("pending");

  const tabItems = [
    {
      key: "all",
      label: `All Payments (${filteredPayments.length})`,
      children: (
        <Table
          dataSource={filteredPayments}
          columns={columns}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredPayments.length,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} payments`,
          }}
          onChange={handleTableChange}
          loading={loading}
          scroll={{ x: 1200 }}
        />
      ),
    },
    {
      key: "completed",
      label: `Completed (${completedPayments.length})`,
      children: (
        <Table
          dataSource={completedPayments}
          columns={columns}
          pagination={{ 
            pageSize: 10,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} completed payments`,
          }}
          loading={loading}
          scroll={{ x: 1200 }}
        />
      ),
    },
    {
      key: "pending",
      label: `Pending (${pendingPayments.length})`,
      children: (
        <Table
          dataSource={pendingPayments}
          columns={columns}
          pagination={{ 
            pageSize: 10,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} pending payments`,
          }}
          loading={loading}
          scroll={{ x: 1200 }}
        />
      ),
    },
  ];

  return (
    <ProviderLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Title level={2} className="text-white mb-2">Earnings Dashboard</Title>
            <div className="text-gray-400">
              Track your revenue, manage payments, and monitor your financial growth
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <Row gutter={[24, 24]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card className="glow-border text-center">
              <Statistic 
                title="This Month" 
                value={stats.thisMonthEarnings} 
               
                valueStyle={{ color: "#22C55E" }} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="glow-border text-center">
              <Statistic 
                title="Total Earnings" 
                value={stats.totalEarnings} 
                prefix={<TrendingUp className="text-blue-400" />} 
                valueStyle={{ color: "#3B82F6" }} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="glow-border text-center">
              <Statistic 
                title="Upcoming Payout" 
                value={stats.upcomingPayout} 
                prefix={<Calendar className="text-yellow-400" />} 
                valueStyle={{ color: "#F59E0B" }} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="glow-border text-center">
              <Statistic 
                title="Average Payment" 
                value={`$${calculatedStats.averagePayment?.toLocaleString()}`} 
                prefix={<Clock className="text-purple-400" />} 
                valueStyle={{ color: "#8B5CF6" }} 
              />
            </Card>
          </Col>
        </Row>

        {/* Search and Filters */}
        <Card className="mb-6 glow-border">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <Input.Search
              size="large"
              prefix={<Search size={16} />}
              placeholder="Search by client name, email, or service..."
              className="max-w-md"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              onSearch={handleSearch}
              allowClear
            />
            <Space>
              <Select
                placeholder="Filter by status"
                value={statusFilter}
                onChange={handleStatusFilter}
                style={{ width: 150 }}
                allowClear
              >
                <Option value="all">All Status</Option>
                <Option value="completed">Completed</Option>
                <Option value="pending">Pending</Option>
                <Option value="failed">Failed</Option>
              </Select>
              <Button 
                icon={<Download size={16} />}
                onClick={handleExportEarnings}
                disabled={filteredPayments.length === 0}
                className="hover-lift"
              >
                Export Data
              </Button>
            </Space>
          </div>
          {searchTerm && (
            <div className="mt-3">
              <Tag color="blue" closable onClose={() => handleSearch("")}>
                Searching: "{searchTerm}"
              </Tag>
              <span className="text-gray-400 ml-2">
                {filteredPayments.length} result{filteredPayments.length !== 1 ? 's' : ''} found
              </span>
            </div>
          )}
        </Card>

        {/* Earnings Table */}
        <Card title="Earnings History" className="glow-border">
          <Tabs 
            items={tabItems} 
            onChange={setActiveTab}
            activeKey={activeTab}
          />
        </Card>
      </div>
    </ProviderLayout>
  );
};

export default ProviderEarnings;