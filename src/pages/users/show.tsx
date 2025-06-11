import { Show } from "@refinedev/antd";
import { Descriptions, Tag, Table } from "antd";
import { useShow } from "@refinedev/core";

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

        <Descriptions.Item label="Địa chỉ giao hàng">
          <Table
            dataSource={addresses}
            rowKey={(addr) => addr._id}
            pagination={false}
            bordered
            size="small"
          >
            <Table.Column title="Người nhận" dataIndex="receiver_name" />
            <Table.Column title="Số điện thoại" dataIndex="phone" />
            <Table.Column
              title="Địa chỉ"
              render={(_, addr: any) =>
                `${addr.address}, ${addr.commune?.name || ""}, ${addr.district?.name || ""}, ${addr.city?.name || ""}`
              }
            />
            <Table.Column
              title="Mặc định"
              render={(_, addr: any) =>
                addr.isDefault ? (
                  <Tag color="green">Mặc định</Tag>
                ) : (
                  "-"
                )
              }
            />
          </Table>
        </Descriptions.Item>
      </Descriptions>
    </Show>
  );
};
