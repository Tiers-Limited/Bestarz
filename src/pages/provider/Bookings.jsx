import React, { useState, useEffect } from "react";
import { Table, Tag, Button, Avatar, Typography, Select, DatePicker, Pagination, message, Spin, Modal, Row, Col, Card } from "antd";
import { Calendar, Users, MessageCircle, MapPin, DollarSign, Clock, Phone, Mail, FileText, CreditCard } from "lucide-react";
import ProviderLayout from "../../components/ProviderLayout";
import dayjs from 'dayjs';
import { useProvider } from "../../context/provider/ProviderContext";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const ProviderBookings = () => {
  const { fetchBookings, bookingsData, loading } = useProvider();
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState([]);
  
  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const { bookings, pagination } = bookingsData;

  const loadBookings = async (params = {}) => {
    const result = await fetchBookings(params);
    if (!result.success) {
      message.error(result.error);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    const startDate = dateRange[0] ? dateRange[0].format('YYYY-MM-DD') : null;
    const endDate = dateRange[1] ? dateRange[1].format('YYYY-MM-DD') : null;
    loadBookings({
      page: 1,
      status: value,
      startDate,
      endDate
    });
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates || []);
    const startDate = dates && dates[0] ? dates[0].format('YYYY-MM-DD') : null;
    const endDate = dates && dates[1] ? dates[1].format('YYYY-MM-DD') : null;
    loadBookings({
      page: 1,
      status: statusFilter,
      startDate,
      endDate
    });
  };

  const handlePageChange = (page) => {
    const startDate = dateRange[0] ? dateRange[0].format('YYYY-MM-DD') : null;
    const endDate = dateRange[1] ? dateRange[1].format('YYYY-MM-DD') : null;
    loadBookings({
      page,
      status: statusFilter,
      startDate,
      endDate
    });
  };

  const showBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedBooking(null);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "confirmed": return "green";
      case "pending": return "orange";
      case "cancelled": return "red";
      case "completed": return "blue";
      default: return "gray";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid": return "green";
      case "pending": return "orange";
      case "failed": return "red";
      case "refunded": return "purple";
      default: return "gray";
    }
  };

  const formatDate = (dateString) => {
    return dayjs(dateString).format('MMM DD, YYYY');
  };

  const formatDateTime = (dateString) => {
    return dayjs(dateString).format('MMM DD, YYYY [at] h:mm A');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getClientName = (booking) => {
    if (booking.client) {
      return `${booking.client.firstName} ${booking.client.lastName}`;
    }
    return 'Anonymous Client';
  };

  const getClientInitials = (booking) => {
    if (booking.client) {
      return `${booking.client.firstName[0]}${booking.client.lastName[0]}`;
    }
    return 'AC';
  };

  // Table columns configuration
  const columns = [
    {
      title: 'Client',
      dataIndex: 'client',
      key: 'client',
      className: "whitespace-nowrap",
      
      render: (_, booking) => (
        <div className="flex items-center">
          {booking.client?.profileImage ? (
            <Avatar src={booking.client.profileImage} size={32} className="mr-2" />
          ) : (
            <Avatar style={{ backgroundColor: "#3B82F6" }} size={32} className="mr-2">
              {getClientInitials(booking)}
            </Avatar>
          )}
          <span>{getClientName(booking)}</span>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      className: "whitespace-nowrap",
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'dateStart',
      key: 'dateStart',
      className: "whitespace-nowrap",
      render: (dateStart, booking) => (
        <div className="flex items-center">
          <Calendar size={12} className="mr-2" />
          {formatDate(dateStart)} at {booking.eventTime}
        </div>
      ),
    },
    {
      title: 'Service',
      key: 'service',
      className: "whitespace-nowrap",
      render: (_, booking) => (
        <div className="flex items-center">
          <Users size={12} className="mr-2" />
          {booking.serviceCategory} - {booking.eventType} ({booking.guests} guests)
        </div>
      ),
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      className: "whitespace-nowrap",
      render: (location) => (
        <div className="flex items-center">
          <MapPin size={12} className="mr-2" />
          {location.city}, {location.state}
        </div>
      ),
    },
    {
      title: 'Amount',
      key: 'amount',
      className: "whitespace-nowrap",
      render: (_, booking) => (
        <div className="flex items-center">
          <DollarSign size={12} className="mr-2" />
          {booking.amount
            ? formatCurrency(booking.amount)
            : `${formatCurrency(booking.budgetMin)} - ${formatCurrency(booking.budgetMax)}`}
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      className: "whitespace-nowrap",
      render: (_, booking) => (
        <div className="flex gap-2">
          <Button 
            icon={<MessageCircle size={14} />}
            disabled={!booking.client}
          >
            Message
          </Button>
          <Button 
            type="primary"
            onClick={() => showBookingDetails(booking)}
          >
            Details
          </Button>
        </div>
      ),
    },
  ];

  return (
    <ProviderLayout>
      <div className="p-6">
        <Title level={2} className="text-white mb-6">Bookings</Title>
        
        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <Select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="w-40"
            placeholder="Filter by status"
          >
            <Option value="all">All Statuses</Option>
            <Option value="pending">Pending</Option>
            <Option value="confirmed">Confirmed</Option>
            <Option value="completed">Completed</Option>
            <Option value="cancelled">Cancelled</Option>
          </Select>
          
          <RangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            className="w-64"
            placeholder={['Start Date', 'End Date']}
          />
          
          <Button onClick={() => {
            setStatusFilter('all');
            setDateRange([]);
            loadBookings({ page: 1 });
          }}>
            Clear Filters
          </Button>
        </div>

        {/* Table */}
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={bookings}
            rowKey="_id"
            locale={{ emptyText: 'No bookings found' }}
            pagination={false}
            className="glow-border"
            rowClassName="hover:bg-gray-800/50"
            scroll={{ x: 'max-content' }}
          />
          
          {/* Pagination */}
          {pagination.total > 0 && (
            <div className="flex justify-center mt-6">
              <Pagination
                current={pagination.page}
                total={pagination.total}
                pageSize={pagination.limit}
                onChange={handlePageChange}
                showSizeChanger={false}
                showQuickJumper
                showTotal={(total, range) =>
                  `${range[0]}-${range[1]} of ${total} bookings`
                }
              />
            </div>
          )}
        </Spin>

        {/* Booking Details Modal */}
        <Modal
          title={
            <div className="flex items-center space-x-3">
              {selectedBooking?.client?.profileImage ? (
                <Avatar size={40} src={selectedBooking.client.profileImage} />
              ) : (
                <Avatar size={40} style={{ backgroundColor: "#3B82F6" }}>
                  {selectedBooking ? getClientInitials(selectedBooking) : 'AC'}
                </Avatar>
              )}
              <div>
                <div className="text-lg font-semibold">
                  {selectedBooking ? getClientName(selectedBooking) : 'Booking Details'}
                </div>
                <div className="text-sm text-gray-500">
                  Booking ID: {selectedBooking?._id}
                </div>
              </div>
            </div>
          }
          visible={isModalVisible}
          onCancel={handleModalClose}
          footer={[
            <Button key="close" onClick={handleModalClose}>
              Close
            </Button>
          ]}
          width={800}
        >
          {selectedBooking && (
            <div className="space-y-4">
              {/* Status Tags */}
              <div className="flex space-x-2 mb-4">
                <Tag color={getStatusColor(selectedBooking.status)} className="text-sm">
                  Status: {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                </Tag>
                <Tag color={getPaymentStatusColor(selectedBooking.paymentStatus)} className="text-sm">
                  Payment: {selectedBooking.paymentStatus.charAt(0).toUpperCase() + selectedBooking.paymentStatus.slice(1)}
                </Tag>
              </div>

              <Row gutter={[24, 16]}>
                {/* Event Details */}
                <Col span={12}>
                  <Card size="small" title="Event Details" className="h-full">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2 text-blue-500" />
                        <Text><strong>Service:</strong> {selectedBooking.serviceCategory}</Text>
                      </div>
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-green-500" />
                        <Text><strong>Event Type:</strong> {selectedBooking.eventType}</Text>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2 text-purple-500" />
                        <Text><strong>Guests:</strong> {selectedBooking.guests}</Text>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-orange-500" />
                        <Text><strong>Duration:</strong> {selectedBooking.duration}</Text>
                      </div>
                    </div>
                  </Card>
                </Col>

                {/* Date & Time */}
                <Col span={12}>
                  <Card size="small" title="Schedule" className="h-full">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                        <Text><strong>Start:</strong> {formatDateTime(selectedBooking.dateStart)}</Text>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-red-500" />
                        <Text><strong>End:</strong> {formatDateTime(selectedBooking.dateEnd)}</Text>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-green-500" />
                        <Text><strong>Event Time:</strong> {selectedBooking.eventTime}</Text>
                      </div>
                    </div>
                  </Card>
                </Col>

                {/* Location */}
                <Col span={12}>
                  <Card size="small" title="Location" className="h-full">
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <MapPin className="w-4 h-4 mr-2 mt-1 text-red-500" />
                        <div>
                          <Text><strong>Address:</strong></Text>
                          <div className="text-sm text-gray-600">
                            {selectedBooking.location.address}<br />
                            {selectedBooking.location.city}, {selectedBooking.location.state} {selectedBooking.location.zipCode}<br />
                            {selectedBooking.location.country}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>

                {/* Contact Information */}
                <Col span={12}>
                  <Card size="small" title="Contact Information" className="h-full">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-blue-500" />
                        <Text><strong>Phone:</strong> {selectedBooking.contactInfo.phone}</Text>
                      </div>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-green-500" />
                        <Text><strong>Email:</strong> {selectedBooking.contactInfo.email}</Text>
                      </div>
                      {selectedBooking.client && (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-purple-500" />
                          <Text><strong>Client Phone:</strong> {selectedBooking.client.phone}</Text>
                        </div>
                      )}
                    </div>
                  </Card>
                </Col>

                {/* Pricing */}
                <Col span={24}>
                  <Card size="small" title="Pricing">
                    <Row gutter={16}>
                      <Col span={8}>
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-2 text-green-500" />
                          <Text><strong>Budget Range:</strong></Text>
                        </div>
                        <Text className="text-gray-600 ml-6">
                          {formatCurrency(selectedBooking.budgetMin)} - {formatCurrency(selectedBooking.budgetMax)}
                        </Text>
                      </Col>
                      {selectedBooking.amount && (
                        <Col span={8}>
                          <div className="flex items-center">
                            <CreditCard className="w-4 h-4 mr-2 text-blue-500" />
                            <Text><strong>Final Amount:</strong></Text>
                          </div>
                          <Text className="text-gray-600 ml-6 text-lg font-semibold">
                            {formatCurrency(selectedBooking.amount)}
                          </Text>
                        </Col>
                      )}
                      <Col span={8}>
                        <div className="flex items-center">
                          <CreditCard className="w-4 h-4 mr-2 text-orange-500" />
                          <Text><strong>Payment Status:</strong></Text>
                        </div>
                        <Tag color={getPaymentStatusColor(selectedBooking.paymentStatus)} className="ml-6">
                          {selectedBooking.paymentStatus.charAt(0).toUpperCase() + selectedBooking.paymentStatus.slice(1)}
                        </Tag>
                      </Col>
                    </Row>
                  </Card>
                </Col>

                {/* Description */}
                {selectedBooking.description && (
                  <Col span={24}>
                    <Card size="small" title="Description">
                      <Text>{selectedBooking.description}</Text>
                    </Card>
                  </Col>
                )}

                {/* Notes */}
                {selectedBooking.notes && (
                  <Col span={24}>
                    <Card size="small" title="Notes">
                      <Text>{selectedBooking.notes}</Text>
                    </Card>
                  </Col>
                )}

                {/* Timestamps */}
                <Col span={24}>
                  <Card size="small" title="Booking Information">
                    <Row gutter={16}>
                      <Col span={12}>
                        <Text><strong>Created:</strong> {formatDateTime(selectedBooking.createdAt)}</Text>
                      </Col>
                      <Col span={12}>
                        <Text><strong>Last Updated:</strong> {formatDateTime(selectedBooking.updatedAt)}</Text>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              </Row>
            </div>
          )}
        </Modal>
      </div>
    </ProviderLayout>
  );
};

export default ProviderBookings;