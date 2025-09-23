import React from 'react';
import { Card, Typography, Button } from 'antd';
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const Success = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card
          className="glass-card text-center relative overflow-hidden"
          style={{
            border: '1px solid rgba(34,197,94,0.3)',
            background:
              'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(59,130,246,0.05))',
          }}
        >
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <CheckCircle size={80} className="text-green-400" />
          </div>

          {/* Heading */}
          <Title level={2} className="text-white mb-2">
            Payment Successful 🎉
          </Title>

          {/* Subtext */}
          <Paragraph className="text-gray-400 text-lg mb-8">
            Thank you for your purchase!  
            Your subscription is now active and you can enjoy all premium features.
          </Paragraph>

          {/* Button */}
          <Button
            type="primary"
            size="large"
            block
            className="h-12 text-lg font-medium"
            onClick={() => navigate('/provider/dashboard')}
          >
            Back to Dashboard
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Success;
