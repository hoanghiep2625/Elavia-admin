import { List } from "@refinedev/antd";
import { Space, Table } from "antd";
import { useTable } from "@refinedev/antd";
import { DeleteButton, EditButton, ShowButton } from "@refinedev/antd";
import dayjs from "dayjs";

// 1. Danh sách Attribute
export const AttributeList = () => {
  const { tableProps } = useTable();

  return (
    <List>
      <Table {...tableProps} rowKey="_id">
        <Table.Column dataIndex="name" title="Name" />
        <Table.Column dataIndex="slug" title="Slug" />
        <Table.Column
          dataIndex="values"
          title="Values"
          render={(values: string[]) => values?.join(", ")}
        />{" "}
        <Table.Column
          dataIndex="createdAt"
          title="Ngày tạo"
          render={(date) =>
            date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "-"
          }
        />
        <Table.Column
          dataIndex="updatedAt"
          title="Cập nhật"
          render={(date) =>
            date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "-"
          }
        />
        <Table.Column
          title="Actions"
          render={(_, record) => (
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
