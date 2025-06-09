import { DeleteButton, EditButton, List, ShowButton } from "@refinedev/antd";
import type { BaseRecord } from "@refinedev/core";
import { Input, Space, Table } from "antd";
import { useState } from "react";
import { useCustom } from "@refinedev/core";

export const ProductList = () => {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [sorter, setSorter] = useState<{ field?: string; order?: string }>({});
  const [search, setSearch] = useState("");
  const { data, isLoading } = useCustom({
    url: "/admin/products",
    method: "get",
    config: {
      query: {
        _page: pagination.current,
        _limit: pagination.pageSize,
        _sort: sorter.field,
        _order: sorter.order,
      },
    },
  });

  const tableData = data?.data?.data ?? [];
  const total = data?.data?.total ?? 0;

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
          placeholder="Tìm kiếm sản phẩm"
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
        <Table.Column dataIndex="name" title="Tên sản phẩm" sorter={true}/>
        <Table.Column dataIndex="sku" title="SKU" sorter={true}/>
        <Table.Column
          dataIndex={["categoryId", "name"]}
          title="Danh mục"
          sorter={true}
          render={(value) => value || "Không xác định"}
        />
        <Table.Column dataIndex="shortDescription" title="Mô tả ngắn" />
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
    </List>
  );
};
