// src/pages/orders/edit.tsx
import React from "react";
import { Edit, useForm } from "@refinedev/antd";
import { useOne } from "@refinedev/core";
import { Form, Input, Select, Typography, Row, Col, Card, Tag, List } from "antd";

const { Title, Text } = Typography;

const getStatusColor = (status: string) => {
  switch (status) {
    case "Chờ xác nhận":
      return "orange";
    case "Đã xác nhận":
      return "blue";
    case "Người bán huỷ":
    case "Người mua huỷ":
      return "red";
    case "Đang giao hàng":
      return "cyan";
    case "Giao hàng thành công":
      return "green";
    case "Giao hàng thất bại":
      return "volcano";
    case "Chờ thanh toán":
      return "gold";
    case "Đã thanh toán":
      return "purple";
    case "Huỷ do quá thời gian thanh toán":
      return "magenta";
    default:
      return "default";
  }
};

export const OrderEdit = () => {
  const { formProps, saveButtonProps, queryResult } = useForm({
    resource: "orders",
    action: "edit",
  });

  const order = queryResult?.data?.data;

  // Call API user
  const userId = order?.user?._id;
  const { data: userData } = useOne({
    resource: "users",
    id: userId,
    queryOptions: { enabled: !!userId },
  });
  const userInfo = userData?.data;

  // Map receiver sang user nếu user không có name/phone/address
  const initialValues = {
    ...order,
    user: {
      ...order?.user,
      name: order?.user?.name || order?.receiver?.name || "",
      phone: order?.user?.phone || order?.receiver?.phone || "",
      address: order?.user?.address || order?.receiver?.address || "",
    },
  };

  return (
    <Edit saveButtonProps={saveButtonProps} title="Chỉnh sửa đơn hàng">
      <Form {...formProps} layout="vertical" initialValues={initialValues}>
        <Row gutter={24}>
          {/* Thông tin người đặt */}
          <Col span={12}>
            <Card title="Thông tin người đặt">
              <div style={{ marginLeft: 16 }}>
                <div style={{ marginBottom: 8 }}>
                  <strong>Họ tên:</strong>
                  <div>{[userInfo?.first_name, userInfo?.name].filter(Boolean).join(" ") || "--"}</div>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <strong>Email:</strong>
                  <div>{userInfo?.email || order?.user?.email || "--"}</div>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <strong>Số điện thoại:</strong>
                  <div>{userInfo?.phone || order?.user?.phone || "--"}</div>
                </div>
               
              </div>
            </Card>
          </Col>

          {/* Thông tin người nhận (có thể sửa) */}
          <Col span={12}>
            <Card title="Thông tin người nhận (có thể sửa)">
              <Form.Item
                label="Tên khách hàng"
                name={["receiver", "name"]}
                rules={[{ required: true, message: "Vui lòng nhập tên khách hàng" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Số điện thoại"
                name={["receiver", "phone"]}
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
                label="Địa chỉ"
                name={["receiver", "address"]}
                rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
              >
                <Input
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                />
              </Form.Item>
            </Card>
          </Col>
        </Row>

        {/* Thông tin đơn hàng */}
        <Card style={{ marginTop: 24 }} title="Thông tin đơn hàng">
          <Row gutter={24}>
            <Col span={8}>
              <div style={{ marginBottom: 16 }}>
                <span style={{ fontWeight: 600, color: "#1677ff" }}>Mã đơn hàng</span>
                <br />
                <Text strong>{order?.orderId || "--"}</Text>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ marginBottom: 16 }}>
                <span style={{ fontWeight: 600, color: "#1677ff" }}>Tổng tiền</span>
                <br />
                <Text strong>
                  {order?.finalAmount?.toLocaleString("vi-VN") + "đ" || "--"}
                </Text>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ marginBottom: 16 }}>
                <span style={{ fontWeight: 600 }}>Phương thức thanh toán</span>
                <br />
                <Text>
                  {order?.paymentMethod === "COD"
                    ? "Thanh toán khi nhận hàng"
                    : order?.paymentMethod || "--"}
                </Text>
              </div>
            </Col>
          </Row>
          <Form.Item label="Sản phẩm">
            <List
              dataSource={order?.items || []}
              renderItem={(item: any) => (
                <List.Item>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <img
                      src={item.productVariantId?.images?.main?.url}
                      alt={item.productName}
                      style={{
                        width: 60,
                        height: 60,
                        objectFit: "cover",
                        borderRadius: 6,
                        border: "1px solid #eee",
                      }}
                    />
                    <div>
                      <div>
                        <Text strong>{item.productName}</Text>
                      </div>
                      <div>
                        <span>
                          Size: <b>{item.size}</b> | SL: <b>{item.quantity}</b> | Giá:{" "}
                          <b>{item.price?.toLocaleString("vi-VN")}đ</b>
                        </span>
                      </div>
                      <div>
                        <span>
                          Màu:{" "}
                          <Tag
                            color="default"
                            style={{
                              background: item.productVariantId?.color?.actualColor,
                              color: "#000",
                              border: "none",
                            }}
                          >
                            {item.productVariantId?.color?.colorName || "--"}
                          </Tag>
                        </span>
                      </div>
                    </div>
                  </div>
                </List.Item>
              )}
              locale={{ emptyText: "Không có sản phẩm" }}
            />
          </Form.Item>
        </Card>

        {/* Trạng thái đơn hàng */}
        <Form.Item
          label="Trạng thái đơn hàng"
          name="status"
          style={{ marginTop: 24 }}
          rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
        >
          <Select>
            {[
              "Chờ xác nhận",
              "Đã xác nhận",
              "Đang giao hàng",
              "Giao hàng thành công",
              "Giao hàng thất bại",
              "Đã thanh toán",
              "Người mua huỷ",
              "Người bán huỷ",
              "Chờ thanh toán",
              "Huỷ do quá thời gian thanh toán",
            ].map((status) => (
              <Select.Option key={status} value={status}>
                <Tag color={getStatusColor(status)} style={{ marginRight: 8 }}>
                  ●
                </Tag>
                {status}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Edit>
  );
};


