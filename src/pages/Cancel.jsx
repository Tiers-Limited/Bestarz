import React from 'react';
import { Card, Typography, Button } from 'antd';
import { XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const Cancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card
          className="glass-card text-center relative overflow-hidden"
          style={{
            border: '1px solid rgba(239,68,68,0.3)',
            background:
              'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(59,130,246,0.05))',
          }}
        >
          {/* Cancel Icon */}
          <div className="flex justify-center mb-6">
            <XCircle size={80} className="text-red-400" />
          </div>

          {/* Heading */}
          <Title level={2} className="text-white mb-2">
            Payment Canceled
          </Title>

          {/* Subtext */}
          <Paragraph className="text-gray-400 text-lg mb-8">
            Your payment was not completed.  
            If this was a mistake, you can try again anytime.
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

export default Cancel;
