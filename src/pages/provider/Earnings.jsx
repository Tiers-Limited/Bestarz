import React from "react";
import { Card, Table, Statistic, Row, Col, Typography } from "antd";
import { DollarSign, TrendingUp, Calendar } from "lucide-react";
import ProviderLayout from "../../components/ProviderLayout";

const { Title } = Typography;

const ProviderEarnings = () => {
  const columns = [
    { title: "Date", dataIndex: "date", key: "date" },
    { title: "Client", dataIndex: "client", key: "client" },
    { title: "Service", dataIndex: "service", key: "service" },
    { title: "Amount", dataIndex: "amount", key: "amount" },
    { title: "Status", dataIndex: "status", key: "status" },
  ];

  const data = [
    { key: 1, date: "2025-01-15", client: "Sarah Johnson", service: "Wedding DJ", amount: "$1200", status: "Paid" },
    { key: 2, date: "2025-01-18", client: "Mike Chen", service: "Corporate Event", amount: "$800", status: "Pending" },
    { key: 3, date: "2025-01-22", client: "Emily Davis", service: "Birthday Party", amount: "$600", status: "Paid" },
  ];

  return (
    <ProviderLayout>
      <div className="p-6">
        <Title level={2} className="text-white mb-6">Earnings</Title>

        <Row gutter={[24, 24]} className="mb-6">
          <Col xs={24} sm={12} lg={8}>
            <Card className="glow-border">
              <Statistic title="This Month" value={5280} prefix={<DollarSign />} valueStyle={{ color: "#22C55E" }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card className="glow-border">
              <Statistic title="Total Earnings" value={32400} prefix={<TrendingUp />} valueStyle={{ color: "#3B82F6" }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card className="glow-border">
              <Statistic title="Upcoming Payout" value={1800} prefix={<Calendar />} valueStyle={{ color: "#F59E0B" }} />
            </Card>
          </Col>
        </Row>

        <Card title="Earnings History" className="glow-border">
          <Table columns={columns} dataSource={data} pagination={{ pageSize: 5 }} />
        </Card>
      </div>
    </ProviderLayout>
  );
};

export default ProviderEarnings;
