import { Show } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography, Descriptions, Divider } from "antd";

const { Title, Text } = Typography;

export const ProductShow = () => {
  const { queryResult } = useShow({ resource: "products" });
  const { data, isLoading } = queryResult;
  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      <Title level={4} style={{ marginBottom: 24 }}>
        Thông tin sản phẩm
      </Title>
      <Descriptions
        bordered
        column={1}
        labelStyle={{ width: 180, fontWeight: 500 }}
        contentStyle={{ background: "#fafafa" }}
        size="middle"
      >
        <Descriptions.Item label="ID">{record?._id}</Descriptions.Item>
        <Descriptions.Item label="Tên sản phẩm">{record?.name}</Descriptions.Item>
        <Descriptions.Item label="SKU">{record?.sku}</Descriptions.Item>
        <Descriptions.Item label="Danh mục">{record?.categoryId?.name || "Không xác định"}</Descriptions.Item>
        <Descriptions.Item label="Mô tả ngắn">{record?.shortDescription}</Descriptions.Item>
        <Descriptions.Item label="Mô tả chi tiết">
          <div
            style={{ background: "#fff", padding: 12, borderRadius: 4, minHeight: 40 }}
            dangerouslySetInnerHTML={{ __html: record?.description || "" }}
          />
        </Descriptions.Item>
        <Descriptions.Item label="Ngày tạo">
          {record?.createdAt
            ? new Date(record.createdAt).toLocaleDateString("vi-VN")
            : ""}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày cập nhật">
          {record?.updatedAt
            ? new Date(record.updatedAt).toLocaleDateString("vi-VN")
            : ""}
        </Descriptions.Item>
      </Descriptions>
      <Divider />
    </Show>
  );
};
