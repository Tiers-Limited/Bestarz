import React, { useState } from "react";
import { Card, Typography, Table, Tag, Space, Button, Drawer, Timeline } from "antd";
import { Shield, Ban, Eye, CheckCircle } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";

const { Title, Paragraph } = Typography;

const AdminSecurity = () => {
  const [auditLogVisible, setAuditLogVisible] = useState(false);

  // Security event logs (main table)
  const [logs] = useState([
    {
      key: "1",
      id: "LOG001",
      action: "Failed Login Attempt",
      user: "john@example.com",
      status: "warning",
      timestamp: "2025-09-05 10:32",
    },
    {
      key: "2",
      id: "LOG002",
      action: "Account Blocked",
      user: "fakevendor@spam.com",
      status: "critical",
      timestamp: "2025-09-07 15:12",
    },
    {
      key: "3",
      id: "LOG003",
      action: "Password Changed",
      user: "sarah@example.com",
      status: "normal",
      timestamp: "2025-09-08 18:45",
    },
  ]);

  // Audit logs (drawer timeline)
  const [auditLogs] = useState([
    {
      type: "block",
      action: "Account Blocked",
      target: "fakevendor@spam.com",
      reason: "Suspicious activity",
      admin: "admin1@example.com",
      timestamp: "2025-09-07 15:12",
    },
    {
      type: "disable",
      action: "2FA Disabled",
      target: "mark@example.com",
      reason: "User requested temporary disable",
      admin: "admin2@example.com",
      timestamp: "2025-09-06 09:30",
    },
    {
      type: "success",
      action: "Password Changed",
      target: "sarah@example.com",
      reason: "Routine update",
      admin: "admin3@example.com",
      timestamp: "2025-09-08 18:45",
    },
  ]);

  const columns = [
    { title: "Log ID", dataIndex: "id", key: "id" },
    { title: "Action", dataIndex: "action", key: "action" },
    { title: "User", dataIndex: "user", key: "user" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const config = {
          normal: { color: "blue", label: "Normal" },
          warning: { color: "orange", label: "Warning" },
          critical: { color: "red", label: "Critical" },
        };
        const { color, label } = config[status] || config.normal;
        return <Tag color={color}>{label}</Tag>;
      },
    },
    { title: "Timestamp", dataIndex: "timestamp", key: "timestamp" },
    {
      title: "Action",
      key: "action",
      render: () => (
        <Space>
          <Button
            size="small"
            icon={<Eye size={14} />}
            onClick={() => setAuditLogVisible(true)}
          >
            View
          </Button>
          <Button size="small" danger icon={<Ban size={14} />}>
            Block
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="p-6">
        <Title level={2} className="text-white flex items-center gap-2">
          <Shield size={20} /> Security Center
        </Title>
        <Paragraph className="text-gray-400 mb-4">
          Monitor suspicious activity, review audit logs, and manage account security.
        </Paragraph>

        {/* Security Logs Table */}
        <Card className="glow-border">
          <Table
            dataSource={logs}
            columns={columns}
            pagination={false}
            rowClassName="hover:bg-gray-800"
          />
        </Card>

        {/* Audit Log Drawer */}
        <Drawer
          title="Audit Log - Account Actions"
          placement="right"
          size="large"
          onClose={() => setAuditLogVisible(false)}
          open={auditLogVisible}
          className="bg-black"
        >
          <Paragraph className="text-gray-400 mb-6">
            Track all account management actions for transparency and compliance.
          </Paragraph>

          <Timeline
            items={auditLogs.map((log) => ({
              dot:
                log.type === "block" ? (
                  <Shield size={16} className="text-red-500" />
                ) : log.type === "disable" ? (
                  <Ban size={16} className="text-orange-500" />
                ) : (
                  <CheckCircle size={16} className="text-green-500" />
                ),
              children: (
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <Title level={5} className="text-white mb-1">
                      {log.action}
                    </Title>
                    <span className="text-gray-500 text-sm">
                      {log.timestamp}
                    </span>
                  </div>
                  <Paragraph className="text-gray-300 mb-1">
                    <strong>Target:</strong> {log.target}
                  </Paragraph>
                  <Paragraph className="text-gray-300 mb-1">
                    <strong>Reason:</strong> {log.reason}
                  </Paragraph>
                  <Paragraph className="text-gray-400 text-sm">
                    Action by: {log.admin}
                  </Paragraph>
                </div>
              ),
            }))}
          />
        </Drawer>
      </div>
    </AdminLayout>
  );
};

export default AdminSecurity;
