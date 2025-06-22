import { Show } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Card, Row, Col, Typography, Image, Tag, Tooltip } from "antd";

const { Title, Text } = Typography;

export const ProductVariantShow = () => {
  const { queryResult } = useShow({ resource: "variants" });
  const { data, isLoading } = queryResult;
  const record = data?.data;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString();
  };

  return (
    <Show isLoading={isLoading}>
      <Row gutter={[24, 24]}>
        <Col span={12}>
          <Card title="Thông Tin Cơ Bản" bordered>
            <p>
              <Text strong>ID: </Text>
              {record?._id}
            </p>
            <p>
              <a href={`/products/show/${record?.productId?._id}`}>
                <Text strong>Sản phẩm: </Text>
                {record?.productId?.name}
              </a>
            </p>
            <p>
              <Text strong>SKU: </Text>
              {record?.sku}
            </p>
            <p>
              <Text strong>Giá: </Text>
              {record?.price}
            </p>
            <p>
              <Text strong>Tên màu: </Text>
              {record?.color?.colorName}
            </p>
            <p>
              <Text strong>Màu cơ bản: </Text>
              {record?.color?.baseColor}
            </p>
            <p style={{ display: "flex", alignItems: "center" }}>
              <Text strong>Màu thực tế: </Text>
              <span
                style={{
                  display: "inline-block",
                  marginLeft: "8px",
                  width: "24px",
                  height: "24px",
                  backgroundColor: record?.color?.actualColor,
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              />
            </p>
            <p>
              <Text strong>Trạng thái: </Text>
              {(() => {
                const status = record?.status;
                const productStatus = record?.productId?.status;

                let color = "default";
                let text = "";
                let tooltipText = "";

                if (productStatus === false) {
                  color = "red";
                  text = "Không hoạt động";
                  tooltipText = "Sản phẩm đang bị vô hiệu hóa.";
                } else {
                  if (status === true) {
                    color = "green";
                    text = "Hoạt động";
                    tooltipText = "Sản phẩm và biến thể đều đang hoạt động.";
                  } else {
                    color = "gold";
                    text = "Không hoạt động";
                    tooltipText = "Biến thể này đang bị vô hiệu hóa.";
                  }
                }

                return (
                  <Tooltip
                    title={tooltipText}
                    overlayInnerStyle={{
                      backgroundColor: "#fff",
                      color: "#000",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                    }}
                  >
                    <Tag
                      color={color}
                      style={{ marginLeft: 8, cursor: "pointer" }}
                    >
                      {text}
                    </Tag>
                  </Tooltip>
                );
              })()}
            </p>
          </Card>

          <Card title="Kích Thước" bordered style={{ marginTop: "24px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {record?.sizes?.map((s: any, index: number) => (
                    <th
                      key={index}
                      style={{
                        border: "1px solid #ccc",
                        padding: "8px",
                        textAlign: "center",
                      }}
                    >
                      {s.size}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {record?.sizes?.map((s: any, index: number) => (
                    <td
                      key={index}
                      style={{
                        border: "1px solid #ccc",
                        padding: "8px",
                        textAlign: "center",
                      }}
                    >
                      {s.stock}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </Card>
        </Col>

        {/* Cột bên phải: Hình ảnh và ngày */}
        <Col span={12}>
          <Card title="Hình Ảnh" bordered>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <p>
                  <Text strong>Ảnh chính:</Text>
                </p>
                <Image
                  src={record?.images?.main?.url}
                  width={120}
                  style={{ borderRadius: 8 }}
                />
              </Col>
              <Col span={12}>
                <p>
                  <Text strong>Ảnh hover:</Text>
                </p>
                <Image
                  src={record?.images?.hover?.url}
                  width={120}
                  style={{ borderRadius: 8 }}
                />
              </Col>
              <Col span={24}>
                <p>
                  <Text strong>Ảnh sản phẩm:</Text>
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {record?.images?.product?.map(
                    (
                      image: { url: string; public_id: string },
                      index: number
                    ) => (
                      <Image
                        key={image.public_id || index}
                        src={image.url}
                        width={100}
                        style={{ borderRadius: 8 }}
                      />
                    )
                  )}
                </div>
              </Col>
            </Row>
          </Card>

          <Card title="Thông Tin Ngày" bordered style={{ marginTop: "24px" }}>
            <p>
              <Text strong>Ngày tạo: </Text>
              {formatDate(record?.createdAt)}
            </p>
            <p>
              <Text strong>Ngày cập nhật: </Text>
              {formatDate(record?.updatedAt)}
            </p>
          </Card>
        </Col>
      </Row>
    </Show>
  );
};
