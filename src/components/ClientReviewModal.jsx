import React, { useEffect } from "react";
import { Modal, Form, Input, Button, Rate, message } from "antd";
import { Star } from "lucide-react";

const { TextArea } = Input;

const ClientReviewModal = ({
  visible,
  onClose,
  booking,
  loading,
  onSubmit,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && booking) {
      form.setFieldsValue({
        rating: 5,
        comment: "",
      });
    }
  }, [visible, booking, form]);

  const handleFinish = async (values) => {
    if (!booking) return;
    const result = await onSubmit({
      bookingId: booking._id,
      ...values,
    });

    if (result.success) {
      message.success("Review submitted successfully!");
      form.resetFields();
      onClose();
    } else {
      message.error(result.error || "Failed to submit review");
    }
  };

  return (
    <Modal
      title={
        <span className="flex items-center gap-2 text-gray-100">
          <Star size={20} />
          Leave a Review
        </span>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      {booking && (
        <div className="mb-4 p-4 bg-gray-100 rounded">
          <h4 className="mb-2 text-gray-900 font-semibold">{booking.eventType}</h4>
          <p className="text-gray-700">
            Provider: {booking.provider?.businessName}
          </p>
          <p className="text-gray-700">
            Date: {new Date(booking.dateStart).toLocaleDateString()}
          </p>
        </div>
      )}

      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          label={<span className="text-gray-100">Rating</span>}
          name="rating"
          rules={[{ required: true, message: "Please select a rating" }]}
        >
          <Rate />
        </Form.Item>

        <Form.Item
          label={<span className="text-gray-100">Review Comment</span>}
          name="comment"
          rules={[{ required: true, message: "Please write a review" }]}
        >
          <TextArea
            rows={4}
            placeholder="Share your experience with this provider..."
            className="text-gray-800"
          />
        </Form.Item>

        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<Star size={16} />}
          >
            Submit Review
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ClientReviewModal;
