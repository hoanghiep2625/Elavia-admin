import React, { useState } from "react";
import { List, DateField, ShowButton, EditButton } from "@refinedev/antd";
import {
  Table,
  Tag,
  Input,
  Select,
  Button,
  Tooltip,
  Descriptions,
  message,
} from "antd";
import { useCustom, useUpdate, useInvalidate } from "@refinedev/core";

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
    case "Đã nhận hàng":
      return "lime";
    case "Giao hàng thất bại":
      return "volcano";
    case "Chờ thanh toán":
      return "gold";
    case "Đã thanh toán":
      return "purple";
    case "Thanh toán khi nhận hàng":
      return "geekblue";
    case "Huỷ do quá thời gian thanh toán":
      return "magenta";
    case "Khiếu nại":
      return "orange";
    case "Đang xử lý khiếu nại":
      return "processing";
    case "Khiếu nại được giải quyết":
      return "success";
    case "Khiếu nại bị từ chối":
      return "error";
    default:
      return "default";
  }
};

// Helper function để lấy màu HEX từ Ant Design color token
const getStatusDotColor = (colorToken: string) => {
  const colorMap: Record<string, string> = {
    orange: "#fa8c16",
    blue: "#1677ff",
    red: "#f5222d",
    cyan: "#13c2c2",
    green: "#52c41a",
    lime: "#a0d911",
    volcano: "#fa541c",
    gold: "#faad14",
    purple: "#722ed1",
    geekblue: "#2f54eb",
    magenta: "#eb2f96",
    processing: "#1677ff",
    success: "#52c41a",
    error: "#f5222d",
    default: "#d9d9d9",
  };
  return colorMap[colorToken] || "#d9d9d9";
};

