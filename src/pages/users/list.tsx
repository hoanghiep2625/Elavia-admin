import { EditButton, List, ShowButton } from "@refinedev/antd";
import type { BaseRecord } from "@refinedev/core";
import { Input, Space, Table, Button, Select } from "antd";
import { useState } from "react";
import { useCustom, useUpdate } from "@refinedev/core";

export const UserList = () => {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const [sorter, setSorter] = useState<{ field?: string; order?: string }>({});
  // Tách input và search state
  const [pendingEmail, setPendingEmail] = useState("");
  const [pendingPhone, setPendingPhone] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [searchPhone, setSearchPhone] = useState("");

  const { mutate: updateUser } = useUpdate({
    resource: "users",
    successNotification: {
      message: "Cập nhật vai trò thành công",
      type: "success",
    },
    errorNotification: {
      message: "Lỗi khi cập nhật vai trò",
      type: "error",
    },
  });

  const { data, isLoading, refetch } = useCustom({
    url: "/admin/users",
    method: "get",
    config: {
      query: {
        _page: pagination.current,
        _limit: pagination.pageSize,
        _sort: sorter.field,
        _order: sorter.order,
        ...(searchEmail ? { _email: searchEmail } : {}),
        ...(searchPhone ? { _phone: searchPhone } : {}),
      },
    },
  });

  const tableData = data?.data?.data ?? [];
  const total = data?.data?.total ?? 0;

  const handleTableChange = (
    paginationConfig: any,
    _: any,
    sorterConfig: any
  ) => {
    setPagination({
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
    });
    if (sorterConfig && sorterConfig.field) {
      setSorter({
        field: Array.isArray(sorterConfig.field)
          ? sorterConfig.field.join(".")
          : sorterConfig.field,
        order: sorterConfig.order === "ascend" ? "asc" : "desc",
      });
    } else {
      setSorter({});
    }
  };

  // Khi bấm nút tìm kiếm
  const handleSearch = () => {
    setSearchEmail(pendingEmail);
    setSearchPhone(pendingPhone);
    setPagination({ ...pagination, current: 1 });
  };

  // Handle thay đổi vai trò
  const handleRoleChange = (userId: string, newRole: string) => {
    updateUser(
      {
        id: userId,
        values: { role: newRole },
      },
      {
        onSuccess: () => {
          refetch();
        },
      }
    );
  };

  return (
    <List canCreate>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Input
          placeholder="Tìm kiếm email"
          allowClear
          value={pendingEmail}
          onChange={(e) => setPendingEmail(e.target.value)}
          style={{ width: 220 }}
        />
        <Input
          placeholder="Tìm kiếm SĐT"
          allowClear
          value={pendingPhone}
          onChange={(e) => setPendingPhone(e.target.value)}
          style={{ width: 220 }}
        />
        <Button type="primary" onClick={handleSearch}>
          Tìm kiếm
        </Button>
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
          title="STT"
          key="stt"
          align="center"
          width={60}
          render={(_, __, index) =>
            (pagination.current - 1) * pagination.pageSize + index + 1
          }
        />
        <Table.Column dataIndex="email" title="Email" sorter={true} />

        <Table.Column title="SĐT" sorter={true} dataIndex={"phone"} />

        <Table.Column
          dataIndex="role"
          title="Vai trò"
          render={(role: string, record: BaseRecord) => {
            return (
              <Select
                value={role}
                onChange={(newRole) => handleRoleChange(record._id, newRole)}
                style={{
                  width: 140,
                  backgroundColor: role === "3" ? "#fff2f0" : "transparent",
                  borderColor: role === "3" ? "#f5222d" : "#1890ff",
                }}
                options={[
                  {
                    value: "1",
                    label: (
                      <span style={{ color: "#1890ff", fontWeight: "500" }}>
                        Khách hàng
                      </span>
                    ),
                  },
                  {
                    value: "3",
                    label: (
                      <span style={{ color: "#f5222d", fontWeight: "500" }}>
                        Quản trị viên
                      </span>
                    ),
                  },
                ]}
              />
            );
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
