import { Edit, useForm, useSelect } from "@refinedev/antd";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  Row,
  Col,
  Card,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";

const fixedSizes = ["S", "M", "L", "XL", "XXL"];

export const ProductVariantEdit = () => {
  const { formProps, saveButtonProps } = useForm({
    resource: "products-variant",
  });

  const { selectProps: productSelectProps } = useSelect({
    resource: "products",
    optionLabel: "name",
    optionValue: "_id",
  });

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Card
        title="Chỉnh sửa Sản phẩm Variant"
        bordered
        style={{ margin: "16px" }}
      >
        <Form {...formProps} layout="vertical">
          {/* Thông Tin Cơ Bản */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Sản phẩm"
                name="productId"
                rules={[{ required: true, message: "Vui lòng chọn sản phẩm" }]}
              >
                <Select {...productSelectProps} placeholder="Chọn sản phẩm" />
              </Form.Item>
              <Form.Item
                label="SKU"
                name="sku"
                rules={[{ required: true, message: "Vui lòng nhập SKU" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Giá"
                name="price"
                rules={[{ required: true, message: "Vui lòng nhập giá" }]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Tên màu" name={["color", "colorName"]}>
                <Input />
              </Form.Item>
              <Form.Item label="Màu thực tế" name={["color", "actualColor"]}>
                <Input type="color" />
              </Form.Item>
              <Form.Item label="Màu cơ bản" name={["color", "baseColor"]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>

          {/* Phần Hình Ảnh */}
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Ảnh chính" name={["images", "main"]}>
                <Upload listType="picture" maxCount={1}>
                  <Button icon={<UploadOutlined />}>Tải lên</Button>
                </Upload>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Ảnh hover" name={["images", "hover"]}>
                <Upload listType="picture" maxCount={1}>
                  <Button icon={<UploadOutlined />}>Tải lên</Button>
                </Upload>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Ảnh sản phẩm" name={["images", "product"]}>
                <Upload listType="picture" multiple>
                  <Button icon={<UploadOutlined />}>Tải lên</Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          {/* Phần Kích Thước với 5 size cố định */}
          <Card type="inner" title="Kích thước" style={{ marginTop: 16 }}>
            {fixedSizes.map((size, index) => (
              <Row gutter={16} key={index}>
                <Col span={12}>
                  <Form.Item
                    label={`Kích thước (${size})`}
                    name={["sizes", index, "size"]}
                    initialValue={size}
                  >
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={`Số lượng (${size})`}
                    name={["sizes", index, "stock"]}
                    rules={[
                      {
                        required: true,
                        message: `Nhập số lượng cho size ${size}`,
                      },
                    ]}
                  >
                    <InputNumber
                      min={0}
                      placeholder="Số lượng"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            ))}
          </Card>
        </Form>
      </Card>
    </Edit>
  );
};
