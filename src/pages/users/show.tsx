import { Show } from "@refinedev/antd";
import { Descriptions, Tag, Typography } from "antd";
import { useShow } from "@refinedev/core";

export const UserShow = () => {
  const { queryResult } = useShow();
  const { data, isLoading } = queryResult;
  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      <Descriptions
        title="Thông tin người dùng"
        bordered
        column={1}
        layout="vertical"
      >
        <Descriptions.Item label="Họ và tên">{record?.name}</Descriptions.Item>

        <Descriptions.Item label="Email">{record?.email}</Descriptions.Item>

        <Descriptions.Item label="Số điện thoại">
          {record?.phone}
        </Descriptions.Item>

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

        <Descriptions.Item label="Địa chỉ mặc định">
          {record?.shipping_addresses?.find((a: any) => a.isDefault)?.address},{" "}
          {
            record?.shipping_addresses?.find((a: any) => a.isDefault)?.commune
              ?.name
          }
          ,{" "}
          {
            record?.shipping_addresses?.find((a: any) => a.isDefault)?.district
              ?.name
          }
          ,{" "}
          {
            record?.shipping_addresses?.find((a: any) => a.isDefault)?.city
              ?.name
          }
        </Descriptions.Item>
      </Descriptions>
    </Show>
  );
};
