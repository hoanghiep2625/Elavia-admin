import { EditButton, List, ShowButton } from "@refinedev/antd";
import {
  BaseRecord,
  useCustom,
  useCustomMutation,
  useNotification,
  useDelete,
} from "@refinedev/core";
import { Button, Input, Space, Table, Modal, Tooltip, Image, Select } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import type { TableRowSelection } from "antd/es/table/interface";
import { useEffect, useState, useMemo } from "react";
import dayjs from "dayjs";

export const ProductList = () => {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [sorter, setSorter] = useState<{ field?: string; order?: string }>({});
  const [nameSearch, setNameSearch] = useState("");
  const [skuSearch, setSkuSearch] = useState("");
  const [filters, setFilters] = useState({ _name: "", _sku: "" });
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const token = localStorage.getItem("token");

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
        _sort: sorter.field || "createdAt",
        _order: sorter.order || "desc",
        ...(filters._name ? { _name: filters._name } : {}),
        ...(filters._sku ? { _sku: filters._sku } : {}),
      },
    },
  });

  const { mutate: bulkDelete } = useCustomMutation();
  const { open } = useNotification();

  // Custom delete function với error handling tốt hơn
  const handleSingleDelete = (productId: string) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa sản phẩm này?",
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/products/${productId}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Có lỗi xảy ra khi xóa sản phẩm");
          }

          open?.({
            type: "success",
            message: "Xóa sản phẩm thành công",
          });
          refetch();
        } catch (error: any) {
          open?.({
            type: "error",
            message: "Không thể xóa sản phẩm",
            description: error.message,
          });
        }
      },
    });
  };

  const tableData = data?.data?.data ?? [];
  const total = data?.data?.total ?? 0;

  const sortedTableData = useMemo(() => {
    if (!Array.isArray(tableData)) return [];

    return [...tableData].sort((a, b) => {
      if (a.status === false && b.status === true) return -1;
      if (a.status === true && b.status === false) return 1;

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [tableData]);

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

  const handleBulkDelete = () => {
    Modal.confirm({
      title: "Xác nhận xoá",
      content: `Bạn có chắc chắn muốn xoá ${selectedRowKeys.length} sản phẩm đã chọn?`,
      okText: "Xoá",
      cancelText: "Huỷ",
      onOk: async () => {
        try {
          await bulkDelete({
            url: "/admin/products/bulk-delete",
            method: "delete",
            values: {
              ids: selectedRowKeys,
            },
          });

          setSelectedRowKeys([]);
          open?.({
            type: "success",
            message: "Xóa sản phẩm thành công",
          });
          await refetch();
        } catch (error) {
          const apiError = error as { response?: { data?: { message?: string } }; message?: string };
          const errorMessage = apiError?.response?.data?.message || 
                               apiError?.message || 
                               "Có lỗi xảy ra khi xóa sản phẩm";
          open?.({
            type: "error",
            message: "Không thể xóa sản phẩm",
            description: errorMessage,
          });
        }
      },
    });
  };

  const rowSelection: TableRowSelection<any> = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
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

      {selectedRowKeys.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <span style={{ marginRight: 8 }}>
            Đã chọn {selectedRowKeys.length} sản phẩm
          </span>
          <Button danger onClick={handleBulkDelete}>
            Xoá đã chọn
          </Button>
        </div>
      )}

      <Table
        rowSelection={rowSelection}
        dataSource={sortedTableData} 
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
        // ✅ Thêm highlight cho row không hoạt động
        rowClassName={(record) => 
          record.status === false ? 'inactive-product-row' : ''
        }
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
          title="Ảnh"
          key="image"
          width={70}
          render={(_, record: any) => {
            const img =
              record.representativeVariantId?.images?.main?.url ||
              record.representativeVariantId?.images?.product?.[0]?.url;
            return img ? (
              <Image src={img} alt="Ảnh sản phẩm" width={50} />
            ) : (
              <span>Không có ảnh</span>
            );
          }}
        />
        <Table.Column dataIndex="name" title="Tên sản phẩm" />
        <Table.Column dataIndex="sku" title="SKU" />
        <Table.Column
          dataIndex={["categoryId", "name"]}
          title="Danh mục"
          render={(value) => value || "Không xác định"}
        />
        <Table.Column
          title="Giá"
          render={(_, record: any) => {
            let price = 0;
            if (
              record.representativeVariantId?.sizes &&
              record.representativeVariantId.sizes.length > 0
            ) {
              const sizeOrder = ["S", "M", "L", "XL", "XXL"];
              const sortedSizes = record.representativeVariantId.sizes.sort(
                (a: any, b: any) => {
                  return sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size);
                }
              );
              price = sortedSizes[0]?.price || 0;
            }

            return new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(price);
          }}
        />
        <Table.Column
          title="Màu sắc"
          render={(_, record: any) =>
            record.representativeVariantId?.color?.colorName || "-"
          }
        />
        <Table.Column
          title="Tồn kho"
          render={(_, record: any) =>
            record.representativeVariantId?.sizes
              ? record.representativeVariantId.sizes.reduce(
                  (sum: number, s: any) => sum + (s.stock || 0),
                  0
                )
              : "-"
          }
        />
        <Table.Column
          dataIndex="variantCount"
          title="Số biến thể"
          align="center"
          render={(count) => count ?? 0}
        />
        
        {/* ✅ Cột trạng thái sử dụng pattern như reviews */}
        <Table.Column
          title="Trạng thái"
          dataIndex="status"
          align="center"
          width={160}
          render={(status, record) => {
            return (
              <Select
                className="product-status-select"
                value={status}
                onChange={async (newStatus) => {
                  try {
                    // ✅ Gọi API trực tiếp như reviews (không dùng mutation)
                    await fetch(
                      `${import.meta.env.VITE_API_URL}/admin/products/${record._id}`,
                      {
                        method: "PATCH",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ status: newStatus }),
                      }
                    );
                    
                    // ✅ Refetch data để reload bảng
                    refetch();
                    
                    // ✅ Hiện thông báo thành công
                    open?.({
                      type: "success",
                      message: `Cập nhật trạng thái thành công: ${newStatus ? 'Hoạt động' : 'Không hoạt động'}`,
                    });
                  } catch (error) {
                    console.error("Cập nhật trạng thái thất bại:", error);
                    open?.({
                      type: "error",
                      message: "Có lỗi xảy ra khi cập nhật trạng thái",
                    });
                  }
                }}
                style={{
                  width: 120,
                  backgroundColor: status === false ? '#fff2f0' : 'transparent'
                }}
              >
                <Select.Option value={true}>
                  <span style={{ color: '#16a34a', fontWeight: '500' }}>Hoạt động</span>
                </Select.Option>
                <Select.Option value={false}>
                  <span style={{ color: '#dc2626', fontWeight: '500' }}>Không hoạt động</span>
                </Select.Option>
              </Select>
            );
          }}
        />
        
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
          title="Hành động"
          dataIndex="actions"
          width={160}
          render={(_, record: any) => (
            <Space size="small">
              <EditButton hideText size="small" recordItemId={record._id} />
              <ShowButton hideText size="small" recordItemId={record._id} />
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleSingleDelete(record._id)}
                title="Xóa sản phẩm"
              />
              <Tooltip title="Thêm biến thể">
                <Button
                  size="small"
                  type="default"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    window.location.href = `/variants/create/${record._id}`;
                  }}
                />
              </Tooltip>
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
