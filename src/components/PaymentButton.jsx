import React, { useState } from "react";
import { Button, Modal, message, Alert } from "antd";
import { DollarSign, CreditCard } from "lucide-react";
import { usePayment } from "../context/payment/PaymentContext";

const PaymentButton = ({ booking, paymentType, size = "default" }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const { createPayment, loading } = usePayment();

  const getPaymentStatus = () => {
    // If specific paymentType is passed, use it
    if (paymentType === "advance" && booking.paymentStatus === "advance_pending") {
      return {
        type: "advance",
        label: "Pay Advance (30%)",
        amount: booking.advanceAmount || (booking.totalAmount * 0.3),
        description: "Pay 30% advance to start your booking",
      };
    } else if (paymentType === "final" && booking.paymentStatus === "final_pending") {
      return {
        type: "final",
        label: "Pay Final Amount (70%)",
        amount: booking.remainingAmount || (booking.totalAmount * 0.7),
        description: "Pay remaining 70% to complete the booking",
      };
    }

    // Legacy fallback logic
    if (booking.paymentStatus === "advance_pending") {
      return {
        type: "advance",
        label: "Pay Advance (30%)",
        amount: booking.advanceAmount || (booking.totalAmount * 0.3),
        description: "Pay 30% advance to start your booking",
      };
    } else if (booking.paymentStatus === "final_pending") {
      return {
        type: "final",
        label: "Pay Final Amount (70%)",
        amount: booking.remainingAmount || (booking.totalAmount * 0.7),
        description: "Pay remaining 70% to complete the booking",
      };
    }
    return null;
  };

  const paymentStatus = getPaymentStatus();

  const handlePayment = async () => {
    if (!paymentStatus) return;
    const result = await createPayment(booking._id, paymentStatus.type);
    if (!result.success) {
      message.error(result.error);
    }
  };

  const showPaymentModal = () => {
    setPaymentInfo(paymentStatus);
    setModalVisible(true);
  };

  if (!paymentStatus) return null;

  // Show alert only if payment is actually being processed (not just pending)
  // advance_pending and final_pending mean payment is NEEDED, not being processed
  const isBeingProcessed =
    (paymentStatus.type === "advance" && booking.paymentStatus === "advance_paid") ||
    (paymentStatus.type === "final" && booking.paymentStatus === "final_paid");

  if (isBeingProcessed) {
    return (
      <Alert
        message="Payment Completed"
        description="Your payment has been processed successfully."
        type="success"
        showIcon
      />
    );
  }

  return (
    <>
      <Button
        type="primary"
        size={size}
        icon={<CreditCard size={size === "small" ? 14 : 18} />}
        onClick={showPaymentModal}
        loading={loading}
      >
        {paymentStatus.label}
      </Button>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <DollarSign size={24} className="text-blue-500" />
            <span>Payment Details</span>
          </div>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="pay"
            type="primary"
            loading={loading}
            onClick={handlePayment}
            icon={<CreditCard size={16} />}
          >
            Proceed to Payment
          </Button>,
        ]}
      >
        <div className="space-y-4">
          <Alert message={paymentInfo?.description} type="info" showIcon />

          <div className=" p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-white">Payment Type:</span>
              <span className="font-semibold">
                {paymentInfo?.type === "advance" ? "Advance Payment (30%)" : "Final Payment (70%)"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white">Total Booking Amount:</span>
              <span className="font-semibold">${booking.amount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
              <span>Amount to Pay:</span>
              <span className="text-blue-600">${paymentInfo?.amount?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default PaymentButton;
