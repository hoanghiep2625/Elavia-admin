import { Show } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { useParams } from "react-router-dom";
import {
  Typography,
  Card,
  Descriptions,
  Tag,
  Divider,
  Image,
  Row,
  Col,
} from "antd";
import React, { useEffect, useState } from "react";
import axios from "axios";

const { Text, Title } = Typography;

const getStatusColor = (status: any) => {
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

export const OrderShow = () => {
  const { id } = useParams();
  const { queryResult } = useShow({ resource: "orders", id });
  const { data, isLoading } = queryResult;
  const record = data?.data;

  const { queryResult: userQuery } = useShow({
    resource: "/users",
    id: record?.user?._id,
  });
  const userInfo = userQuery?.data?.data;

  const formatCurrency = (amount: number) =>
    `${amount?.toLocaleString()}đ`;

  return (
    <Show isLoading={isLoading}>
      <Row gutter={24}>
        {/* Danh sách sản phẩm */}
        <Col span={14}>
          <Card title="Tất cả sản phẩm">
            {record?.items?.map((item: any, index: number) => (
              <Card
                key={index}
                type="inner"
                style={{ marginBottom: 16 }}
                bodyStyle={{ padding: 16 }}
              >
                <Row align="middle" gutter={16}>
                  <Col>
                    <Image
                      width={90}
                      src={item.productVariantId?.images?.main?.url}
                      alt={item.productName}
                      style={{ borderRadius: 8, border: "1px solid #eee" }}
                    />
                  </Col>
                  <Col flex="auto">
                    <div style={{ marginBottom: 4 }}>
                      <Text strong>{item.productName}</Text>
                    </div>
                    <div style={{ marginBottom: 4 }}>
                      <span>
                        <b>Size:</b> {item.size} &nbsp;|&nbsp;
                        <b>SL:</b> {item.quantity} &nbsp;|&nbsp;
                        <b>Giá:</b> {formatCurrency(item.price)}
                      </span>
                    </div>
                    <div>
                      <span>
                        <b>Màu:</b>{" "}
                        <Tag
                          style={{
                            background: item.productVariantId?.color?.actualColor,
                            color: "#333",
                            border: "none",
                            minWidth: 60,
                            display: "inline-block",
                          }}
                        >
                          {item.productVariantId?.color?.colorName || "--"}
                        </Tag>
                      </span>
                    </div>
                  </Col>
                </Row>
              </Card>
            ))}
          </Card>

          <Card title="Tổng giỏ hàng" style={{ marginTop: 24 }}>
            <Descriptions column={1}>
              <Descriptions.Item label="Tạm tính">
                {formatCurrency(record?.totalPrice)}
              </Descriptions.Item>
              <Descriptions.Item label="Phí vận chuyển">
                {formatCurrency(record?.shippingFee)}
              </Descriptions.Item>
              <Descriptions.Item label="Giảm giá">
                - {formatCurrency(record?.discountAmount)}
              </Descriptions.Item>
              <Descriptions.Item label="Thuế (VAT)">
                10%
              </Descriptions.Item>
              <Descriptions.Item label="Tổng cộng">
                <Text strong style={{ color: "orange" }}>
                  {formatCurrency(record?.finalAmount)}
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Thông tin đơn hàng */}
        <Col span={10}>
          <Card title="Tóm tắt">
            <Descriptions column={1}>
              <Descriptions.Item label="Mã đơn">
                {record?.orderId}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={getStatusColor(record?.status)}>
                  {record?.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày đặt">
                {record?.createdAt &&
                  new Date(record.createdAt).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng cộng">
                <Text strong>{formatCurrency(record?.finalAmount)}</Text>
              </Descriptions.Item>
              {record?.customerNote && (
                <Descriptions.Item label="Ghi chú khách hàng">
                  {record.customerNote}
                </Descriptions.Item>
              )}
              {record?.adminNote && (
                <Descriptions.Item label="Ghi chú quản trị">
                  {record.adminNote}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* Thông tin người nhận */}
          <Card title="Thông tin người nhận" style={{ marginTop: 24 }}>
            <Descriptions column={1}>
              <Descriptions.Item label="Họ tên">
                {record?.receiver?.name || "--"}
              </Descriptions.Item>
              <Descriptions.Item label="SĐT">
                {record?.receiver?.phone || "--"}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">
                {record?.receiver
                  ? `${record.receiver.address}, ${record.receiver.communeName || record.receiver.wardName || ""}, ${record.receiver.districtName}, ${record.receiver.cityName}`
                  : "--"}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Thông tin người đặt hàng */}
          <Card title="Thông tin người đặt hàng" style={{ marginTop: 24 }}>
            <Descriptions column={1}>
              <Descriptions.Item label="Họ tên">
                {userInfo
                  ? `${userInfo.first_name ? userInfo.first_name + " " : ""}${userInfo.name || ""}`.trim() || "--"
                  : "--"}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {userInfo?.email || "--"}
              </Descriptions.Item>
              <Descriptions.Item label="SĐT">
                {userInfo?.phone || "--"}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Phương thức thanh toán */}
          <Card title="Phương thức thanh toán" style={{ marginTop: 24 }}>
            <Text>
              {record?.paymentMethod === "COD"
                ? "Thanh toán khi nhận hàng"
                : record?.paymentMethod || "--"}
            </Text>
          </Card>

          {/* Phương thức vận chuyển */}
          <Card title="Phương thức vận chuyển" style={{ marginTop: 24 }}>
            <Text>Chuyển phát nhanh</Text>
          </Card>
        </Col>
      </Row>
    </Show>
  );
};



