import { DeleteButton, EditButton, List, ShowButton } from "@refinedev/antd";
import { useCustom } from "@refinedev/core";
import type { BaseRecord } from "@refinedev/core";
import { Space, Table, Image } from "antd";
import { useState } from "react";

export const ProductVariantList = () => {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const { data, isLoading, isError } = useCustom({
    url: "/admin/variants",
    method: "get",
    config: {
      query: {
        _page: pagination.current,
        _limit: pagination.pageSize,
      },
    },
  });

  const tableData = data?.data?.data || [];
  const total = data?.data?.total || 0;

  const handleTableChange = (newPagination: any) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  return (
    <List>
      {isLoading ? (
        <div>Đang tải...</div>
      ) : isError ? (
        <div>Lỗi khi tải dữ liệu</div>
      ) : (
        <Table
          dataSource={tableData}
          rowKey="_id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
            showTotal: (total) => `Tổng ${total} bản ghi`,
          }}
          onChange={handleTableChange}
        >
          <Table.Column
            dataIndex={["productId", "name"]}
            title="Sản phẩm"
            render={(value) => value || "Không xác định"}
          />
          <Table.Column dataIndex="sku" title="SKU" />
          <Table.Column
            title="Màu"
            render={(_, record) => {
              const color = record.color || {};
              return (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      display: "inline-block",
                      width: 24,
                      height: 24,
                      backgroundColor: color.actualColor || "#ccc",
                      border: "1px solid #ddd",
                      borderRadius: 2,
                    }}
                  />
                  <span>{color.colorName || "Không có"}</span>
                </span>
              );
            }}
          />
          <Table.Column dataIndex="price" title="Giá" />
          <Table.Column
            dataIndex={["images", "main", "url"]}
            title="Ảnh chính"
            render={(value) => <Image src={value} width={50} />}
          />
          <Table.Column
            title="Hành động"
            dataIndex="actions"
            render={(_, record: BaseRecord) => (
              <Space>
                <EditButton hideText size="small" recordItemId={record._id} />
                <ShowButton hideText size="small" recordItemId={record._id} />
                <DeleteButton hideText size="small" recordItemId={record._id} />
              </Space>
            )}
          />
        </Table>
      )}
    </List>
  );
};
