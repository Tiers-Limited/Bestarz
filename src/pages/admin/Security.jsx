import React, { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Table,
  Tag,
  Space,
  Button,
  Drawer,
  Timeline,
  Row,
  Col,
  Statistic,
  message,
  Modal,
} from "antd";
import { Shield, Ban, Eye, CheckCircle } from "lucide-react";
import dayjs from "dayjs";
import AdminLayout from "../../components/AdminLayout";
import { useAdmin } from "../../context/admin/AdminContext";

const { Title, Paragraph } = Typography;

const AdminSecurity = () => {
  const { auditLogs, fetchAuditLogs, disableUser } = useAdmin();
  const [auditLogVisible, setAuditLogVisible] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const [logStats, setLogStats] = useState({
    normal: 0,
    warning: 0,
    critical: 0,
  });

  useEffect(() => {
    fetchAuditLogs()
      .then((res) => {
        if (res.success) calculateStats(res.data.logs);
        else message.error("Failed to fetch audit logs");
      })
      .catch(() => message.error("Network error while fetching audit logs"));
  }, []);

  const calculateStats = (logs) => {
    const stats = { normal: 0, warning: 0, critical: 0 };
    logs.forEach((log) => {
      stats[log.status] = (stats[log.status] || 0) + 1;
    });
    setLogStats(stats);
  };

  
  const handleDisable = (client) => {
    Modal.confirm({
      title: (
        <span className="text-white">
          Disable {client.firstName} {client.lastName}?
        </span>
      ),
      content: (
        <span className="text-white">
          This will temporarily disable {client.firstName} {client.lastName}'s
          account. They won&apos;t be able to make new bookings.
        </span>
      ),
      okText: `Disable ${client.role}`,
      okType: "danger",
      className: "custom-dark-modal",
      okButtonProps: { className: "dark-danger-btn" },
      cancelButtonProps: { className: "dark-cancel-btn" },
      onOk: async () => {
        try {
          const result = await disableUser(
            client._id,
            "Temporarily disabled by admin"
          );

          if (result.success) {
            message.success(
              `${client.firstName} ${client.lastName} has been disabled successfully`
            );
            await fetchAuditLogs();
          } else {
            message.error(result.error || "Failed to disable client");
          }
        } catch (error) {
          console.error(error);
          message.error("An error occurred while disabling the client");
        }
      },
    });
  };

  const columns = [
    { title: "Log ID", dataIndex: "_id", key: "_id" },
    { title: "Action", dataIndex: "action", key: "action" },
    { title: "User", dataIndex: ["user", "email"], key: "user" },
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
    {
      title: "User Status",
      dataIndex: ["user", "status"],
      key: "userStatus",

      render: (status) => {
        const config = {
          active: { color: "green", label: "Active" },
          disabled: { color: "orange", label: "Disabled" },
          pending: { color: "blue", label: "Pending" },
        };
        const { color, label } = config[status] || {
          color: "default",
          label: status,
        };
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: "Timestamp",
      dataIndex: "timestamp",
      key: "timestamp",
      render: (ts) => dayjs(ts).format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<Eye size={14} />}
            onClick={() => {
              setSelectedLog(record);
              setAuditLogVisible(true);
            }}
          >
            View
          </Button>


          {record.user.status!="disabled"?
             <Button
             size="small"
             danger
             icon={<Ban size={14} />}
             onClick={() => handleDisable(record.user)}
           >
             Disable
           </Button>:""
          }
         
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
          Monitor suspicious activity, review audit logs, and manage account
          security.
        </Paragraph>

        {/* Stats Cards */}
        <Row gutter={16} className="mb-6">
          <Col span={8}>
            <Card>
              <Statistic
                title="Critical Logs"
                value={logStats.critical}
                valueStyle={{ color: "red" }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Warning Logs"
                value={logStats.warning}
                valueStyle={{ color: "orange" }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Normal Logs"
                value={logStats.normal}
                valueStyle={{ color: "blue" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Security Logs Table */}
        <Card className="glow-border">
          <Table
            dataSource={auditLogs}
            columns={columns}
            pagination={{ pageSize: 10 }}
            rowClassName="hover:bg-gray-800"
            rowKey="_id"
            scroll={{ x: "max-content" }} // enables horizontal scroll if needed
            className="no-wrap-table"
          />
        </Card>

        {/* Audit Log Drawer */}
        <Drawer
          title="Audit Log Details"
          placement="right"
          size="large"
          onClose={() => setAuditLogVisible(false)}
          open={auditLogVisible}
          className="bg-black text-white"
        >
          {selectedLog && (
            <div>
              <Paragraph className="text-gray-400 mb-6">
                Detailed action info for transparency and compliance.
              </Paragraph>
              <Timeline
                items={[
                  {
                    dot:
                      selectedLog.status === "critical" ? (
                        <Shield size={16} className="text-red-500" />
                      ) : selectedLog.status === "warning" ? (
                        <Ban size={16} className="text-orange-500" />
                      ) : (
                        <CheckCircle size={16} className="text-green-500" />
                      ),
                    children: (
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <Title level={5} className="text-white mb-1">
                            {selectedLog.action}
                          </Title>
                          <span className="text-gray-500 text-sm">
                            {dayjs(selectedLog.timestamp).format(
                              "YYYY-MM-DD HH:mm:ss"
                            )}
                          </span>
                        </div>
                        <Paragraph className="text-gray-300 mb-1">
                          <strong>Target:</strong> {selectedLog.user.email}
                        </Paragraph>
                        <Paragraph className="text-gray-300 mb-1">
                          <strong>Reason:</strong>{" "}
                          {selectedLog.action.includes("- Reason:")
                            ? selectedLog.action.split("- Reason: ")[1]
                            : "N/A"}
                        </Paragraph>
                      </div>
                    ),
                  },
                ]}
              />
            </div>
          )}
        </Drawer>
      </div>
    </AdminLayout>
  );
};

export default AdminSecurity;
