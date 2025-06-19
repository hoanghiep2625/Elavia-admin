import { Show } from "@refinedev/antd";
import { Descriptions, Tag, Typography, Table } from "antd";
import { useShow } from "@refinedev/core";

const { Text } = Typography;

export const UserShow = () => {
  const { queryResult } = useShow();
  const { data, isLoading } = queryResult;
  const record = data?.data;
  const addresses = record?.shipping_addresses || [];

  return (
    <Show isLoading={isLoading}>
      <Descriptions
        title="Thông tin người dùng"
        bordered
        column={1}
        layout="horizontal"
        labelStyle={{ fontWeight: 600, width: 160 }}
        contentStyle={{ fontWeight: 400 }}
        style={{ background: "#fff", padding: 24, borderRadius: 12 }}
      >
        <Descriptions.Item label="Họ và tên">{record?.name}</Descriptions.Item>
        <Descriptions.Item label="Email">{record?.email}</Descriptions.Item>
        <Descriptions.Item label="Số điện thoại">{record?.phone}</Descriptions.Item>
        <Descriptions.Item label="Ngày sinh">{record?.date}</Descriptions.Item>
        <Descriptions.Item label="Giới tính">
          {record?.sex === "1" ? "Nam" : "Nữ"}
        </Descriptions.Item>
        <Descriptions.Item label="Vai trò">
          {record?.role === "3" ? (
            <Tag color="red">Quản trị viên</Tag>
          ) : record?.role === "2" ? (
            <Tag color="green">Người bán</Tag>
          ) : (
            <Tag color="blue">Khách hàng</Tag>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Xác thực">
          {record?.verify === 1 ? (
            <Tag color="green">Đã xác thực</Tag>
          ) : (
            <Tag color="orange">Chưa xác thực</Tag>
          )}
        </Descriptions.Item>

       <Descriptions.Item label="Địa chỉ giao hàng">
  {addresses.length === 0 ? (
    <Text type="secondary">Không có địa chỉ</Text>
  ) : (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {addresses.map((addr: any, index: number) => (
        <div
          key={addr._id || index}
          style={{
            padding: 12,
            border: "1px solid #f0f0f0",
            borderRadius: 8,
            backgroundColor: "#fafafa",
          }}
        >
          <Text strong>
            {index + 1}. {addr.receiver_name}
          </Text>
          <br />
          SĐT: {addr.phone}
          <br />
          ĐC: {addr.address}, {addr.commune?.name}, {addr.district?.name}, {addr.city?.name}
          <br />
          {addr.isDefault && <Tag color="green">Mặc định</Tag>}
        </div>
      ))}
    </div>
  )}
</Descriptions.Item>
      </Descriptions>
    </Show>
  );
};


