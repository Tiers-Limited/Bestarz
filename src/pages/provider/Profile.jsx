import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Upload, Select, Row, Col, InputNumber, Space, Tag, message, Spin, Image } from 'antd';
import { Camera, MapPin, Phone, Mail, Globe, Copy, Check, Edit, Trash2, X } from 'lucide-react';
import ProviderLayout from '../../components/ProviderLayout';
import { useProvider } from '../../context/provider/ProviderContext';
import { useAuth } from '../../context/AuthContext';
import cloudinaryService from '../../services/CloudinaryService';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ProviderProfile = () => {
  const [form] = Form.useForm();
  const [copied, setCopied] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [portfolioImages, setPortfolioImages] = useState([]);
  
  const { profileData, loading, fetchProfileData, updateProfile } = useProvider();
  const { user } = useAuth();

  useEffect(() => {
    fetchProfileData();
  }, []);

  useEffect(() => {
    if (profileData) {
      // Set form values when profile data is loaded
      form.setFieldsValue({
        businessName: profileData.businessName || '',
        category: profileData.category || '',
        description: profileData.description || '',
        services: profileData.services || [],
        basePrice: profileData.basePrice || 0,
        location: profileData.location || '',
        phone: profileData.user?.phone || '',
        email: profileData.user?.email || '',
        website: profileData.website || '',
        availability: profileData.availability || []
      });
      
      // Set uploaded images
      setProfileImageUrl(profileData.profileImage || '');
      setPortfolioImages(profileData.portfolio || []);
    }
  }, [profileData, form]);

  const publicUrl = `${import.meta.env.VITE_FRONTEND_URL}/provider/${profileData?.slug}`;

  const categories = [
    'DJ & Music', 'Photography', 'Catering', 'Event Planning', 
    'Videography', 'Entertainment', 'Transportation', 'Flowers & Decor'
  ];

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle profile image upload
  const handleProfileImageUpload = async (file) => {
    try {
      setUploadingProfile(true);
      
      // Validate file type and size
      const isValidType = file.type.startsWith('image/');
      if (!isValidType) {
        message.error('Please upload a valid image file!');
        return false;
      }

      const isValidSize = file.size / 1024 / 1024 < 5; // 5MB limit
      if (!isValidSize) {
        message.error('Image must be smaller than 5MB!');
        return false;
      }

      const result = await cloudinaryService.uploadFile(file, 'image');
      setProfileImageUrl(result.url);
      message.success('Profile image uploaded successfully!');
      
      return false; // Prevent default upload behavior
    } catch (error) {
      console.error('Profile image upload error:', error);
      message.error(`Upload failed: ${error.message}`);
      return false;
    } finally {
      setUploadingProfile(false);
    }
  };

  // Handle portfolio images upload
  const handlePortfolioUpload = async (file) => {
    try {
      setUploadingPortfolio(true);
      
      // Validate file type and size
      const isValidType = file.type.startsWith('image/');
      if (!isValidType) {
        message.error('Please upload a valid image file!');
        return false;
      }

      const isValidSize = file.size / 1024 / 1024 < 10; // 10MB limit for portfolio
      if (!isValidSize) {
        message.error('Image must be smaller than 10MB!');
        return false;
      }

      // Check portfolio limit
      if (portfolioImages.length >= 10) {
        message.error('Maximum 10 portfolio images allowed!');
        return false;
      }

      const result = await cloudinaryService.uploadFile(file, 'image');
      const newImage = {
        url: result.url,
        public_id: result.public_id,
        original_filename: result.original_filename
      };
      
      setPortfolioImages(prev => [...prev, newImage]);
      message.success('Portfolio image uploaded successfully!');
      
      return false; // Prevent default upload behavior
    } catch (error) {
      console.error('Portfolio upload error:', error);
      message.error(`Upload failed: ${error.message}`);
      return false;
    } finally {
      setUploadingPortfolio(false);
    }
  };

  // Remove portfolio image
  const removePortfolioImage = async (index, publicId) => {
    try {
      if (publicId) {
        await cloudinaryService.deleteFile(publicId);
      }
      setPortfolioImages(prev => prev.filter((_, i) => i !== index));
      message.success('Image removed successfully!');
    } catch (error) {
      console.error('Error removing image:', error);
      message.error('Failed to remove image');
    }
  };

  // Remove profile image
  const removeProfileImage = async () => {
    try {
      if (profileData?.profileImage) {
        // Extract public_id from URL if needed
        const publicId = profileImageUrl.split('/').pop().split('.')[0];
        await cloudinaryService.deleteFile(publicId);
      }
      setProfileImageUrl('');
      message.success('Profile image removed successfully!');
    } catch (error) {
      console.error('Error removing profile image:', error);
      message.error('Failed to remove profile image');
    }
  };

  const onFinish = async (values) => {
    try {
      // Include uploaded images in the form data
      const formDataWithImages = {
        ...values,
        profileImage: profileImageUrl,
        portfolio: portfolioImages
      };

      const result = await updateProfile(formDataWithImages);
      if (result.success) {
        message.success('Profile updated successfully!');
      } else {
        message.error(result.error);
      }
    } catch (error) {
      message.error('Failed to update profile');
    }
  };

  if (loading && !profileData) {
    return (
      <ProviderLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Spin size="large" />
        </div>
      </ProviderLayout>
    );
  }

  return (
    <ProviderLayout>
      <div className="p-6">
        <Title level={2} className="text-white mb-2">Provider Profile</Title>
        <Paragraph className="text-gray-400 mb-8">
          Manage your business profile, services, and pricing structure
        </Paragraph>

        {/* Public Link Card */}
        <Card className="mb-8 vibrant-card">
          <div className="flex items-center justify-between">
            <div>
              <Title level={5} className="text-white mb-1">Your Public Booking Page</Title>
              <Paragraph className="text-gray-400 mb-0">
                Share this link with clients to receive bookings
              </Paragraph>
            </div>
            <Space>
              <code className="bg-gray-800 px-3 py-2 rounded text-blue-400 text-sm">
                {publicUrl}
              </code>
              <Button 
                type="primary" 
                icon={copied ? <Check size={16} /> : <Copy size={16} />}
                onClick={handleCopyUrl}
                className="glow-button"
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </Space>
          </div>
        </Card>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Row gutter={[24, 24]}>
            {/* Basic Information */}
            <Col xs={24} lg={12}>
              <Card title="Basic Information" className="h-full glow-border">
                <Form.Item
                  name="businessName"
                  label={<span className="text-white">Business Name</span>}
                  rules={[{ required: true, message: 'Please input your business name!' }]}
                >
                  <Input size="large" placeholder="Your Business Name" />
                </Form.Item>

                <Form.Item
                  name="category"
                  label={<span className="text-white">Service Category</span>}
                  rules={[{ required: true, message: 'Please select a category!' }]}
                >
                  <Select 
                    size="large" 
                    placeholder="Select your primary service"
                    getPopupContainer={(triggerNode) => triggerNode.parentNode}
                  >
                    {categories.map(cat => (
                      <Option key={cat} value={cat}>{cat}</Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="description"
                  label={<span className="text-white">Business Description</span>}
                  rules={[{ required: true, message: 'Please provide a description!' }]}
                >
                  <TextArea 
                    rows={4} 
                    placeholder="Describe your services and what makes you unique..."
                  />
                </Form.Item>

                <Form.Item
                  name="basePrice"
                  label={<span className="text-white">Starting Price (for basic listings)</span>}
                  rules={[{ required: true, message: 'Please set your starting price!' }]}
                >
                  <InputNumber
                    size="large"
                    style={{ width: '100%' }}
                    prefix="$"
                    placeholder="Starting price for your services"
                    min={0}
                  />
                </Form.Item>
              </Card>
            </Col>

            {/* Contact & Media */}
            <Col xs={24} lg={12}>
              <Card title="Contact Information" className="h-full glow-border">
                <Form.Item
                  name="location"
                  label={<span className="text-white">Service Area</span>}
                  rules={[{ required: true, message: 'Please input your service area!' }]}
                >
                  <Input 
                    size="large" 
                    prefix={<MapPin size={16} className="text-gray-400" />}
                    placeholder="City, State" 
                  />
                </Form.Item>

                <Form.Item
                  name="phone"
                  label={<span className="text-white">Phone Number</span>}
                  rules={[{ required: true, message: 'Please input your phone!' }]}
                >
                  <Input 
                    size="large" 
                    prefix={<Phone size={16} className="text-gray-400" />}
                    placeholder="+1 (555) 123-4567"
                    
                    value={user?.phone}
                  />
                </Form.Item>

                <Form.Item
                  name="email"
                  label={<span className="text-white">Business Email</span>}
                  rules={[
                    { required: true, message: 'Please input your email!' },
                    { type: 'email', message: 'Please enter a valid email!' }
                  ]}
                >
                  <Input 
                    size="large" 
                    prefix={<Mail size={16} className="text-gray-400" />}
                    placeholder="business@example.com"
                    disabled
                    value={user?.email}
                  />
                </Form.Item>

                <Form.Item
                  name="website"
                  label={<span className="text-white">Website (Optional)</span>}
                >
                  <Input 
                    size="large" 
                    prefix={<Globe size={16} className="text-gray-400" />}
                    placeholder="www.yourbusiness.com" 
                  />
                </Form.Item>

                {/* Profile Image Upload */}
                <Form.Item
                  label={<span className="text-white">Profile Image</span>}
                >
                  {profileImageUrl ? (
                    <div className="relative inline-block">
                      <Image
                        width={150}
                        height={150}
                        src={profileImageUrl}
                        alt="Profile"
                        className="rounded-lg object-cover"
                      />
                      <Button
                        type="text"
                        
                        icon={<X size={16} />}
                        onClick={removeProfileImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        size="small"
                      />
                    </div>
                  ) : (
                    <Upload.Dragger 
                      className="bg-gray-800 border-gray-600 hover:border-blue-400"
                      beforeUpload={handleProfileImageUpload}
                      showUploadList={false}
                      accept="image/*"
                    >
                      <p className="ant-upload-drag-icon">
                        {uploadingProfile ? (
                          <Spin size="large" />
                        ) : (
                          <Camera size={32} className="text-gray-400 mx-auto" />
                        )}
                      </p>
                      <p className="ant-upload-text text-white">
                        {uploadingProfile ? 'Uploading...' : 'Upload your business logo or photo'}
                      </p>
                      <p className="ant-upload-hint text-gray-400">
                        Drag & drop or click to browse (max 5MB)
                      </p>
                    </Upload.Dragger>
                  )}
                </Form.Item>
              </Card>
            </Col>

            {/* Services & Availability */}
            <Col xs={24}>
              <Card title="Service Details" className="glow-border">
                <Row gutter={[24, 24]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="services"
                      label={<span className="text-white">Services Offered</span>}
                      rules={[{ required: true, message: 'Please add at least one service!' }]}
                    >
                      <Select
                        mode="tags"
                        size="large"
                        placeholder="Add your services"
                        getPopupContainer={(triggerNode) => triggerNode.parentNode}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="availability"
                      label={<span className="text-white">Availability</span>}
                      rules={[{ required: true, message: 'Please select available days!' }]}
                    >
                      <Select
                        mode="multiple"
                        size="large"
                        placeholder="Select available days"
                        getPopupContainer={(triggerNode) => triggerNode.parentNode}
                      >
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                          <Option key={day} value={day}>{day}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                {/* Portfolio Images */}
                <Form.Item
                  label={<span className="text-white">Portfolio Images ({portfolioImages.length}/10)</span>}
                >
                  {/* Display existing portfolio images */}
                  {portfolioImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      {portfolioImages.map((image, index) => (
                        <div key={index} className="relative">
                          <Image
                            width={150}
                            height={150}
                            src={image.url || image}
                            alt={`Portfolio ${index + 1}`}
                            className="rounded-lg object-cover"
                          />
                          <Button
                            type="text"
                            
                            icon={<X size={16} />}
                            onClick={() => removePortfolioImage(index, image.public_id)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                            size="small"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload new portfolio images */}
                  {portfolioImages.length < 10 && (
                    <Upload.Dragger 
                      className="bg-gray-800 border-gray-600 hover:border-blue-400"
                      beforeUpload={handlePortfolioUpload}
                      showUploadList={false}
                      accept="image/*"
                      disabled={uploadingPortfolio}
                    >
                      <p className="ant-upload-drag-icon">
                        {uploadingPortfolio ? (
                          <Spin size="large" />
                        ) : (
                          <Camera size={32} className="text-gray-400 mx-auto" />
                        )}
                      </p>
                      <p className="ant-upload-text text-white">
                        {uploadingPortfolio ? 'Uploading...' : 'Upload portfolio images'}
                      </p>
                      <p className="ant-upload-hint text-gray-400">
                        Show off your best work (max 10 images, 10MB each)
                      </p>
                    </Upload.Dragger>
                  )}
                </Form.Item>
              </Card>
            </Col>
          </Row>

          <div className="mt-8 text-center">
            <Space size="large">
              <Button 
                size="large" 
                className="hover-lift"
                onClick={() => {
                  form.resetFields();
                  setProfileImageUrl('');
                  setPortfolioImages([]);
                }}
              >
                Reset
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                size="large" 
                loading={loading}
                className="glow-button px-8"
              >
                Save Profile
              </Button>
            </Space>
          </div>
        </Form>
      </div>
    </ProviderLayout>
  );
};

export default ProviderProfile;