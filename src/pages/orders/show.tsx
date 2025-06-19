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
                title={item.productName}
              >
                <p>Số lượng: {item.quantity}</p>
                <p>Kích cỡ: {item.size}</p>
                <p>Giá: {formatCurrency(item.price)}</p>
                <Image
                  width={100}
                  src={item.productVariantId?.images?.main?.url}
                  alt="Ảnh sản phẩm"
                />
              </Card>
            ))}
          </Card>

          <Card title="Tổng giỏ hàng" style={{ marginTop: 24 }}>
            <Descriptions column={1}>
              <Descriptions.Item label="Tạm tính">
                {formatCurrency(record?.totalAmount)}
              </Descriptions.Item>
              <Descriptions.Item label="Phí vận chuyển">
                0đ
              </Descriptions.Item>
              <Descriptions.Item label="Giảm giá">
                - 0đ
              </Descriptions.Item>
              <Descriptions.Item label="Thuế (VAT)">
                10%
              </Descriptions.Item>
              <Descriptions.Item label="Tổng cộng">
                <Text strong style={{ color: "orange" }}>
                  {formatCurrency(record?.totalAmount)}
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
                <Text strong>{formatCurrency(record?.totalAmount)}</Text>
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

          {/* Địa chỉ giao hàng */}
          <Card title="Địa chỉ giao hàng" style={{ marginTop: 24 }}>
            <Text>{record?.user?.address || "--"}</Text>
          </Card>

          {/* Thông tin người đặt hàng */}
          <Card title="Thông tin người đặt hàng" style={{ marginTop: 24 }}>
            <Descriptions column={1}>
              <Descriptions.Item label="Họ tên">
                {record?.user?.name || "--"}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {record?.user?.email || "--"}
              </Descriptions.Item>
              <Descriptions.Item label="SĐT">
                {record?.user?.phone || "--"}
              </Descriptions.Item>
            </Descriptions>
            <Divider />
            <Card title="Phương thức thanh toán">
              <Text>{record?.paymentMethod || "--"}</Text>
              <Text>{record?.cashOnDelivery || "--"}</Text>
            </Card>
            <Card title="Phương thức vận chuyển" style={{ marginTop: 24 }}>
              <Text>{record?.shippingMethod || "--"}</Text>
              <Text>{record?.standardDelivery || "--"}</Text>
            </Card>
          </Card>
        </Col>
      </Row>
    </Show>
  );
};

