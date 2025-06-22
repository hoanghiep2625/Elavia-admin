import React from "react";
import { Show } from "@refinedev/antd";
import { useCustom, useShow } from "@refinedev/core";
import { Typography, Descriptions, Divider, Table, Image, Tag, Card, Tooltip } from "antd";

const { Title } = Typography;

// Component hiển thị danh sách biến thể sản phẩm
const ProductVariantsTable = ({ productId }: { productId: string }) => {
    const { data, isLoading } = useCustom({
        url: `/admin/variants-product/${productId}`,
        method: "get",
    });

    // Nếu API trả về { data: [...] }
    const variants = data?.data?.data || data?.data || [];

    const columns = [
        {
            title: "Ảnh",
            dataIndex: ["images", "main", "url"],
            key: "image",
            render: (url: string) =>
                url ? <Image width={60} src={url} /> : "Không có ảnh",
        },
        {
            title: "SKU",
            dataIndex: "sku",
            key: "sku",
        },
        {
            title: "Màu",
            dataIndex: "color",
            key: "color",
            render: (color: any) =>
                color ? (
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
                ) : (
                    "Không có"
                ),
        },
        {
            title: "Giá",
            dataIndex: "price",
            key: "price",
            render: (price: number) => price?.toLocaleString("vi-VN") + "đ",
        },
        {
            title: "Kích cỡ & Tồn kho",
            dataIndex: "sizes",
            key: "sizes",
            render: (sizes: any[]) =>
                Array.isArray(sizes) && sizes.length > 0 ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {sizes.map((sz, idx) => (
                            <Tooltip
                                key={idx}
                                title={`Tồn kho: ${sz.stock ?? 0}`}
                                placement="top"
                            >
                                <Tag color="blue">
                                    {sz.size}: {sz.stock ?? 0}
                                </Tag>
                            </Tooltip>
                        ))}
                    </div>
                ) : (
                    <Tag color="red">Không có</Tag>
                ),
        },
        {
            title: "Tổng tồn kho",
            key: "totalStock",
            render: (_:any, record: any) =>
                Array.isArray(record.sizes)
                    ? record.sizes.reduce((sum:any, sz:any) => sum + (sz.stock || 0), 0)
                    : 0,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status: boolean) =>
                status ? (
                    <Tag color="green">Hoạt động</Tag>
                ) : (
                    <Tag color="red">Không hoạt động</Tag>
                ),
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (value: string) =>
                value
                    ? new Date(value).toLocaleString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                      })
                    : "",
        },
    ];

    return (
        <Card title="Danh sách biến thể sản phẩm" style={{ marginTop: 32 }}>
            <Table
                rowKey="_id"
                columns={columns}
                dataSource={variants}
                loading={isLoading}
                pagination={false}
                scroll={{ x: true }}
            />
        </Card>
    );
};

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
            {/* Hiển thị danh sách biến thể */}
            {record?._id && <ProductVariantsTable productId={record._id} />}
        </Show>
    );
};
