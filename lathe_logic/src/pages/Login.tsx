// src/Login.tsx
import React, { useState } from "react";
import { Form, Input, Button, message, Typography, Spin, Alert } from "antd";
import { UserOutlined, LockOutlined, LoadingOutlined } from "@ant-design/icons";
import axios from "axios";

const { Title } = Typography;

const Login: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [invalid, setInvalid] = useState<boolean>(false);
  const [form] = Form.useForm();

  localStorage.removeItem("token");

  const onFinish = async (values: unknown) => {
    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:3000/api/auth/login",
        values
      );
      const { token, user } = response.data;

      // Store the token in localStorage
      localStorage.setItem("token", token);

      // Store the user details in sessionStorage
      sessionStorage.setItem("user", JSON.stringify(user));

      setTimeout(() => setLoading(false), 2000);
      window.location.href = "/"; // Redirect to the dashboard
    } catch (error) {
      setLoading(false);
      setInvalid(true);
      message.error("Login failed. Please check your credentials." + error);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Title level={2}>Welcome back!</Title>
      <Form
        form={form}
        name="normal_login"
        className="w-[20vw]"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        style={{
          height: "200px"
        }}
      >
        <Form.Item
          name="username"
          rules={[{ required: true, message: "Please input your Username!" }]}
        >
          <Input
            onInput={() => setInvalid(false)}
            prefix={<UserOutlined className="site-form-item-icon" />}
            placeholder="Username"
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: "Please input your Password!" }]}
        >
          <Input.Password
            onInput={() => setInvalid(false)}
            prefix={<LockOutlined className="site-form-item-icon" />}
            type="password"
            placeholder="Password"
          />
        </Form.Item>
        <Form.Item>
          <Spin indicator={<LoadingOutlined spin />} spinning={loading}>
            <Button type="primary" htmlType="submit" className="w-full">
              Log in
            </Button>
          </Spin>
        </Form.Item>
        {invalid && (
          <Form.Item>
            <Alert
              message="Invalid Credentials"
              closable
              afterClose={() => setInvalid(false)}
              type="error"
            />
          </Form.Item>
        )}
      </Form>
    </div>
  );
};

export default Login;
