// src/pages/orders/edit.tsx
import React from "react";
import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Select, Typography, List, Card } from "antd";

const { Title, Text } = Typography;

export const OrderEdit = () => {
  const { formProps, saveButtonProps, queryResult } = useForm({
    resource: "orders",
    action: "edit",
  });

  // Lấy dữ liệu order từ BE (object gốc)
 const order = queryResult?.data?.data;

  // Truyền initialValues vào Form để luôn nhận đúng dữ liệu
  return (
    <Edit saveButtonProps={saveButtonProps} title="Chỉnh sửa đơn hàng">
      <Form {...formProps} layout="vertical" initialValues={order}>
        <Title level={4}>Thông tin đơn hàng</Title>
        <Form.Item label="Mã đơn hàng" name="orderId">
          <Input disabled />
        </Form.Item>
        <Form.Item label="Email khách hàng" name={["user", "email"]}>
          <Input disabled />
        </Form.Item>
        <Form.Item label="Tổng tiền" name="totalAmount">
          <Input disabled />
        </Form.Item>
        <Form.Item label="Phương thức thanh toán" name="paymentMethod">
          <Input disabled />
        </Form.Item>
        <Form.Item label="Sản phẩm">
          <Card>
            <List
              dataSource={order?.items || []}
              renderItem={(item: any) => (
                <List.Item>
                  <Text>
                    {item.productName} - Size: {item.size} - SL: {item.quantity} - Giá:{" "}
                    {item.price?.toLocaleString("vi-VN")}đ
                  </Text>
                </List.Item>
              )}
              locale={{ emptyText: "Không có sản phẩm" }}
            />
          </Card>
        </Form.Item>

        <Title level={4}>Thông tin có thể chỉnh sửa</Title>
        <Form.Item
          label="Trạng thái"
          name="status"
          rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
        >
          <Select>
            <Select.Option value="Chờ xác nhận">Chờ xác nhận</Select.Option>
            <Select.Option value="Đã xác nhận">Đã xác nhận</Select.Option>
            <Select.Option value="Đang giao hàng">Đang giao hàng</Select.Option>
            <Select.Option value="Giao hàng thành công">Giao hàng thành công</Select.Option>
            <Select.Option value="Giao hàng thất bại">Giao hàng thất bại</Select.Option>
            <Select.Option value="Đã thanh toán">Đã thanh toán</Select.Option>
            <Select.Option value="Người mua huỷ">Người mua huỷ</Select.Option>
            <Select.Option value="Người bán huỷ">Người bán huỷ</Select.Option>
            <Select.Option value="Huỷ do quá thời gian thanh toán">Huỷ do quá thời gian thanh toán</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          label="Tên khách hàng"
          name={["user", "name"]}
          rules={[{ required: true, message: "Vui lòng nhập tên khách hàng" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Số điện thoại"
          name={["user", "phone"]}
          rules={[
            { required: true, message: "Vui lòng nhập số điện thoại" },
            {
              pattern: /^[0-9]{10}$/,
              message: "Số điện thoại phải có 10 chữ số",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Địa chỉ giao hàng"
          name={["user", "address"]}
          rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Edit>
  );
};


