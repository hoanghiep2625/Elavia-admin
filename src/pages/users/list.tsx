import { EditButton, List, ShowButton, useTable } from "@refinedev/antd";
import type { BaseRecord } from "@refinedev/core";
import { Space, Table, Tag } from "antd";

export const UserList = () => {
  const { tableProps } = useTable({
    resource: "users",
    syncWithLocation: true,
  });

  const data = (tableProps.dataSource as any) ?? [];

  // Lấy SĐT mặc định từ shipping_addresses
  const getDefaultPhone = (record: any) => {
    const defaultAddress = record?.shipping_addresses?.find(
      (addr: any) => addr.isDefault
    );
    return defaultAddress?.phone || record.phone || "Không có";
  };

  return (
    <List>
      <Table
        {...tableProps}
        dataSource={Array.isArray(data) ? data : []}
        rowKey="_id"
      >
        <Table.Column dataIndex="email" title="Email" />

        <Table.Column
          title="SĐT"
          render={(_, record: any) => getDefaultPhone(record)}
        />

        <Table.Column
          dataIndex="role"
          title="Vai trò"
          render={(role: string) => {
            switch (role) {
              case "1":
                return <Tag color="blue">Khách hàng</Tag>;
              case "2":
                return <Tag color="green">Người bán</Tag>;
              case "3":
                return <Tag color="red">Quản trị viên</Tag>;
              default:
                return <Tag color="default">Không xác định</Tag>;
            }
          }}
        />
        <Table.Column
          title="Hành động"
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record._id} />
              <ShowButton hideText size="small" recordItemId={record._id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
