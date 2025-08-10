import { Edit, useForm, useTable, useSelect } from "@refinedev/antd";
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
  Image,
  Space,
  message,
  Switch,
} from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const fixedSizes = ["S", "M", "L", "XL", "XXL"];

export const ProductVariantEdit = () => {
  const { id } = useParams();
  const { formProps, saveButtonProps, queryResult } = useForm({
    resource: "variants",
    action: "edit",
    id,
  });

  const { tableProps: productTableProps } = useTable({
    resource: "products",
    syncWithLocation: false,
    pagination: { pageSize: 1000 },
  });

  const { selectProps: attributeSelectProps } = useSelect({
    resource: "attributes",
    optionLabel: "name",
    optionValue: "slug",
  });

  const [productTreeData, setProductTreeData] = useState([]);
  const [deletedPublicIds, setDeletedPublicIds] = useState<string[]>([]);
  const [attributeList, setAttributeList] = useState<any[]>([]);
  const [priceMode, setPriceMode] = useState<"single" | "multiple">("single");
  const [commonPrice, setCommonPrice] = useState<number>(0);

  useEffect(() => {
    if (queryResult?.data?.data) {
      console.log("Dữ liệu từ API:", queryResult.data.data);
      const data = queryResult.data.data;
      const mainImage = data.images?.main
        ? [
            {
              uid: data.images.main.public_id,
              name: "main.jpg",
              status: "done",
              url: data.images.main.url,
              public_id: data.images.main.public_id,
            },
          ]
        : [];
      const hoverImage = data.images?.hover
        ? [
            {
              uid: data.images.hover.public_id,
              name: "hover.jpg",
              status: "done",
              url: data.images.hover.url,
              public_id: data.images.hover.public_id,
            },
          ]
        : [];
      const productImages = Array.isArray(data.images?.product)
        ? data.images.product.map((img: any, idx: number) => ({
            uid: img.public_id || idx,
            name: `product_${idx}.jpg`,
            status: "done",
            url: img.url,
            public_id: img.public_id,
          }))
        : [];

      // Cập nhật sizes để có cả price
      const sizes = fixedSizes.map((size) => {
        const found = data.sizes?.find((s: any) => s.size === size);
        return {
          size,
          stock: found?.stock ?? 0,
          price: found?.price ?? 0, // Thêm price
        };
      });

      // Kiểm tra xem tất cả size có cùng giá không để set priceMode
      const prices = sizes.map((s) => s.price).filter((p) => p > 0);
      const uniquePrices = [...new Set(prices)];
      if (uniquePrices.length === 1) {
        setPriceMode("single");
        setCommonPrice(uniquePrices[0]);
      } else {
        setPriceMode("multiple");
      }

      formProps.form?.setFieldsValue({
        productId: data.productId?._id || data.productId,
        productName: data.productId?.name || "",
        sku: data.sku,
        color: {
          colorName: data.color?.colorName || "",
          actualColor: data.color?.actualColor || "",
          baseColor: data.color?.baseColor || "",
        },
        images: { main: mainImage, hover: hoverImage, product: productImages },
        sizes,
        attributes: data.attributes || [],
        status: data.status === true || data.status === "active",
      });
    }
  }, [queryResult?.data?.data]);

  useEffect(() => {
    // Fetch attributes trực tiếp từ API để đảm bảo đúng định dạng
    const fetchAttributes = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/admin/attributes`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setAttributeList(res.data.data || []);
      } catch (err) {
        setAttributeList([]);
      }
    };
    fetchAttributes();
  }, []);

  const handleRemoveImage = (file: any, imageType: any) => {
    message.loading({ content: "Đang xóa ảnh...", key: "removeImage" });
    const publicId = file.public_id;
    if (publicId) {
      setDeletedPublicIds((prev) => [...prev, publicId]);
    }
    const currentImages =
      formProps.form?.getFieldValue(["images", imageType]) || [];
    const updatedImages = currentImages.filter(
      (img: any) => img.uid !== file.uid
    );
    formProps.form?.setFieldsValue({
      images: {
        ...formProps.form?.getFieldValue("images"),
        [imageType]: updatedImages,
      },
    });
    message.success({ content: "Xóa ảnh thành công", key: "removeImage" });
  };

  // Hàm cập nhật giá cho tất cả size khi thay đổi giá chung
  const handleCommonPriceChange = (price: number) => {
    setCommonPrice(price);
    if (priceMode === "single" && formProps.form) {
      const sizes = formProps.form.getFieldValue("sizes") || [];
      const updatedSizes = sizes.map((size: any) => ({
        ...size,
        price: price,
      }));
      formProps.form.setFieldValue("sizes", updatedSizes);
    }
  };

  // Hàm thay đổi chế độ giá
  const handlePriceModeChange = (mode: "single" | "multiple") => {
    setPriceMode(mode);
    if (mode === "single" && formProps.form) {
      // Khi chuyển sang chế độ giá chung, cập nhật tất cả size với giá chung
      const sizes = formProps.form.getFieldValue("sizes") || [];
      const updatedSizes = sizes.map((size: any) => ({
        ...size,
        price: commonPrice,
      }));
      formProps.form.setFieldValue("sizes", updatedSizes);
    }
  };

  const handleFinish = async (values: any) => {
    console.log("Giá trị form khi submit:", values);
    const formData = new FormData();

    formData.append("productId", values.productId);
    formData.append("sku", values.sku);
    formData.append("color.colorName", values.color.colorName);
    formData.append("color.actualColor", values.color.actualColor);
    formData.append("color.baseColor", values.color.baseColor);
    formData.append("status", values.status);

    if (values.images?.main?.[0]?.originFileObj) {
      formData.append("images[main]", values.images.main[0].originFileObj);
    }

    if (values.images?.hover?.[0]?.originFileObj) {
      formData.append("images[hover]", values.images.hover[0].originFileObj);
    }

    if (Array.isArray(values.images?.product)) {
      values.images.product.forEach((img: any) => {
        if (img.originFileObj) {
          formData.append("images[product]", img.originFileObj);
        }
      });
    }

    deletedPublicIds.forEach((publicId) => {
      formData.append("deletedImages[]", publicId);
    });

    // Cập nhật sizes với price
    values.sizes.forEach((s: any, idx: any) => {
      formData.append(`sizes[${idx}][size]`, s.size);
      formData.append(`sizes[${idx}][stock]`, s.stock);
      const price = priceMode === "single" ? commonPrice : s.price;
      formData.append(`sizes[${idx}][price]`, price.toString());
    });

    values.attributes?.forEach((attr: any, index: number) => {
      formData.append(`attributes[${index}][attribute]`, attr.attribute);
      formData.append(`attributes[${index}][value]`, attr.value);
    });

    try {
      await formProps.onFinish?.(formData);
      setDeletedPublicIds([]);
      message.success("Cập nhật biến thể thành công");
    } catch (error) {
      console.error("Error updating variant:", error);
      message.error("Cập nhật biến thể thất bại");
    }
  };

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Card title="Chỉnh sửa Sản phẩm Variant" bordered>
        <Form {...formProps} layout="vertical" onFinish={handleFinish}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Sản phẩm"
                name="productName"
                rules={[{ required: true }]}
              >
                <Input placeholder="Chọn sản phẩm" disabled={true} />
              </Form.Item>
              <Form.Item
                label="Sản phẩm"
                name="productId"
                rules={[{ required: true }]}
                hidden
              >
                <Input />
              </Form.Item>
              <Form.Item label="SKU" name="sku" rules={[{ required: true }]}>
                <Input disabled={true} />
              </Form.Item>
              <Form.Item
                label="Trạng thái"
                name="status"
                valuePropName="checked"
                rules={[
                  { required: true, message: "Vui lòng chọn trạng thái" },
                ]}
              >
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Tên màu"
                name={["color", "colorName"]}
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Màu thực tế"
                name={["color", "actualColor"]}
                rules={[{ required: true }]}
              >
                <Input type="color" />
              </Form.Item>
              <Form.Item
                label="Màu cơ bản"
                name={["color", "baseColor"]}
                rules={[{ required: true }]}
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
            <Col span={6}>
              <Form.Item
                label="Ảnh chính"
                name={["images", "main"]}
                valuePropName="fileList"
                getValueProps={(value) => ({
                  fileList: Array.isArray(value) ? value : value ? [value] : [],
                })}
                rules={[
                  { required: true, message: "Vui lòng tải lên ảnh chính" },
                ]}
              >
                <Space direction="vertical">
                  {formProps.form?.getFieldValue(["images", "main"])?.[0]
                    ?.url && (
                    <Space>
                      <Image
                        src={
                          formProps.form.getFieldValue(["images", "main"])[0]
                            .url
                        }
                        alt="Ảnh chính"
                        width={80}
                        style={{ borderRadius: 4 }}
                      />
                      <Button
                        icon={<DeleteOutlined />}
                        danger
                        onClick={() =>
                          handleRemoveImage(
                            formProps.form?.getFieldValue([
                              "images",
                              "main",
                            ])?.[0],
                            "main"
                          )
                        }
                      />
                    </Space>
                  )}
                  <Upload
                    listType="picture"
                    maxCount={1}
                    beforeUpload={() => false}
                  >
                    <Button icon={<UploadOutlined />}>Tải lên</Button>
                  </Upload>
                </Space>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="Ảnh hover"
                name={["images", "hover"]}
                valuePropName="fileList"
                getValueProps={(value) => ({
                  fileList: Array.isArray(value) ? value : value ? [value] : [],
                })}
                rules={[
                  { required: true, message: "Vui lòng tải lên ảnh hover" },
                ]}
              >
                <Space direction="vertical">
                  {formProps.form?.getFieldValue(["images", "hover"])?.[0]
                    ?.url && (
                    <Space>
                      <Image
                        src={
                          formProps.form.getFieldValue(["images", "hover"])[0]
                            .url
                        }
                        alt="Ảnh hover"
                        width={80}
                        style={{ borderRadius: 4 }}
                      />
                      <Button
                        icon={<DeleteOutlined />}
                        danger
                        onClick={() =>
                          handleRemoveImage(
                            formProps.form?.getFieldValue([
                              "images",
                              "hover",
                            ])[0],
                            "hover"
                          )
                        }
                      />
                    </Space>
                  )}
                  <Upload
                    listType="picture"
                    maxCount={1}
                    beforeUpload={() => false}
                  >
                    <Button icon={<UploadOutlined />}>Tải lên</Button>
                  </Upload>
                </Space>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Ảnh sản phẩm"
                name={["images", "product"]}
                valuePropName="fileList"
                getValueProps={(value) => ({
                  fileList: Array.isArray(value) ? value : value ? [value] : [],
                })}
                rules={[
                  {
                    required: true,
                    message: "Vui lòng tải lên ít nhất một ảnh sản phẩm",
                  },
                ]}
              >
                <Space direction="vertical">
                  <Space wrap>
                    {Array.isArray(
                      formProps.form?.getFieldValue(["images", "product"])
                    ) &&
                      formProps.form
                        .getFieldValue(["images", "product"])
                        .map((img: any, idx: any) =>
                          img.url ? (
                            <Space
                              key={img.uid || idx}
                              direction="vertical"
                              align="center"
                            >
                              <Image
                                src={img.url}
                                alt={`Ảnh sản phẩm ${idx + 1}`}
                                width={60}
                                style={{ borderRadius: 4 }}
                              />
                              <Button
                                icon={<DeleteOutlined />}
                                danger
                                onClick={() =>
                                  handleRemoveImage(img, "product")
                                }
                              />
                            </Space>
                          ) : null
                        )}
                  </Space>
                  <Upload
                    listType="picture"
                    multiple
                    beforeUpload={() => false}
                  >
                    <Button icon={<UploadOutlined />}>Tải lên</Button>
                  </Upload>
                </Space>
              </Form.Item>
            </Col>
          </Row>

          <Card
            type="inner"
            title="Kích thước và Giá"
            style={{ marginTop: 16 }}
          >
            {/* Chọn chế độ giá */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <Form.Item label="Chế độ giá">
                  <Select
                    value={priceMode}
                    onChange={handlePriceModeChange}
                    style={{ width: "100%" }}
                  >
                    <Select.Option value="single">
                      Giá chung cho tất cả size
                    </Select.Option>
                    <Select.Option value="multiple">
                      Giá riêng cho từng size
                    </Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              {priceMode === "single" && (
                <Col span={12}>
                  <Form.Item
                    label="Giá chung (VNĐ)"
                    rules={[
                      { required: true, message: "Vui lòng nhập giá chung" },
                    ]}
                  >
                    <InputNumber
                      min={0}
                      style={{ width: "100%" }}
                      value={commonPrice}
                      onChange={(value) => handleCommonPriceChange(value || 0)}
                      placeholder="Nhập giá cho tất cả size"
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                    />
                  </Form.Item>
                </Col>
              )}
            </Row>

            <Row gutter={[16, 8]} style={{ fontWeight: 500, padding: "8px 0" }}>
              <Col span={6}>Size</Col>
              <Col span={priceMode === "single" ? 18 : 9}>Số lượng</Col>
              {priceMode === "multiple" && <Col span={9}>Giá (VNĐ)</Col>}
            </Row>

            {fixedSizes.map((size, index) => (
              <Row
                gutter={16}
                key={index}
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
                <Col span={priceMode === "single" ? 18 : 9}>
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
                      placeholder="Số lượng"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
                {priceMode === "multiple" && (
                  <Col span={9}>
                    <Form.Item
                      name={["sizes", index, "price"]}
                      rules={[
                        {
                          required: true,
                          message: `Nhập giá cho size ${size}`,
                        },
                      ]}
                      style={{ marginBottom: 0 }}
                    >
                      <InputNumber
                        min={0}
                        style={{ width: "100%" }}
                        placeholder={`Giá size ${size}`}
                        formatter={(value) =>
                          `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                      />
                    </Form.Item>
                  </Col>
                )}
                {/* Hidden price field cho chế độ single */}
                {priceMode === "single" && (
                  <Form.Item
                    name={["sizes", index, "price"]}
                    style={{ display: "none" }}
                  >
                    <InputNumber />
                  </Form.Item>
                )}
              </Row>
            ))}
          </Card>

          <Card type="inner" title="Thuộc tính" style={{ marginTop: 24 }}>
            <Form.List name="attributes">
              {(fields, { add, remove }) => {
                // Lấy danh sách slug đã chọn để disable option đã có
                const selectedSlugs = fields
                  .map(({ name }) =>
                    formProps.form?.getFieldValue([
                      "attributes",
                      name,
                      "attribute",
                    ])
                  )
                  .filter(Boolean);

                return (
                  <>
                    {fields.map(({ key, name, ...restField }) => {
                      const currentAttrSlug = formProps.form?.getFieldValue([
                        "attributes",
                        name,
                        "attribute",
                      ]);
                      const attrObj = attributeList.find(
                        (a) => a.slug === currentAttrSlug
                      );

                      return (
                        <Row key={key} gutter={16} align="middle">
                          <Col span={10}>
                            <Form.Item
                              {...restField}
                              name={[name, "attribute"]}
                              rules={[
                                { required: true, message: "Chọn thuộc tính" },
                              ]}
                            >
                              <Select
                                placeholder="Chọn thuộc tính"
                                showSearch
                                optionFilterProp="children"
                                filterOption={(input, option) => {
                                  const opt = option as any;
                                  return typeof opt?.children === "string"
                                    ? opt.children
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                    : false;
                                }}
                              >
                                {attributeList.map((attr) => (
                                  <Select.Option
                                    key={attr.slug}
                                    value={attr.slug}
                                    disabled={
                                      selectedSlugs.includes(attr.slug) &&
                                      currentAttrSlug !== attr.slug
                                    }
                                  >
                                    {attr.name}
                                  </Select.Option>
                                ))}
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col span={10}>
                            <Form.Item
                              {...restField}
                              name={[name, "value"]}
                              rules={[
                                { required: true, message: "Chọn giá trị" },
                              ]}
                            >
                              <Select placeholder="Chọn giá trị" allowClear>
                                {(attrObj?.values || []).map((val: string) => (
                                  <Select.Option key={val} value={val}>
                                    {val}
                                  </Select.Option>
                                ))}
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col span={4}>
                            <Button
                              danger
                              onClick={() => remove(name)}
                              icon={<DeleteOutlined />}
                            />
                          </Col>
                        </Row>
                      );
                    })}
                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => {
                          const selectedSlugs = fields
                            .map(({ name }) =>
                              formProps.form?.getFieldValue([
                                "attributes",
                                name,
                                "attribute",
                              ])
                            )
                            .filter(Boolean);

                          const firstAvailable = attributeList.find(
                            (attr) => !selectedSlugs.includes(attr.slug)
                          );

                          const idx = fields.length;
                          add(
                            firstAvailable
                              ? {
                                  attribute: firstAvailable.slug,
                                  value: undefined,
                                }
                              : {}
                          );
                        }}
                        block
                        disabled={
                          attributeList.length === 0 ||
                          fields.length >= attributeList.length
                        }
                      >
                        Thêm thuộc tính
                      </Button>
                    </Form.Item>
                  </>
                );
              }}
            </Form.List>
          </Card>
        </Form>
      </Card>
    </Edit>
  );
};
