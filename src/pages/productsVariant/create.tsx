import { Create } from "@refinedev/antd";
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
  message,
  Switch,
} from "antd";
import { UploadOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useForm } from "@refinedev/antd";
import axios from "axios";
import { UploadFile } from "antd/lib/upload/interface";

interface Size {
  size: string;
  stock: number;
}
interface Color {
  baseColor: string;
  actualColor: string;
  colorName: string;
}
interface FormValues {
  productId: string;
  sku: string;
  price: number;
  color: Color;
  sizes: Size[];
  status: string;
  attributes?: Record<string, string>;
}

export const ProductVariantCreate = () => {
  const { id } = useParams();
  const [productName, setProductName] = useState<string>("");
  const [mainImage, setMainImage] = useState<UploadFile[]>([]);
  const [hoverImage, setHoverImage] = useState<UploadFile[]>([]);
  const [productImages, setProductImages] = useState<UploadFile[]>([]);
  const [productSku, setSku] = useState<string>("");
  const navigate = useNavigate();
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);

  const { formProps, saveButtonProps } = useForm<FormValues>({
    resource: "product-variants",
  }) as {
    formProps: {
      form?: import("antd").FormInstance<FormValues>;
      [key: string]: any;
    };
    saveButtonProps: any;
  };
  const [attributes, setAttributes] = useState<
    { slug: string; name: string; values: string[] }[]
  >([]);
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/admin/attributes`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        setAttributes(res.data.data);
      });
  }, []);

  useEffect(() => {
    if (!id) return;
    axios
      .get(`${import.meta.env.VITE_API_URL}/admin/products/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        setProductName(res.data.name);
        setSku(res.data.sku || "");
        formProps.form?.setFieldsValue({ sku: res.data.sku || "" });
      })
      .catch(() => setProductName("Không tìm thấy sản phẩm"));
  }, [id, formProps.form]);

  const handleSubmit = async (values: FormValues) => {
    try {
      const formData = new FormData();
      const attributesArray = Object.entries(values.attributes || {})
        .filter(([_, val]) => val !== undefined && val !== "")
        .map(([attribute, value]) => ({ attribute, value }));

      attributesArray.forEach((attr, index) => {
        formData.append(`attributes[${index}][attribute]`, attr.attribute);
        formData.append(`attributes[${index}][value]`, attr.value);
      });

      formData.append("productId", id || "");
      formData.append("sku", values.sku);
      formData.append("price", values.price.toString());
      formData.append("color.baseColor", values.color.baseColor);
      formData.append("color.actualColor", values.color.actualColor);
      formData.append("color.colorName", values.color.colorName);
      formData.append("status", values.status || "active");

      values.sizes.forEach((sizeObj: Size, i: number) => {
        formData.append(`sizes[${i}][size]`, sizeObj.size);
        formData.append(`sizes[${i}][stock]`, sizeObj.stock.toString());
      });

      if (mainImage[0]?.originFileObj) {
        formData.append("mainImage", mainImage[0].originFileObj);
      }
      if (hoverImage[0]?.originFileObj) {
        formData.append("hoverImage", hoverImage[0].originFileObj);
      }
      productImages.forEach((file: UploadFile) => {
        if (file.originFileObj) {
          formData.append("productImages", file.originFileObj);
        }
      });

      await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/variants`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      message.success("Tạo variant thành công!");
      navigate(`/variants`);
      formProps.form?.resetFields();
      setMainImage([]);
      setHoverImage([]);
      setProductImages([]);
    } catch (err) {
      message.error("Lỗi khi tạo variant!");
      console.error(err);
    }
  };

  return (
    <Create goBack={false} saveButtonProps={saveButtonProps}>
      <Card
        title={
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/products")}
              style={{ marginRight: 8 }}
            />
            Tạo mới Sản phẩm Variant
          </span>
        }
        bordered
        style={{ margin: "16px" }}
      >
        <Form<FormValues>
          {...formProps}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            sizes: ["S", "M", "L", "XL", "XXL"].map((size) => ({
              size,
              stock: 0,
            })),
            color: {
              actualColor: "#000000",
            },
            status: true, // Mặc định là active
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Sản phẩm">
                <Input value={productName} disabled />
              </Form.Item>
              <Form.Item name="productId" initialValue={id} hidden>
                <Input />
              </Form.Item>
              <Form.Item label="SKU" name="sku">
                <Input value={productSku} disabled />
              </Form.Item>
              <Form.Item
                label="Giá"
                name="price"
                rules={[{ required: true, message: "Vui lòng nhập giá" }]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item
                label="Trạng thái"
                name="status"
                rules={[
                  { required: true, message: "Vui lòng chọn trạng thái" },
                ]}
              >
                <Switch
                  checkedChildren="Active"
                  unCheckedChildren="Inactive"
                  defaultChecked
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Tên màu"
                name={["color", "colorName"]}
                rules={[{ required: true, message: "Vui lòng nhập tên màu" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Màu thực tế"
                name={["color", "actualColor"]}
                rules={[{ required: true, message: "Vui lòng chọn màu" }]}
              >
                <Input type="color" />
              </Form.Item>
              <Form.Item
                label="Màu cơ bản"
                name={["color", "baseColor"]}
                rules={[
                  { required: true, message: "Vui lòng chọn màu cơ bản" },
                ]}
              >
                <Select placeholder="Chọn màu cơ bản">
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
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Ảnh chính" name="mainImage">
                <Upload
                  listType="picture"
                  maxCount={1}
                  beforeUpload={() => false}
                  onChange={(info) => setMainImage(info.fileList)}
                  fileList={mainImage}
                >
                  <Button icon={<UploadOutlined />}>Tải lên</Button>
                </Upload>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Ảnh hover" name="hoverImage">
                <Upload
                  listType="picture"
                  maxCount={1}
                  beforeUpload={() => false}
                  onChange={(info) => setHoverImage(info.fileList)}
                  fileList={hoverImage}
                >
                  <Button icon={<UploadOutlined />}>Tải lên</Button>
                </Upload>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Ảnh sản phẩm" name="productImages">
                <Upload
                  listType="picture"
                  multiple
                  beforeUpload={() => false}
                  onChange={(info) => setProductImages(info.fileList)}
                  fileList={productImages}
                >
                  <Button icon={<UploadOutlined />}>Tải lên</Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          <Card type="inner" title="Kích thước" style={{ marginTop: 16 }}>
            <Row gutter={[16, 8]} style={{ fontWeight: 500, padding: "8px 0" }}>
              <Col span={6}>Size</Col>
              <Col span={18}>Số lượng</Col>
            </Row>
            {["S", "M", "L", "XL", "XXL"].map((size, index) => (
              <Row
                gutter={16}
                key={size}
                align="middle"
                style={{ marginBottom: 8 }}
              >
                <Col span={6}>
                  <Form.Item
                    name={["sizes", index, "size"]}
                    initialValue={size}
                    style={{ marginBottom: 0 }}
                  >
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col span={18}>
                  <Form.Item
                    name={["sizes", index, "stock"]}
                    rules={[
                      {
                        required: true,
                        message: `Nhập số lượng cho size ${size}`,
                      },
                    ]}
                    style={{ marginBottom: 0 }}
                  >
                    <InputNumber
                      min={0}
                      style={{ width: "100%" }}
                      placeholder={`Số lượng size ${size}`}
                    />
                  </Form.Item>
                </Col>
              </Row>
            ))}
          </Card>
          <Card
            type="inner"
            title="Thuộc tính sản phẩm"
            style={{ marginTop: 16 }}
          >
            <Row gutter={16}>
              <Col span={10}>
                <Form.Item label="Chọn thuộc tính muốn áp dụng">
                  <Select
                    mode="multiple"
                    placeholder="Chọn các thuộc tính áp dụng"
                    onChange={(selected) => setSelectedAttributes(selected)}
                    value={selectedAttributes}
                    allowClear
                  >
                    {attributes.map((attr) => (
                      <Select.Option key={attr.slug} value={attr.slug}>
                        {attr.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={14}>
                {selectedAttributes.map((slug) => {
                  const attr = attributes.find((a) => a.slug === slug);
                  if (!attr) return null;
                  return (
                    <Form.Item
                      key={attr.slug}
                      label={attr.name}
                      name={["attributes", attr.slug]}
                    >
                      <Select placeholder={`Chọn ${attr.name}`} allowClear>
                        {attr.values.map((val) => (
                          <Select.Option key={val} value={val}>
                            {val}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  );
                })}
              </Col>
            </Row>
          </Card>
        </Form>
      </Card>
    </Create>
  );
};
