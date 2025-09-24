import React, { useEffect } from "react";
import { Card, Typography, Form, Input, Button, Divider } from "antd";
import { Settings } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import { usePlatform } from "../../context/admin/PlatformContext";

const { Title, Paragraph } = Typography;

const AdminPlatformSettings = () => {
  const [form] = Form.useForm();
  const { platformSettings, updatePlatformSettings } = usePlatform();

  useEffect(() => {
    if (platformSettings) {
      form.setFieldsValue({
        name: platformSettings?.settings?.platformName,
        email: platformSettings?.settings?.supportEmail,
      });
    }
  }, [platformSettings]);

  const handleSave = (values) => {
    const payload = {
      platformName: values.name,
      supportEmail: values.email,
    };
    updatePlatformSettings(payload);
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
              <Input placeholder="My Event Platform" />
            </Form.Item>

            <Form.Item label="Support Email" name="email">
              <Input placeholder="support@myplatform.com" />
            </Form.Item>

            <Divider />

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
