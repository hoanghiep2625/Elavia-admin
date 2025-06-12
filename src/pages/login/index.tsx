import { useLogin } from "@refinedev/core";
import { Button, Form, Input, Typography, Card, Space, theme } from "antd";

const { Title, Text } = Typography;

export const Login = () => {
  const { token } = theme.useToken();
  const { mutate: login, isLoading } = useLogin();

  const onFinish = (values: any) => {
    login(values);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: `linear-gradient(135deg, ${token.colorPrimary}11, #fff)`,
        padding: "24px",
      }}
    >
      <Card
        style={{
          maxWidth: 400,
          width: "100%",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          borderRadius: "16px",
        }}
      >
        <Space
          direction="vertical"
          size="large"
          style={{ width: "100%", textAlign: "center" }}
        >
          {/* Logo IvyModa hoặc tên hệ thống */}
          <img
            src="/logo.png"
            alt="Elavia Logo"
            style={{ width: "120px", margin: "0 auto" }}
          />

          <Title level={5} style={{ marginBottom: 0 }}>
            Admin Login
          </Title>
          <Form
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ email: "", password: "" }}
            style={{ width: "100%" }}
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Invalid email address" },
              ]}
            >
              <Input placeholder="admin@example.com" size="large" />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please enter your password" },
              ]}
            >
              <Input.Password placeholder="••••••••" size="large" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={isLoading}
              >
                Sign in
              </Button>
            </Form.Item>
          </Form>
        </Space>
      </Card>
    </div>
  );
};
