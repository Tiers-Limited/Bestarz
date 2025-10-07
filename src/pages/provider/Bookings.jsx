import React, { useState, useEffect } from "react";
import {
  Tag,
  Button,
  Avatar,
  Typography,
  message,
  Spin,
  Modal,
  Row,
  Col,
  Card,
  Calendar,
  Badge,
  Tooltip,
  Popover
} from "antd";
import {
  Users,
  MessageCircle,
  MapPin,
  DollarSign,
  Clock,
  Phone,
  Mail,
  FileText,
  CreditCard,
  Eye,
  ChevronLeft,
  ChevronRight,
  Info
} from "lucide-react";
import ProviderLayout from "../../components/ProviderLayout";
import dayjs from "dayjs";
import { useProvider } from "../../context/provider/ProviderContext";
import BookingDetailsModal from "../../components/BookingDetailsModal";
import BookingStatusModal from "../../components/BookingStatusModal";
import { useCreateConversation } from "../../hooks/useCreateConversation";

const { Title, Text } = Typography;

const ProviderBookings = () => {
  const { fetchBookings, bookingsData, loading } = useProvider();

  const { createAndNavigateToConversation } = useCreateConversation();

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const { bookings, pagination } = bookingsData;

  const [statusModal, setStatusModal] = useState({
    visible: false,
    booking: null,
    currentStatus: "pending",
  });



  const loadBookings = async (params = {}) => {
    const result = await fetchBookings(params);
    if (!result.success) {
      message.error(result.error);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handlePageChange = (page) => {
    loadBookings({
      page,
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

  // Handle accept/reject booking
  const handleBookingAction = async (bookingId, action, totalAmount = null) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: action,
          totalAmount: action === 'ACCEPTED' ? totalAmount : undefined
        })
      });

      const data = await response.json();

      if (response.ok) {
        message.success(`Booking ${action.toLowerCase()} successfully!`);
        loadBookings(); // Refresh the bookings list
      } else {
        message.error(data.message || `Failed to ${action.toLowerCase()} booking`);
      }
    } catch (error) {
      console.error('Booking action error:', error);
      message.error('Network error. Please try again.');
    }
  };

  // Show accept booking modal with amount input
  const showAcceptModal = (booking) => {
    Modal.confirm({
      title: 'Accept Booking Request',
      content: (
        <div>
          <p>Do you want to accept this booking request?</p>
          <p><strong>Budget Range:</strong> ${booking.budgetMin} - ${booking.budgetMax}</p>
          <div style={{ marginTop: 16 }}>
            <label>Set Total Amount: $</label>
            <input 
              id="totalAmount"
              type="number" 
              min={booking.budgetMin} 
              max={booking.budgetMax}
              defaultValue={booking.budgetMin}
              style={{ 
                marginLeft: 8, 
                padding: '4px 8px', 
                border: '1px solid #d9d9d9', 
                borderRadius: '4px',
                width: '120px'
              }}
            />
          </div>
        </div>
      ),
      onOk() {
        const totalAmount = document.getElementById('totalAmount')?.value;
        if (!totalAmount || totalAmount < booking.budgetMin || totalAmount > booking.budgetMax) {
          message.error('Please enter a valid amount within the budget range');
          return false;
        }
        handleBookingAction(booking._id, 'ACCEPTED', parseFloat(totalAmount));
      },
      onCancel() {},
    });
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
    if (booking.client) {
      return `${booking.client.firstName} ${booking.client.lastName}`;
    }
    return "Anonymous Client";
  };

  const getClientInitials = (booking) => {
    if (booking.client) {
      return `${booking.client.firstName[0]}${booking.client.lastName[0]}`;
    }
    return "AC";
  };

  // Calendar helper functions
  const getBookingsForDate = (date) => {
    const dateString = dayjs(date).format("YYYY-MM-DD");
    return bookings.filter(booking => 
      dayjs(booking.dateStart).format("YYYY-MM-DD") === dateString
    );
  };

  const handleCalendarSelect = (date) => {
    const bookingsForDate = getBookingsForDate(date);
    if (bookingsForDate.length > 0) {
      // Show the first booking details for that date
      showBookingDetails(bookingsForDate[0]);
    }
  };

  return (
    <ProviderLayout>
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <Title level={2} className="text-white mb-0 text-xl sm:text-2xl">
            Bookings
          </Title>
        </div>

        <>
          /* Calendar View */
          <Card className="glow-border mb-6 overflow-hidden">
            <div className="w-full overflow-x-auto">
              <Calendar
                onSelect={handleCalendarSelect}
                className="custom-calendar min-w-full"
                fullscreen={false}
                dateFullCellRender={(date) => {
                  const isToday = dayjs(date).isSame(dayjs(), 'day');
                  const bookingsForDate = getBookingsForDate(date);
                  const hasBookings = bookingsForDate.length > 0;

                  const confirmedBookings = bookingsForDate.filter(b => b.status === 'confirmed');
                  const pendingBookings = bookingsForDate.filter(b => b.status === 'pending');
                  const cancelledBookings = bookingsForDate.filter(b => b.status === 'cancelled');

                  // Create tooltip content with booking details
                  const tooltipContent = hasBookings ? (
                    <div className="max-w-xs sm:max-w-sm">
                      <div className="text-white font-semibold mb-3 text-center">
                        {dayjs(date).format('MMM DD, YYYY')}
                      </div>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {bookingsForDate.slice(0, 3).map((booking, index) => (
                          <div key={index} className="bg-gray-700 p-2 sm:p-3 rounded-lg">
                            <div className="flex justify-between items-start mb-2 gap-2">
                              <div className="text-white font-medium text-xs sm:text-sm flex-1 min-w-0">
                                <div className="truncate">{getClientName(booking)}</div>
                              </div>
                              <Tag
                                color={
                                  booking.status === 'confirmed' ? 'green' :
                                  booking.status === 'pending' ? 'orange' :
                                  booking.status === 'cancelled' ? 'red' : 'blue'
                                }
                                size="small"
                                className="text-xs"
                              >
                                {booking.status}
                              </Tag>
                            </div>
                            <div className="text-gray-300 text-xs space-y-1">
                              <div className="truncate">{booking.eventType} • {booking.serviceCategory}</div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="truncate">{booking.eventTime}</span>
                                <span className="whitespace-nowrap">{booking.guests} guests</span>
                              </div>
                            </div>
                          </div>
                        ))}
                        {bookingsForDate.length > 3 && (
                          <div className="text-gray-400 text-xs text-center py-2">
                            +{bookingsForDate.length - 3} more bookings
                          </div>
                        )}
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-600">
                        <Button
                          size="small"
                          type="primary"
                          icon={<Eye size={12} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCalendarSelect(date);
                          }}
                          className="w-full"
                          block
                        >
                          View All Details
                        </Button>
                      </div>
                    </div>
                  ) : null;

                  return (
                    <Tooltip
                      title={tooltipContent}
                      placement="right"
                      overlayStyle={{ maxWidth: '320px' }}
                      trigger={hasBookings ? ['hover'] : []}
                      overlayClassName="calendar-tooltip"
                    >
                      <div className={`
                        relative h-12 w-full flex flex-col items-center justify-center p-1 min-w-0
                        ${isToday ? 'bg-blue-600/20 border border-blue-500 rounded-md' : ''}
                        ${hasBookings ? 'hover:bg-gray-700/30 cursor-pointer' : ''}
                        transition-colors
                      `}>
                        <span className={`
                          text-sm font-medium leading-none mb-1
                          ${isToday ? 'text-blue-300 font-bold' : 'text-gray-300'}
                        `}>
                          {date.date()}
                        </span>
                        {hasBookings && (
                          <div className="flex space-x-1">
                            {confirmedBookings.length > 0 && (
                              <div className="w-2 h-2 bg-green-500 rounded-full shadow-sm"></div>
                            )}
                            {pendingBookings.length > 0 && (
                              <div className="w-2 h-2 bg-yellow-500 rounded-full shadow-sm"></div>
                            )}
                            {cancelledBookings.length > 0 && (
                              <div className="w-2 h-2 bg-red-500 rounded-full shadow-sm"></div>
                            )}
                          </div>
                        )}
                      </div>
                    </Tooltip>
                  );
                }}
                headerRender={({ value, onChange }) => {
                  const year = value.year();
                  const month = value.month();
                  const today = dayjs();
                  const isCurrentMonth = today.year() === year && today.month() === month;

                  return (
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <Button
                          onClick={() => onChange(value.clone().month(month - 1))}
                          icon={<ChevronLeft size={16} />}
                          className="text-white border-gray-600 hover:border-blue-500"
                          size="small"
                        />
                        <div className="text-center min-w-0">
                          <div className="text-white text-lg font-semibold truncate">
                            {dayjs(value).format('MMMM YYYY')}
                          </div>
                          {isCurrentMonth && (
                            <div className="text-blue-400 text-xs">
                              Today: {today.format('MMM DD')}
                            </div>
                          )}
                        </div>
                        <Button
                          onClick={() => onChange(value.clone().month(month + 1))}
                          icon={<ChevronRight size={16} />}
                          className="text-white border-gray-600 hover:border-blue-500"
                          size="small"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-gray-300">Confirmed</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-gray-300">Pending</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-gray-300">Cancelled</span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
            </div>
            
            {/* Calendar Info */}
            <div className="mt-4 bg-gray-800/50 rounded-lg p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2 text-gray-300">
                  <Info size={16} />
                  <span className="font-medium text-sm sm:text-base">Calendar Guide</span>
                </div>
                <div className="text-sm text-gray-400">
                  Total Bookings: <span className="text-white font-semibold">{bookings.length}</span>
                </div>
              </div>
              <div className="mt-2 text-xs sm:text-sm text-gray-400">
                Hover over dates with colored dots to see booking details. Click any date to view all bookings for that day.
              </div>
            </div>
          </Card>

        {/* Booking Details Modal */}
        <BookingDetailsModal
          visible={isModalVisible}
          onClose={handleModalClose}
          booking={selectedBooking}
          getStatusColor={getStatusColor}
          getPaymentStatusColor={getPaymentStatusColor}
          getClientInitials={getClientInitials}
          getClientName={getClientName}
          actionButtons={
            selectedBooking?.status === "PENDING" ? (
              <>
                <button
                  onClick={() => {
                    handleModalClose();
                    showAcceptModal(selectedBooking);
                  }}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  Accept
                </button>
                <button
                  onClick={() => {
                    handleModalClose();
                    handleBookingAction(selectedBooking._id, "REJECTED");
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  Reject
                </button>
              </>
            ) : null
          }
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
          onSuccess={() => loadBookings()}
        />
        </>
      </div>
    </ProviderLayout>
  );
};

export default ProviderBookings;
