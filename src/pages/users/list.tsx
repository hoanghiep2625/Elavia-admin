import { EditButton, List, ShowButton } from "@refinedev/antd";
import type { BaseRecord } from "@refinedev/core";
import { Input, Space, Table, Tag } from "antd";
import { useState } from "react";
import { useCustom } from "@refinedev/core";

export const UserList = () => {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

   const [sorter, setSorter] = useState<{ field?: string; order?: string }>({});
  const [search, setSearch] = useState("");

 const { data, isLoading } = useCustom({
    url: "/admin/users",
    method: "get",
    config: {
      query: {
        _page: pagination.current,
        _limit: pagination.pageSize,
        _sort: sorter.field,
        _order: sorter.order,
        q: search,
      },
    },
  });

   let tableData = data?.data?.data ?? [];
  const total = data?.data?.total ?? 0;

  // Lấy SĐT mặc định từ shipping_addresses
  const getDefaultPhone = (record: any) => {
    const defaultAddress = record?.shipping_addresses?.find(
      (addr: any) => addr.isDefault
    );
    return defaultAddress?.phone || record.phone || "Không có";
  };

   // Nếu backend không hỗ trợ search, filter phía client
  if (search) {
    tableData = tableData.filter(
      (item: any) =>
        item?.email?.toLowerCase().includes(search.toLowerCase()) ||
        getDefaultPhone(item)?.toLowerCase().includes(search.toLowerCase())
    );
  }

  const handleTableChange = (paginationConfig: any, _: any, sorterConfig: any) => {
    setPagination({
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
    });
    if (sorterConfig && sorterConfig.field) {
      setSorter({
        field: Array.isArray(sorterConfig.field) ? sorterConfig.field.join('.') : sorterConfig.field,
        order: sorterConfig.order === "ascend" ? "asc" : "desc",
      });
    } else {
      setSorter({});
    }
  };


 return (
    <List>
      <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        <Input.Search
          placeholder="Tìm kiếm email hoặc SĐT"
          allowClear
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 320 }}
        />
      </div>
      <Table
        dataSource={Array.isArray(tableData) ? tableData : []}
        rowKey="_id"
        loading={isLoading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} bản ghi`,
        }}
        onChange={handleTableChange}
      >
        <Table.Column
          dataIndex="email"
          title="Email"
          sorter={true}
        />

        <Table.Column
          title="SĐT"
          sorter={true}
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
