import React from "react";
import { Form, Input, Button, Card, Typography, Divider, message } from "antd";
import { Mail, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const { Title, Paragraph, Link } = Typography;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { forgotPassword, loading } = useAuth(); 

  const onFinish = async (values) => {
    const result = await forgotPassword(values.email);

    if (result.success) {
      message.success("Password reset link sent! Check your email.");
    } else {
      message.error(result.error || "Failed to send reset link");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button
          type="text"
          icon={<ArrowLeft size={16} />}
          onClick={() => navigate("/signin")}
          className="mb-6 text-gray-400 hover:text-white"
        >
          Back to Signin
        </Button>

        <Card
          className="glass-card"
          style={{ border: "1px solid rgba(59, 130, 246, 0.2)" }}
        >
          <div className="text-center mb-8">
            <div className="bestarz-logo text-3xl mb-2">
              Best<span className="bestarz-star">★</span>rz
            </div>
            <Title level={3} className="text-white mb-2">
              Forgot Password
            </Title>
            <Paragraph className="text-gray-400">
              Enter your email to receive a password reset link
            </Paragraph>
          </div>

          <Form name="forgot-password" layout="vertical" onFinish={onFinish}>
            {/* Email Field */}
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Please enter a valid email" },
              ]}
            >
              <Input
                prefix={<Mail size={16} className="text-gray-400" />}
                placeholder="Email"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                className="h-12 text-lg font-medium"
              >
                Send Reset Link
              </Button>
            </Form.Item>
          </Form>

          <Divider className="border-gray-600">
            <span className="text-gray-500">or</span>
          </Divider>

          <div className="text-center">
            <Paragraph className="text-gray-400">
              Remembered your password?{" "}
              <Link
                onClick={() => navigate("/signin")}
                className="text-blue-400 hover:text-blue-300"
              >
                Sign in
              </Link>
            </Paragraph>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
