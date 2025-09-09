import React from "react";
import { Card, Form, Input, Button, Switch, Typography } from "antd";
import ProviderLayout from "../../components/ProviderLayout";

const { Title } = Typography;

const ProviderSettings = () => {
  return (
    <ProviderLayout>
      <div className="p-6">
        <Title level={2} className="text-white mb-6">Provider Settings</Title>
        <Card className="glow-border">
          <Form layout="vertical">
            <Form.Item label="Business Name">
              <Input placeholder="Enter your business name" />
            </Form.Item>
            <Form.Item label="Contact Email">
              <Input type="email" placeholder="Enter your email" />
            </Form.Item>
            <Form.Item label="Phone Number">
              <Input placeholder="Enter your phone number" />
            </Form.Item>
            <Form.Item  label="Notifications">
              <Switch defaultChecked /> 
              <span className="ms-2">Enable Booking Alerts</span>
            </Form.Item>
            <Form.Item>
              <Button type="primary" className="glow-button">Save Settings</Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </ProviderLayout>
  );
};

export default ProviderSettings;
