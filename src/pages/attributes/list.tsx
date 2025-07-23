import React, { useState } from "react";
import { List } from "@refinedev/antd";
import { Button, Input, Space, Table } from "antd";
import { DeleteButton, EditButton, ShowButton } from "@refinedev/antd";
import dayjs from "dayjs";
import { useCustom, useInvalidate } from "@refinedev/core";

export const AttributeList = () => {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [sorter, setSorter] = useState<{ field?: string; order?: string }>({});

  // Thêm state cho filter
  const [nameSearch, setNameSearch] = useState("");
  const [slugSearch, setSlugSearch] = useState("");
  const [valuesSearch, setValuesSearch] = useState("");
  const [filters, setFilters] = useState<{
    _name?: string;
    _slug?: string;
    _values?: string;
  }>({});

  const invalidate = useInvalidate();

  const { data, isLoading, refetch } = useCustom({
    url: "/admin/attributes",
    method: "get",
    config: {
      query: {
        _page: pagination.current,
        _limit: pagination.pageSize,
        _sort: sorter.field,
        _order: sorter.order,
        ...(filters._name && filters._name !== ""
          ? { _name: filters._name }
          : {}),
        ...(filters._slug && filters._slug !== ""
          ? { _slug: filters._slug }
          : {}),
        ...(filters._values && filters._values !== ""
          ? { _values: filters._values }
          : {}),
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

  // Hàm tìm kiếm
  const handleSearch = () => {
    setFilters({
      _name: nameSearch.trim(),
      _slug: slugSearch.trim(),
      _values: valuesSearch.trim(),
    });
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const safeDataSource = tableData;
  const tableQueryResult = { isLoading };
  const tableProps = {
    dataSource: safeDataSource,
    pagination: {
      current: pagination.current,
      pageSize: pagination.pageSize,
      total,
    },
    onChange: handleTableChange,
  };

  return (
    <List>
      {/* Thanh tìm kiếm */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <Input
          placeholder="Tên thuộc tính"
          value={nameSearch}
          onChange={(e) => setNameSearch(e.target.value)}
          style={{ width: 160 }}
        />
        <Input
          placeholder="Slug"
          value={slugSearch}
          onChange={(e) => setSlugSearch(e.target.value)}
          style={{ width: 140 }}
        />
        <Input
          placeholder="Giá trị (cách nhau bởi dấu phẩy)"
          value={valuesSearch}
          onChange={(e) => setValuesSearch(e.target.value)}
          style={{ width: 200 }}
        />
        <Button type="primary" onClick={handleSearch}>
          Tìm kiếm
        </Button>
      </div>
      <Table
        {...tableProps}
        dataSource={safeDataSource}
        rowKey="_id"
        loading={tableQueryResult.isLoading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          showTotal: (total) => `Tổng ${total} bản ghi`,
          showSizeChanger: true,
          onChange: (page, pageSize) => {
            setPagination({ current: page, pageSize });
            handleSearch();
          },
        }}
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
        <Table.Column dataIndex="name" title="Name" />
        <Table.Column dataIndex="slug" title="Slug" />
        <Table.Column
          dataIndex="values"
          title="Values"
          render={(values: string[]) => (values ? values.join(", ") : "-")}
        />
        <Table.Column
          dataIndex="createdAt"
          title="Ngày tạo"
          sorter={true}
          render={(date) =>
            date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "-"
          }
        />
        <Table.Column
          dataIndex="updatedAt"
          title="Cập nhật"
          sorter={true}
          render={(date) =>
            date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "-"
          }
        />
        <Table.Column
          title="Actions"
          render={(_, record: { _id: string }) => (
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
