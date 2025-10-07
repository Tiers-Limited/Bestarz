import React, { useState, useEffect } from "react";
import { 
  Card, 
  Table, 
  Tag, 
  Typography, 
  Space, 
  Button, 
  Spin,
  Row,
  Col,
  Statistic,
  Modal,
  message
} from "antd";
import { DollarSign, Download, Eye, Calendar, CreditCard } from "lucide-react";
import ClientLayout from "../../components/ClientLayout";
import { useClient } from "../../context/client/ClientContext";

const { Title, Paragraph } = Typography;

const ClientPayments = () => {
  const { payments, loading, fetchPayments } = useClient();
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleViewPayment = (payment) => {
    setSelectedPayment(payment);
    setPaymentModalVisible(true);
  };



  if (loading && !payments.length) {
    return (
      <ClientLayout>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <Spin size="large" />
        </div>
      </ClientLayout>
    );
  }

  // Calculate payment statistics
  const totalPaid = payments
    .filter(p => p.status === 'completed' || p.status === 'complete')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const pendingAmount = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const completedPayments = payments.filter(p => p.status === 'completed' || p.status === 'complete').length;
  const pendingPayments = payments.filter(p => p.status === 'pending').length;

  const columns = [
    {
      title: "Transaction ID",
      dataIndex: "_id",
      key: "_id",
      render: (id) => <span className="text-gray-300">{id.slice(-8)}</span>,
    },
    {
      title: "Event",
      key: "event",
      render: (_, record) => (
        <div>
          <div className="text-white">{record.booking?.eventType || "N/A"}</div>
          <div className="text-gray-400 text-sm">
            {record.provider?.businessName || "N/A"}
          </div>
        </div>
      ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => (
        <span className="text-gray-300">
          {new Date(date).toLocaleDateString()}
        </span>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount, record) => (
        <span className="text-white font-semibold">
          ${amount.toLocaleString()} {record.currency || 'USD'}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const config = {
          completed: { color: "green", label: "Completed" },
          complete: { color: "green", label: "Completed" },
          pending: { color: "orange", label: "Pending" },
          failed: { color: "red", label: "Failed" },
          cancelled: { color: "red", label: "Cancelled" },
        };
        const { color, label } = config[status] || { color: "default", label: status };
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: "Payment Method",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (method) => (
        <span className="text-gray-300 capitalize">
          {method || "N/A"}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button 
            size="small" 
            icon={<Eye size={14} />}
            onClick={() => handleViewPayment(record)}
          >
            View
          </Button>
          
        </Space>
      ),
    },
  ];

  return (
    <ClientLayout>
      <div className="p-6">
        <Title level={2} className="text-white">Payment History</Title>
        <Paragraph className="text-gray-400 mb-6">
          View and manage all your payment transactions.
        </Paragraph>

        {/* Payment Statistics */}
        <Row gutter={[24, 24]} className="mb-8">
          <Col xs={24} sm={12} lg={6}>
            <Card className="hover-lift glow-border">
              <Statistic
                title="Total Paid"
                value={totalPaid}
                prefix="$"
                valueStyle={{ color: "#22C55E" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="hover-lift glow-border">
              <Statistic
                title="Pending Amount"
                value={pendingAmount}
                prefix="$"
                valueStyle={{ color: "#F59E0B" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="hover-lift glow-border">
              <Statistic
                title="Completed Payments"
                value={completedPayments}
                valueStyle={{ color: "#3B82F6" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="hover-lift glow-border">
              <Statistic
                title="Pending Payments"
                value={pendingPayments}
                valueStyle={{ color: "#EF4444" }}
              />
            </Card>
          </Col>
        </Row>

        <Card className="glow-border">
          <Table 
            dataSource={payments} 
            columns={columns} 
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} payments`
            }}
            className="bg-transparent"
            scroll={{ x: 1000 }}
            rowKey="_id"
          />
        </Card>

        {/* Payment Details Modal */}
        <Modal
          title={
            <span className="flex items-center gap-2">
              <CreditCard size={20} />
              Payment Details
            </span>
          }
          open={paymentModalVisible}
          onCancel={() => {
            setPaymentModalVisible(false);
            setSelectedPayment(null);
          }}
          footer={null}
          width={600}
        >
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Transaction ID
                  </label>
                  <p className="text-white">{selectedPayment._id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Amount
                  </label>
                  <p className="text-white font-semibold">
                    ${selectedPayment.amount.toLocaleString()} {selectedPayment.currency}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Status
                  </label>
                  <Tag
                    color={selectedPayment.status === 'completed' || selectedPayment.status === 'complete' ? 'green' :
                           selectedPayment.status === 'pending' ? 'orange' : 'red'}
                  >
                    {selectedPayment.status.toUpperCase()}
                  </Tag>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Payment Method
                  </label>
                  <p className="text-white capitalize">
                    {selectedPayment.paymentMethod || 'N/A'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Event Details
                </label>
                <div className="bg-gray-800 p-3 rounded">
                  <p className="font-medium text-white">{selectedPayment.booking?.eventType}</p>
                  <p className="text-gray-300">
                    Provider: {selectedPayment.provider?.businessName}
                  </p>
                  <p className="text-gray-300">
                    Date: {selectedPayment.booking?.dateStart &&
                           new Date(selectedPayment.booking.dateStart).toLocaleDateString()}
                  </p>
                  <p className="text-gray-300">
                    Location: {selectedPayment.booking?.location?.address}, {selectedPayment.booking?.location?.city}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Payment Date
                  </label>
                  <p className="text-white">
                    {new Date(selectedPayment.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Last Updated
                  </label>
                  <p className="text-white">
                    {new Date(selectedPayment.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {selectedPayment.stripePaymentIntentId && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Stripe Payment ID
                  </label>
                  <p className="text-white text-sm font-mono">
                    {selectedPayment.stripePaymentIntentId}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t">
             
                <Button 
                  type="primary"
                  onClick={() => {
                    setPaymentModalVisible(false);
                    setSelectedPayment(null);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </ClientLayout>
  );
};

export default ClientPayments;