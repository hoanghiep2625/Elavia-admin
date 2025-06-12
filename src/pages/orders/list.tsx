import React, { useState } from "react";
import { List, DateField, ShowButton, EditButton } from "@refinedev/antd";
import { Table, Tag, Input, Select, Button } from "antd";
import { useCustom } from "@refinedev/core";

const getStatusColor = (status: string) => {
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
      console.warn("Trạng thái không xác định:", status);
      return "default";
  }
};

export const OrderList = () => {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const [sorter, setSorter] = useState<{ field?: string; order?: string }>({});
  const [pendingOrderId, setPendingOrderId] = useState("");
  const [pendingUser, setPendingUser] = useState("");
  const [pendingPhone, setPendingPhone] = useState("");
  const [pendingAddress, setPendingAddress] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");

  const [searchOrderId, setSearchOrderId] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [searchAddress, setSearchAddress] = useState("");
  const [searchEmail, setSearchEmail] = useState("");

  const query: Record<string, any> = {
    _page: pagination.current,
    _limit: pagination.pageSize,
    _sort: sorter.field,
    _order: sorter.order,
  };
  if (searchOrderId) query._orderId = searchOrderId;
  if (searchUser) query._user = searchUser;
  if (searchPhone) query._phone = searchPhone;
  if (searchAddress) query._address = searchAddress;
  if (searchEmail) query._email = searchEmail;

  const { data, isLoading } = useCustom({
    url: "/admin/orders",
    method: "get",
    config: {
      query,
    },
  });

  const tableData = data?.data?.data || [];
  const total = data?.data?.total || 0;

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

  const handleSearch = () => {
    setSearchOrderId(pendingOrderId);
    setSearchUser(pendingUser);
    setSearchPhone(pendingPhone);
    setSearchAddress(pendingAddress);
    setSearchEmail(pendingEmail);
    setPagination({ ...pagination, current: 1 });
  };

  return (
    <List>
      <div style={{ marginBottom: 16, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <Input
          placeholder="Mã đơn hàng"
          allowClear
          value={pendingOrderId}
          onChange={(e) => setPendingOrderId(e.target.value)}
          style={{ width: 160 }}
        />
        <Input
          placeholder="Tên khách hàng"
          allowClear
          value={pendingUser}
          onChange={(e) => setPendingUser(e.target.value)}
          style={{ width: 160 }}
        />
        <Input
          placeholder="Số điện thoại"
          allowClear
          value={pendingPhone}
          onChange={(e) => setPendingPhone(e.target.value)}
          style={{ width: 160 }}
        />
        <Input
          placeholder="Địa chỉ"
          allowClear
          value={pendingAddress}
          onChange={(e) => setPendingAddress(e.target.value)}
          style={{ width: 160 }}
        />
        <Input
          placeholder="Email"
          allowClear
          value={pendingEmail}
          onChange={(e) => setPendingEmail(e.target.value)}
          style={{ width: 160 }}
        />
        <Button type="primary" onClick={handleSearch}>
          Tìm kiếm
        </Button>
      </div>
      <Table
        rowKey="_id"
        dataSource={Array.isArray(tableData) ? tableData : []}
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
          render={(_, __, index) =>
            (pagination.current - 1) * pagination.pageSize + index + 1
          }
        />
        <Table.Column title="Mã đơn hàng" dataIndex="orderId" sorter={true} />
        <Table.Column
          title="Khách hàng"
          dataIndex={["user", "name"]}
          sorter={true}
          render={(name: string) => name || "Không có"}
        />
        <Table.Column
          title="SĐT"
          dataIndex={["user", "phone"]}
          sorter={true}
          render={(phone: string) => phone || "Không có"}
        />
        <Table.Column
          title="Email"
          dataIndex={["user", "email"]}
          sorter={true}
          render={(email: string) => email || "Không có"}
        />
        <Table.Column
          title="Địa chỉ giao hàng"
          sorter={true}
          render={(_, record: any) => record?.user?.address || "Không có"}
        />
        <Table.Column
          title="Ngày đặt"
          dataIndex="createdAt"
          sorter={true}
          render={(value: string) => (
            <DateField value={value} format="DD/MM/YYYY HH:mm" />
          )}
        />
        <Table.Column
          title="Tổng tiền"
          dataIndex="totalAmount"
          sorter={true}
          render={(amount: number) => amount?.toLocaleString("vi-VN") + "đ"}
        />
        <Table.Column
          title="Phương thức TT"
          dataIndex="paymentMethod"
          sorter={true}
          render={(method: string) => {
            switch (method) {
              case "COD":
                return "COD";
              case "MoMo":
                return "MoMo";
              case "zalopay":
                return "ZaloPay";
              default:
                return method || "Không xác định";
            }
          }}
        />
        <Table.Column
          title="Trạng thái"
          dataIndex="status"
          sorter={true}
          render={(status: string) => (
            <Tag color={getStatusColor(status || "default")}>
              {status || "Không xác định"}
            </Tag>
          )}
        />
        <Table.Column
          title="Thao tác"
          render={(_, record: any) => (
            <span style={{ display: "flex", gap: 8 }}>
              <ShowButton hideText size="small" recordItemId={record._id} />
               <EditButton hideText size="small" recordItemId={record._id} />
            </span>
          )}
        />
      </Table>
    </List>
  );
};
