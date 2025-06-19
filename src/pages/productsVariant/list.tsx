import { DeleteButton, EditButton, List, ShowButton } from "@refinedev/antd";
import { BaseRecord, useCustom } from "@refinedev/core";
import { Space, Table, Image, Input, Button, Select, Tag } from "antd";
import { useState } from "react";

export const ProductVariantList = () => {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [sorter, setSorter] = useState<{ field?: string; order?: string }>({});
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [baseColors, setBaseColors] = useState("");
  const [nameSearch, setNameSearch] = useState("");
  const [skuSearch, setSkuSearch] = useState("");
  const [filters, setFilters] = useState<{
    _priceMin?: string;
    _priceMax?: string;
    _baseColors?: string;
    _name?: string;
    _sku?: string;
  }>({});

  const { data, isLoading, isError, refetch } = useCustom({
    url: "/admin/variants",
    method: "get",
    config: {
      query: {
        _page: pagination.current,
        _limit: pagination.pageSize,
        _sort: sorter.field,
        _order: sorter.order,
        ...(filters._priceMin && filters._priceMin !== ""
          ? { _priceMin: filters._priceMin }
          : {}),
        ...(filters._priceMax && filters._priceMax !== ""
          ? { _priceMax: filters._priceMax }
          : {}),
        ...(filters._baseColors && filters._baseColors !== ""
          ? { _baseColors: filters._baseColors }
          : {}),
        ...(filters._name && filters._name !== ""
          ? { _name: filters._name }
          : {}),
        ...(filters._sku && filters._sku !== "" ? { _sku: filters._sku } : {}),
      },
    },
  });

  const tableData = data?.data?.data || [];
  const total = data?.data?.total || 0;

  const handleTableChange = (newPagination: any, _: any, sorterConfig: any) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
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
      _priceMin: priceMin.trim(),
      _priceMax: priceMax.trim(),
      _baseColors: baseColors,
      _name: nameSearch.trim(),
      _sku: skuSearch.trim(),
    });
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  return (
    <List canCreate={false}>
      <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        <Input
          placeholder="Tên sản phẩm"
          value={nameSearch}
          allowClear
          onChange={(e) => setNameSearch(e.target.value)}
          style={{ width: 160 }}
        />
        <Input
          placeholder="Mã sản phẩm (SKU)"
          value={skuSearch}
          allowClear
          onChange={(e) => setSkuSearch(e.target.value)}
          style={{ width: 180 }}
        />
        <Input
          placeholder="Giá thấp nhất"
          value={priceMin}
          onChange={(e) => setPriceMin(e.target.value)}
          style={{ width: 140 }}
          type="number"
          min={0}
        />
        <Input
          placeholder="Giá cao nhất"
          value={priceMax}
          onChange={(e) => setPriceMax(e.target.value)}
          style={{ width: 140 }}
          type="number"
          min={0}
        />
        <Select
          placeholder="Chọn màu cơ bản"
          allowClear
          style={{ width: 160 }}
          value={baseColors || undefined}
          onChange={(value) => setBaseColors(value || "")}
        >
          <Select.Option value="black">Đen</Select.Option>
          <Select.Option value="white">Trắng</Select.Option>
          <Select.Option value="blue">Xanh dương</Select.Option>
          <Select.Option value="yellow">Vàng</Select.Option>
          <Select.Option value="pink">Hồng</Select.Option>
          <Select.Option value="red">Đỏ</Select.Option>
          <Select.Option value="gray">Xám</Select.Option>
          <Select.Option value="beige">Be</Select.Option>
          <Select.Option value="brown">Nâu</Select.Option>
          <Select.Option value="green">Xanh lá</Select.Option>
          <Select.Option value="orange">Cam</Select.Option>
          <Select.Option value="purple">Tím</Select.Option>
        </Select>
        <Button type="primary" onClick={handleSearch}>
          Tìm kiếm
        </Button>
      </div>
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
            title="STT"
            key="index"
            align="center"
            render={(_, __, index) =>
              pagination.pageSize * (pagination.current - 1) + index + 1
            }
            width={70}
          />
          <Table.Column
            dataIndex={["productId", "name"]}
            title="Sản phẩm"
            sorter={true}
            render={(value) => value || "Không xác định"}
          />
          <Table.Column dataIndex="sku" title="SKU" sorter={true} />
          <Table.Column
            title="Màu"
            sorter={{
              compare: (a, b) => {
                const nameA = a.color?.colorName || "";
                const nameB = b.color?.colorName || "";
                return nameA.localeCompare(nameB);
              },
              multiple: 1,
            }}
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
          <Table.Column dataIndex="price" title="Giá" sorter={true} />
          <Table.Column
            align="center"
            title="Tồn kho"
            sorter={false}
            render={(_, record) => {
              const totalStock = Array.isArray(record.sizes)
                ? record.sizes.reduce((sum, size) => sum + (size.stock || 0), 0)
                : 0;
              return totalStock;
            }}
          />
          <Table.Column
            dataIndex="status"
            title="Trạng thái"
            sorter={true}
            render={(status) => (
              <Tag color={status ? "green" : "red"}>
                {status ? "Active" : "Inactive"}
              </Tag>
            )}
          />
          <Table.Column
            dataIndex={["images", "main", "url"]}
            title="Ảnh chính"
            render={(value) => <Image src={value} width={50} />}
          />
          <Table.Column
            dataIndex="createdAt"
            title="Ngày tạo"
            width={120}
            sorter={true}
            render={(value) =>
              value
                ? new Date(value).toLocaleString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })
                : ""
            }
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
              </Space>
            )}
          />
        </Table>
      )}
    </List>
  );
};