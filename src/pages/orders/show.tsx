import { Show } from "@refinedev/antd";
import { useShow, useCustom } from "@refinedev/core";
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
  Button,
  Modal,
  Timeline,
  Space,
  message,
} from "antd";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { HistoryOutlined } from "@ant-design/icons";

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
    case "Đã nhận hàng":
      return "lime";
    case "Giao hàng thất bại":
      return "volcano";
    case "Chờ thanh toán":
      return "gold";
    case "Đã thanh toán":
      return "purple";
    case "Thanh toán khi nhận hàng":
      return "geekblue";
    case "Huỷ do quá thời gian thanh toán":
      return "magenta";
    case "Giao dịch bị từ chối do nhà phát hành":
      return "red";
    case "Khiếu nại":
      return "orange";
    case "Đang xử lý khiếu nại":
      return "processing";
    case "Khiếu nại được giải quyết":
      return "success";
    case "Khiếu nại bị từ chối":
      return "error";
    default:
      return "default";
  }
};

export const OrderShow = () => {
  const { id } = useParams();
  const { queryResult } = useShow({ resource: "orders", id });
  const { data, isLoading } = queryResult;
  const record = data?.data;

  // State cho lịch sử trạng thái
  const [showHistory, setShowHistory] = useState(false);
  const [statusHistory, setStatusHistory] = useState([]);

  // Lấy lịch sử trạng thái
  const { refetch: refetchHistory } = useCustom({
    url: `/admin/orders/${record?.orderId}/status-history`,
    method: "get",
    queryOptions: {
      enabled: false, // Chỉ gọi khi cần
      onSuccess: (data) => {
        if (data?.data?.data?.statusHistory) {
          setStatusHistory(data.data.data.statusHistory);
        }
      },
    },
  });

  // Hàm mở modal lịch sử
  const showOrderHistory = async () => {
    if (!record?.orderId) {
      message.error("Không tìm thấy mã đơn hàng");
      return;
    }
    setShowHistory(true);
    try {
      await refetchHistory();
    } catch (error) {
      message.error("Không thể tải lịch sử trạng thái");
    }
  };

  const { queryResult: userQuery } = useShow({
    resource: "/users",
    id: record?.user?._id,
  });
  const userInfo = userQuery?.data?.data;

  const formatCurrency = (amount: number) => `${amount?.toLocaleString()}đ`;

  return (
    <Show isLoading={isLoading}>
      <Row gutter={24}>
        {/* Danh sách sản phẩm */}
        <Col span={14}>
          <Card title="Tất cả sản phẩm">
            {record?.items?.map((item: any, index: number) => {
              // Lấy dữ liệu từ snapshot productInfo trước, fallback về productVariantId
              const productData = item.productInfo || item.productVariantId;
              const productName =
                item.productInfo?.productName ||
                item.productInfo?.product?.name ||
                item.productName ||
                "Không có tên";
              const productImage = productData?.images?.main?.url;
              const productColor = productData?.color;

              // Tìm giá theo size từ snapshot
              const sizeData = productData?.sizes?.find(
                (s: any) => s.size === item.size
              );
              const price = sizeData?.price || item.price || 0;

              return (
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
                        src={productImage}
                        alt={productName}
                        style={{ borderRadius: 8, border: "1px solid #eee" }}
                      />
                    </Col>
                    <Col flex="auto">
                      <div style={{ marginBottom: 4 }}>
                        <Text strong>{productName}</Text>
                      </div>
                      <div style={{ marginBottom: 4 }}>
                        <span>
                          <b>Size:</b> {item.size} &nbsp;|&nbsp;
                          <b>SL:</b> {item.quantity} &nbsp;|&nbsp;
                          <b>Giá:</b> {formatCurrency(price)}
                        </span>
                      </div>
                      <div>
                        <span>
                          <b>Màu:</b>{" "}
                          <Tag
                            style={{
                              background:
                                productColor?.actualColor || "#f0f0f0",
                              color: "#333",
                              border: "none",
                              minWidth: 60,
                              display: "inline-block",
                            }}
                          >
                            {productColor?.colorName || "--"}
                          </Tag>
                        </span>
                      </div>
                    </Col>
                  </Row>
                </Card>
              );
            })}
          </Card>

          <Card title="Tổng giỏ hàng" style={{ marginTop: 24 }}>
            <Descriptions column={1}>
              <Descriptions.Item label="Tạm tính">
                {formatCurrency(record?.totalPrice)}
              </Descriptions.Item>
              <Descriptions.Item label="Phí vận chuyển">
                {formatCurrency(record?.shippingFee)}
              </Descriptions.Item>
              <Descriptions.Item label="Mã voucher áp dụng">
                {record?.voucher?.code || record?.voucher || "--"}
              </Descriptions.Item>
              <Descriptions.Item label="Giảm giá">
                - {formatCurrency(record?.discountAmount)}
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
              <Descriptions.Item label="TT Thanh toán">
                <Tag color={getStatusColor(record?.paymentStatus)}>
                  {record?.paymentStatus}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="TT Giao hàng">
                <Tag color={getStatusColor(record?.shippingStatus)}>
                  {record?.shippingStatus}
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

          {/* Thông tin khiếu nại (nếu có) */}
          {record?.complaint && (
            <Card title="Thông tin khiếu nại" style={{ marginTop: 24 }}>
              <Descriptions column={1}>
                <Descriptions.Item label="Lý do">
                  {record.complaint.reason}
                </Descriptions.Item>
                <Descriptions.Item label="Mô tả">
                  {record.complaint.description}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag
                    color={
                      record.complaint.status === "Được chấp nhận"
                        ? "green"
                        : record.complaint.status === "Bị từ chối"
                        ? "red"
                        : record.complaint.status === "Đang xử lý"
                        ? "blue"
                        : "orange"
                    }
                  >
                    {record.complaint.status}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">
                  {record.complaint.createdAt &&
                    new Date(record.complaint.createdAt).toLocaleString()}
                </Descriptions.Item>
                {record.complaint.adminNote && (
                  <Descriptions.Item label="Ghi chú admin">
                    {record.complaint.adminNote}
                  </Descriptions.Item>
                )}
                {record.complaint.resolution && (
                  <Descriptions.Item label="Cách giải quyết">
                    {record.complaint.resolution}
                  </Descriptions.Item>
                )}
                {record.complaint.processedAt && (
                  <Descriptions.Item label="Ngày xử lý">
                    {new Date(record.complaint.processedAt).toLocaleString()}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          )}

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
                  ? `${record.receiver.address}, ${
                      record.receiver.communeName ||
                      record.receiver.wardName ||
                      ""
                    }, ${record.receiver.districtName}, ${
                      record.receiver.cityName
                    }`
                  : "--"}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Thông tin người đặt hàng */}
          <Card title="Thông tin người đặt hàng" style={{ marginTop: 24 }}>
            <Descriptions column={1}>
              <Descriptions.Item label="Họ tên">
                {userInfo
                  ? `${userInfo.first_name ? userInfo.first_name + " " : ""}${
                      userInfo.name || ""
                    }`.trim() || "--"
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

          {/* Lịch sử trạng thái */}
          <Card title="Lịch sử trạng thái" style={{ marginTop: 24 }}>
            <Button
              type="primary"
              icon={<HistoryOutlined />}
              onClick={showOrderHistory}
            >
              Xem lịch sử trạng thái đơn hàng
            </Button>
          </Card>
        </Col>
      </Row>

      {/* Modal hiển thị lịch sử trạng thái */}
      <Modal
        title={
          <Space>
            <HistoryOutlined />
            Lịch sử trạng thái đơn hàng: {record?.orderId}
          </Space>
        }
        open={showHistory}
        onCancel={() => setShowHistory(false)}
        footer={[
          <Button key="close" onClick={() => setShowHistory(false)}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {statusHistory.length > 0 ? (
          <Timeline
            mode="left"
            items={statusHistory.map((history: any, index: number) => ({
              color: getStatusColor(history.to),
              label: (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {new Date(history.updatedAt).toLocaleString("vi-VN")}
                </Text>
              ),
              children: (
                <Card size="small" style={{ marginBottom: 8 }}>
                  <div>
                    <Text strong>
                      {history.type === "payment" ? "Thanh toán" : "Giao hàng"}:
                    </Text>
                    <Tag
                      color={getStatusColor(history.from)}
                      style={{ margin: "0 8px" }}
                    >
                      {history.from}
                    </Tag>
                    →
                    <Tag
                      color={getStatusColor(history.to)}
                      style={{ margin: "0 8px" }}
                    >
                      {history.to}
                    </Tag>
                  </div>
                  {history.note && (
                    <div style={{ marginTop: 4 }}>
                      <Text type="secondary">Ghi chú: {history.note}</Text>
                    </div>
                  )}
                  {history.reason && (
                    <div style={{ marginTop: 4 }}>
                      <Text type="secondary">Lý do: {history.reason}</Text>
                    </div>
                  )}
                  <div style={{ marginTop: 4 }}>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {history.isAutomatic ? "🤖 Tự động" : "👤 Thủ công"}
                      {history.updatedBy &&
                        ` • Bởi: ${history.updatedBy.email || "Hệ thống"}`}
                    </Text>
                  </div>
                </Card>
              ),
            }))}
          />
        ) : (
          <div style={{ textAlign: "center", padding: 40 }}>
            <Text type="secondary">Chưa có lịch sử thay đổi trạng thái</Text>
          </div>
        )}
      </Modal>
    </Show>
  );
};
