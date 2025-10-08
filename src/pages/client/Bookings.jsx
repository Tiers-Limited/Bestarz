import React, { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Button,
  Avatar,
  Typography,
  Select,
  DatePicker,
  Pagination,
  message,
  Spin,
  Modal,
  Row,
  Col,
  Card,
  Form,
} from "antd";
import {
  Calendar,
  Users,
  MessageCircle,
  MapPin,
  DollarSign,
  Clock,
  Phone,
  Mail,
  FileText,
  CreditCard,
  Star,
} from "lucide-react";
import ClientLayout from "../../components/ClientLayout";
import dayjs from "dayjs";
import { useProvider } from "../../context/provider/ProviderContext";
import BookingStatusModal from "../../components/BookingStatusModal";
import { useBooking } from "../../context/booking/BookingContext";
import ClientReviewModal from "../../components/ClientReviewModal";
import { useClient } from "../../context/client/ClientContext";
import { useCreateConversation } from "../../hooks/useCreateConversation";
import BookingDetailsModal from "../../components/BookingDetailsModal";
import PaymentButton from "../../components/PaymentButton";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const ClientBookings = () => {
  const { fetchBookings, bookingsData, loading } = useBooking();

  const { createReview } = useClient();

  const { createAndNavigateToConversation } = useCreateConversation();

  // Filter states
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState([]);

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);

  const { bookings, pagination } = bookingsData;

  const [statusModal, setStatusModal] = useState({
    visible: false,
    booking: null,
    currentStatus: "pending",
  });

  const handleStatusUpdate = (booking, newStatus) => {
    setStatusModal({
      visible: true,
      booking: booking,
      currentStatus: newStatus,
    });
  };

  const handleCompleteBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/complete`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        message.success('Booking marked as completed! Payment has been processed.');
        loadBookings(); // Refresh the bookings list
      } else {
        message.error(data.message || 'Failed to complete booking');
      }
    } catch (error) {
      console.error('Complete booking error:', error);
      message.error('Network error. Please try again.');
    }
  };

  const [reviewForm] = Form.useForm();

  // Handle review submission
  const handleReviewSubmit = async (values) => {
    if (!selectedBooking) return;

    const result = await createReview({
      bookingId: selectedBooking._id,
      rating: values.rating,
      comment: values.comment,
    });

    if (result.success) {
      message.success("Review submitted successfully!");
      setReviewModalVisible(false);
      setSelectedBooking(null);
      reviewForm.resetFields();
      fetchDashboard(); // Refresh data
    } else {
      message.error(result.error || "Failed to submit review");
    }
  };

  // Open review modal
  const openReviewModal = (booking) => {
    setSelectedBooking(booking);
    setReviewModalVisible(true);
    reviewForm.setFieldsValue({
      rating: 5,
      comment: "",
    });
  };

  const loadBookings = async (params = {}) => {
    console.log('Loading client bookings with params:', params);
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
    const startDate = dateRange[0] ? dateRange[0].format("YYYY-MM-DD") : null;
    const endDate = dateRange[1] ? dateRange[1].format("YYYY-MM-DD") : null;
    loadBookings({
      page: 1,
      status: value,
      startDate,
      endDate,
    });
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates || []);
    const startDate = dates && dates[0] ? dates[0].format("YYYY-MM-DD") : null;
    const endDate = dates && dates[1] ? dates[1].format("YYYY-MM-DD") : null;
    loadBookings({
      page: 1,
      status: statusFilter,
      startDate,
      endDate,
    });
  };

  const handlePageChange = (page) => {
    const startDate = dateRange[0] ? dateRange[0].format("YYYY-MM-DD") : null;
    const endDate = dateRange[1] ? dateRange[1].format("YYYY-MM-DD") : null;
    loadBookings({
      page,
      status: statusFilter,
      startDate,
      endDate,
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

  // Handle marking booking as done
  const handleMarkAsDone = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/done`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        message.success('Event marked as done! Please proceed with final payment.');
        loadBookings(); // Refresh the bookings list
      } else {
        message.error(data.message || 'Failed to mark event as done');
      }
    } catch (error) {
      console.error('Mark as done error:', error);
      message.error('Network error. Please try again.');
    }
  };

  // Manual payment completion for testing (bypasses webhook)
  const handleManualCompletePayment = async (booking) => {
    try {
      const token = localStorage.getItem('token');
      const paymentId = booking.paymentStatus === 'advance_pending' 
        ? booking.advancePaymentId 
        : booking.finalPaymentId;
      
      if (!paymentId) {
        message.error('Payment ID not found');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/payments/${paymentId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        message.success('Payment completed successfully! (Test Mode)');
        loadBookings(); // Refresh the bookings list
      } else {
        message.error(data.message || 'Failed to complete payment');
      }
    } catch (error) {
      console.error('Manual complete payment error:', error);
      message.error('Network error. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "orange";
      case "ACCEPTED":
        return "blue";
      case "REJECTED":
        return "red";
      case "IN_PROGRESS":
        return "purple";
      case "COMPLETED":
        return "green";
      case "CANCELLED":
        return "red";
      case "completed":
        return "blue";
      default:
        return "gray";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "green";
      case "pending":
        return "orange";
      case "failed":
        return "red";
      case "refunded":
        return "purple";
      default:
        return "gray";
    }
  };

  const formatDate = (dateString) => {
    return dayjs(dateString).format("MMM DD, YYYY");
  };

  const formatDateTime = (dateString) => {
    return dayjs(dateString).format("MMM DD, YYYY [at] h:mm A");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getClientName = (booking) => {
    if (booking.provider?.user?.firstName) {
      return `${booking.provider.user.firstName} ${booking.provider.user.lastName || ''}`.trim();
    }
    return "Anonymous Provider";
  };

  const getClientInitials = (booking) => {
    if (booking.provider?.user?.firstName) {
      return `${booking.provider.user.firstName[0]}${booking.provider.user.lastName ? booking.provider.user.lastName[0] : ''}`;
    }
    return "AP";
  };

  // Table columns configuration
  const columns = [
    {
      title: "Provider",
      dataIndex: "provider",
      key: "provider",
      className: "whitespace-nowrap",

      render: (_, booking) => (
        <div className="flex items-center">
          {booking.provider?.user?.profileImage ? (
            <Avatar
              src={booking.provider.user.profileImage}
              size={32}
              className="mr-2"
            />
          ) : (
            <Avatar
              style={{ backgroundColor: "#3B82F6" }}
              size={32}
              className="mr-2"
            >
              {getClientInitials(booking)}
            </Avatar>
          )}
          <span>{getClientName(booking)}</span>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      className: "whitespace-nowrap",
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
    {
      title: "Date",
      dataIndex: "dateStart",
      key: "dateStart",
      className: "whitespace-nowrap",
      render: (dateStart, booking) => (
        <div className="flex items-center">
          <Calendar size={12} className="mr-2" />
          {formatDate(dateStart)} at {booking.eventTime}
        </div>
      ),
    },
    {
      title: "Service",
      key: "service",
      className: "whitespace-nowrap",
      render: (_, booking) => (
        <div className="flex items-center">
          <Users size={12} className="mr-2" />
          {booking.serviceCategory} - {booking.eventType} ({booking.guests}{" "}
          guests)
        </div>
      ),
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      className: "whitespace-nowrap",
      render: (location) => (
        <div className="flex items-center">
          <MapPin size={12} className="mr-2" />
          {location}
        </div>
      ),
    },
    {
      title: "Amount",
      key: "amount",
      className: "whitespace-nowrap",
      render: (_, booking) => (
        <div className="flex items-center">
          {booking.amount
            ? formatCurrency(booking.amount)
            : `${formatCurrency(booking.budgetMin)} - ${formatCurrency(
                booking.budgetMax
              )}`}
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      className: "whitespace-nowrap",
      render: (_, booking) => {
        return (
          <div className="flex gap-2 flex-wrap">
            <Button
              size="small"
              icon={<MessageCircle size={14} />}
              onClick={() =>
                createAndNavigateToConversation(booking?.provider?.user?._id)
              }
            >
              Message
            </Button>
            
            <Button 
              size="small" 
              type="primary" 
              onClick={() => showBookingDetails(booking)}
            >
              Details
            </Button>

            {/* Show Make Advance Payment button when advance payment is pending */}
            {booking.paymentStatus === "advance_pending" && (
              <PaymentButton 
                booking={booking} 
                paymentType="advance"
                size="small"
              />
            )}

            {/* Show Mark as Done button when advance payment is completed */}
            {((booking.status === "IN_PROGRESS" || booking.status === "ACCEPTED") && 
              (booking.advancePaid || booking.paymentStatus === "advance_paid")) && (
              <Button
                size="small"
                type="default"
                onClick={() => handleMarkAsDone(booking._id)}
              >
                Mark as Done
              </Button>
            )}

            {/* Show Make Final Payment button after marking as done */}
            {booking.paymentStatus === "final_pending" && (
              <PaymentButton 
                booking={booking} 
                paymentType="final"
                size="small"
              />
            )}

            {/* Show Leave Review button after final payment is completed */}
            {booking.status === "COMPLETED" && booking.finalPaid && !booking.hasReview && (
              <Button
                size="small"
                type="primary"
                icon={<Star size={14} />}
                onClick={() => openReviewModal(booking)}
              >
                Review
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <ClientLayout>
      <div className="p-6">
        <Title level={2} className="text-white mb-6">
          Bookings
        </Title>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <Select
            defaultValue="all"
            style={{ width: 150 }}
            onChange={handleStatusFilterChange}
            className="bg-gray-800 text-white rounded-md"
          >
            <Option value="all">All Statuses</Option>
            <Option value="PENDING">Pending</Option>
            <Option value="ACCEPTED">Accepted</Option>
            <Option value="REJECTED">Rejected</Option>
            <Option value="IN_PROGRESS">In Progress</Option>
            <Option value="COMPLETED">Completed</Option>
            <Option value="CANCELLED">Cancelled</Option>
          </Select>

          <RangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            className="w-64"
            placeholder={["Start Date", "End Date"]}
          />

          <Button
            onClick={() => {
              setStatusFilter("all");
              setDateRange([]);
              loadBookings({ page: 1 });
            }}
          >
            Clear Filters
          </Button>
        </div>

        {/* Table */}
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={bookings}
            rowKey="_id"
            locale={{ emptyText: "No bookings found" }}
            pagination={false}
            className="glow-border"
            rowClassName="hover:bg-gray-800/50"
            scroll={{ x: "max-content" }}
          />

          {/* Pagination */}
          {pagination?.total > 0 && (
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
        <BookingDetailsModal
          visible={isModalVisible}
          onClose={handleModalClose}
          booking={selectedBooking}
          getStatusColor={getStatusColor}
          getPaymentStatusColor={getPaymentStatusColor}
          getClientInitials={getClientInitials}
          getClientName={getClientName}
        />

        <BookingStatusModal
          visible={statusModal.visible}
          onClose={() =>
            setStatusModal({
              visible: false,
              booking: null,
              currentStatus: "pending",
            })
          }
          booking={statusModal.booking}
          currentStatus={statusModal.currentStatus}
          onSuccess={() =>
            loadBookings({ page: pagination.page, status: statusFilter })
          }
        />

        <ClientReviewModal
          visible={reviewModalVisible}
          onClose={() => {
            setReviewModalVisible(false);
            setSelectedBooking(null);
          }}
          booking={selectedBooking}
          loading={loading}
          onSubmit={handleReviewSubmit}
        />
      </div>
    </ClientLayout>
  );
};

export default ClientBookings;
