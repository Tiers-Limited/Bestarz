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
            <Avatar size={40} src={booking.client.profileImage} />
          ) : (
            <Avatar size={40} style={{ backgroundColor: "#3B82F6" }}>
              {getClientInitials(booking)}
            </Avatar>
          )}
          <div>
            <div className="text-lg font-semibold">
              {getClientName(booking)}
            </div>
            <div className="text-sm text-gray-500">Booking ID: {booking._id}</div>
          </div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <button
          key="close"
          onClick={onClose}
          className="px-4 py-1 bg-gray-700 text-white rounded-md"
        >
          Close
        </button>,
      ]}
      width={800}
    >
      <div className="space-y-4">
        {/* Status Tags */}
        <div className="flex space-x-2 mb-4">
          <Tag color={getStatusColor(booking.status)} className="text-sm">
            Status: {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </Tag>
          <Tag
            color={getPaymentStatusColor(booking.paymentStatus)}
            className="text-sm"
          >
            Payment:{" "}
            {booking.paymentStatus.charAt(0).toUpperCase() +
              booking.paymentStatus.slice(1)}
          </Tag>
        </div>

        <Row gutter={[24, 16]}>
          {/* Event Details */}
          <Col span={12}>
            <Card size="small" title="Event Details" className="h-full">
              <div className="space-y-3">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-blue-500" />
                  <Text>
                    <strong>Service:</strong> {booking.serviceCategory}
                  </Text>
                </div>
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-green-500" />
                  <Text>
                    <strong>Event Type:</strong> {booking.eventType}
                  </Text>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-purple-500" />
                  <Text>
                    <strong>Guests:</strong> {booking.guests}
                  </Text>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-orange-500" />
                  <Text>
                    <strong>Duration:</strong> {booking.duration}
                  </Text>
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
                  <Text>
                    <strong>Start:</strong> {formatDateTime(booking.dateStart)}
                  </Text>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-red-500" />
                  <Text>
                    <strong>End:</strong> {formatDateTime(booking.dateEnd)}
                  </Text>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-green-500" />
                  <Text>
                    <strong>Event Time:</strong> {booking.eventTime}
                  </Text>
                </div>
              </div>
            </Card>
          </Col>

          {/* Location */}
          <Col span={12}>
            <Card size="small" title="Location" className="h-full">
              <div className="flex items-start">
                <MapPin className="w-4 h-4 mr-2 mt-1 text-red-500" />
                <Text>
                  <strong>Address:</strong> {booking.location}
                </Text>
              </div>
            </Card>
          </Col>

          {/* Contact Info */}
          <Col span={12}>
            <Card size="small" title="Contact Information" className="h-full">
              <div className="space-y-3">
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-blue-500" />
                  <Text>
                    <strong>Phone:</strong> {booking.contactInfo.phone}
                  </Text>
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-green-500" />
                  <Text>
                    <strong>Email:</strong> {booking.contactInfo.email}
                  </Text>
                </div>
                {booking.client && (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-purple-500" />
                    <Text>
                      <strong>Client Phone:</strong> {booking.client.phone}
                    </Text>
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
                    <Text>
                      <strong>Budget Range:</strong>
                    </Text>
                  </div>
                  <Text className="text-gray-600 ml-6">
                    {formatCurrency(booking.budgetMin)} -{" "}
                    {formatCurrency(booking.budgetMax)}
                  </Text>
                </Col>
                {booking.amount && (
                  <Col span={8}>
                    <div className="flex items-center">
                      <CreditCard className="w-4 h-4 mr-2 text-blue-500" />
                      <Text>
                        <strong>Final Amount:</strong>
                      </Text>
                    </div>
                    <Text className="text-gray-600 ml-6 text-lg font-semibold">
                      {formatCurrency(booking.amount)}
                    </Text>
                  </Col>
                )}
                <Col span={8}>
                  <div className="flex items-center">
                    <CreditCard className="w-4 h-4 mr-2 text-orange-500" />
                    <Text>
                      <strong>Payment Status:</strong>
                    </Text>
                  </div>
                  <Tag
                    color={getPaymentStatusColor(booking.paymentStatus)}
                    className="ml-6"
                  >
                    {booking.paymentStatus.charAt(0).toUpperCase() +
                      booking.paymentStatus.slice(1)}
                  </Tag>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Description */}
          {booking.description && (
            <Col span={24}>
              <Card size="small" title="Description">
                <Text>{booking.description}</Text>
              </Card>
            </Col>
          )}

          {/* Notes */}
          {booking.notes && (
            <Col span={24}>
              <Card size="small" title="Notes">
                <Text>{booking.notes}</Text>
              </Card>
            </Col>
          )}

          {/* Timestamps */}
          <Col span={24}>
            <Card size="small" title="Booking Information">
              <Row gutter={16}>
                <Col span={12}>
                  <Text>
                    <strong>Created:</strong> {formatDateTime(booking.createdAt)}
                  </Text>
                </Col>
                <Col span={12}>
                  <Text>
                    <strong>Last Updated:</strong>{" "}
                    {formatDateTime(booking.updatedAt)}
                  </Text>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </div>
    </Modal>
  );
};

export default BookingDetailsModal;
