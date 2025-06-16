import { DeleteButton, EditButton, List, ShowButton } from "@refinedev/antd";
import type { BaseRecord } from "@refinedev/core";
import { Button, Input, Space, Table } from "antd";
import { useState, useEffect } from "react";
import { useCustom } from "@refinedev/core";

export const ProductList = () => {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [sorter, setSorter] = useState<{ field?: string; order?: string }>({});
  const [nameSearch, setNameSearch] = useState("");
  const [skuSearch, setSkuSearch] = useState("");
  const [filters, setFilters] = useState({ _name: "", _sku: "" });

  // Trigger search when filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, [filters]);

  const { data, isLoading, refetch } = useCustom({
    url: "/admin/products",
    method: "get",
    config: {
      query: {
        _page: pagination.current,
        _limit: pagination.pageSize,
        _sort: sorter.field,
        _order: sorter.order,
        ...(filters._name ? { _name: filters._name } : {}),
        ...(filters._sku ? { _sku: filters._sku } : {}),
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

  const handleSearch = () => {
    setFilters({
      _name: nameSearch.trim(),
      _sku: skuSearch.trim(),
    });
  };

  return (
    <List>
      <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        <Input
          placeholder="Tìm theo tên sản phẩm"
          allowClear
          value={nameSearch}
          onChange={(e) => setNameSearch(e.target.value)}
          style={{ width: 200 }}
        />
        <Input
          placeholder="Tìm theo SKU"
          allowClear
          value={skuSearch}
          onChange={(e) => setSkuSearch(e.target.value)}
          style={{ width: 200 }}
        />
        <Button type="primary" onClick={handleSearch}>
          Tìm kiếm
        </Button>
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
        <Table.Column
          title="STT"
          key="stt"
          align="center"
          width={60}
          render={(_, __, index) =>
            (pagination.current - 1) * pagination.pageSize + index + 1
          }
        />
        <Table.Column dataIndex="name" title="Tên sản phẩm" sorter={true} />
        <Table.Column dataIndex="sku" title="SKU" sorter={true} />
        <Table.Column
          dataIndex={["categoryId", "name"]}
          title="Danh mục"
          sorter={true}
          render={(value) => value || "Không xác định"}
        />
        <Table.Column
          title="Hành động"
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record._id} />
              <ShowButton hideText size="small" recordItemId={record._id} />
              <DeleteButton
                hideText
                size="small"
                recordItemId={record._id}
                onSuccess={() => refetch()}
              />
              <Button
                size="small"
                type="primary"
                onClick={() => {
                  window.location.href = `/variants/create/${record._id}`;
                }}
              >
                Thêm biến thể
              </Button>
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
