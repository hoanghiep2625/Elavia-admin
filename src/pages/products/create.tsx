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
  Space,
  Popconfirm,
  Progress,
  Spin,
  notification,
  Result,
} from "antd";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  UploadOutlined,
  DeleteOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
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

// Component con cho từng biến thể
const VariantForm = ({
  index,
  variant,
  onChange,
  onRemove,
  attributes,
  selectedAttributes,
  setSelectedAttributes,
  isRemovable,
  disabled = false,
}: any) => {
  // Quản lý ảnh riêng cho từng biến thể
  const [mainImage, setMainImage] = useState<UploadFile[]>(
    variant.mainImage || []
  );
  const [hoverImage, setHoverImage] = useState<UploadFile[]>(
    variant.hoverImage || []
  );
  const [productImages, setProductImages] = useState<UploadFile[]>(
    variant.productImages || []
  );
  const [priceMode, setPriceMode] = useState<"single" | "multiple">(
    variant.priceMode || "single"
  );
  const [commonPrice, setCommonPrice] = useState<number>(
    variant.commonPrice || 0
  );

  useEffect(() => {
    onChange(index, {
      ...variant,
      mainImage,
      hoverImage,
      productImages,
      priceMode,
      commonPrice,
    });
    // eslint-disable-next-line
  }, [mainImage, hoverImage, productImages, priceMode, commonPrice]);

  // Xử lý thay đổi trường
  const handleFieldChange = (field: string, value: any) => {
    onChange(index, { ...variant, [field]: value });
  };

  // Xử lý thay đổi trường lồng nhau (color, sizes, attributes)
  const handleNestedChange = (field: string, subfield: string, value: any) => {
    onChange(index, {
      ...variant,
      [field]: {
        ...variant[field],
        [subfield]: value,
      },
    });
  };

  // Xử lý thay đổi size
  const handleSizeChange = (
    sizeIndex: number,
    field: "stock" | "price",
    value: number
  ) => {
    const sizes = [...variant.sizes];
    sizes[sizeIndex][field] = value;
    onChange(index, { ...variant, sizes });
  };

  // Hàm cập nhật giá cho tất cả size khi thay đổi giá chung
  const handleCommonPriceChange = (price: number) => {
    setCommonPrice(price);
    if (priceMode === "single") {
      const sizes = variant.sizes.map((size: any) => ({
        ...size,
        price: price,
      }));
      onChange(index, { ...variant, sizes, commonPrice: price });
    }
  };

  // Hàm thay đổi chế độ giá
  const handlePriceModeChange = (mode: "single" | "multiple") => {
    setPriceMode(mode);
    if (mode === "single") {
      // Khi chuyển sang chế độ giá chung, cập nhật tất cả size với giá chung
      const sizes = variant.sizes.map((size: any) => ({
        ...size,
        price: commonPrice,
      }));
      onChange(index, { ...variant, sizes, priceMode: mode, commonPrice });
    } else {
      onChange(index, { ...variant, priceMode: mode });
    }
  };

  // Xử lý thuộc tính động
  const handleAttributeChange = (slug: string, value: any) => {
    onChange(index, {
      ...variant,
      attributes: {
        ...variant.attributes,
        [slug]: value,
      },
    });
  };

  // Xử lý chọn thuộc tính áp dụng
  const handleSelectAttributes = (selected: string[]) => {
    // Xóa giá trị thuộc tính không còn chọn
    const newAttrs = { ...variant.attributes };
    Object.keys(newAttrs).forEach((k) => {
      if (!selected.includes(k)) delete newAttrs[k];
    });
    onChange(index, {
      ...variant,
      selectedAttributes: selected,
      attributes: newAttrs,
    });
  };

  return (
    <Card
      type="inner"
      title={`Biến thể ${index + 1}`}
      style={{ marginTop: 24, marginBottom: 16 }}
      extra={
        isRemovable && (
          <Popconfirm
            title="Xóa biến thể này?"
            onConfirm={() => onRemove(index)}
            okText="Xóa"
            cancelText="Hủy"
            disabled={disabled}
          >
            <Button icon={<DeleteOutlined />} danger size="small" disabled={disabled}>
              Xóa
            </Button>
          </Popconfirm>
        )
      }
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Trạng thái biến thể"
            required
            validateStatus={variant.errors?.status ? "error" : ""}
            help={variant.errors?.status}
          >
            <Switch
              checkedChildren="Active"
              unCheckedChildren="Inactive"
              checked={variant.status}
              onChange={(v) => handleFieldChange("status", v)}
              disabled={disabled}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Tên màu"
            required
            validateStatus={variant.errors?.colorName ? "error" : ""}
            help={variant.errors?.colorName}
          >
            <Input
              value={variant.color?.colorName}
              onChange={(e) =>
                handleNestedChange("color", "colorName", e.target.value)
              }
              placeholder="Nhập tên màu"
              disabled={disabled}
            />
          </Form.Item>
          <Form.Item
            label="Màu thực tế"
            required
            validateStatus={variant.errors?.actualColor ? "error" : ""}
            help={variant.errors?.actualColor}
          >
            <Input
              type="color"
              value={variant.color?.actualColor}
              onChange={(e) =>
                handleNestedChange("color", "actualColor", e.target.value)
              }
              disabled={disabled}
            />
          </Form.Item>
          <Form.Item
            label="Màu cơ bản"
            required
            validateStatus={variant.errors?.baseColor ? "error" : ""}
            help={variant.errors?.baseColor}
          >
            <Select
              value={variant.color?.baseColor}
              onChange={(v) => handleNestedChange("color", "baseColor", v)}
              placeholder="Chọn màu cơ bản"
              disabled={disabled}
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
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label="Ảnh chính"
            required
            validateStatus={variant.errors?.mainImage ? "error" : ""}
            help={variant.errors?.mainImage}
          >
            <Upload
              listType="picture"
              maxCount={1}
              beforeUpload={() => false}
              onChange={(info) => setMainImage(info.fileList)}
              fileList={mainImage}
              disabled={disabled}
            >
              <Button icon={<UploadOutlined />} disabled={disabled}>Tải lên</Button>
            </Upload>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="Ảnh hover"
            required
            validateStatus={variant.errors?.hoverImage ? "error" : ""}
            help={variant.errors?.hoverImage}
          >
            <Upload
              listType="picture"
              maxCount={1}
              beforeUpload={() => false}
              onChange={(info) => setHoverImage(info.fileList)}
              fileList={hoverImage}
              disabled={disabled}
            >
              <Button icon={<UploadOutlined />} disabled={disabled}>Tải lên</Button>
            </Upload>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="Ảnh sản phẩm"
            required
            validateStatus={variant.errors?.productImages ? "error" : ""}
            help={variant.errors?.productImages}
          >
            <Upload
              listType="picture"
              multiple
              beforeUpload={() => false}
              onChange={(info) => setProductImages(info.fileList)}
              fileList={productImages}
              disabled={disabled}
            >
              <Button icon={<UploadOutlined />} disabled={disabled}>Tải lên</Button>
            </Upload>
          </Form.Item>
        </Col>
      </Row>
      <Card type="inner" title="Kích thước và Giá" style={{ marginTop: 16 }}>
        {/* Chọn chế độ giá */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <Form.Item label="Chế độ giá">
              <Select
                value={priceMode}
                onChange={handlePriceModeChange}
                style={{ width: "100%" }}
                disabled={disabled}
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
                required
                validateStatus={variant.errors?.commonPrice ? "error" : ""}
                help={variant.errors?.commonPrice}
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
                  parser={(value) => Number(value?.replace(/\$\s?|(,*)/g, "") || "0")}
                  disabled={disabled}
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
        {["S", "M", "L", "XL", "XXL"].map((size, sizeIdx) => (
          <Row
            gutter={16}
            key={size}
            align="middle"
            style={{ marginBottom: 8 }}
          >
            <Col span={6}>
              <Input value={size} disabled />
            </Col>
            <Col span={priceMode === "single" ? 18 : 9}>
              <Form.Item
                required
                validateStatus={
                  variant.errors?.[`stock_${size}`] ? "error" : ""
                }
                help={variant.errors?.[`stock_${size}`]}
                style={{ marginBottom: 0 }}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  value={variant.sizes[sizeIdx]?.stock}
                  onChange={(v) => handleSizeChange(sizeIdx, "stock", v || 0)}
                  placeholder={`Số lượng size ${size}`}
                  disabled={disabled}
                />
              </Form.Item>
            </Col>
            {priceMode === "multiple" && (
              <Col span={9}>
                <Form.Item
                  required
                  validateStatus={
                    variant.errors?.[`price_${size}`] ? "error" : ""
                  }
                  help={variant.errors?.[`price_${size}`]}
                  style={{ marginBottom: 0 }}
                >
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    value={variant.sizes[sizeIdx]?.price}
                    onChange={(v) => handleSizeChange(sizeIdx, "price", v || 0)}
                    placeholder={`Giá size ${size}`}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) =>
                      Number(value?.replace(/\$\s?|(,*)/g, "") || "0")
                    }
                    disabled={disabled}
                  />
                </Form.Item>
              </Col>
            )}
          </Row>
        ))}
      </Card>
      <Card type="inner" title="Thuộc tính sản phẩm" style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={10}>
            <Form.Item label="Chọn thuộc tính muốn áp dụng">
              <Select
                mode="multiple"
                placeholder="Chọn các thuộc tính áp dụng"
                onChange={handleSelectAttributes}
                value={variant.selectedAttributes}
                allowClear
                disabled={disabled}
              >
                {attributes.map((attr: any) => (
                  <Select.Option key={attr.slug} value={attr.slug}>
                    {attr.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={14}>
            {variant.selectedAttributes?.map((slug: string) => {
              const attr = attributes.find((a: any) => a.slug === slug);
              if (!attr) return null;
              return (
                <Form.Item
                  key={attr.slug}
                  label={attr.name}
                  required
                  validateStatus={
                    variant.errors?.[`attr_${slug}`] ? "error" : ""
                  }
                  help={variant.errors?.[`attr_${slug}`]}
                >
                  <Select
                    placeholder={`Chọn ${attr.name}`}
                    allowClear
                    value={variant.attributes?.[slug]}
                    onChange={(v) => handleAttributeChange(slug, v)}
                    disabled={disabled}
                  >
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
  );
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
  const [variants, setVariants] = useState<any[]>([]);
  const [variantAttrs, setVariantAttrs] = useState<string[][]>([]); // Lưu selectedAttributes cho từng biến thể
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  // Method để navigate an toàn và tránh unsaved changes warning
  const navigateToProducts = () => {
    // Clear any form dirty state trước khi navigate
    if (formProps.form) {
      formProps.form.resetFields();
    }
    navigate("/products", { replace: true });
  };

  useEffect(() => {
    if (categoryTableProps?.dataSource) {
      const raw = Array.isArray(categoryTableProps.dataSource)
        ? categoryTableProps.dataSource
        : (categoryTableProps.dataSource as any)?.data ?? [];
      setCategories(raw);
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

  // Ngăn người dùng rời khỏi trang khi đang submit
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isSubmitting) {
        e.preventDefault();
        e.returnValue = 'Đang tạo sản phẩm, vui lòng đợi...';
        return 'Đang tạo sản phẩm, vui lòng đợi...';
      }
    };

    const handlePopstate = (e: PopStateEvent) => {
      if (isSubmitting) {
        e.preventDefault();
        window.history.pushState(null, '', window.location.pathname);
        message.warning('Vui lòng đợi hoàn thành việc tạo sản phẩm!');
      }
    };

    if (isSubmitting) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('popstate', handlePopstate);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopstate);
    };
  }, [isSubmitting]);

  // Khởi tạo biến thể đầu tiên
  useEffect(() => {
    setVariants([
      {
        status: true,
        color: { baseColor: undefined, actualColor: "#000000", colorName: "" },
        mainImage: [],
        hoverImage: [],
        productImages: [],
        priceMode: "single",
        commonPrice: 0,
        sizes: ["S", "M", "L", "XL", "XXL"].map((size) => ({
          size,
          stock: 0,
          price: 0,
        })),
        attributes: {},
        selectedAttributes: [],
        errors: {},
      },
    ]);
    setVariantAttrs([[]]);
    formProps.form?.setFieldsValue({
      sku: generateSKU(),
      status: true,
    });
    // eslint-disable-next-line
  }, [formProps.form]);

  // Thêm biến thể mới
  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        status: true,
        color: { baseColor: undefined, actualColor: "#000000", colorName: "" },
        mainImage: [],
        hoverImage: [],
        productImages: [],
        priceMode: "single",
        commonPrice: 0,
        sizes: ["S", "M", "L", "XL", "XXL"].map((size) => ({
          size,
          stock: 0,
          price: 0,
        })),
        attributes: {},
        selectedAttributes: [],
        errors: {},
      },
    ]);
    setVariantAttrs((prev) => [...prev, []]);
  };

  // Xóa biến thể
  const handleRemoveVariant = (idx: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== idx));
    setVariantAttrs((prev) => prev.filter((_, i) => i !== idx));
  };

  // Cập nhật biến thể
  const handleVariantChange = (idx: number, data: any) => {
    setVariants((prev) => prev.map((v, i) => (i === idx ? data : v)));
  };

  // Cập nhật selectedAttributes cho từng biến thể
  const handleSetSelectedAttributes = (idx: number, selected: string[]) => {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === idx ? { ...v, selectedAttributes: selected } : v
      )
    );
  };

  // Validate từng biến thể
  const validateVariants = () => {
    let isValid = true;
    const newVariants = variants.map((variant) => {
      const errors: any = {};

      // Validate giá theo price mode
      if (variant.priceMode === "single") {
        if (!variant.commonPrice && variant.commonPrice !== 0) {
          errors.commonPrice = "Vui lòng nhập giá chung";
          isValid = false;
        }
      } else {
        // Validate giá riêng cho từng size
        variant.sizes.forEach((sz: any) => {
          if (!sz.price && sz.price !== 0) {
            errors[`price_${sz.size}`] = `Nhập giá cho size ${sz.size}`;
            isValid = false;
          }
        });
      }

      if (!variant.color?.colorName) {
        errors.colorName = "Vui lòng nhập tên màu";
        isValid = false;
      }
      if (!variant.color?.actualColor) {
        errors.actualColor = "Vui lòng chọn màu thực tế";
        isValid = false;
      }
      if (!variant.color?.baseColor) {
        errors.baseColor = "Vui lòng chọn màu cơ bản";
        isValid = false;
      }
      if (!variant.mainImage?.[0]) {
        errors.mainImage = "Vui lòng tải lên ảnh chính";
        isValid = false;
      }
      if (!variant.hoverImage?.[0]) {
        errors.hoverImage = "Vui lòng tải lên ảnh hover";
        isValid = false;
      }
      if (!variant.productImages?.length) {
        errors.productImages = "Vui lòng tải lên ít nhất 1 ảnh sản phẩm";
        isValid = false;
      }
      variant.sizes.forEach((sz: any, idx: number) => {
        if (sz.stock === undefined || sz.stock === null || sz.stock === "") {
          errors[`stock_${sz.size}`] = `Nhập số lượng cho size ${sz.size}`;
          isValid = false;
        }
      });
      // Validate thuộc tính động
      (variant.selectedAttributes || []).forEach((slug: string) => {
        if (!variant.attributes?.[slug]) {
          errors[`attr_${slug}`] = `Chọn giá trị cho thuộc tính`;
          isValid = false;
        }
      });
      return { ...variant, errors };
    });
    setVariants(newVariants);
    return isValid;
  };

  // Xử lý submit
  const handleSubmit = async (values: any) => {
    if (!validateVariants()) {
      message.error("Vui lòng điền đầy đủ thông tin cho tất cả biến thể!");
      return;
    }

    setIsSubmitting(true);
    setProgress(0);
    setCurrentStep("Đang tạo sản phẩm...");

    // Clear form dirty state ngay khi bắt đầu submit để tránh unsaved warning
    if (formProps.form?.setFieldsValue) {
      const currentValues = formProps.form.getFieldsValue();
      formProps.form.setFieldsValue(currentValues);
    }

    try {
      // 1. Tạo sản phẩm
      setProgress(20);
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
      setProgress(40);

      // 2. Tạo các biến thể
      setCurrentStep("Đang tạo biến thể sản phẩm...");
      const totalVariants = variants.length;
      
      for (let i = 0; i < variants.length; i++) {
        const variant = variants[i];
        setCurrentStep(`Đang tạo biến thể ${i + 1}/${totalVariants}...`);
        
        const formData = new FormData();
        // Thuộc tính
        const attributesArray = Object.entries(variant.attributes || {})
          .filter(([, val]) => val !== undefined && val !== "")
          .map(([attribute, value]) => ({ attribute, value }));
        attributesArray.forEach((attr, index) => {
          formData.append(`attributes[${index}][attribute]`, attr.attribute);
          formData.append(`attributes[${index}][value]`, String(attr.value));
        });

        formData.append("productId", productId);
        formData.append("sku", values.sku); // Có thể cần sửa nếu mỗi biến thể có SKU riêng
        formData.append("color.baseColor", variant.color.baseColor);
        formData.append("color.actualColor", variant.color.actualColor);
        formData.append("color.colorName", variant.color.colorName);
        formData.append("status", String(variant.status));

        variant.sizes.forEach((sizeObj: any, index: number) => {
          formData.append(`sizes[${index}][size]`, sizeObj.size);
          formData.append(`sizes[${index}][stock]`, sizeObj.stock.toString());
          formData.append(`sizes[${index}][price]`, sizeObj.price.toString());
        });

        if (variant.mainImage[0]?.originFileObj) {
          formData.append("mainImage", variant.mainImage[0].originFileObj);
        }
        if (variant.hoverImage[0]?.originFileObj) {
          formData.append("hoverImage", variant.hoverImage[0].originFileObj);
        }
        variant.productImages.forEach((file: UploadFile) => {
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

        // Cập nhật progress cho từng variant
        const variantProgress = 40 + ((i + 1) / totalVariants) * 50;
        setProgress(variantProgress);
      }

      setProgress(100);
      setCurrentStep("Hoàn thành!");

      // Hiển thị notification thay vì message
      notification.success({
        message: 'Tạo sản phẩm thành công!',
        description: `Đã tạo sản phẩm "${values.name}" với ${variants.length} biến thể`,
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
        duration: 3,
        placement: 'topRight',
      });

      // Reset form và state ngay lập tức để tránh unsaved changes warning
      formProps.form?.resetFields();
      formProps.form?.setFieldsValue({
        sku: generateSKU(),
        status: true,
      });
      
      setVariants([
        {
          status: true,
          color: {
            baseColor: undefined,
            actualColor: "#000000",
            colorName: "",
          },
          mainImage: [],
          hoverImage: [],
          productImages: [],
          priceMode: "single",
          commonPrice: 0,
          sizes: ["S", "M", "L", "XL", "XXL"].map((size) => ({
            size,
            stock: 0,
            price: 0,
          })),
          attributes: {},
          selectedAttributes: [],
          errors: {},
        },
      ]);
      setVariantAttrs([[]]);

      // Hiển thị success result trong 2 giây rồi chuyển trang
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setIsSubmitting(false);
        setProgress(0);
        setCurrentStep("");
        // Sử dụng method an toàn để navigate
        navigateToProducts();
      }, 2000);

    } catch (err) {
      setIsSubmitting(false);
      setProgress(0);
      setCurrentStep("");
      
      notification.error({
        message: 'Lỗi tạo sản phẩm',
        description: 'Đã xảy ra lỗi khi tạo sản phẩm hoặc biến thể. Vui lòng thử lại!',
        duration: 4,
        placement: 'topRight',
      });
      console.error(err);
    }
  };

  return (
    <>
      {/* Loading Overlay */}
      {isSubmitting && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Spin 
            size="large" 
            indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
          />
          <div style={{ marginTop: 16, fontSize: 16, color: "#666" }}>
            {currentStep}
          </div>
          <Progress
            percent={progress}
            style={{ width: 300, marginTop: 16 }}
            strokeColor={{
              from: '#108ee9',
              to: '#87d068',
            }}
            status={progress === 100 ? "success" : "active"}
          />
        </div>
      )}

      {/* Success Result */}
      {showSuccess && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#fff",
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Result
            status="success"
            title="Tạo sản phẩm thành công!"
            subTitle="Đang chuyển hướng về danh sách sản phẩm..."
            icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
          />
        </div>
      )}

      <Create saveButtonProps={{
        ...saveButtonProps,
        loading: isSubmitting,
        disabled: isSubmitting,
      }}>
        <Form {...formProps} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="sku" hidden>
            <Input />
          </Form.Item>

          <Form.Item
            label="Tên sản phẩm"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
          >
            <Input placeholder="Nhập tên sản phẩm" disabled={isSubmitting} />
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
              disabled={isSubmitting}
            />
          </Form.Item>

          <Form.Item
            label="Mô tả ngắn"
            name="shortDescription"
            rules={[{ required: true, message: "Vui lòng nhập mô tả ngắn" }]}
          >
            <Input.TextArea 
              rows={2} 
              placeholder="Nhập mô tả ngắn" 
              disabled={isSubmitting}
            />
          </Form.Item>

          <Form.Item label="Mô tả chi tiết" name="description">
            <ReactQuill
              theme="snow"
              onChange={(value) =>
                formProps.form?.setFieldsValue({ description: value })
              }
              value={formProps.form?.getFieldValue("description") || ""}
              readOnly={isSubmitting}
            />
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="status"
            valuePropName="checked"
            initialValue={true}
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Switch 
              checkedChildren="Active" 
              unCheckedChildren="Inactive" 
              disabled={isSubmitting}
            />
          </Form.Item>

          {/* --- FORM VARIANTS --- */}
          {variants.map((variant, idx) => (
            <VariantForm
              key={idx}
              index={idx}
              variant={variant}
              onChange={handleVariantChange}
              onRemove={handleRemoveVariant}
              attributes={attributes}
              isRemovable={variants.length > 1}
              disabled={isSubmitting}
            />
          ))}

          <div style={{ margin: "16px 0" }}>
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={handleAddVariant}
              block
              disabled={isSubmitting}
            >
              Tạo biến thể mới
            </Button>
          </div>
        </Form>
      </Create>
    </>
  );
};
