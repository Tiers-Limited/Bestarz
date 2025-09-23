import React from "react";
import { Card, Typography, Button, Row, Col, List, Tag, Space } from "antd";
import { Check, Star, Zap, Crown, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProviderLayout from "../../components/ProviderLayout";
import { useSubscription } from "../../context/provider/SubscriptionContext";
import { useProvider } from "../../context/provider/ProviderContext";

const { Title, Paragraph } = Typography;

const ProviderSubscription = () => {
  const navigate = useNavigate();
  const {
    createSubscription,
    updateSubscription,
    cancelSubscription,
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

  console.log(profileData,"profileDataprofileData")

  const currentPlan = {
    name: profileData?.user?.subscriptionPlan || "",
    renewalDate: profileData?.user?.subscriptionEnd || "",
    status:
      profileData?.user?.subscriptionStatus,
  };


  console.log(currentPlan,"currentPlancurrentPlan")

  const handleSelectPlan = async (plan) => {
    if (currentPlan.name?.toLowerCase() === plan.name.toLowerCase()) return;

    if (currentPlan.status === "active") {
      await updateSubscription(plan.name.toLowerCase(), plan.price);
    } else {
      await createSubscription(plan.name.toLowerCase(), plan.price);
    }
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
          {!hasSubscription && (
            <Card
              className="mb-8 glass-card"
              style={{ border: "1px solid #EAB308" }}
            >
              <Paragraph className="text-gray-400 mb-0">
                You don’t have any active subscription. Please select a plan
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
                    <Tag color="blue" className="absolute top-4 right-4">
                      MOST POPULAR
                    </Tag>
                  )}

                  <div className="mb-6">
                    {plan.icon}
                    <Title level={3} className="text-white mt-4 mb-2">
                      {plan.name}
                    </Title>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-white">
                        ${plan.price}
                      </span>
                      <span className="text-gray-400">/{plan.period}</span>
                    </div>
                  </div>

                  <List
                    dataSource={plan.features}
                    renderItem={(feature) => (
                      <List.Item className="border-none px-0 py-2">
                        <div className="flex items-center">
                          <Check size={16} className="text-green-400 mr-3" />
                          <span className="text-gray-300">{feature}</span>
                        </div>
                      </List.Item>
                    )}
                    className="mb-6"
                  />

                  <Button
                    type={plan.popular ? "primary" : "default"}
                    size="large"
                    block
                    className="h-12 text-lg font-medium"
                    disabled={
                      currentPlan.name?.toLowerCase() ===
                      plan.name.toLowerCase()
                    }
                    onClick={() => handleSelectPlan(plan)}
                    loading={loading}
                  >
                    {currentPlan.name?.toLowerCase() === plan.name.toLowerCase()
                      ? "Current Plan"
                      : "Select Plan"}
                  </Button>
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
