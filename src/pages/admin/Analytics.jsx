import React from "react";
import { Card, Typography, Row, Col } from "antd";
import { BarChart3, TrendingUp, Users, DollarSign } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import AdminLayout from "../../components/AdminLayout";

const { Title, Paragraph } = Typography;

const revenueData = [
  { month: "Jan", revenue: 4000 },
  { month: "Feb", revenue: 3200 },
  { month: "Mar", revenue: 5000 },
  { month: "Apr", revenue: 4700 },
  { month: "May", revenue: 6200 },
  { month: "Jun", revenue: 8000 },
];

const bookingsData = [
  { category: "Catering", bookings: 120 },
  { category: "Photography", bookings: 90 },
  { category: "DJ & Music", bookings: 70 },
  { category: "Decorations", bookings: 50 },
];

const AdminAnalytics = () => {
  return (
    <AdminLayout>
      <div className="p-6">
        <Title level={2} className="text-white flex items-center gap-2">
          <BarChart3 size={20} /> Analytics
        </Title>
        <Paragraph className="text-gray-400 mb-6">
          Insights into platform performance and user activity.
        </Paragraph>

        <Row gutter={[24, 24]}>
          {/* Revenue Growth */}
          <Col xs={24} lg={12}>
            <Card title="Revenue Growth" className="glow-border">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="month" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3B82F6"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* Bookings by Category */}
          <Col xs={24} lg={12}>
            <Card title="Bookings by Category" className="glow-border">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={bookingsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="category" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="bookings" fill="#22C55E" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]} className="mt-6">
          <Col xs={24} lg={8}>
            <Card className="glow-border">
              <div className="flex items-center gap-3">
                <DollarSign className="text-green-400" />
                <div>
                  <p className="text-gray-400 text-sm">Total Revenue</p>
                  <p className="text-white text-lg font-bold">$125,680</p>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card className="glow-border">
              <div className="flex items-center gap-3">
                <Users className="text-blue-400" />
                <div>
                  <p className="text-gray-400 text-sm">Active Users</p>
                  <p className="text-white text-lg font-bold">12,470</p>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card className="glow-border">
              <div className="flex items-center gap-3">
                <TrendingUp className="text-purple-400" />
                <div>
                  <p className="text-gray-400 text-sm">Growth Rate</p>
                  <p className="text-white text-lg font-bold">+23.5%</p>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
