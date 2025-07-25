import React, { useState, useEffect } from "react";
import { Create, useForm, useTable } from "@refinedev/antd";
import {
  Form,
  Input,
  TreeSelect,
  Switch,
  InputNumber,
  Select,
  Upload,
  Button,
  Row,
  Col,
  Card,
  message,
} from "antd";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import { UploadFile } from "antd/lib/upload/interface";
import { useNavigate } from "react-router";


// Hàm tạo SKU ngẫu nhiên cho sản phẩm
const generateSKU = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from(
    { length: 7 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
};

const buildTreeData = (
  categories: any[],
  parentId: string | null = null
): any[] => {
  const filtered = categories.filter((item) => item.parentId === parentId);
  return filtered.map((item) => ({
    title: item.name,
    value: item._id,
    key: item._id,
    children: buildTreeData(categories, item._id),
  }));
};

export const ProductCreate: React.FC = () => {
  const { formProps, saveButtonProps } = useForm({
    resource: "products",
  });

  const { tableProps: categoryTableProps } = useTable({
    resource: "categories",
    syncWithLocation: true,
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [attributes, setAttributes] = useState<any[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [mainImage, setMainImage] = useState<UploadFile[]>([]);
  const [hoverImage, setHoverImage] = useState<UploadFile[]>([]);
  const [productImages, setProductImages] = useState<UploadFile[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (categoryTableProps?.dataSource) {
      const raw = Array.isArray(categoryTableProps.dataSource)
        ? categoryTableProps.dataSource
        : (categoryTableProps.dataSource as any)?.data ?? [];
      setCategories(raw);
      console.log("Categories:", raw);
    }
  }, [categoryTableProps?.dataSource]);

  const treeData = buildTreeData(categories);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/admin/attributes`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => setAttributes(res.data.data || []));
  }, []);

  useEffect(() => {
    formProps.form?.setFieldsValue({
      sku: generateSKU(),
      sizes: ["S", "M", "L", "XL", "XXL"].map((size) => ({
        size,
        stock: 0,
      })),
      color: { actualColor: "#000000" },
      status: true,
    });
  }, [formProps.form]);

  const handleSubmit = async (values: any) => {
    try {
      // 1. Tạo sản phẩm
      const productRes = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/products`,
        {
          name: values.name,
          sku: values.sku,
          categoryId: values.categoryId,
          shortDescription: values.shortDescription,
          description: values.description,
          status: values.status,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const productId = productRes.data._id;

      // 2. Tạo variant đầu tiên
      const formData = new FormData();
      // Thuộc tính
      const attributesArray = Object.entries(values.attributes || {})
        .filter(([_, val]) => val !== undefined && val !== "")
        .map(([attribute, value]) => ({ attribute, value }));
      attributesArray.forEach((attr, index) => {
        formData.append(`attributes[${index}][attribute]`, attr.attribute);
        formData.append(`attributes[${index}][value]`, String(attr.value));
      });

      formData.append("productId", productId);
      formData.append("sku", values.sku);
      formData.append("price", values.price);
      formData.append("color.baseColor", values.color.baseColor);
      formData.append("color.actualColor", values.color.actualColor);
      formData.append("color.colorName", values.color.colorName);
      formData.append("status", String(values.status));

      values.sizes.forEach((sizeObj: any, i: number) => {
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

      message.success("Tạo sản phẩm và biến thể thành công!");
      formProps.form?.resetFields();
      setMainImage([]);
      setHoverImage([]);
      setProductImages([]);
      setSelectedAttributes([]);
      navigate("/products"); 
    } catch (err) {
      message.error("Lỗi khi tạo sản phẩm hoặc biến thể!");
      console.error(err);
    }
  };

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical" onFinish={handleSubmit}>
        <Form.Item name="sku" hidden>
          <Input />
        </Form.Item>

        <Form.Item
          label="Tên sản phẩm"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
        >
          <Input placeholder="Nhập tên sản phẩm" />
        </Form.Item>

        <Form.Item
          label="Danh mục"
          name="categoryId"
          rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
        >
          <TreeSelect
            treeData={treeData}
            placeholder="Chọn danh mục"
            allowClear
            treeDefaultExpandedKeys={[]}
          />
        </Form.Item>

        <Form.Item
          label="Mô tả ngắn"
          name="shortDescription"
          rules={[{ required: true, message: "Vui lòng nhập mô tả ngắn" }]}
        >
          <Input.TextArea rows={2} placeholder="Nhập mô tả ngắn" />
        </Form.Item>

        <Form.Item label="Mô tả chi tiết" name="description">
          <ReactQuill
            theme="snow"
            onChange={(value) =>
              formProps.form?.setFieldsValue({ description: value })
            }
            value={formProps.form?.getFieldValue("description") || ""}
          />
        </Form.Item>

        <Form.Item
          label="Trạng thái"
          name="status"
          valuePropName="checked"
          initialValue={true}
          rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
        >
          <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
        </Form.Item>

        {/* --- FORM VARIANT --- */}
        <Card
          title="Tạo biến thể đầu tiên cho sản phẩm"
          style={{ marginTop: 24 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Giá"
                name="price"
                rules={[{ required: true, message: "Vui lòng nhập giá" }]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item
                label="Trạng thái biến thể"
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
            <Row
              gutter={[16, 8]}
              style={{ fontWeight: 500, padding: "8px 0" }}
            >
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
                        {attr.values.map((val: string) => (
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
        </Card>
      </Form>
    </Create>
  );
};
