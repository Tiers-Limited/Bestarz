import React from "react";
import { Card, Typography, Button, Row, Col, List, Tag, Space, Modal } from "antd";
import { Check, Star, Zap, Crown, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProviderLayout from "../../components/ProviderLayout";
import { useSubscription } from "../../context/provider/SubscriptionContext";
import { message } from '../../utils';
import { useProvider } from "../../context/provider/ProviderContext";

const { Title, Paragraph } = Typography;

const ProviderSubscription = () => {
  const navigate = useNavigate();
  const {
    subscription,
    createSubscription,
    updateSubscription,
    cancelSubscription,
    getCurrentSubscription,
    loading,
  } = useSubscription();
  const { profileData } = useProvider();

  const plans = [
    {
      name: "Starter",
      price: 29,
      period: "month",
      popular: false,
      features: [
        "Up to 10 bookings per month",
        "Basic profile customization",
        "Email notifications",
        "Standard support",
        "5% transaction fee",
      ],
      icon: <Star size={24} className="text-blue-400" />,
      stripePriceId: "price_123456789",
    },
    {
      name: "Professional",
      price: 69,
      period: "month",
      popular: true,
      features: [
        "Unlimited bookings",
        "Advanced profile features",
        "Google Calendar sync",
        "Priority support",
        "3% transaction fee",
        "Custom booking forms",
        "Analytics dashboard",
      ],
      icon: <Zap size={24} className="text-green-400" />,
      stripePriceId: "price_987654321",
    },
    {
      name: "Enterprise",
      price: 149,
      period: "month",
      popular: false,
      features: [
        "Everything in Professional",
        "Multi-location management",
        "Team collaboration tools",
        "White-label options",
        "2% transaction fee",
        "Advanced analytics",
        "Dedicated account manager",
      ],
      icon: <Crown size={24} className="text-purple-400" />,
      stripePriceId: "price_192837465",
    },
  ];

  console.log(profileData,"profileDataprofileData");
  console.log(subscription,"subscriptionData");

  const currentPlan = {
    name: subscription?.subscriptionPlan || profileData?.user?.subscriptionPlan || "",
    renewalDate: subscription?.subscriptionEnd || profileData?.user?.subscriptionEnd || "",
    status: subscription?.subscriptionStatus || profileData?.user?.subscriptionStatus || "canceled",
  };

  console.log(currentPlan,"currentPlancurrentPlan");

  const handleSelectPlan = async (plan) => {
    if (currentPlan.name?.toLowerCase() === plan.name.toLowerCase()) return;

    if (currentPlan.status === "active") {
      await updateSubscription(plan.name.toLowerCase(), plan.price);
    } else {
      await createSubscription(plan.name.toLowerCase(), plan.price);
    }
  };

  const handleCancelSubscription = () => {
    const planName = currentPlan.name?.charAt(0).toUpperCase() + currentPlan.name?.slice(1);
    const renewalDate = currentPlan.renewalDate ? new Date(currentPlan.renewalDate).toLocaleDateString() : 'N/A';

    Modal.confirm({
      title: <span style={{ color: '#ffffff' }}>Cancel {planName} Subscription</span>,
      content: (
        <div>
          <p style={{ marginBottom: '16px', color: '#ff7875', fontWeight: 'bold' }}>
            ⚠️ You are about to cancel your {planName} subscription.
          </p>
          <p style={{ marginBottom: '12px', color: '#ffffff' }}>
            <strong style={{ color: '#ffffff' }}>What happens next:</strong>
          </p>
          <ul style={{ marginBottom: '16px', paddingLeft: '20px', color: '#d9d9d9' }}>
            <li>You'll keep access to premium features until {renewalDate}</li>
            <li>No more charges will be made to your card</li>
            <li>You can resubscribe anytime before the end date</li>
            <li>You'll lose access to: unlimited bookings, advanced profiles, priority support</li>
          </ul>
          <p style={{ color: '#bfbfbf', fontSize: '14px' }}>
            This action cannot be undone. Are you sure you want to proceed?
          </p>
        </div>
      ),
      okText: 'Yes, Cancel Subscription',
      okType: 'danger',
      cancelText: 'Keep My Subscription',
      width: 500,
      onOk: async () => {
        const result = await cancelSubscription();
        if (result.success) {
          message.success('Subscription canceled successfully');
        } else {
          message.error(result.error || 'Failed to cancel subscription');
        }
      },
    });
  };

  const hasSubscription = currentPlan.name && currentPlan.status === "active";

  return (
    <ProviderLayout>
      <div className="min-h-screen bg-black p-4">
        <div className="max-w-6xl mx-auto">
          <Button
            type="text"
            icon={<ArrowLeft size={16} />}
            onClick={() => navigate("/provider/dashboard")}
            className="mb-6 text-gray-400 hover:text-white"
          >
            Back to Dashboard
          </Button>

          <div className="text-center mb-12">
            <div className="bestarz-logo text-4xl mb-4">
              Best<span className="bestarz-star">★</span>rz
            </div>
            <Title level={1} className="text-white mb-4">
              Choose Your Plan
            </Title>
            <Paragraph className="text-xl text-gray-400 max-w-2xl mx-auto">
              Select the perfect plan to grow your business and manage bookings
              effortlessly
            </Paragraph>
          </div>

          {/* Current Subscription Status */}
          {hasSubscription ? (
            <Card
              className="mb-8 glass-card"
              style={{ border: "1px solid #10B981" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <Title level={4} className="text-white mb-2">
                    Current Plan: {currentPlan.name?.charAt(0).toUpperCase() + currentPlan.name?.slice(1)}
                  </Title>
                  <Paragraph className="text-gray-400 mb-0">
                    Status: <Tag color="green">{currentPlan.status}</Tag>
                    {currentPlan.renewalDate && (
                      <span>
                        • Renews on: {new Date(currentPlan.renewalDate).toLocaleDateString()}
                      </span>
                    )}
                  </Paragraph>
                </div>
                <div>
                  <Button 
                    danger 
                    onClick={handleCancelSubscription}
                    loading={loading}
                  >
                    Cancel Subscription
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card
              className="mb-8 glass-card"
              style={{ border: "1px solid #EAB308" }}
            >
              <Paragraph className="text-gray-400 mb-0">
                You don't have any active subscription. Please select a plan
                below to get started.
              </Paragraph>
            </Card>
          )}

          {/* Pricing Plans */}
          <Row gutter={[24, 24]} className="mb-12">
            {plans.map((plan, index) => (
              <Col xs={24} lg={8} key={index}>
                <Card
                  className={`h-full text-center hover-lift ${
                    plan.popular ? "border-blue-400" : ""
                  }`}
                  style={{
                    background: plan.popular
                      ? "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(34, 197, 94, 0.05))"
                      : undefined,
                    border: plan.popular
                      ? "2px solid #3B82F6"
                      : "1px solid #333333",
                  }}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Tag color="blue" className="px-3 py-1">
                        Most Popular
                      </Tag>
                    </div>
                  )}

                  <div className="p-6">
                    <div className="mb-4">{plan.icon}</div>
                    <Title level={3} className="text-white mb-2">
                      {plan.name}
                    </Title>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-white">
                        ${plan.price}
                      </span>
                      <span className="text-gray-400">/{plan.period}</span>
                    </div>

                    <List
                      dataSource={plan.features}
                      renderItem={(feature) => (
                        <List.Item className="border-none py-2">
                          <Space className="text-gray-300">
                            <Check size={16} className="text-green-400" />
                            {feature}
                          </Space>
                        </List.Item>
                      )}
                      className="mb-6"
                    />

                    <Button
                      type="primary"
                      size="large"
                      block
                      loading={loading}
                      disabled={
                        currentPlan.name?.toLowerCase() ===
                        plan.name.toLowerCase()
                      }
                      onClick={() => handleSelectPlan(plan)}
                      className={
                        currentPlan.name?.toLowerCase() === plan.name.toLowerCase()
                          ? "bg-green-600 border-green-600"
                          : plan.popular
                          ? "bg-blue-600 border-blue-600 hover:bg-blue-700"
                          : ""
                      }
                    >
                      {currentPlan.name?.toLowerCase() === plan.name.toLowerCase()
                        ? "Current Plan"
                        : `Choose ${plan.name}`}
                    </Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    </ProviderLayout>
  );
};

export default ProviderSubscription;