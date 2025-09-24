import React, { useEffect } from "react";
import { Card, Typography, Row, Col, Spin } from "antd";
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
import { useAdmin } from "../../context/admin/AdminContext";

const { Title, Paragraph } = Typography;

const AdminAnalytics = () => {
  const { analytics, fetchAnalytics, loading } = useAdmin();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Format revenue data for chart
  const revenueData = analytics?.revenueData?.map((item) => ({
    month: `${item._id.year}-${item._id.month}-${item._id.day}`,
    revenue: item.revenue,
  })) || [];

  // Format bookings by category
  const bookingsData = analytics?.bookingsByCategory?.map((item) => ({
    category: item._id,
    bookings: item.count,
  })) || [];

  // Compute total revenue
  const totalRevenue = analytics?.revenueData?.reduce((sum, item) => sum + item.revenue, 0) || 0;

  // Compute total users (active users)
  const totalUsers = analytics?.userGrowth?.reduce((sum, item) => sum + item.users, 0) || 0;

  // Compute growth rate (simplified: last day / first day - 1)
  const growthRate = (() => {
    if (!analytics?.userGrowth || analytics.userGrowth.length < 2) return 0;
    const sorted = [...analytics.userGrowth].sort((a, b) => 
      new Date(a._id.year, a._id.month - 1, a._id.day) - 
      new Date(b._id.year, b._id.month - 1, b._id.day)
    );
    const first = sorted[0].users || 0;
    const last = sorted[sorted.length - 1].users || 0;
    return first === 0 ? 0 : ((last - first) / first) * 100;
  })();

  return (
    <AdminLayout>
      <div className="p-6">
        <Title level={2} className="text-white flex items-center gap-2">
          <BarChart3 size={20} /> Analytics
        </Title>
        <Paragraph className="text-gray-400 mb-6">
          Insights into platform performance and user activity.
        </Paragraph>

        {loading ? (
          <div className="flex justify-center items-center p-6">
            <Spin size="large" />
          </div>
        ) : (
          <>



<Row gutter={[24, 24]} className="mt-6">
              <Col xs={24} lg={8}>
                <Card className="glow-border">
                  <div className="flex items-center gap-3">
                    <DollarSign className="text-green-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Total Revenue</p>
                      <p className="text-white text-lg font-bold">${totalRevenue.toLocaleString()}</p>
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
                      <p className="text-white text-lg font-bold">{totalUsers.toLocaleString()}</p>
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
                      <p className="text-white text-lg font-bold">{growthRate.toFixed(1)}%</p>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
            <Row className="mt-4" gutter={[24, 24]}>
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

         
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
