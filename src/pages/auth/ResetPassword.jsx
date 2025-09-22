import React from "react";
import { Form, Input, Button, Card, Typography, Divider, message } from "antd";
import { Lock, ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const { Title, Paragraph, Link } = Typography;

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { resetPassword, loading } = useAuth();

  // Extract token from URL
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");
  const id = queryParams.get("id");

  const onFinish = async (values) => {
    if (!token || !id) {
      message.error("Invalid or missing reset credentials");
      navigate("/forgot-password"); // redirect user back
      return;
    }
  
    if (values.password !== values.confirmPassword) {
      message.error("Passwords do not match!");
      return;
    }
  
    const result = await resetPassword({ id, token, newPassword: values.password });
  
    if (result.success) {
      message.success("Password reset successfully! You can sign in now.");
      navigate("/signin");
    } else {
      message.error(result.error || "Failed to reset password");
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
              Reset Password
            </Title>
            <Paragraph className="text-gray-400">
              Enter your new password below
            </Paragraph>
          </div>

          <Form name="reset-password" layout="vertical" onFinish={onFinish}>
            <Form.Item
              name="password"
              rules={[{ required: true, message: "Please enter a new password!" }]}
            >
              <Input.Password
                prefix={<Lock size={16} className="text-gray-400" />}
                placeholder="New Password"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              rules={[
                { required: true, message: "Please confirm your new password!" },
              ]}
            >
              <Input.Password
                prefix={<Lock size={16} className="text-gray-400" />}
                placeholder="Confirm Password"
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
                Reset Password
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

export default ResetPassword;
