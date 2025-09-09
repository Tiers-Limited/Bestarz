import React, { useState } from "react";
import { Card, Typography, Tabs, List, Button, Tag } from "antd";
import { Bell } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";

const { Title } = Typography;

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New User Registered",
      description: "A new provider has signed up.",
      read: false,
    },
    {
      id: 2,
      title: "Payment Received",
      description: "You have received a new payment of $120.",
      read: false,
    },
    {
      id: 3,
      title: "System Update",
      description: "The system will undergo maintenance tonight.",
      read: true,
    },
  ]);

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const unreadNotifications = notifications.filter((n) => !n.read);

  const renderList = (data) => (
    <List
      itemLayout="horizontal"
      dataSource={data}
      renderItem={(item) => (
        <List.Item
          actions={
            !item.read
              ? [
                  <Button
                    size="small"
                    type="link"
                    onClick={() => markAsRead(item.id)}
                  >
                    Mark as Read
                  </Button>,
                ]
              : []
          }
        >
          <List.Item.Meta
            title={
              <span className="text-white flex items-center gap-2">
                {item.title}
                {!item.read && <Tag color="red">New</Tag>}
              </span>
            }
            description={
              <span className="text-gray-400">{item.description}</span>
            }
          />
        </List.Item>
      )}
    />
  );

  return (
    <AdminLayout>
      <div className="p-6">
        <Title level={2} className="text-white flex items-center gap-2">
          <Bell size={20} /> Notifications
        </Title>

        <Card className="glow-border">
          <Tabs
            defaultActiveKey="1"
            items={[
              {
                key: "1",
                label: `Unread (${unreadNotifications.length})`,
                children: renderList(unreadNotifications),
              },
              {
                key: "2",
                label: "All",
                children: renderList(notifications),
              },
            ]}
          />
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminNotifications;
