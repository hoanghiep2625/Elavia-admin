import {
  List,
  EditButton,
  DeleteButton,
  ShowButton,
  DateField,
} from "@refinedev/antd";
import { useCustom } from "@refinedev/core";
import { Table, Space, Tag, Form, Input, Button, Select } from "antd";
import { useState } from "react";
import {
  formatVoucherValue,
  getVoucherTypeColor,
  getVoucherStatusColor,
} from "./helpers";

export const VoucherList = () => {
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [sorter, setSorter] = useState<{ field?: string; order?: string }>({});
  const [filters, setFilters] = useState({
    _code: "",
    _description: "",
    _type: "",
  });

  const { data, isLoading, refetch } = useCustom({
    url: "/vouchers",
    method: "get",
    config: {
      query: {
        page: pagination.current,
        limit: pagination.pageSize,
        _sort: sorter.field,
        _order: sorter.order,
        ...(filters._code ? { _code: filters._code } : {}),
        ...(filters._description ? { _description: filters._description } : {}),
        ...(filters._type ? { _type: filters._type } : {}),
      },
    },
  });

  const tableData = data?.data?.data ?? [];
  const total = data?.data?.total ?? 0;

  // Khi đổi trang hoặc sort
  const handleTableChange = (
    paginationConfig: any,
    _filters: any,
    sorterConfig: any
  ) => {
    setPagination({
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
    });
    if (sorterConfig && sorterConfig.field) {
      setSorter({
        field: sorterConfig.field,
        order: sorterConfig.order === "ascend" ? "asc" : "desc",
      });
    } else {
      setSorter({});
    }
  };

  const handleSearch = (values: any) => {
    setFilters({
      _code: values._code || "",
      _description: values._description || "",
      _type: values._type || "",
    });
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  return (
    <List>
      <Form
        form={form}
        layout="inline"
        onFinish={handleSearch}
        style={{ marginBottom: 16 }}
      >
        <Form.Item name="_code">
          <Input placeholder="Tìm theo mã" allowClear style={{ width: 180 }} />
        </Form.Item>
        <Form.Item name="_description">
          <Input
            placeholder="Tìm theo mô tả"
            allowClear
            style={{ width: 180 }}
          />
        </Form.Item>
        <Form.Item name="_type">
          <Select placeholder="Chọn loại" allowClear style={{ width: 180 }}>
            <Select.Option value="fixed">Giảm tiền</Select.Option>
            <Select.Option value="percent">Giảm %</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Tìm kiếm
          </Button>
        </Form.Item>
      </Form>

      <Table
        loading={isLoading}
        style={{ marginTop: 0 }}
        dataSource={tableData}
        rowKey="_id"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total,
          showTotal: (total) => `Tổng ${total} bản ghi`,
          showSizeChanger: true,
        }}
        onChange={handleTableChange}
      >
        <Table.Column
          title="STT"
          key="index"
          align="center"
          render={(_, __, index) =>
            pagination.pageSize * (pagination.current - 1) + index + 1
          }
          width={70}
        />
        <Table.Column dataIndex="code" title="Mã giảm giá" />
        <Table.Column
          dataIndex="type"
          title="Loại"
          render={(value) => (
            <Tag color={getVoucherTypeColor(value)}>
              {value === "fixed" ? "Giảm tiền" : "Giảm %"}
            </Tag>
          )}
        />
        <Table.Column
          dataIndex="value"
          title="Giá trị"
          sorter={true}
          render={(value, record: any) => (
            <strong>{formatVoucherValue(value, record.type)}</strong>
          )}
        />
        <Table.Column
          dataIndex="quantity"
          title="Còn lại"
          sorter={true}
          render={(value) => (
            <Tag color={value > 0 ? "green" : "red"}>{value} lượt</Tag>
          )}
        />
        <Table.Column
          dataIndex="expiresAt"
          title="Hết hạn"
          render={(value) => <DateField value={value} format="DD/MM/YYYY" />}
        />
        <Table.Column
          dataIndex="isActive"
          title="Trạng thái"
          render={(value) => (
            <Tag color={getVoucherStatusColor(value)}>
              {value ? "Hoạt động" : "Tắt"}
            </Tag>
          )}
        />
        <Table.Column
          title="Hành động"
          render={(_, record) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record._id} />
              <ShowButton hideText size="small" recordItemId={record._id} />
              <DeleteButton
                hideText
                size="small"
                recordItemId={record._id}
                onSuccess={() => {
                  refetch();
                }}
              />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
