import React from "react";
import { Modal, Avatar, Tag, Row, Col, Card, Typography } from "antd";
import {
  Calendar,
  Users,
  FileText,
  Clock,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  CreditCard,
} from "lucide-react";
import dayjs from "dayjs";

const { Text } = Typography;

const BookingDetailsModal = ({
  visible,
  onClose,
  booking,
  getStatusColor,
  getPaymentStatusColor,
  getClientInitials,
  getClientName,
  actionButtons = null, // Optional action buttons for providers
}) => {
  if (!booking) return null;

  const formatDateTime = (dateString) =>
    dayjs(dateString).format("MMM DD, YYYY [at] h:mm A");

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

  return (
    <Modal
      title={
        <div className="flex items-center space-x-3">
          {booking?.client?.profileImage ? (
            <Avatar size={48} src={booking.client.profileImage} />
          ) : (
            <Avatar size={48} style={{ backgroundColor: "#3B82F6" }}>
              {getClientInitials(booking)}
            </Avatar>
          )}
          <div>
            <div className="text-xl font-bold text-white">
              {getClientName(booking)}
            </div>
            <div className="text-sm text-gray-400">Booking #{booking._id.slice(-8)}</div>
          </div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <div key="footer" className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Tag color={getStatusColor(booking.status)} className="text-sm font-medium">
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Tag>
            <Tag color={getPaymentStatusColor(booking.paymentStatus)} className="text-sm font-medium">
              {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
            </Tag>
          </div>
          <div className="flex items-center space-x-3">
            {actionButtons}
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>,
      ]}
      width={900}
      className="booking-details-modal"
      styles={{
        body: {
          padding: '24px',
          backgroundColor: '#1a1a1a'
        }
      }}
    >
      <div className="space-y-6">
        {/* Key Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Event Overview */}
          <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-400" />
              Event Details
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Service:</span>
                <span className="text-white font-medium">{booking.serviceCategory}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Event Type:</span>
                <span className="text-white">{booking.eventType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Guests:</span>
                <span className="text-white">{booking.guests}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Duration:</span>
                <span className="text-white">{booking.duration}</span>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-green-400" />
              Schedule
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Start:</span>
                <span className="text-white font-medium">{formatDateTime(booking.dateStart)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">End:</span>
                <span className="text-white">{formatDateTime(booking.dateEnd)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Event Time:</span>
                <span className="text-white">{booking.eventTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Location & Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-red-400" />
              Location
            </h3>
            <p className="text-white">{booking.location}</p>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Phone className="w-5 h-5 mr-2 text-purple-400" />
              Contact Information
            </h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-white">{booking.contactInfo.phone}</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-white">{booking.contactInfo.email}</span>
              </div>
              {booking.client && (
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-white">Client: {booking.client.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl p-6 border border-blue-500/30">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <DollarSign className="w-6 h-6 mr-2 text-yellow-400" />
            Pricing Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-gray-400 text-sm">Budget Range</div>
              <div className="text-white font-bold text-lg">
                {formatCurrency(booking.budgetMin)} - {formatCurrency(booking.budgetMax)}
              </div>
            </div>
            {booking.amount && (
              <div className="text-center">
                <div className="text-gray-400 text-sm">Final Amount</div>
                <div className="text-green-400 font-bold text-xl">
                  {formatCurrency(booking.amount)}
                </div>
              </div>
            )}
            <div className="text-center">
              <div className="text-gray-400 text-sm">Payment Status</div>
              <Tag
                color={getPaymentStatusColor(booking.paymentStatus)}
                className="mt-1 text-sm font-medium"
              >
                {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
              </Tag>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        {(booking.description || booking.notes) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {booking.description && (
              <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-orange-400" />
                  Description
                </h3>
                <p className="text-gray-300 leading-relaxed">{booking.description}</p>
              </div>
            )}
            {booking.notes && (
              <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-orange-400" />
                  Notes
                </h3>
                <p className="text-gray-300 leading-relaxed">{booking.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Booking Metadata */}
        <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-600">
          <div className="flex flex-col sm:flex-row justify-between text-sm">
            <div>
              <span className="text-gray-400">Created:</span>
              <span className="text-white ml-2">{formatDateTime(booking.createdAt)}</span>
            </div>
            <div>
              <span className="text-gray-400">Last Updated:</span>
              <span className="text-white ml-2">{formatDateTime(booking.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default BookingDetailsModal;
