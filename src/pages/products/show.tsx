import { Show, TextField } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography } from "antd";

const { Title } = Typography;

export const ProductShow = () => {
  const { queryResult } = useShow({
    resource: "products",
  });
  const { data, isLoading } = queryResult;
  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      <Title level={5}>ID</Title>
      <TextField value={record?._id} />
      <Title level={5}>Tên sản phẩm</Title>
      <TextField value={record?.name} />
      <Title level={5}>SKU</Title>
      <TextField value={record?.sku} />
      <Title level={5}>Danh mục</Title>
      <TextField value={record?.categoryId?.name || "Không xác định"} />
      <Title level={5}>Mô tả ngắn</Title>
      <TextField value={record?.shortDescription} />
      <Title level={5}>Mô tả chi tiết</Title>
      <TextField value={record?.description} />
      <Title level={5}>Ngày tạo</Title>
      <TextField value={record?.createdAt} />
      <Title level={5}>Ngày cập nhật</Title>
      <TextField value={record?.updatedAt} />
    </Show>
  );
};
