import React, { useState } from "react";
import { Card, Typography, Form, Input, Switch, Button, Divider } from "antd";
import { Settings } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";

const { Title, Paragraph } = Typography;

const AdminPlatformSettings = () => {
  const [form] = Form.useForm();
  const [emailNotifications, setEmailNotifications] = useState(true);

  const handleSave = (values) => {
    console.log("Saved settings:", values);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <Title level={2} className="text-white flex items-center gap-2">
          <Settings size={20} /> Platform Settings
        </Title>
        <Paragraph className="text-gray-400 mb-4">
          Configure global platform settings here.
        </Paragraph>

        <Card className="glow-border">
          <Form form={form} layout="vertical" onFinish={handleSave}>
            <Form.Item label="Platform Name" name="name">
              <Input placeholder="Bestarz Platform" />
            </Form.Item>

            <Form.Item label="Support Email" name="email">
              <Input placeholder="support@bestarz.com" />
            </Form.Item>

            <Divider />

            <Form.Item label="Email Notifications">
              <Switch
                checked={emailNotifications}
                onChange={setEmailNotifications}
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Save Settings
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminPlatformSettings;
