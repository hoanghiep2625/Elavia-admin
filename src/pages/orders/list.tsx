import React, { useState } from "react";
import { List, DateField, ShowButton, EditButton } from "@refinedev/antd";
import { Table, Tag, Input, Select, Button, Tooltip, Descriptions } from "antd";
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
  const [pendingEmail, setPendingEmail] = useState("");
  const [pendingStatus, setPendingStatus] = useState("");

  const [searchOrderId, setSearchOrderId] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [searchStatus, setSearchStatus] = useState("");

  const query: Record<string, any> = {
    _page: pagination.current,
    _limit: pagination.pageSize,
    _sort: sorter.field,
    _order: sorter.order,
  };
  if (searchOrderId) query._orderId = searchOrderId;
  if (searchUser) query._user = searchUser;
  if (searchPhone) query._phone = searchPhone;
  if (searchEmail) query._email = searchEmail;
  if (searchStatus) query._status = searchStatus;

  const { data, isLoading } = useCustom({
    url: "/admin/orders",
    method: "get",
    config: {
      query,
    },
  });

  const tableData = data?.data?.data || [];
  const total = data?.data?.total || 0;

  const handleTableChange = (paginationConfig: any, _: any, sorterConfig: any) => {
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
    setSearchEmail(pendingEmail);
    setSearchStatus(pendingStatus);
    setPagination({ ...pagination, current: 1 });
  };

  return (
    <List>
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
          placeholder="Email"
          allowClear
          value={pendingEmail}
          onChange={(e) => setPendingEmail(e.target.value)}
          style={{ width: 160 }}
        />
        <Select
          labelInValue
          value={pendingStatus ? { label: pendingStatus, value: pendingStatus } : { label: "Trạng thái", value: "" }}
          onChange={(val) => {
            if (val.value !== "") setPendingStatus(val.value);
          }}
          style={{ width: 180 }}
          options={[
            { value: "Chờ xác nhận", label: "Chờ xác nhận" },
            { value: "Đã xác nhận", label: "Đã xác nhận" },
            { value: "Người bán huỷ", label: "Người bán huỷ" },
            { value: "Người mua huỷ", label: "Người mua huỷ" },
            { value: "Đang giao hàng", label: "Đang giao hàng" },
            { value: "Giao hàng thành công", label: "Giao hàng thành công" },
            { value: "Giao hàng thất bại", label: "Giao hàng thất bại" },
            { value: "Chờ thanh toán", label: "Chờ thanh toán" },
            { value: "Đã thanh toán", label: "Đã thanh toán" },
            { value: "Huỷ do quá thời gian thanh toán", label: "Huỷ do quá thời gian thanh toán" },
          ]}
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
        scroll={{ x: "max-content" }}
      >
        <Table.Column
          title="STT"
          align="center"
          width={60}
          render={(_, __, index) =>
            (pagination.current - 1) * pagination.pageSize + index + 1
          }
        />
        <Table.Column
          title="Mã đơn hàng"
          dataIndex="orderId"
          width={160}
          sorter={true}
          render={(_, record: any) => (
            <Tooltip
              placement="right"
              overlayStyle={{ minWidth: 400, maxWidth: 600 }}
              overlayInnerStyle={{
                background: "#222", // nền tối
                color: "#fff",      // chữ trắng
                boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                borderRadius: 8,
                border: "1px solid #444",
              }}
              title={
                <Descriptions
                  column={1}
                  size="small"
                  bordered
                  contentStyle={{ color: "#fff" }}
                  labelStyle={{ color: "#bbb" }}
                >
                  <Descriptions.Item label="Mã đơn">{record?.orderId}</Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">
                    <Tag color={getStatusColor(record?.status)}>{record?.status}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày đặt">
                    {record?.createdAt && new Date(record.createdAt).toLocaleString()}
                  </Descriptions.Item>
                  <Descriptions.Item label="Tổng cộng">
                    {record?.finalAmount?.toLocaleString("vi-VN") + "đ"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Người nhận">
                    {record?.receiver?.name} - {record?.receiver?.phone}
                  </Descriptions.Item>
                  <Descriptions.Item label="Địa chỉ">
                    {record?.receiver
                      ? `${record.receiver.address}, ${record.receiver.wardName}, ${record.receiver.districtName}, ${record.receiver.cityName}`
                      : "--"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email người đặt">
                    {record?.user?.email}
                  </Descriptions.Item>
                  <Descriptions.Item label="Phương thức TT">
                    {record?.paymentMethod === "COD"
                      ? "Thanh toán khi nhận hàng(COD)"
                      : record?.paymentMethod === "MoMo"
                      ? "MoMo"
                      : record?.paymentMethod === "zalopay"
                      ? "ZaloPay"
                      : record?.paymentMethod || "Không xác định"}
                  </Descriptions.Item>
                  
                </Descriptions>
              }
            >
              <span style={{ color: "#1677ff", cursor: "pointer" }}>{record?.orderId}</span>
            </Tooltip>
          )}
        />
        <Table.Column
          title="Họ tên"
          width={160}
          render={(_, record: any) =>
            record?.receiver?.name || "Không có"
          }
        />
        <Table.Column
          title="SĐT"
          width={120}
          render={(_, record: any) =>
            record?.receiver?.phone || "Không có"
          }
        />
        <Table.Column
          title="Email(Người đặt)"
          width={200}
          render={(_, record: any) =>
            record?.user?.email || "Không có"
          }
        />
        <Table.Column
          title="Ngày đặt"
          width={140}
          dataIndex="createdAt"
          sorter={true}
          render={(value: string) => (
            <DateField value={value} format="DD/MM/YYYY HH:mm" />
          )}
        />
        <Table.Column
          title="Tổng tiền"
          width={120}
          dataIndex="finalAmount"
          sorter={true}
          render={(amount: number) =>
            amount?.toLocaleString("vi-VN") + "đ"
          }
        />
        <Table.Column
          title="Phương thức TT"
          width={120}
          dataIndex="paymentMethod"
          sorter={true}
          render={(method: string) => {
            switch (method) {
              case "COD":
                return "Thanh toán khi nhận hàng(COD)";
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
          width={160}
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
          width={100}
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
