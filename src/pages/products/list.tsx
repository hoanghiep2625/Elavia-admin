import {
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import type { BaseRecord } from "@refinedev/core";
import { Space, Table } from "antd";

export const ProductList = () => {
  const { tableProps } = useTable({
    resource: "products",
    syncWithLocation: true,
  });

  const data = (tableProps.dataSource as any)?.data ?? [];

  return (
    <List>
      <Table
        {...tableProps}
        dataSource={Array.isArray(data) ? data : []}
        rowKey="_id"
      >
        <Table.Column dataIndex="name" title="Tên sản phẩm" />
        <Table.Column dataIndex="sku" title="SKU" />
        <Table.Column
          dataIndex={["categoryId", "name"]}
          title="Danh mục"
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
