import React from "react";
import { Card, Typography, Form, Input, Button, Upload, Avatar } from "antd";
import { User, Mail, UploadCloud } from "lucide-react";
import ClientLayout from "../../components/ClientLayout";

const { Title, Paragraph } = Typography;

const ClientProfileSettings = () => {
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    console.log("Profile updated:", values);
  };

  return (
    <ClientLayout>
      <div className="p-6">
        <Title level={2} className="text-white flex items-center gap-2">
          <User size={20} /> Profile Settings
        </Title>
        <Paragraph className="text-gray-400 mb-4">
          Update your personal information and profile preferences.
        </Paragraph>

        <Card className="glow-border">
          <div className="flex items-center mb-6 gap-4">
            <Avatar size={80} style={{ backgroundColor: "#8B5CF6" }}>
              AD
            </Avatar>
            <Upload showUploadList={false}>
              <Button icon={<UploadCloud size={16} />}>Change Avatar</Button>
            </Upload>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              name: "client User",
              email: "client@example.com",
            }}
          >
            <Form.Item
              label="Full Name"
              name="name"
              rules={[{ required: true, message: "Please enter your name" }]}
            >
              <Input prefix={<User size={16} />} />
            </Form.Item>

            <Form.Item
              label="Email Address"
              name="email"
              rules={[{ required: true, message: "Please enter your email" }]}
            >
              <Input prefix={<Mail size={16} />} />
            </Form.Item>

            <div className="text-right">
              <Button type="primary" className="bg-green-500 hover:bg-green-600" htmlType="submit">
                Save Changes
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </ClientLayout>
  );
};

export default ClientProfileSettings;
