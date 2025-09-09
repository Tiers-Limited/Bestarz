import React from "react";
import { Card, List, Tag, Button, Avatar, Typography } from "antd";
import { Calendar, Users, MessageCircle } from "lucide-react";
import ProviderLayout from "../../components/ProviderLayout";

const { Title } = Typography;

const ProviderBookings = () => {
  const bookings = [
    { id: 1, client: "Sarah Johnson", service: "Wedding DJ", date: "2025-01-15", time: "6:00 PM", status: "Confirmed" },
    { id: 2, client: "Mike Chen", service: "Corporate Event", date: "2025-01-18", time: "2:00 PM", status: "Pending" },
    { id: 3, client: "Emily Davis", service: "Birthday Party", date: "2025-01-22", time: "4:00 PM", status: "Cancelled" },
  ];

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "confirmed": return "green";
      case "pending": return "orange";
      case "cancelled": return "red";
      default: return "blue";
    }
  };

  return (
    <ProviderLayout>
      <div className="p-6">
        <Title level={2} className="text-white mb-6">Bookings</Title>
        <Card className="glow-border">
          <List
            dataSource={bookings}
            renderItem={(booking) => (
              <List.Item
                actions={[
                  <Button key="message" icon={<MessageCircle size={14} />}>Message</Button>,
                  <Button key="details" type="primary">Details</Button>
                ]}
                className="hover:bg-gray-800/50 rounded-lg px-4 mb-2 glow-border"
              >
                <List.Item.Meta
                className="p-3"
                  avatar={<Avatar style={{ backgroundColor: "#3B82F6" }}>{booking.client[0]}</Avatar>}
                  title={
                    <div className="flex items-center justify-between">
                      <span className="text-white font-semibold">{booking.client}</span>
                      <Tag color={getStatusColor(booking.status)}>{booking.status}</Tag>
                    </div>
                  }
                  description={
                    <div className="text-gray-400">
                      <div><Calendar size={12} className="inline mr-1" /> {booking.date} at {booking.time}</div>
                      <div><Users size={12} className="inline mr-1" /> {booking.service}</div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      </div>
    </ProviderLayout>
  );
};

export default ProviderBookings;
