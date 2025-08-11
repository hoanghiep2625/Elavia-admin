import React, { useState, useEffect } from "react";
import {
  Modal,
  Input,
  List,
  Card,
  Button,
  Space,
  Typography,
  Image,
  Tag,
  message,
  Divider,
} from "antd";
import { SearchOutlined, ShoppingOutlined } from "@ant-design/icons";
import { axiosInstance } from "../axiosInstance";

const { Search } = Input;
const { Text, Title } = Typography;

interface ProductVariant {
  _id: string;
  sku: string;
  color: {
    baseColor: string;
    actualColor: string;
    colorName: string;
  };
  images: {
    main: { url: string; public_id: string };
    hover: { url: string; public_id: string };
    product: Array<{ url: string; public_id: string }>;
  };
  attributes: Array<{ attribute: string; value: string }>;
  sizes: Array<{
    size: string;
    stock: number;
    price: number;
  }>;
}

interface Product {
  _id: string;
  name: string;
  sku: string;
  description: string;
  category: string;
  representativeVariant: any;
  variants: ProductVariant[];
}

interface ProductSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelectProduct: (
    product: Product,
    variant: ProductVariant,
    size: any
  ) => void;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({
  visible,
  onClose,
  onSelectProduct,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );
  const [selectedSize, setSelectedSize] = useState<any>(null);

  // Load products
  const loadProducts = async (searchTerm = "") => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/chat/admin/products", {
        params: {
          search: searchTerm,
          limit: 20,
        },
      });

      setProducts(response.data.products || []);
    } catch (error) {
      console.error("Error loading products:", error);
      message.error("Lỗi khi tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadProducts();
    }
  }, [visible]);

  const handleSearch = (value: string) => {
    setSearch(value);
    loadProducts(value);
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setSelectedVariant(null);
    setSelectedSize(null);
  };

  const handleVariantSelect = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setSelectedSize(null);
  };

  const handleSizeSelect = (size: any) => {
    setSelectedSize(size);
  };

  const handleSendProduct = () => {
    if (selectedProduct && selectedVariant && selectedSize) {
      onSelectProduct(selectedProduct, selectedVariant, selectedSize);
      setSelectedProduct(null);
      setSelectedVariant(null);
      setSelectedSize(null);
      setSearch("");
      onClose();
    }
  };

  const formatPrice = (price: number, discount?: number) => {
    if (!price || typeof price !== "number") return "0đ";

    let finalPrice = price;
    if (discount && discount > 0) {
      finalPrice = price * (1 - discount / 100);
    }

    return finalPrice.toLocaleString("vi-VN") + "đ";
  };

  const getTotalStock = (variant: ProductVariant) => {
    if (!variant.sizes || variant.sizes.length === 0) return 0;
    return variant.sizes.reduce((total, size) => total + size.stock, 0);
  };

  const getProductMinPrice = (product: Product) => {
    if (!product.variants || product.variants.length === 0) return "N/A";
    const allPrices = product.variants.flatMap(
      (v) => v.sizes?.map((s) => s.price) || []
    );
    if (allPrices.length === 0) return "N/A";
    return formatPrice(Math.min(...allPrices));
  };

  return (
    <Modal
      title={
        <Space>
          <ShoppingOutlined />
          <span>Chọn sản phẩm gửi cho khách hàng</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={800}
      footer={
        selectedProduct && selectedVariant && selectedSize ? (
          <Space>
            <Button onClick={onClose}>Hủy</Button>
            <Button type="primary" onClick={handleSendProduct}>
              Gửi sản phẩm này
            </Button>
          </Space>
        ) : (
          <Space>
            <Button onClick={onClose}>Hủy</Button>
            <Button type="primary" disabled>
              {!selectedProduct
                ? "Chọn sản phẩm"
                : !selectedVariant
                ? "Chọn phiên bản"
                : "Chọn kích thước"}
            </Button>
          </Space>
        )
      }
    >
      <div style={{ marginBottom: "16px" }}>
        <Search
          placeholder="Tìm kiếm sản phẩm..."
          allowClear
          onSearch={handleSearch}
          style={{ width: "100%" }}
          enterButton={<SearchOutlined />}
        />
      </div>

      {!selectedProduct ? (
        // Product List
        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          <List
            loading={loading}
            dataSource={products}
            renderItem={(product) => (
              <List.Item
                onClick={() => handleProductSelect(product)}
                style={{
                  cursor: "pointer",
                  padding: "12px",
                  border: "1px solid #f0f0f0",
                  borderRadius: "8px",
                  marginBottom: "8px",
                }}
                className="hover:bg-gray-50"
              >
                <List.Item.Meta
                  avatar={
                    <Image
                      width={60}
                      height={60}
                      src={
                        product.representativeVariant?.images?.main?.url ||
                        "/images/no-image.png"
                      }
                      fallback="/images/no-image.png"
                      style={{ borderRadius: "8px" }}
                    />
                  }
                  title={
                    <div>
                      <Text strong>{product.name}</Text>
                      <div style={{ marginTop: "4px" }}>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          {product.variants.length} phiên bản có sẵn
                        </Text>
                      </div>
                    </div>
                  }
                  description={
                    <div>
                      <Text style={{ fontSize: "14px" }}>
                        Giá từ: {getProductMinPrice(product)}
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </div>
      ) : (
        // Variant Selection
        <div>
          <Card
            size="small"
            title={
              <Space>
                <Button size="small" onClick={() => setSelectedProduct(null)}>
                  ← Quay lại
                </Button>
                <span>{selectedProduct.name}</span>
              </Space>
            }
            style={{ marginBottom: "16px" }}
          >
            <Space>
              <Image
                width={80}
                height={80}
                src={
                  selectedProduct.representativeVariant?.images?.main?.url ||
                  "/images/no-image.png"
                }
                fallback="/images/no-image.png"
                style={{ borderRadius: "8px" }}
              />
              <div>
                <Text>{selectedProduct.description}</Text>
              </div>
            </Space>
          </Card>

          <Title level={5}>Chọn phiên bản:</Title>
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            <List
              dataSource={selectedProduct.variants}
              renderItem={(variant) => (
                <List.Item
                  onClick={() => handleVariantSelect(variant)}
                  style={{
                    cursor: "pointer",
                    padding: "12px",
                    border:
                      selectedVariant?._id === variant._id
                        ? "2px solid #1890ff"
                        : "1px solid #f0f0f0",
                    borderRadius: "8px",
                    marginBottom: "8px",
                    backgroundColor:
                      selectedVariant?._id === variant._id
                        ? "#f6ffed"
                        : "white",
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <Image
                        width={50}
                        height={50}
                        src={
                          variant.images?.main?.url ||
                          selectedProduct.representativeVariant?.images?.main
                            ?.url ||
                          "/images/no-image.png"
                        }
                        fallback="/images/no-image.png"
                        style={{ borderRadius: "6px" }}
                      />
                    }
                    title={
                      <Space>
                        <Tag color="blue">{variant.color.colorName}</Tag>
                        <Tag color="orange">Còn {getTotalStock(variant)}</Tag>
                      </Space>
                    }
                    description={
                      <div>
                        <Text style={{ fontSize: "14px" }}>
                          Số lượng sizes: {variant.sizes?.length || 0}
                        </Text>
                        <br />
                        <Text style={{ fontSize: "12px", color: "#999" }}>
                          Giá từ:{" "}
                          {variant.sizes && variant.sizes.length > 0
                            ? formatPrice(
                                Math.min(...variant.sizes.map((s) => s.price))
                              )
                            : "N/A"}
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        </div>
      )}

      {/* Size Selection */}
      {selectedVariant &&
        selectedVariant.sizes &&
        selectedVariant.sizes.length > 0 && (
          <div style={{ marginTop: "24px" }}>
            <Title level={5}>Chọn kích thước:</Title>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {selectedVariant.sizes.map((size, index) => (
                <Button
                  key={index}
                  onClick={() => handleSizeSelect(size)}
                  type={
                    selectedSize && selectedSize.size === size.size
                      ? "primary"
                      : "default"
                  }
                  style={{
                    minWidth: "80px",
                    height: "60px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "8px",
                  }}
                  disabled={size.stock === 0}
                >
                  <div style={{ fontWeight: "bold", fontSize: "14px" }}>
                    {size.size}
                  </div>
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    {formatPrice(size.price)}
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      color: size.stock > 0 ? "#52c41a" : "#ff4d4f",
                    }}
                  >
                    Còn {size.stock}
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}
    </Modal>
  );
};

export default ProductSelector;
