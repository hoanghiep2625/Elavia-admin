import { Show } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography, Descriptions, Tag, Image } from "antd";

const getStatusColor = (status: string) => {
  switch (status) {
    case "Chờ xác nhận":
      return "orange";
    case "Đã xác nhận":
      return "blue";
    case "Người bán huỷ":
      return "red";
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
      console.warn("Trạng thái không xác định:", status);
      return "default";
  }
};

export const OrderShow = () => {
  const { queryResult } = useShow({
    resource: "orders",
  });

  const { data, isLoading } = queryResult;
  const record = data?.data?.orders?.[0];
  console.log("🚀 ~ OrderShow ~ record:", record);

  return (
    <Show isLoading={isLoading}>
      <Descriptions title="Thông tin đơn hàng" bordered column={1}>
        <Descriptions.Item label="Mã đơn hàng">
          {record?.orderId}
        </Descriptions.Item>
        <Descriptions.Item label="Tên khách hàng">
          {record?.user?.name}
        </Descriptions.Item>
        <Descriptions.Item label="Email">
          {record?.user?.email}
        </Descriptions.Item>
        <Descriptions.Item label="Số điện thoại">
          {record?.user?.phone}
        </Descriptions.Item>
        <Descriptions.Item label="Địa chỉ">
          {record?.user?.address}
        </Descriptions.Item>
        <Descriptions.Item label="Phương thức thanh toán">
          {record?.paymentMethod}
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái đơn hàng">
          <Tag color={getStatusColor(record?.status || "default")}>
            {record?.status || "Không xác định"}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Tổng tiền">
          {record?.totalAmount?.toLocaleString()}đ
        </Descriptions.Item>
        <Descriptions.Item label="Ngày tạo">
          {new Date(record?.createdAt).toLocaleString()}
        </Descriptions.Item>
        <Descriptions.Item label="Danh sách sản phẩm">
          {record?.items?.map((item: any, index: number) => (
            <div key={index} style={{ marginBottom: 16 }}>
              <Typography.Text strong>{item.productName}</Typography.Text>
              <br />
              Kích cỡ: {item.size} | SL: {item.quantity}
              <br />
              Giá: {item.price?.toLocaleString()}đ
              <br />
              <Image
                width={100}
                src={item.productVariantId?.images?.main?.url}
                alt="Ảnh sản phẩm"
              />
            </div>
          ))}
        </Descriptions.Item>
      </Descriptions>
    </Show>
  );
};