export const OrderList = () => {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const [sorter, setSorter] = useState<{ field?: string; order?: string }>({});

  // Hook để update đơn hàng
  const { mutate: updateOrder } = useUpdate();
  const invalidate = useInvalidate();

  // Logic xác định trạng thái có thể thay đổi được
  const allowedPaymentStatusTransitions: Record<string, string[]> = {
    "Chờ thanh toán": [
      "Đã thanh toán",
      "Huỷ do quá thời gian thanh toán",
      "Người mua huỷ",
      "Người bán huỷ",
    ],
    "Đã thanh toán": ["Người mua huỷ", "Người bán huỷ"],
    "Thanh toán khi nhận hàng": [
      "Đã thanh toán", // Khi giao hàng thành công
      "Người mua huỷ",
      "Người bán huỷ",
    ],
    "Huỷ do quá thời gian thanh toán": [],
    "Người mua huỷ": [],
    "Người bán huỷ": [],
  };

  const allowedShippingStatusTransitions: Record<string, string[]> = {
    "Chờ xác nhận": ["Đã xác nhận", "Người mua huỷ", "Người bán huỷ"],
    "Đã xác nhận": ["Đang giao hàng", "Người bán huỷ", "Người mua huỷ"],
    "Đang giao hàng": [
      "Giao hàng thành công",
      "Giao hàng thất bại",
      "Khiếu nại",
      "Người bán huỷ",
      "Người mua huỷ",
    ],
    "Giao hàng thành công": ["Đã nhận hàng", "Khiếu nại"],
    "Đã nhận hàng": [],
    "Giao hàng thất bại": ["Người bán huỷ", "Người mua huỷ", "Khiếu nại"],
    "Khiếu nại": ["Đang xử lý khiếu nại"],
    "Đang xử lý khiếu nại": [
      "Khiếu nại được giải quyết",
      "Khiếu nại bị từ chối",
    ],
    "Khiếu nại được giải quyết": [],
    "Khiếu nại bị từ chối": [],
    "Người mua huỷ": [],
    "Người bán huỷ": [],
  };

  // Hàm xử lý thay đổi trạng thái
  const handleStatusChange = (
    orderId: string,
    statusType: "payment" | "shipping",
    newStatus: string,
    currentData: any
  ) => {
    const updateData =
      statusType === "payment"
        ? { paymentStatus: newStatus }
        : { shippingStatus: newStatus };

    updateOrder(
      {
        resource: "orders",
        id: orderId,
        values: updateData,
      },
      {
        onSuccess: () => {
          message.success(
            `Cập nhật trạng thái ${
              statusType === "payment" ? "thanh toán" : "giao hàng"
            } thành công`
          );
          // Refresh data
          invalidate({
            resource: "orders",
            invalidates: ["list"],
          });
        },
        onError: (error) => {
          message.error(`Lỗi cập nhật trạng thái: ${error.message}`);
        },
      }
    );
  };

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
          placeholder="Trạng thái"
          allowClear
          value={pendingStatus}
          onChange={(val) => setPendingStatus(val || "")}
          style={{ width: 180 }}
        >
          <Select.OptGroup label="Trạng thái thanh toán">
            <Select.Option value="Chờ thanh toán">Chờ thanh toán</Select.Option>
            <Select.Option value="Đã thanh toán">Đã thanh toán</Select.Option>
            <Select.Option value="Thanh toán khi nhận hàng">
              Thanh toán khi nhận hàng
            </Select.Option>
            <Select.Option value="Huỷ do quá thời gian thanh toán">
              Huỷ do quá thời gian thanh toán
            </Select.Option>
          </Select.OptGroup>
          <Select.OptGroup label="Trạng thái giao hàng">
            <Select.Option value="Chờ xác nhận">Chờ xác nhận</Select.Option>
            <Select.Option value="Đã xác nhận">Đã xác nhận</Select.Option>
            <Select.Option value="Đang giao hàng">Đang giao hàng</Select.Option>
            <Select.Option value="Giao hàng thành công">
              Giao hàng thành công
            </Select.Option>
            <Select.Option value="Đã nhận hàng">Đã nhận hàng</Select.Option>
            <Select.Option value="Giao hàng thất bại">
              Giao hàng thất bại
            </Select.Option>
            <Select.Option value="Khiếu nại">Khiếu nại</Select.Option>
            <Select.Option value="Đang xử lý khiếu nại">
              Đang xử lý khiếu nại
            </Select.Option>
            <Select.Option value="Khiếu nại được giải quyết">
              Khiếu nại được giải quyết
            </Select.Option>
            <Select.Option value="Khiếu nại bị từ chối">
              Khiếu nại bị từ chối
            </Select.Option>
          </Select.OptGroup>
          <Select.OptGroup label="Trạng thái hủy">
            <Select.Option value="Người bán huỷ">Người bán huỷ</Select.Option>
            <Select.Option value="Người mua huỷ">Người mua huỷ</Select.Option>
          </Select.OptGroup>
        </Select>
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
                color: "#fff", // chữ trắng
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
                  <Descriptions.Item label="Mã đơn">
                    {record?.orderId}
                  </Descriptions.Item>
                  <Descriptions.Item label="TT Thanh toán">
                    <Tag color={getStatusColor(record?.paymentStatus)}>
                      {record?.paymentStatus}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="TT Giao hàng">
                    <Tag color={getStatusColor(record?.shippingStatus)}>
                      {record?.shippingStatus}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày đặt">
                    {record?.createdAt &&
                      new Date(record.createdAt).toLocaleString()}
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
              <span style={{ color: "#1677ff", cursor: "pointer" }}>
                {record?.orderId}
              </span>
            </Tooltip>
          )}
        />
        <Table.Column
          title="Họ tên"
          width={160}
          render={(_, record: any) => record?.receiver?.name || "Không có"}
        />
        <Table.Column
          title="SĐT"
          width={120}
          render={(_, record: any) => record?.receiver?.phone || "Không có"}
        />
        <Table.Column
          title="Email(Người đặt)"
          width={200}
          render={(_, record: any) => record?.user?.email || "Không có"}
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
          render={(amount: number) => amount?.toLocaleString("vi-VN") + "đ"}
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
          title="TT Thanh toán"
          width={180}
          dataIndex="paymentStatus"
          sorter={true}
          render={(status: string, record: any) => {
            const allowedTransitions =
              allowedPaymentStatusTransitions[status] || [];
            const canChange = allowedTransitions.length > 0;

            if (!canChange) {
              // Không thể thay đổi - chỉ hiển thị Tag
              return (
                <Tag color={getStatusColor(status || "default")}>
                  {status || "Không xác định"}
                </Tag>
              );
            }

            // Có thể thay đổi - hiển thị Select
            return (
              <Select
                value={status}
                style={{ width: "100%" }}
                size="small"
                onChange={(value) =>
                  handleStatusChange(record._id, "payment", value, record)
                }
              >
                <Select.Option value={status}>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: getStatusDotColor(
                          getStatusColor(status)
                        ),
                      }}
                    ></span>
                    {status}
                  </span>
                </Select.Option>
                {allowedTransitions.map((nextStatus) => (
                  <Select.Option key={nextStatus} value={nextStatus}>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: getStatusDotColor(
                            getStatusColor(nextStatus)
                          ),
                        }}
                      ></span>
                      {nextStatus}
                    </span>
                  </Select.Option>
                ))}
              </Select>
            );
          }}
        />
        <Table.Column
          title="TT Giao hàng"
          width={180}
          dataIndex="shippingStatus"
          sorter={true}
          render={(status: string, record: any) => {
            const allowedTransitions =
              allowedShippingStatusTransitions[status] || [];
            const canChange = allowedTransitions.length > 0;

            if (!canChange) {
              // Không thể thay đổi - chỉ hiển thị Tag
              return (
                <Tag color={getStatusColor(status || "default")}>
                  {status || "Không xác định"}
                </Tag>
              );
            }

            // Có thể thay đổi - hiển thị Select
            return (
              <Select
                value={status}
                style={{ width: "100%" }}
                size="small"
                onChange={(value) =>
                  handleStatusChange(record._id, "shipping", value, record)
                }
              >
                <Select.Option value={status}>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: getStatusDotColor(
                          getStatusColor(status)
                        ),
                      }}
                    ></span>
                    {status}
                  </span>
                </Select.Option>
                {allowedTransitions.map((nextStatus) => (
                  <Select.Option key={nextStatus} value={nextStatus}>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: getStatusDotColor(
                            getStatusColor(nextStatus)
                          ),
                        }}
                      ></span>
                      {nextStatus}
                    </span>
                  </Select.Option>
                ))}
              </Select>
            );
          }}
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
