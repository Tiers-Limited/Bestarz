import React, { useState, useEffect } from "react";
import { 
  Card, 
  Typography, 
  Form, 
  Input, 
  Button, 
  Upload, 
  Avatar, 
  message, 
  Spin,
  Row,
  Col
} from "antd";
import { User, Mail, UploadCloud, Phone } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import cloudinaryService from "../../services/CloudinaryService";
import { useAuth } from "../../context/AuthContext"; 

const { Title, Paragraph } = Typography;

const AdminProfileSettings = () => {
  const { user, profileLoading, fetchProfile, updateProfile } = useAuth();
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  // Fetch profile on mount
  useEffect(() => {
    if (!user) {
      fetchProfile().then(res => {
        if (res.success && res.data) {


          console.log
          form.setFieldsValue({
            firstName: res.data.firstName,
            lastName: res.data.lastName,
            email: res.data.email,
            phone: res.data.phone
          });
          setImageUrl(res.data.profileImage);
        }
      });
    } else {
      // If user already loaded in context, just set form
      form.setFieldsValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone
      });
      setImageUrl(user.profileImage);
    }
  }, [user, form]);
  

  const handleSubmit = async (values) => {
    const updateData = {
      firstName: values.firstName,
      lastName: values.lastName,
      phone: values.phone,
    };

    if (imageUrl && imageUrl !== user?.profileImage) {
      updateData.profileImage = imageUrl;
    }

    const result = await updateProfile(updateData);
    if (result.success) {
      message.success("Profile updated successfully!");
      form.setFieldsValue({
        firstName: result.data.firstName,
        lastName: result.data.lastName,
        phone: result.data.phone
      });
    } else {
      message.error(result.error || "Failed to update profile");
    }
  };

  const handleImageUpload = async (file) => {
    try {
      setUploading(true);
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        message.error('You can only upload image files!');
        return false;
      }

      // Validate file size (max 5MB)
      if (file.size / 1024 / 1024 > 5) {
        message.error('Image must be smaller than 5MB!');
        return false;
      }

      const result = await cloudinaryService.uploadFile(file, 'image');
      setImageUrl(result.url);
      message.success('Image uploaded successfully!');
      
    } catch (error) {
      console.error('Upload error:', error);
      message.error('Image upload failed');
    } finally {
      setUploading(false);
    }
    
    return false; // Prevent default upload behavior
  };

  if (profileLoading && !user) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <Spin size="large" />
        </div>
      </AdminLayout>
    );
  }

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <Title level={2} className="text-white flex items-center gap-2">
          <User size={20} /> Profile Settings
        </Title>
        <Paragraph className="text-gray-400 mb-4">
          Update your personal information and profile preferences.
        </Paragraph>

        <Card className="glow-border">
          <div className="flex items-center mb-6 gap-4">
            <Avatar 
              size={80} 
              src={imageUrl}
              style={{ backgroundColor: "#8B5CF6" }}
            >
              {user ? getInitials(user.firstName, user.lastName) : 'CL'}
            </Avatar>
            <Upload 
              beforeUpload={handleImageUpload}
              showUploadList={false}
              accept="image/*"
            >
              <Button 
                icon={<UploadCloud size={16} />} 
                loading={uploading}
                disabled={profileLoading}
              >
                {uploading ? 'Uploading...' : 'Change Avatar'}
              </Button>
            </Upload>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            disabled={profileLoading}
          >
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="First Name"
                  name="firstName"
                  rules={[{ required: true, message: "Please enter your first name" }]}
                >
                  <Input prefix={<User size={16} />} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Last Name"
                  name="lastName"
                  rules={[{ required: true, message: "Please enter your last name" }]}
                >
                  <Input prefix={<User size={16} />} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Email Address"
                  name="email"
                  rules={[
                    { required: true, message: "Please enter your email" },
                    { type: "email", message: "Please enter a valid email" }
                  ]}
                >
                  <Input prefix={<Mail size={16} />} disabled />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Phone Number"
                  name="phone"
                  rules={[{ required: true, message: "Please enter your phone number" }]}
                >
                  <Input prefix={<Phone size={16} />} />
                </Form.Item>
              </Col>
            </Row>

            <div className="text-right mt-6">
              <Button 
                type="primary" 
                className="bg-green-500 hover:bg-green-600" 
                htmlType="submit"
                loading={profileLoading}
              >
                Save Changes
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminProfileSettings;
