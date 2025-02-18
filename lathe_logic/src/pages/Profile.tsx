// src/pages/Profile.tsx
import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Form, Input, message, Space } from 'antd';
import { EditOutlined, SaveOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface AdminProfile {
  _id: string;
  id: string;
  username: string;
  email: string;
  password: string;
  companyUid: string;
  company: string;
  role: string;
  isAdmin: boolean;
}

const Profile = () => {
  const [adminProfile, setAdminProfile] = useState<AdminProfile>({
    _id: '',
    id: '',
    username: '',
    email: '',
    password: '',
    companyUid: '',
    company: '',
    role: '',
    isAdmin: false,
  });
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [profileForm] = Form.useForm();

  useEffect(() => {
    // Fetch admin profile from sessionStorage
    const adminDetails = JSON.parse(sessionStorage.getItem('user') || '{}');
    if (adminDetails) {
      setAdminProfile(adminDetails);

      // Set form values
      profileForm.setFieldsValue({
        username: adminDetails.username || '',
        email: adminDetails.email || '',
        company: adminDetails.company || '',
        role: adminDetails.role || '',
      });
    }
  }, [profileForm]);

  const handleProfileEdit = () => {
    setIsEditingProfile(true);
  };

  const handleProfileCancel = () => {
    setIsEditingProfile(false);
    profileForm.resetFields();
  };

  const handleProfileFinish = (values: Partial<AdminProfile>) => {
    // Update admin profile in sessionStorage
    const updatedAdminDetails = {
      ...adminProfile,
      ...values,
    };
    sessionStorage.setItem('user', JSON.stringify(updatedAdminDetails));

    // Update state
    setAdminProfile(updatedAdminDetails);
    setIsEditingProfile(false);
    message.success('Profile updated successfully!');
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Admin Profile</Title>
      <Card style={{ maxWidth: 600, margin: 'auto', marginBottom: '24px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={3}>{adminProfile.username}</Title>
            {!isEditingProfile && (
              <Button type="link" icon={<EditOutlined />} onClick={handleProfileEdit}>
                Edit Profile
              </Button>
            )}
          </div>
          <Form form={profileForm} onFinish={handleProfileFinish} layout="vertical" initialValues={adminProfile} hidden={!isEditingProfile}>
            <Form.Item
              name="username"
              label="Username"
              rules={[{ required: true, message: 'Please enter your username' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="company"
              label="Company"
              rules={[{ required: true, message: 'Please enter your company' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="role"
              label="Role"
              rules={[{ required: true, message: 'Please select your role' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                  Save Changes
                </Button>
                <Button onClick={handleProfileCancel}>Cancel</Button>
              </Space>
            </Form.Item>
          </Form>
          {!isEditingProfile && (
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>Email:</Text>
              <Text>{adminProfile.email}</Text>
              <Text strong>Company:</Text>
              <Text>{adminProfile.company}</Text>
              <Text strong>Role:</Text>
              <Text>{adminProfile.role}</Text>
            </Space>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default Profile;