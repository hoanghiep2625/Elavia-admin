import React, { useState } from "react";
import { List, DateField, ShowButton } from "@refinedev/antd";
import { Table, Tag, Input } from "antd";
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
  const [search, setSearch] = useState("");

  const { data, isLoading } = useCustom({
    url: "/admin/orders",
    method: "get",
    config: {
      query: {
        _page: pagination.current,
        _limit: pagination.pageSize,
        _sort: sorter.field,
        _order: sorter.order,
        q: search, // tuỳ backend, nếu không hỗ trợ thì filter phía client
      },
    },
  });

  let tableData = data?.data?.data || [];
  const total = data?.data?.total || 0;

  if (search) {
    tableData = tableData.filter((item: any) =>
      item?.user?.name?.toLowerCase().includes(search.toLowerCase())
    );
  }
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
  return (
    <List>
      <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        <Input.Search
          placeholder="Tìm kiếm khách hàng"
          allowClear
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 320 }}
        />
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
              <ShowButton hideText recordItemId={record._id} />
              {/* Thêm các nút cập nhật trạng thái, huỷ đơn ở đây nếu cần */}
            </span>
          )}
        />
      </Table>
    </List>
  );
};
