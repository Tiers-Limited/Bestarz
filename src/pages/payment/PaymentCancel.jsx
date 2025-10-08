import React from 'react';
import { Result, Button } from 'antd';
import { XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const PaymentCancel = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <Result
        icon={<XCircle className="w-16 h-16 text-red-500" />}
        title="Payment Cancelled"
        subTitle="Your payment was cancelled. You can try again from your bookings page."
        extra={[
          <Link to="/client/bookings" key="dashboard">
            <Button type="primary">
              Go to My Bookings
            </Button>
          </Link>,
        ]}
      />
    </div>
  );
};

export default PaymentCancel;
