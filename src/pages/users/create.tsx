import React, { useEffect } from "react";
import { Create, useForm } from "@refinedev/antd";
import { Form, Input, message } from "antd";
import axios from "axios";

const defaultUserData = {
  first_name: "Admin",
  name: "Admin",
  phone: "0381234567",
  date: "2000-01-01",
  sex: "1",
  shipping_addresses: [
    {
      receiver_name: "nguoi moi",
      phone: "0381234567",
      city: { id: "01", name: "Hà Nội" },
      district: { id: "001", name: "Quận Ba Đình" },
      ward: { id: "00001", name: "Phường Phúc Xá" },
      address: "Số 1 Phan Đình Phùng",
      isDefault: true,
    },
  ],
  verify: 0,
};

export const UserCreate = () => {
  const { formProps, saveButtonProps } = useForm({
    resource: "users",
    action: "create",
    redirect: "list",
    mutationMode: "pessimistic",
  });

  // Không cần setFieldsValue nếu không có input tương ứng

  const handleFinish = async (values: any) => {
    try {
      await axios.post(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:5175/api"
        }/auth/register`,
        {
          ...defaultUserData,
          ...values,
          role: "3", // luôn là admin
        }
      );
      message.success("Tạo thành công!");
      return true;
    } catch (err: any) {
      message.error(
        err?.response?.data?.message ||
          "Có lỗi xảy ra, vui lòng kiểm tra lại thông tin!"
      );
      return false;
    }
  };

  return (
    <Create title="Thêm quản trị viên mới" saveButtonProps={saveButtonProps}>
      <Form
        {...formProps}
        layout="vertical"
        onFinish={async (values: any) => {
          if (values.password !== values.confirmPassword) {
            message.error("Mật khẩu xác nhận không khớp!");
            return;
          }
          await handleFinish(values);
        }}
      >
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Vui lòng nhập email" },
            { type: "email", message: "Email không hợp lệ" },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Mật khẩu"
          name="password"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu" },
            { min: 6, message: "Mật khẩu tối thiểu 6 ký tự" },
          ]}
          hasFeedback
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          label="Xác nhận mật khẩu"
          name="confirmPassword"
          dependencies={["password"]}
          hasFeedback
          rules={[
            { required: true, message: "Vui lòng xác nhận mật khẩu" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject("Mật khẩu xác nhận không khớp!");
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>
      </Form>
    </Create>
  );
};
