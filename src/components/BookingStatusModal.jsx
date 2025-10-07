import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, InputNumber, Button, message } from 'antd';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/booking/BookingContext';

const { TextArea } = Input;
const { Option } = Select;

const BookingStatusModal = ({ 
  visible, 
  onClose, 
  booking, 
  currentStatus = 'pending',
  onSuccess 
}) => {
  const [form] = Form.useForm();
  const { updateBookingStatus, confirmBooking, loading } = useBooking();
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);

  const { user } = useAuth();


  useEffect(()=>{

    if(user?.role=="provider"){

      setSelectedStatus("confirmed")

    }


  },[])

  const handleSubmit = async (values) => {
    try {
      const { status, notes, amount } = values;

      let result;
      if (status === 'confirmed' && user?.role === 'provider') {
        // For provider confirmation, call the confirm endpoint
        result = await confirmBooking(booking._id, amount);
      } else {
        // For other status updates, use the general update function
        result = await updateBookingStatus(booking._id, status, notes, amount);
      }

      if (result.success) {
        message.success(`Booking ${status} successfully!`);
        form.resetFields();
        onClose();
        if (onSuccess) onSuccess();
      } else {
        message.error(result.error);
      }
    } catch (error) {
      message.error('Failed to update booking status');
    }
  };

  const getDefaultAmount = () => {
    if (booking?.amount) return booking.amount;
    if (booking?.budgetMax) return booking.budgetMax;
    return booking?.budgetMin || 0;
  };

  // Get status options based on user role
  const getStatusOptions = () => {
    if (user?.role === 'provider') {
      return [
        { value: 'confirmed', label: 'Accept', color: '#22C55E' },
        { value: 'cancelled', label: 'Reject', color: '#EF4444' }
      ];
    } else if (user?.role === 'client') {
      return [
        { value: 'completed', label: 'Mark as Completed', color: '#3B82F6' },
      ];
    }
    return [];
  };

  const statusOptions = getStatusOptions();

  return (
    <Modal
      title="Update Booking Status"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={500}
      className="booking-status-modal"
    >
      {booking && (
        <div className="mb-4 p-4 bg-gray-800 rounded-lg">
          <div className="text-white font-semibold mb-2">
            {user?.role === 'provider' 
              ? `${booking.client?.firstName} ${booking.client?.lastName}`
              : booking.provider?.businessName || 'Provider'
            }
          </div>
          <div className="text-gray-300 text-sm">
            {booking.serviceCategory} - {booking.eventType}
          </div>
          <div className="text-gray-400 text-xs mt-1">
            {new Date(booking.dateStart).toLocaleDateString()} • {booking.guests} guests
          </div>
        
        </div>
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          status: currentStatus,
          notes: '',
          amount: getDefaultAmount()
        }}
      >
        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: 'Please select a status' }]}
        >
          <Select 
            size="large"
            onChange={setSelectedStatus}
            placeholder="Select booking status"
          >
            {statusOptions.map(option => (
              <Option key={option.value} value={option.value}>
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: option.color }}
                  />
                  {option.label}
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>

        {(selectedStatus === 'confirmed' && user?.role === 'provider') && (
          <Form.Item
            name="amount"
            label="Final Amount"
            rules={[
              { required: true, message: 'Please enter the final amount' },
              { type: 'number', min: 0, message: 'Amount must be positive' }
            ]}
          >
            <InputNumber
              size="large"
              style={{ width: '100%' }}
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              placeholder="Enter final booking amount"
            />
          </Form.Item>
        )}

        <Form.Item
          name="notes"
          label={
            selectedStatus === 'cancelled' 
              ? 'Reason for Cancellation' 
              : 'Notes (Optional)'
          }
          rules={
            selectedStatus === 'cancelled'
              ? [{ required: true, message: 'Please provide a reason for cancellation' }]
              : []
          }
        >
          <TextArea
            rows={3}
            placeholder={
              selectedStatus === 'cancelled'
                ? 'Please provide a reason for cancellation...'
                : 'Add any notes about this status update...'
            }
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item className="mb-0">
          <div className="flex justify-end space-x-3">
            <Button onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={loading}
              className="glow-button"
              danger={selectedStatus === 'cancelled'}
            >
              {selectedStatus === 'confirmed' && 'Accept Booking'}
              {selectedStatus === 'cancelled' && 'Cancel Booking'}
              {selectedStatus === 'completed' && 'Mark Complete'}
              {!['confirmed', 'cancelled', 'completed'].includes(selectedStatus) && 'Update Status'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BookingStatusModal;